package com.memoryheist.service;

import com.memoryheist.dto.LevelSummaryDto;
import com.memoryheist.exception.ResourceNotFoundException;
import com.memoryheist.model.Attempt;
import com.memoryheist.model.AttemptStatus;
import com.memoryheist.model.GameMode;
import com.memoryheist.model.Level;
import com.memoryheist.repository.AttemptRepository;
import com.memoryheist.repository.LevelRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LevelService {

    private final LevelRepository levelRepository;
    private final AttemptRepository attemptRepository;

    public LevelService(LevelRepository levelRepository, AttemptRepository attemptRepository) {
        this.levelRepository = levelRepository;
        this.attemptRepository = attemptRepository;
    }

    public List<LevelSummaryDto> getLevelSummaries(String playerId) {
        List<Level> levels = levelRepository.findAllByOrderByLevelNumberAsc();

        Map<String, Integer> bestScores = new HashMap<>();
        Set<String> completedLevelIds = new HashSet<>();

        if (playerId != null && !playerId.isBlank()) {
            List<Attempt> successfulAttempts = attemptRepository
                    .findByPlayerIdAndModeAndStatusAndSuccessTrue(playerId, GameMode.NORMAL, AttemptStatus.COMPLETED);

            for (Attempt att : successfulAttempts) {
                completedLevelIds.add(att.getLevelId());
                int currentBest = bestScores.getOrDefault(att.getLevelId(), 0);
                if (att.getScore() != null && att.getScore() > currentBest) {
                    bestScores.put(att.getLevelId(), att.getScore());
                }
            }
        }

        List<LevelSummaryDto> dtos = new ArrayList<>();
        for (Level lvl : levels) {
            LevelSummaryDto dto = new LevelSummaryDto(
                    lvl.getId(),
                    lvl.getLevelNumber(),
                    lvl.getName(),
                    lvl.getDescription(),
                    lvl.getDifficulty(),
                    lvl.getWidth(),
                    lvl.getHeight(),
                    lvl.getMemorizeTimeSeconds(),
                    lvl.getTimeLimitSeconds(),
                    lvl.getGuards() != null ? lvl.getGuards().size() : 0
            );

            if (playerId != null && !playerId.isBlank()) {
                dto.setCompleted(completedLevelIds.contains(lvl.getId()));
                dto.setBestScore(bestScores.get(lvl.getId()));
            }

            dtos.add(dto);
        }

        return dtos;
    }

    public Level getLevelById(String id) {
        return levelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with ID: " + id));
    }
}
