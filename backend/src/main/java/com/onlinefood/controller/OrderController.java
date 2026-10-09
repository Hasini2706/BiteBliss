package com.onlinefood.controller;

import com.onlinefood.dto.OrderItemResponse;
import com.onlinefood.dto.OrderRequest;
import com.onlinefood.dto.OrderResponse;
import com.onlinefood.entity.Address;
import com.onlinefood.entity.Order;
import com.onlinefood.entity.OrderItem;
import com.onlinefood.entity.OrderStatusHistory;
import com.onlinefood.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/orders", "/orders"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        Order order = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(mapToResponse(order), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> responses = orderService.getAllOrders().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id, Authentication authentication) {
        Order order = orderService.getOrderById(id);
        if (authentication != null) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (!isAdmin && (order.getUser() == null || !order.getUser().getEmail().equalsIgnoreCase(authentication.getName()))) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }
        return ResponseEntity.ok(mapToResponse(order));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<OrderStatusHistory>> getOrderHistory(@PathVariable Long id, Authentication authentication) {
        Order order = orderService.getOrderById(id);
        if (authentication != null) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (!isAdmin && (order.getUser() == null || !order.getUser().getEmail().equalsIgnoreCase(authentication.getName()))) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }
        return ResponseEntity.ok(orderService.getOrderStatusHistory(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(@PathVariable Long userId, Authentication authentication) {
        if (authentication != null) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            // If not admin, verify that the email corresponds to this user
        }
        List<OrderResponse> responses = orderService.getOrdersByUser(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable Long id, @RequestBody OrderRequest orderRequest) {
        Order order = orderService.updateOrder(id, orderRequest);
        return ResponseEntity.ok(mapToResponse(order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id, @RequestParam String status, Authentication authentication) {
        String actor = (authentication != null) ? authentication.getName() : "Admin";
        Order order = orderService.transitionOrderStatus(id, status, actor, null);
        return ResponseEntity.ok(mapToResponse(order));
    }

    public OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser() != null ? order.getUser().getId() : null);
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        
        if (order.getUser() != null) {
            response.setUserName(order.getUser().getName());
            response.setUserPhone(order.getUser().getPhone());
            response.setUserEmail(order.getUser().getEmail());
        }

        if (order.getDeliveryAddress() != null) {
            Address addr = order.getDeliveryAddress();
            response.setAddressId(addr.getId());
            StringBuilder sb = new StringBuilder();
            if (addr.getAddressLine1() != null) sb.append(addr.getAddressLine1());
            if (addr.getAddressLine2() != null && !addr.getAddressLine2().isEmpty()) sb.append(", ").append(addr.getAddressLine2());
            if (addr.getCity() != null && !addr.getCity().isEmpty()) sb.append(", ").append(addr.getCity());
            if (addr.getPincode() != null && !addr.getPincode().isEmpty()) sb.append(" - ").append(addr.getPincode());
            response.setDeliveryAddressText(sb.toString());
        }

        response.setPaymentType(order.getPaymentType());
        response.setDeliveryFee(order.getDeliveryFee());
        response.setDiscount(order.getDiscount());
        response.setCouponId(order.getCoupon() != null ? order.getCoupon().getId() : null);
        
        if (order.getItems() != null) {
            List<OrderItemResponse> itemResponses = order.getItems().stream().map(this::mapItemToResponse).collect(Collectors.toList());
            response.setItems(itemResponses);
        }
        return response;
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setMenuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null);
        response.setMenuItemName(item.getMenuItem() != null ? item.getMenuItem().getName() : "Dish");
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        response.setSubtotal(item.getSubtotal());
        return response;
    }
}
