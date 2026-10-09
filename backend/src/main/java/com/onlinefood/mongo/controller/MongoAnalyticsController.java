package com.onlinefood.mongo.controller;

import com.onlinefood.mongo.document.ActivityLogMongoDocument;
import com.onlinefood.mongo.document.OrderMongoDocument;
import com.onlinefood.mongo.document.ReviewMongoDocument;
import com.onlinefood.mongo.repository.ActivityLogMongoRepository;
import com.onlinefood.mongo.repository.OrderMongoRepository;
import com.onlinefood.mongo.repository.ReviewMongoRepository;
import com.onlinefood.mongo.service.MongoSyncService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mongo")
@CrossOrigin(origins = "*")
public class MongoAnalyticsController {

    private final MongoSyncService mongoSyncService;
    private final OrderMongoRepository orderMongoRepository;
    private final ReviewMongoRepository reviewMongoRepository;
    private final ActivityLogMongoRepository activityLogMongoRepository;

    @Autowired
    public MongoAnalyticsController(MongoSyncService mongoSyncService,
                                    OrderMongoRepository orderMongoRepository,
                                    ReviewMongoRepository reviewMongoRepository,
                                    ActivityLogMongoRepository activityLogMongoRepository) {
        this.mongoSyncService = mongoSyncService;
        this.orderMongoRepository = orderMongoRepository;
        this.reviewMongoRepository = reviewMongoRepository;
        this.activityLogMongoRepository = activityLogMongoRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(mongoSyncService.getMongoMetadata());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderMongoDocument>> getMongoOrders() {
        return ResponseEntity.ok(orderMongoRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<List<OrderMongoDocument>> getUserMongoOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderMongoRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewMongoDocument>> getMongoReviews() {
        return ResponseEntity.ok(reviewMongoRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLogMongoDocument>> getMongoActivities() {
        return ResponseEntity.ok(activityLogMongoRepository.findTop50ByOrderByTimestampDesc());
    }

    @PostMapping("/activity")
    public ResponseEntity<ActivityLogMongoDocument> logActivity(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        String action = (String) body.getOrDefault("action", "USER_ACTION");
        Long userId = body.get("userId") != null ? Long.valueOf(body.get("userId").toString()) : null;
        String userEmail = (String) body.getOrDefault("userEmail", "anonymous");
        String details = body.get("details") != null ? body.get("details").toString() : "";
        String ip = request.getRemoteAddr();

        ActivityLogMongoDocument saved = mongoSyncService.logActivity(action, userId, userEmail, details, ip);
        return ResponseEntity.ok(saved);
    }
}
