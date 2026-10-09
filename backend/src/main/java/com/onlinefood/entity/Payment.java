package com.onlinefood.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    // CASH_ON_DELIVERY, UPI, CARD
    private String paymentType;

    // PENDING, SUCCESS, FAILED
    private String paymentStatus;

    private String transactionId;

    public Payment() {
    }

    public Payment(Long id, Long orderId, String paymentType, String paymentStatus, String transactionId) {
        this.id = id;
        this.orderId = orderId;
        this.paymentType = paymentType;
        this.paymentStatus = paymentStatus;
        this.transactionId = transactionId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}
