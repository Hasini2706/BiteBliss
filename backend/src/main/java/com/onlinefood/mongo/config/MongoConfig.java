package com.onlinefood.mongo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.onlinefood.repository")
@EnableMongoRepositories(basePackages = "com.onlinefood.mongo.repository")
public class MongoConfig {
}
