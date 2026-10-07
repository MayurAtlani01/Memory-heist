package com.memoryheist.controller;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final MongoTemplate mongoTemplate;

    public HealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", Instant.now().toString());

        try {
            // Verify MongoDB connectivity
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            response.put("database", "connected");
        } catch (Exception e) {
            response.put("database", "disconnected: " + e.getMessage());
            response.put("status", "DEGRADED");
        }

        return ResponseEntity.ok(response);
    }
}
