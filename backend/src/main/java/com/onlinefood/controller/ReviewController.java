package com.onlinefood.controller;

import com.onlinefood.entity.Review;
import com.onlinefood.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/menu/{menuItemId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long menuItemId) {
        return ResponseEntity.ok(reviewService.getReviewsByMenuItemId(menuItemId));
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @RequestParam Long userId,
            @RequestParam Long menuItemId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment) {
        return ResponseEntity.ok(reviewService.addReview(userId, menuItemId, rating, comment));
    }
}
