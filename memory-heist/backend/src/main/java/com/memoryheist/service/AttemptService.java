package com.memoryheist.service;

import com.memoryheist.dto.CompleteAttemptRequest;
import com.memoryheist.dto.CreateAttemptRequest;
import com.memoryheist.exception.BadRequestException;
import com.memoryheist.exception.ResourceNotFoundException;
import com.memoryheist.model.Attempt;
import com.memoryheist.model.AttemptStatus;
import com.memoryheist.model.Level;
import com.memoryheist.model.ScoreBreakdown;
import com.memoryheist.repository.AttemptRepository;
import com.memoryheist.repository.LevelRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AttemptService {
    private static final Logger logger = LoggerFactory.getLogger(AttemptService.class);

    private final AttemptRepository attemptRepository;
    private final LevelRepository levelRepository;
    private final ScoreCalculator scoreCalculator;

    public AttemptService(AttemptRepository attemptRepository, LevelRepository levelRepository, ScoreCalculator scoreCalculator) {
        this.attemptRepository = attemptRepository;
        this.levelRepository = levelRepository;
        this.scoreCalculator = scoreCalculator;
    }

    public Attempt createAttempt(CreateAttemptRequest request) {
        if (!levelRepository.existsById(request.getLevelId())) {
            throw new ResourceNotFoundException("Level not found with ID: " + request.getLevelId());
        }

        Attempt attempt = new Attempt(request.getLevelId(), request.getPlayerId(), request.getMode());
        Attempt saved = attemptRepository.save(attempt);
        logger.info("Created attempt {} for player {} on level {}", saved.getId(), request.getPlayerId(), request.getLevelId());
        return saved;
    }

    public Attempt completeAttempt(String attemptId, CompleteAttemptRequest request) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with ID: " + attemptId));

        // Validate player ownership
        if (!attempt.getPlayerId().equals(request.getPlayerId())) {
            throw new BadRequestException("Player ID mismatch for attempt: " + attemptId);
        }

        // Idempotency check: repeated completion requests must not create duplicate results
        if (attempt.getStatus() == AttemptStatus.COMPLETED) {
            logger.info("Attempt {} is already completed, returning existing record", attemptId);
            return attempt;
        }

        Level level = levelRepository.findById(attempt.getLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated level not found: " + attempt.getLevelId()));

        // Reasonable value range validation
        if (request.getTimeTakenSeconds() < 0) {
            throw new BadRequestException("timeTakenSeconds must be non-negative");
        }
        if (request.getFlashesUsed() < 0 || request.getFlashesUsed() > 3) {
            throw new BadRequestException("flashesUsed must be between 0 and 3");
        }

        ScoreBreakdown breakdown = scoreCalculator.calculateScore(
                request.getSuccess(),
                request.getTimeTakenSeconds(),
                level.getTimeLimitSeconds(),
                request.getFlashesUsed()
        );

        attempt.setSuccess(request.getSuccess());
        attempt.setTimeTakenSeconds(request.getTimeTakenSeconds());
        attempt.setFlashesUsed(request.getFlashesUsed());
        attempt.setReason(request.getReason());
        attempt.setScore(breakdown.getTotalScore());
        attempt.setScoreBreakdown(breakdown);
        attempt.setStatus(AttemptStatus.COMPLETED);
        attempt.setCompletedAt(Instant.now());

        Attempt saved = attemptRepository.save(attempt);
        logger.info("Completed attempt {}: success={}, score={}", attemptId, saved.getSuccess(), saved.getScore());
        return saved;
    }
}
