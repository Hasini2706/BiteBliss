package com.onlinefood.exception;

public class FoodNotAvailableException extends RuntimeException {
    public FoodNotAvailableException(String message) {
        super(message);
    }
}
