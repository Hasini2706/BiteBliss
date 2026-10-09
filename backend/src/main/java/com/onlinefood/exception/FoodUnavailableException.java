package com.onlinefood.exception;

public class FoodUnavailableException extends RuntimeException {
    public FoodUnavailableException(String message) {
        super(message);
    }
}
