package com.memoryheist.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.memoryheist.model.Level;
import com.memoryheist.repository.LevelRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final LevelRepository levelRepository;
    private final ObjectMapper objectMapper;

    public DataSeeder(LevelRepository levelRepository) {
        this.levelRepository = levelRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public void run(String... args) {
        long existingCount = levelRepository.count();
        if (existingCount > 0) {
            logger.info("Found {} existing levels in MongoDB. Skipping seed data to preserve database.", existingCount);
            return;
        }

        logger.info("No existing levels found. Seeding handcrafted maps from maps.json...");
        try {
            ClassPathResource resource = new ClassPathResource("maps.json");
            try (InputStream is = resource.getInputStream()) {
                List<Level> levels = objectMapper.readValue(is, new TypeReference<List<Level>>() {});
                for (Level level : levels) {
                    if (level.getId() == null || level.getId().isBlank()) {
                        level.setId("level-" + level.getLevelNumber());
                    }
                    levelRepository.save(level);
                }
                logger.info("Successfully seeded {} levels into MongoDB.", levels.size());
            }
        } catch (Exception e) {
            logger.error("Failed to seed initial levels from maps.json: {}", e.getMessage(), e);
        }
    }
}
