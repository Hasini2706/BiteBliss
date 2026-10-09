package com.onlinefood.soap;

import com.onlinefood.soap.dto.GenerateBillRequest;
import com.onlinefood.soap.dto.GenerateBillResponse;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import java.util.UUID;

@Endpoint
public class BillingEndpoint {

    private static final String NAMESPACE_URI = "http://onlinefood.com/billing";

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "GenerateBillRequest")
    @ResponsePayload
    public GenerateBillResponse generateBill(@RequestPayload GenerateBillRequest request) {
        GenerateBillResponse response = new GenerateBillResponse();
        
        // Simulating SOAP billing service logic
        response.setOrderId(request.getOrderId());
        response.setAmount(request.getTotalAmount());
        
        // Simulating failure for negative amounts or 0
        if (request.getTotalAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            response.setStatus("FAILED");
            response.setMessage("Invalid amount for billing");
        } else {
            response.setBillId("BILL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            response.setStatus("SUCCESS");
            response.setMessage("Bill generated successfully");
        }
        
        return response;
    }
}
