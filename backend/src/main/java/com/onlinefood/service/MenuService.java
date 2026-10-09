package com.onlinefood.service;

import com.onlinefood.entity.MenuItem;
import com.onlinefood.exception.MenuItemNotFoundException;
import com.onlinefood.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    public Page<MenuItem> getMenuItems(String category, String search, Pageable pageable) {
        return menuItemRepository.searchMenuItems(category, search, pageable);
    }

    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new MenuItemNotFoundException("Menu Item not found with id: " + id));
    }

    public MenuItem addMenuItem(MenuItem menuItem) {
        if (menuItem.getAvailable() == null) menuItem.setAvailable(true);
        if (menuItem.getIsVeg() == null) menuItem.setIsVeg(true);
        if (menuItem.getRating() == null) menuItem.setRating(4.5);
        if (menuItem.getRestaurantName() == null) menuItem.setRestaurantName("BiteBliss Signature");
        if (menuItem.getPrepTimeMinutes() == null) menuItem.setPrepTimeMinutes(25);
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(Long id, MenuItem updatedItem) {
        MenuItem existingItem = getMenuItemById(id);
        if (updatedItem.getName() != null) existingItem.setName(updatedItem.getName());
        if (updatedItem.getDescription() != null) existingItem.setDescription(updatedItem.getDescription());
        if (updatedItem.getPrice() != null) existingItem.setPrice(updatedItem.getPrice());
        if (updatedItem.getCategory() != null) existingItem.setCategory(updatedItem.getCategory());
        if (updatedItem.getAvailable() != null) existingItem.setAvailable(updatedItem.getAvailable());
        if (updatedItem.getImageUrl() != null) existingItem.setImageUrl(updatedItem.getImageUrl());
        if (updatedItem.getIsVeg() != null) existingItem.setIsVeg(updatedItem.getIsVeg());
        if (updatedItem.getRating() != null) existingItem.setRating(updatedItem.getRating());
        if (updatedItem.getRestaurantName() != null) existingItem.setRestaurantName(updatedItem.getRestaurantName());
        if (updatedItem.getPrepTimeMinutes() != null) existingItem.setPrepTimeMinutes(updatedItem.getPrepTimeMinutes());
        return menuItemRepository.save(existingItem);
    }

    public void deleteMenuItem(Long id) {
        MenuItem item = getMenuItemById(id);
        menuItemRepository.delete(item);
    }
}
