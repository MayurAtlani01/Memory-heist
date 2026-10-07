package com.memoryheist.repository;

import com.memoryheist.model.Attempt;
import com.memoryheist.model.AttemptStatus;
import com.memoryheist.model.GameMode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttemptRepository extends MongoRepository<Attempt, String> {
    List<Attempt> findByPlayerId(String playerId);
    List<Attempt> findByPlayerIdAndModeAndStatusAndSuccessTrue(String playerId, GameMode mode, AttemptStatus status);
    List<Attempt> findByPlayerIdAndLevelId(String playerId, String levelId);
}
