package com.onlinefood.mongo.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "activity_logs")
public class ActivityLogMongoDocument {

    @Id
    private String id;

    private String action;
    private Long userId;
    private String userEmail;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp = LocalDateTime.now();

    public ActivityLogMongoDocument() {
    }

    public ActivityLogMongoDocument(String id, String action, Long userId, String userEmail,
                                    String details, String ipAddress, LocalDateTime timestamp) {
        this.id = id;
        this.action = action;
        this.userId = userId;
        this.userEmail = userEmail;
        this.details = details;
        this.ipAddress = ipAddress;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
