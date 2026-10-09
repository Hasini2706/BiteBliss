package com.onlinefood.service;

import com.onlinefood.dto.OrderItemRequest;
import com.onlinefood.dto.OrderRequest;
import com.onlinefood.entity.*;
import com.onlinefood.exception.*;
import com.onlinefood.repository.*;
import com.onlinefood.soap.dto.GenerateBillRequest;
import com.onlinefood.soap.dto.GenerateBillResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.onlinefood.soap.BillingEndpoint;

import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BillingEndpoint billingEndpoint;

    @Autowired
    private AddressService addressService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(OrderRequest orderRequest) {
        // 1. Validate User
        User user = userRepository.findById(orderRequest.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + orderRequest.getUserId()));

        // 2. Validate Address
        Address address = null;
        if (orderRequest.getAddressId() != null) {
            address = addressService.getAddressById(orderRequest.getAddressId());
            if (address != null && address.getUser() != null && !address.getUser().getId().equals(user.getId())) {
                throw new InvalidOrderException("Address does not belong to user");
            }
        } else {
            List<Address> userAddresses = addressService.getAddressesByUserId(user.getId());
            if (!userAddresses.isEmpty()) {
                address = userAddresses.get(0);
            }
        }

        // 3. Validate Order Items
        if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            throw new InvalidOrderException("Order must contain at least one item.");
        }

        String paymentType = orderRequest.getPaymentType() != null && !orderRequest.getPaymentType().isEmpty()
                ? orderRequest.getPaymentType() : "ONLINE";

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("CREATED");
        order.setDeliveryAddress(address);
        order.setPaymentType(paymentType);
        
        order = orderRepository.save(order); // Save to get ID

        for (OrderItemRequest itemRequest : orderRequest.getItems()) {
            if (itemRequest.getQuantity() <= 0) {
                throw new InvalidOrderException("Quantity must be greater than 0");
            }
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new MenuItemNotFoundException("Food item not found: " + itemRequest.getMenuItemId()));
            
            if (!menuItem.getAvailable()) {
                throw new FoodUnavailableException(menuItem.getName() + " is currently unavailable.");
            }

            BigDecimal price = menuItem.getPrice();
            if (price.compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidOrderException("Invalid price for item: " + menuItem.getName());
            }

            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(price);
            orderItem.setSubtotal(subtotal);
            orderItems.add(orderItem);
        }
        
        BigDecimal deliveryFee = totalAmount.compareTo(new BigDecimal("499.0")) >= 0 ? BigDecimal.ZERO : new BigDecimal("40.0");
        BigDecimal platformFee = new BigDecimal("5.0");
        BigDecimal taxes = totalAmount.multiply(new BigDecimal("0.05")).setScale(0, java.math.RoundingMode.HALF_UP);
        BigDecimal discount = BigDecimal.ZERO;
        
        if (orderRequest.getCouponCode() != null && !orderRequest.getCouponCode().isEmpty()) {
            Coupon coupon = couponService.validateCoupon(orderRequest.getCouponCode(), totalAmount);
            discount = coupon.getDiscountAmount();
            order.setCoupon(coupon);
        }

        totalAmount = totalAmount.add(deliveryFee).add(platformFee).add(taxes).subtract(discount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        order.setDeliveryFee(deliveryFee);
        order.setDiscount(discount);
        
        // Save Order Items
        orderItemRepository.saveAll(orderItems);
        order = orderRepository.save(order);

        // 4. Process Payment
        Payment payment = paymentService.processPayment(order, orderRequest.getPaymentType());
        if ("FAILED".equals(payment.getPaymentStatus())) {
            throw new RuntimeException("Payment failed");
        }

        // 5. Call Billing Service Directly
        try {
            callBillingService(order, payment.getPaymentType());
        } catch (Exception ex) {
            // Compensation: Refund the payment if billing fails
            payment.setPaymentStatus("REFUNDED");
            throw new BillingException("Billing failed: " + ex.getMessage());
        }

        // If billing succeeds, set order status to PENDING
        order.setStatus("PENDING");
        order = orderRepository.save(order);
        
        // Save initial order status history
        OrderStatusHistory initialHistory = new OrderStatusHistory(
            null,
            order.getId(),
            "PENDING",
            (order.getUser() != null && order.getUser().getName() != null) ? order.getUser().getName() : "User",
            LocalDateTime.now(),
            "Order placed successfully"
        );
        orderStatusHistoryRepository.save(initialHistory);

        // Increase coupon usage
        if (order.getCoupon() != null) {
            Coupon c = order.getCoupon();
            c.setCurrentUses(c.getCurrentUses() + 1);
            couponService.addCoupon(c);
        }
        
        notificationService.createNotification(order.getUser().getId(), "Your order has been placed successfully.");
        return order;
    }

    private void callBillingService(Order order, String paymentType) {
        GenerateBillRequest request = new GenerateBillRequest();
        request.setOrderId(order.getId());
        request.setUserId(order.getUser().getId());
        request.setTotalAmount(order.getTotalAmount());
        
        // Call local bean instead of HTTP SOAP to avoid deadlock inside transaction
        GenerateBillResponse response = billingEndpoint.generateBill(request);

        if ("FAILED".equals(response.getStatus())) {
            throw new BillingException("Billing failed: " + response.getMessage());
        }

        Bill bill = new Bill();
        bill.setOrder(order);
        bill.setBillNumber(response.getBillId());
        bill.setAmount(response.getAmount());
        bill.setStatus(response.getStatus());
        bill.setCreatedAt(LocalDateTime.now());
        billRepository.save(bill);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Transactional(rollbackFor = Exception.class)
    public Order updateOrder(Long id, OrderRequest orderRequest) {
        Order order = getOrderById(id);
        if ("CANCELLED".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus())) {
            throw new InvalidOrderException("Cannot update an order that is " + order.getStatus());
        }
        if (orderRequest.getPaymentType() != null && !orderRequest.getPaymentType().isEmpty()) {
            order.setPaymentType(orderRequest.getPaymentType());
        }
        if (orderRequest.getAddressId() != null) {
            Address address = addressService.getAddressById(orderRequest.getAddressId());
            order.setDeliveryAddress(address);
        }
        return orderRepository.save(order);
    }

    @Autowired
    private NotificationService notificationService;

    public List<OrderStatusHistory> getOrderStatusHistory(Long orderId) {
        getOrderById(orderId);
        return orderStatusHistoryRepository.findByOrderIdOrderByChangedAtAsc(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    public Order transitionOrderStatus(Long id, String targetStatus, String changedBy, String comment) {
        Order order = getOrderById(id);
        String currentStatus = order.getStatus();

        if (targetStatus == null || targetStatus.trim().isEmpty()) {
            throw new InvalidOrderException("Target status cannot be empty");
        }
        targetStatus = targetStatus.trim().toUpperCase();

        if (targetStatus.equalsIgnoreCase(currentStatus)) {
            return order;
        }

        if ("DELIVERED".equals(currentStatus) || "CANCELLED".equals(currentStatus) || "REJECTED".equals(currentStatus)) {
            throw new InvalidOrderException("Cannot change status of an order that is already " + currentStatus);
        }

        boolean isValid = false;
        if ("PENDING".equals(currentStatus)) {
            isValid = "ACCEPTED".equals(targetStatus) || "REJECTED".equals(targetStatus) || "CANCELLED".equals(targetStatus);
        } else if ("ACCEPTED".equals(currentStatus)) {
            isValid = "PREPARING".equals(targetStatus);
        } else if ("PREPARING".equals(currentStatus)) {
            isValid = "READY".equals(targetStatus);
        } else if ("READY".equals(currentStatus)) {
            isValid = "OUT_FOR_DELIVERY".equals(targetStatus);
        } else if ("OUT_FOR_DELIVERY".equals(currentStatus)) {
            isValid = "DELIVERED".equals(targetStatus);
        }

        if (!isValid) {
            throw new InvalidOrderException("Invalid status transition from " + currentStatus + " to " + targetStatus);
        }

        order.setStatus(targetStatus);
        order = orderRepository.save(order);

        String actor = (changedBy != null && !changedBy.trim().isEmpty()) ? changedBy : "Admin";
        String historyComment = comment;
        if (historyComment == null || historyComment.trim().isEmpty()) {
            switch (targetStatus) {
                case "ACCEPTED": historyComment = "Order accepted by restaurant"; break;
                case "PREPARING": historyComment = "Kitchen started preparing food"; break;
                case "READY": historyComment = "Food is ready for delivery"; break;
                case "OUT_FOR_DELIVERY": historyComment = "Order dispatched with delivery partner"; break;
                case "DELIVERED": historyComment = "Order safely delivered to customer"; break;
                case "REJECTED": historyComment = "Order rejected by restaurant"; break;
                case "CANCELLED": historyComment = "Order cancelled"; break;
                default: historyComment = "Status updated to " + targetStatus; break;
            }
        }

        OrderStatusHistory history = new OrderStatusHistory(
            null,
            order.getId(),
            targetStatus,
            actor,
            LocalDateTime.now(),
            historyComment
        );
        orderStatusHistoryRepository.save(history);

        String notifMsg;
        switch (targetStatus) {
            case "ACCEPTED":
                notifMsg = "Your order has been accepted by the restaurant.";
                break;
            case "PREPARING":
                notifMsg = "Your food is being prepared.";
                break;
            case "READY":
                notifMsg = "Your order is ready.";
                break;
            case "OUT_FOR_DELIVERY":
                notifMsg = "Your order is on the way.";
                break;
            case "DELIVERED":
                notifMsg = "Your order has been delivered. Enjoy your meal!";
                break;
            case "REJECTED":
                notifMsg = "Sorry, your order was rejected.";
                break;
            case "CANCELLED":
                notifMsg = "Your order has been cancelled.";
                break;
            default:
                notifMsg = "Your order #" + order.getId() + " is now " + targetStatus;
        }
        notificationService.createNotification(order.getUser().getId(), notifMsg);

        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long id) {
        transitionOrderStatus(id, "CANCELLED", "User", "Cancelled by user");
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(Long id, String status) {
        transitionOrderStatus(id, status, "Admin", null);
    }
}
