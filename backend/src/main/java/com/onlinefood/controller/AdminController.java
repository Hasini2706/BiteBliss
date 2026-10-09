package com.onlinefood.controller;

import com.onlinefood.dto.OrderResponse;
import com.onlinefood.entity.Order;
import com.onlinefood.repository.OrderRepository;
import com.onlinefood.repository.UserRepository;
import com.onlinefood.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderController orderController;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        List<Order> allOrders = orderRepository.findAll();
        
        long totalOrders = allOrders.size();
        
        java.math.BigDecimal revenue = allOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()) && !"REJECTED".equals(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                
        long todayOrders = allOrders.stream()
                .filter(o -> o.getOrderDate() != null && o.getOrderDate().toLocalDate().equals(java.time.LocalDate.now()))
                .count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalOrders", totalOrders);
        stats.put("revenue", revenue);
        stats.put("todayOrders", todayOrders);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrdersAdmin() {
        List<OrderResponse> responses = orderService.getAllOrders().stream()
                .map(orderController::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderByIdAdmin(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(orderController.mapToResponse(order));
    }

    @PutMapping("/orders/{id}/accept")
    public ResponseEntity<OrderResponse> acceptOrder(@PathVariable Long id, Authentication authentication) {
        String actor = (authentication != null) ? authentication.getName() : "Admin";
        Order order = orderService.transitionOrderStatus(id, "ACCEPTED", actor, "Order accepted by restaurant");
        return ResponseEntity.ok(orderController.mapToResponse(order));
    }

    @PutMapping("/orders/{id}/reject")
    public ResponseEntity<OrderResponse> rejectOrder(@PathVariable Long id, Authentication authentication) {
        String actor = (authentication != null) ? authentication.getName() : "Admin";
        Order order = orderService.transitionOrderStatus(id, "REJECTED", actor, "Order rejected by restaurant");
        return ResponseEntity.ok(orderController.mapToResponse(order));
    }

    @PutMapping("/orders/{id}/preparing")
    public ResponseEntity<OrderResponse> prepareOrder(@PathVariable Long id, Authentication authentication) {
        String actor = (authentication != null) ? authentication.getName() : "Admin";
        Order order = orderService.transitionOrderStatus(id, "PREPARING", actor, "Kitchen started preparing food");
        return ResponseEntity.ok(orderController.mapToResponse(order));
    }

    @PutMapping("/orders/{id}/ready")
    public ResponseEntity<OrderResponse> readyOrder(@PathVariable Long id, Authentication authentication) {
        String actor = (authentication != null) ? authentication.getName() : "Admin";
        Order order = orderService.transitionOrderStatus(id, "READY", actor, "Food is cooked and packed ready for pickup");
        return ResponseEntity.ok(orderController.mapToResponse(order));
    }

    @PutMapping("/orders/{id}/dispatch")
    public ResponseEntity<OrderResponse> dispatchOrder(@PathVariable Long id, Authentication authentication) {
        String actor = (authentication != null) ? authentication.getName() : "Admin";
        Order order = orderService.transitionOrderStatus(id, "OUT_FOR_DELIVERY", actor, "Dispatched with delivery partner");
        return ResponseEntity.ok(orderController.mapToResponse(order));
    }

    @PutMapping("/orders/{id}/deliver")
    public ResponseEntity<OrderResponse> deliverOrder(@PathVariable Long id, Authentication authentication) {
        String actor = (authentication != null) ? authentication.getName() : "Admin";
        Order order = orderService.transitionOrderStatus(id, "DELIVERED", actor, "Order safely delivered to customer");
        return ResponseEntity.ok(orderController.mapToResponse(order));
    }
}
