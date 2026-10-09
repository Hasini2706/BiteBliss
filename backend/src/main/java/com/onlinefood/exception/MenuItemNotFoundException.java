package com.onlinefood.exception;

public class MenuItemNotFoundException extends ResourceNotFoundException {
    public MenuItemNotFoundException(String message) {
        super(message);
    }
}
