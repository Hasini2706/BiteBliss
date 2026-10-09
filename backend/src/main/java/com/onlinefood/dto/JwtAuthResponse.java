package com.onlinefood.dto;

import com.onlinefood.entity.User;

public class JwtAuthResponse {
    private String accessToken;
    private User user;

    public JwtAuthResponse() {
    }

    public JwtAuthResponse(String accessToken, User user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
