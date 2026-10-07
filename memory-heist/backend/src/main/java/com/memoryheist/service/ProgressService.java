package com.memoryheist.service;

import com.memoryheist.dto.PlayerProgressDto;
import com.memoryheist.model.Attempt;
import com.memoryheist.model.AttemptStatus;
import com.memoryheist.model.GameMode;
import com.memoryheist.repository.AttemptRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProgressService {

    private final AttemptRepository attemptRepository;

    public ProgressService(AttemptRepository attemptRepository) {
        this.attemptRepository = attemptRepository;
    }

    public PlayerProgressDto getPlayerProgress(String playerId) {
        if (playerId == null || playerId.isBlank()) {
            return new PlayerProgressDto("", Collections.emptySet(), Collections.emptyMap(), 0, 0, 0);
        }

        List<Attempt> allAttempts = attemptRepository.findByPlayerId(playerId);

        int totalAttempts = allAttempts.size();
        int successfulHeists = 0;
        Set<String> completedLevelIds = new HashSet<>();
        Map<String, Integer> bestScores = new HashMap<>();

        for (Attempt att : allAttempts) {
            if (Boolean.TRUE.equals(att.getSuccess()) && att.getStatus() == AttemptStatus.COMPLETED) {
                successfulHeists++;

                // Practice mode attempts are excluded from normal personal bests & official progression
                if (att.getMode() == GameMode.NORMAL) {
                    completedLevelIds.add(att.getLevelId());
                    int score = att.getScore() != null ? att.getScore() : 0;
                    int currentBest = bestScores.getOrDefault(att.getLevelId(), 0);
                    if (score > currentBest) {
                        bestScores.put(att.getLevelId(), score);
                    }
                }
            }
        }

        int totalScore = bestScores.values().stream().mapToInt(Integer::intValue).sum();

        return new PlayerProgressDto(
                playerId,
                completedLevelIds,
                bestScores,
                totalScore,
                totalAttempts,
                successfulHeists
        );
    }
}
