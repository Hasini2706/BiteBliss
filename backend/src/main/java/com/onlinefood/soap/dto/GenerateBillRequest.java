package com.onlinefood.soap.dto;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlType;
import lombok.Getter;
import lombok.Setter;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "orderId",
    "userId",
    "totalAmount"
})
@XmlRootElement(name = "GenerateBillRequest", namespace = "http://onlinefood.com/billing")
public class GenerateBillRequest {
    @XmlElement(namespace = "http://onlinefood.com/billing")
    protected long orderId;
    
    @XmlElement(namespace = "http://onlinefood.com/billing")
    protected long userId;
    
    @XmlElement(namespace = "http://onlinefood.com/billing")
    protected java.math.BigDecimal totalAmount;

    public long getOrderId() {
        return orderId;
    }

    public void setOrderId(long orderId) {
        this.orderId = orderId;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public java.math.BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(java.math.BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
