package com.onlinefood.mongo.config;

import com.onlinefood.mongo.document.ActivityLogMongoDocument;
import com.onlinefood.mongo.document.OrderMongoDocument;
import com.onlinefood.mongo.document.ReviewMongoDocument;
import com.onlinefood.mongo.repository.ActivityLogMongoRepository;
import com.onlinefood.mongo.repository.OrderMongoRepository;
import com.onlinefood.mongo.repository.ReviewMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class MongoDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MongoDataLoader.class);

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private OrderMongoRepository orderMongoRepository;

    @Autowired
    private ReviewMongoRepository reviewMongoRepository;

    @Autowired
    private ActivityLogMongoRepository activityLogMongoRepository;

    @Override
    public void run(String... args) {
        try {
            String dbName = mongoTemplate.getDb().getName();
            log.info("🍃 MongoDB Connected successfully! Database: '{}'", dbName);

            // Log startup activity in MongoDB
            ActivityLogMongoDocument startupLog = new ActivityLogMongoDocument(
                    null,
                    "SYSTEM_STARTUP",
                    1L,
                    "system@bitebliss.com",
                    "BiteBliss Polyglot Backend connected to MongoDB database: " + dbName,
                    "127.0.0.1",
                    LocalDateTime.now()
            );
            activityLogMongoRepository.save(startupLog);

            // Seed initial reviews if empty
            if (reviewMongoRepository.count() == 0) {
                List<ReviewMongoDocument> initialReviews = Arrays.asList(
                        new ReviewMongoDocument(null, 1L, "Demo User", 1L, "Hyderabadi Chicken Biryani", 5,
                                "Authentic royal aroma, long grain basmati, and wonderfully tender chicken!",
                                LocalDateTime.now().minusHours(4)),
                        new ReviewMongoDocument(null, 1L, "Rahul Verma", 2L, "Paneer Butter Masala", 5,
                                "Super creamy rich makhani gravy. Pair it with butter naan!",
                                LocalDateTime.now().minusHours(2)),
                        new ReviewMongoDocument(null, 1L, "Pooja Nair", 3L, "Gulab Jamun", 5,
                                "Warm, melt-in-mouth soft dumplings dipped in saffron rose syrup. Best dessert!",
                                LocalDateTime.now().minusHours(1))
                );
                reviewMongoRepository.saveAll(initialReviews);
                log.info("🍃 MongoDB: Seeded {} initial customer reviews", initialReviews.size());
            }

            // Seed initial sample order snapshot if empty
            if (orderMongoRepository.count() == 0) {
                OrderMongoDocument sampleOrder = new OrderMongoDocument();
                sampleOrder.setOrderId(1001L);
                sampleOrder.setUserId(1L);
                sampleOrder.setCustomerName("Demo User");
                sampleOrder.setCustomerEmail("demo@food.com");
                sampleOrder.setTotalAmount(459.0);
                sampleOrder.setDiscountAmount(50.0);
                sampleOrder.setFinalAmount(409.0);
                sampleOrder.setCouponCode("WELCOME50");
                sampleOrder.setStatus("DELIVERED");
                sampleOrder.setPaymentMethod("ONLINE");
                sampleOrder.setDeliveryAddress("#42, 4th Cross, Green Glen Layout, Bellandur, Bengaluru - 560103");
                sampleOrder.setItems(Arrays.asList(
                        new OrderMongoDocument.OrderItemSnapshot(1L, "Hyderabadi Chicken Biryani", 329.0, 1, 329.0),
                        new OrderMongoDocument.OrderItemSnapshot(3L, "Gulab Jamun", 99.0, 1, 99.0)
                ));
                sampleOrder.setGroupSplit(new OrderMongoDocument.GroupSplitInfo(true, 2, 204.5, Arrays.asList("Demo User", "Alex")));
                sampleOrder.setCreatedAt(LocalDateTime.now().minusDays(1));

                orderMongoRepository.save(sampleOrder);
                log.info("🍃 MongoDB: Seeded sample order document in 'orders' collection");
            }

        } catch (Exception e) {
            log.error("🍃 MongoDB initialization warning: {}", e.getMessage());
        }
    }
}
