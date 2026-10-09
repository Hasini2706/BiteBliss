package com.onlinefood.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private String category;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(length = 1000)
    private String imageUrl;

    private Boolean isVeg = true;

    private Double rating = 4.3;

    private String restaurantName = "BiteBliss Signature";

    private Integer prepTimeMinutes = 25;

    public MenuItem() {
    }

    public MenuItem(Long id, String name, String description, BigDecimal price, String category, Boolean available, String imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.available = available != null ? available : true;
        this.imageUrl = imageUrl;
        this.isVeg = true;
        this.rating = 4.3;
        this.restaurantName = "BiteBliss Signature";
        this.prepTimeMinutes = 25;
    }

    public MenuItem(Long id, String name, String description, BigDecimal price, String category, Boolean available, String imageUrl, Boolean isVeg, Double rating, String restaurantName, Integer prepTimeMinutes) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.available = available != null ? available : true;
        this.imageUrl = imageUrl;
        this.isVeg = isVeg != null ? isVeg : true;
        this.rating = rating != null ? rating : 4.3;
        this.restaurantName = restaurantName != null ? restaurantName : "BiteBliss Signature";
        this.prepTimeMinutes = prepTimeMinutes != null ? prepTimeMinutes : 25;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsVeg() {
        return isVeg;
    }

    public void setIsVeg(Boolean isVeg) {
        this.isVeg = isVeg;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public Integer getPrepTimeMinutes() {
        return prepTimeMinutes;
    }

    public void setPrepTimeMinutes(Integer prepTimeMinutes) {
        this.prepTimeMinutes = prepTimeMinutes;
    }
}
