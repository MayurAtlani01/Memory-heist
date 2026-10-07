package com.memoryheist;

import com.memoryheist.dto.CompleteAttemptRequest;
import com.memoryheist.dto.CreateAttemptRequest;
import com.memoryheist.exception.BadRequestException;
import com.memoryheist.exception.ResourceNotFoundException;
import com.memoryheist.model.*;
import com.memoryheist.repository.AttemptRepository;
import com.memoryheist.repository.LevelRepository;
import com.memoryheist.service.AttemptService;
import com.memoryheist.service.ScoreCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttemptServiceTest {

    @Mock
    private AttemptRepository attemptRepository;

    @Mock
    private LevelRepository levelRepository;

    @Spy
    private ScoreCalculator scoreCalculator = new ScoreCalculator();

    @InjectMocks
    private AttemptService attemptService;

    private Level sampleLevel;

    @BeforeEach
    void setUp() {
        sampleLevel = new Level();
        sampleLevel.setId("level-1");
        sampleLevel.setLevelNumber(1);
        sampleLevel.setName("Training Vault");
        sampleLevel.setTimeLimitSeconds(45);
    }

    @Test
    @DisplayName("Create attempt succeeds when level exists")
    void testCreateAttemptSuccess() {
        when(levelRepository.existsById("level-1")).thenReturn(true);
        when(attemptRepository.save(any(Attempt.class))).thenAnswer(inv -> {
            Attempt a = inv.getArgument(0);
            a.setId("att-123");
            return a;
        });

        CreateAttemptRequest req = new CreateAttemptRequest("level-1", "player-1", GameMode.NORMAL);
        Attempt created = attemptService.createAttempt(req);

        assertNotNull(created);
        assertEquals("att-123", created.getId());
        assertEquals(AttemptStatus.IN_PROGRESS, created.getStatus());
        assertEquals("player-1", created.getPlayerId());
    }

    @Test
    @DisplayName("Create attempt throws ResourceNotFoundException when level does not exist")
    void testCreateAttemptInvalidLevel() {
        when(levelRepository.existsById("invalid-id")).thenReturn(false);

        CreateAttemptRequest req = new CreateAttemptRequest("invalid-id", "player-1", GameMode.NORMAL);
        assertThrows(ResourceNotFoundException.class, () -> attemptService.createAttempt(req));
    }

    @Test
    @DisplayName("Complete attempt calculates score and marks COMPLETED")
    void testCompleteAttemptSuccess() {
        Attempt existing = new Attempt("level-1", "player-1", GameMode.NORMAL);
        existing.setId("att-123");
        existing.setStatus(AttemptStatus.IN_PROGRESS);

        when(attemptRepository.findById("att-123")).thenReturn(Optional.of(existing));
        when(levelRepository.findById("level-1")).thenReturn(Optional.of(sampleLevel));
        when(attemptRepository.save(any(Attempt.class))).thenAnswer(inv -> inv.getArgument(0));

        CompleteAttemptRequest req = new CompleteAttemptRequest("player-1", true, 20, 1, "DIAMOND_SECURED");
        Attempt completed = attemptService.completeAttempt("att-123", req);

        assertEquals(AttemptStatus.COMPLETED, completed.getStatus());
        assertTrue(completed.getSuccess());
        // 45s limit, took 20s -> 25s left -> 25 * 25 = 625
        // 1 flash used -> 2 left -> 400
        // Base = 1000 -> Total = 2025
        assertEquals(2025, completed.getScore());
        assertNotNull(completed.getCompletedAt());
    }

    @Test
    @DisplayName("Player ID mismatch throws BadRequestException")
    void testCompleteAttemptPlayerMismatch() {
        Attempt existing = new Attempt("level-1", "player-1", GameMode.NORMAL);
        existing.setId("att-123");

        when(attemptRepository.findById("att-123")).thenReturn(Optional.of(existing));

        CompleteAttemptRequest req = new CompleteAttemptRequest("player-IMPOSTER", true, 20, 1, "DIAMOND_SECURED");
        assertThrows(BadRequestException.class, () -> attemptService.completeAttempt("att-123", req));
    }

    @Test
    @DisplayName("Repeated complete attempt is idempotent and does not recalculate")
    void testCompleteAttemptIdempotent() {
        Attempt alreadyCompleted = new Attempt("level-1", "player-1", GameMode.NORMAL);
        alreadyCompleted.setId("att-123");
        alreadyCompleted.setStatus(AttemptStatus.COMPLETED);
        alreadyCompleted.setSuccess(true);
        alreadyCompleted.setScore(1800);

        when(attemptRepository.findById("att-123")).thenReturn(Optional.of(alreadyCompleted));

        CompleteAttemptRequest req = new CompleteAttemptRequest("player-1", true, 20, 1, "DIAMOND_SECURED");
        Attempt result = attemptService.completeAttempt("att-123", req);

        assertSame(alreadyCompleted, result);
        assertEquals(1800, result.getScore());
        verify(attemptRepository, never()).save(any());
    }

    @Test
    @DisplayName("Invalid flashesUsed range throws BadRequestException")
    void testInvalidFlashesUsed() {
        Attempt existing = new Attempt("level-1", "player-1", GameMode.NORMAL);
        existing.setId("att-123");
        existing.setStatus(AttemptStatus.IN_PROGRESS);

        when(attemptRepository.findById("att-123")).thenReturn(Optional.of(existing));
        when(levelRepository.findById("level-1")).thenReturn(Optional.of(sampleLevel));

        CompleteAttemptRequest req = new CompleteAttemptRequest("player-1", true, 20, 5, "DIAMOND_SECURED");
        assertThrows(BadRequestException.class, () -> attemptService.completeAttempt("att-123", req));
    }
}
