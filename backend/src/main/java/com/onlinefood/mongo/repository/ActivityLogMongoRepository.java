package com.onlinefood.mongo.repository;

import com.onlinefood.mongo.document.ActivityLogMongoDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogMongoRepository extends MongoRepository<ActivityLogMongoDocument, String> {
    List<ActivityLogMongoDocument> findTop50ByOrderByTimestampDesc();
    List<ActivityLogMongoDocument> findByUserIdOrderByTimestampDesc(Long userId);
}
