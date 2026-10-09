package com.onlinefood.service;

import com.onlinefood.entity.Order;
import com.onlinefood.entity.Payment;
import com.onlinefood.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment processPayment(Order order, String paymentType) {
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setPaymentType(paymentType);

        if ("CASH_ON_DELIVERY".equalsIgnoreCase(paymentType)) {
            payment.setPaymentStatus("PENDING");
            payment.setTransactionId("COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        } else {
            // Simulate payment processing for UPI or CARD
            if (java.util.concurrent.ThreadLocalRandom.current().nextInt(100) < 10) {
                payment.setPaymentStatus("FAILED");
            } else {
                payment.setPaymentStatus("SUCCESS");
            }
            payment.setTransactionId("TXN-" + UUID.randomUUID().toString().toUpperCase());
        }

        return paymentRepository.save(payment);
    }
}
