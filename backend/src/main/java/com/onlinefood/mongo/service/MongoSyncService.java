package com.onlinefood.mongo.service;

import com.onlinefood.entity.Address;
import com.onlinefood.entity.Order;
import com.onlinefood.entity.OrderItem;
import com.onlinefood.entity.Review;
import com.onlinefood.mongo.document.ActivityLogMongoDocument;
import com.onlinefood.mongo.document.OrderMongoDocument;
import com.onlinefood.mongo.document.ReviewMongoDocument;
import com.onlinefood.mongo.repository.ActivityLogMongoRepository;
import com.onlinefood.mongo.repository.OrderMongoRepository;
import com.onlinefood.mongo.repository.ReviewMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MongoSyncService {

    private static final Logger log = LoggerFactory.getLogger(MongoSyncService.class);

    private final OrderMongoRepository orderMongoRepository;
    private final ReviewMongoRepository reviewMongoRepository;
    private final ActivityLogMongoRepository activityLogMongoRepository;
    private final MongoTemplate mongoTemplate;

    @Autowired
    public MongoSyncService(OrderMongoRepository orderMongoRepository,
                            ReviewMongoRepository reviewMongoRepository,
                            ActivityLogMongoRepository activityLogMongoRepository,
                            MongoTemplate mongoTemplate) {
        this.orderMongoRepository = orderMongoRepository;
        this.reviewMongoRepository = reviewMongoRepository;
        this.activityLogMongoRepository = activityLogMongoRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public OrderMongoDocument syncOrderSnapshot(Order order) {
        try {
            List<OrderMongoDocument.OrderItemSnapshot> itemSnapshots = new ArrayList<>();
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    OrderMongoDocument.OrderItemSnapshot snap = new OrderMongoDocument.OrderItemSnapshot(
                            item.getMenuItem() != null ? item.getMenuItem().getId() : null,
                            item.getMenuItem() != null ? item.getMenuItem().getName() : "Unknown Item",
                            item.getPrice() != null ? item.getPrice().doubleValue() : 0.0,
                            item.getQuantity() != null ? item.getQuantity() : 1,
                            item.getSubtotal() != null ? item.getSubtotal().doubleValue() : 0.0
                    );
                    itemSnapshots.add(snap);
                }
            }

            String addressStr = "";
            Address addr = order.getDeliveryAddress();
            if (addr != null) {
                addressStr = (addr.getAddressLine1() != null ? addr.getAddressLine1() : "") +
                        (addr.getAddressLine2() != null ? ", " + addr.getAddressLine2() : "") +
                        (addr.getCity() != null ? ", " + addr.getCity() : "") +
                        (addr.getState() != null ? ", " + addr.getState() : "") +
                        (addr.getPincode() != null ? " - " + addr.getPincode() : "");
            }

            String coupon = order.getCoupon() != null ? order.getCoupon().getCode() : null;
            Double discount = order.getDiscount() != null ? order.getDiscount().doubleValue() : 0.0;
            Double total = order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0;
            Double finalAmt = Math.max(0.0, total - discount + (order.getDeliveryFee() != null ? order.getDeliveryFee().doubleValue() : 0.0));

            OrderMongoDocument doc = new OrderMongoDocument();
            doc.setOrderId(order.getId());
            doc.setUserId(order.getUser() != null ? order.getUser().getId() : null);
            doc.setCustomerName(order.getUser() != null ? order.getUser().getName() : "Guest");
            doc.setCustomerEmail(order.getUser() != null ? order.getUser().getEmail() : "");
            doc.setTotalAmount(total);
            doc.setDiscountAmount(discount);
            doc.setFinalAmount(finalAmt);
            doc.setCouponCode(coupon);
            doc.setStatus(order.getStatus());
            doc.setPaymentMethod(order.getPaymentType() != null ? order.getPaymentType() : "COD");
            doc.setDeliveryAddress(addressStr);
            doc.setItems(itemSnapshots);
            doc.setCreatedAt(order.getOrderDate() != null ? order.getOrderDate() : LocalDateTime.now());

            OrderMongoDocument saved = orderMongoRepository.save(doc);
            log.info("MongoDB: Synchronized order document {} for order ID {}", saved.getId(), order.getId());
            return saved;
        } catch (Exception e) {
            log.error("MongoDB: Failed to sync order document: {}", e.getMessage(), e);
            return null;
        }
    }

    public ReviewMongoDocument syncReview(Review review, String userName, String dishName) {
        try {
            ReviewMongoDocument doc = new ReviewMongoDocument();
            doc.setUserId(review.getUser() != null ? review.getUser().getId() : null);
            doc.setUserName(userName);
            doc.setMenuItemId(review.getMenuItem() != null ? review.getMenuItem().getId() : null);
            doc.setDishName(dishName);
            doc.setRating(review.getRating());
            doc.setComment(review.getComment());
            doc.setCreatedAt(LocalDateTime.now());
            return reviewMongoRepository.save(doc);
        } catch (Exception e) {
            log.error("MongoDB: Failed to sync review document: {}", e.getMessage(), e);
            return null;
        }
    }

    public ActivityLogMongoDocument logActivity(String action, Long userId, String userEmail, String details, String ipAddress) {
        try {
            ActivityLogMongoDocument logDoc = new ActivityLogMongoDocument();
            logDoc.setAction(action);
            logDoc.setUserId(userId);
            logDoc.setUserEmail(userEmail);
            logDoc.setDetails(details);
            logDoc.setIpAddress(ipAddress);
            logDoc.setTimestamp(LocalDateTime.now());
            return activityLogMongoRepository.save(logDoc);
        } catch (Exception e) {
            log.error("MongoDB: Failed to save activity log: {}", e.getMessage(), e);
            return null;
        }
    }

    public Map<String, Object> getMongoMetadata() {
        Map<String, Object> meta = new HashMap<>();
        try {
            String dbName = mongoTemplate.getDb().getName();
            Set<String> collections = mongoTemplate.getCollectionNames();
            long orderCount = orderMongoRepository.count();
            long reviewCount = reviewMongoRepository.count();
            long activityCount = activityLogMongoRepository.count();

            meta.put("status", "CONNECTED");
            meta.put("database", dbName);
            meta.put("collections", collections);
            meta.put("totalOrdersCount", orderCount);
            meta.put("totalReviewsCount", reviewCount);
            meta.put("totalActivityLogsCount", activityCount);
        } catch (Exception e) {
            meta.put("status", "ERROR");
            meta.put("message", e.getMessage());
        }
        return meta;
    }
}
