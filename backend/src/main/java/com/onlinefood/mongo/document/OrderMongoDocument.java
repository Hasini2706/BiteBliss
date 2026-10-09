package com.onlinefood.mongo.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
public class OrderMongoDocument {

    @Id
    private String id;

    private Long orderId;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private Double totalAmount;
    private Double discountAmount;
    private Double finalAmount;
    private String couponCode;
    private String status;
    private String paymentMethod;
    private String deliveryAddress;
    private List<OrderItemSnapshot> items = new ArrayList<>();
    private GroupSplitInfo groupSplit;
    private LocalDateTime createdAt = LocalDateTime.now();

    public OrderMongoDocument() {
    }

    public OrderMongoDocument(String id, Long orderId, Long userId, String customerName, String customerEmail,
                              Double totalAmount, Double discountAmount, Double finalAmount, String couponCode,
                              String status, String paymentMethod, String deliveryAddress,
                              List<OrderItemSnapshot> items, GroupSplitInfo groupSplit, LocalDateTime createdAt) {
        this.id = id;
        this.orderId = orderId;
        this.userId = userId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.totalAmount = totalAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.couponCode = couponCode;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.deliveryAddress = deliveryAddress;
        this.items = items != null ? items : new ArrayList<>();
        this.groupSplit = groupSplit;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public List<OrderItemSnapshot> getItems() { return items; }
    public void setItems(List<OrderItemSnapshot> items) { this.items = items; }

    public GroupSplitInfo getGroupSplit() { return groupSplit; }
    public void setGroupSplit(GroupSplitInfo groupSplit) { this.groupSplit = groupSplit; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class OrderItemSnapshot {
        private Long menuItemId;
        private String itemName;
        private Double price;
        private Integer quantity;
        private Double subtotal;

        public OrderItemSnapshot() {}

        public OrderItemSnapshot(Long menuItemId, String itemName, Double price, Integer quantity, Double subtotal) {
            this.menuItemId = menuItemId;
            this.itemName = itemName;
            this.price = price;
            this.quantity = quantity;
            this.subtotal = subtotal;
        }

        public Long getMenuItemId() { return menuItemId; }
        public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getSubtotal() { return subtotal; }
        public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    }

    public static class GroupSplitInfo {
        private boolean isGroupSplit;
        private Integer totalMembers;
        private Double perPersonAmount;
        private List<String> memberNames;

        public GroupSplitInfo() {}

        public GroupSplitInfo(boolean isGroupSplit, Integer totalMembers, Double perPersonAmount, List<String> memberNames) {
            this.isGroupSplit = isGroupSplit;
            this.totalMembers = totalMembers;
            this.perPersonAmount = perPersonAmount;
            this.memberNames = memberNames;
        }

        public boolean isGroupSplit() { return isGroupSplit; }
        public void setGroupSplit(boolean groupSplit) { isGroupSplit = groupSplit; }

        public Integer getTotalMembers() { return totalMembers; }
        public void setTotalMembers(Integer totalMembers) { this.totalMembers = totalMembers; }

        public Double getPerPersonAmount() { return perPersonAmount; }
        public void setPerPersonAmount(Double perPersonAmount) { this.perPersonAmount = perPersonAmount; }

        public List<String> getMemberNames() { return memberNames; }
        public void setMemberNames(List<String> memberNames) { this.memberNames = memberNames; }
    }
}
