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
    "billId",
    "orderId",
    "amount",
    "status",
    "message"
})
@XmlRootElement(name = "GenerateBillResponse", namespace = "http://onlinefood.com/billing")
public class GenerateBillResponse {

    @XmlElement(required = true, namespace = "http://onlinefood.com/billing")
    protected String billId;
    
    @XmlElement(namespace = "http://onlinefood.com/billing")
    protected long orderId;
    
    @XmlElement(namespace = "http://onlinefood.com/billing")
    protected java.math.BigDecimal amount;
    
    @XmlElement(required = true, namespace = "http://onlinefood.com/billing")
    protected String status;
    
    @XmlElement(required = true, namespace = "http://onlinefood.com/billing")
    protected String message;

    public String getBillId() {
        return billId;
    }

    public void setBillId(String billId) {
        this.billId = billId;
    }

    public long getOrderId() {
        return orderId;
    }

    public void setOrderId(long orderId) {
        this.orderId = orderId;
    }

    public java.math.BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(java.math.BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
