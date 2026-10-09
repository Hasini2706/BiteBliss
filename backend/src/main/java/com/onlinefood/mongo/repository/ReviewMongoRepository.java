package com.onlinefood.mongo.repository;

import com.onlinefood.mongo.document.ReviewMongoDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewMongoRepository extends MongoRepository<ReviewMongoDocument, String> {
    List<ReviewMongoDocument> findByMenuItemIdOrderByCreatedAtDesc(Long menuItemId);
    List<ReviewMongoDocument> findAllByOrderByCreatedAtDesc();
}
