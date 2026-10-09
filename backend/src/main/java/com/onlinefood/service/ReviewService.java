package com.onlinefood.service;

import com.onlinefood.entity.MenuItem;
import com.onlinefood.entity.Review;
import com.onlinefood.entity.User;
import com.onlinefood.repository.MenuItemRepository;
import com.onlinefood.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<Review> getReviewsByMenuItemId(Long menuItemId) {
        return reviewRepository.findByMenuItemId(menuItemId);
    }

    public Review addReview(Long userId, Long menuItemId, Integer rating, String comment) {
        // Here we could validate if the user actually ordered the item by checking OrderItemRepository
        // For simplicity in this project, we just add the review
        
        User user = userService.getUserById(userId);
        MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow();
        
        Review review = new Review();
        review.setUser(user);
        review.setMenuItem(menuItem);
        review.setRating(rating);
        review.setComment(comment);
        
        return reviewRepository.save(review);
    }
}
