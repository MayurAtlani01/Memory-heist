package com.memoryheist.repository;

import com.memoryheist.model.Level;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LevelRepository extends MongoRepository<Level, String> {
    List<Level> findAllByOrderByLevelNumberAsc();
    Optional<Level> findByLevelNumber(int levelNumber);
}
