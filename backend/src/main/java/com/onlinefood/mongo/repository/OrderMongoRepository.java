package com.onlinefood.mongo.repository;

import com.onlinefood.mongo.document.OrderMongoDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderMongoRepository extends MongoRepository<OrderMongoDocument, String> {
    Optional<OrderMongoDocument> findByOrderId(Long orderId);
    List<OrderMongoDocument> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<OrderMongoDocument> findAllByOrderByCreatedAtDesc();
}
