package com.memoryheist;

import com.memoryheist.model.ScoreBreakdown;
import com.memoryheist.service.ScoreCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ScoreCalculatorTest {

    private ScoreCalculator scoreCalculator;

    @BeforeEach
    void setUp() {
        scoreCalculator = new ScoreCalculator();
    }

    @Test
    @DisplayName("Failed attempts must always result in zero score")
    void testFailedAttemptScoresZero() {
        ScoreBreakdown breakdown = scoreCalculator.calculateScore(false, 15, 45, 1);
        assertEquals(0, breakdown.getBaseScore());
        assertEquals(0, breakdown.getTimeBonus());
        assertEquals(0, breakdown.getFlashBonus());
        assertEquals(0, breakdown.getTotalScore());
    }

    @Test
    @DisplayName("Flawless run with 0 flashes and fast time yields maximum bonuses")
    void testFlawlessAttempt() {
        // 45s limit, took 15s -> 30s remaining -> 30 * 25 = 750 time bonus
        // 0 flashes used -> 3 unused -> 3 * 200 = 600 flash bonus
        // Base = 1000
        // Total = 1000 + 750 + 600 = 2350
        ScoreBreakdown breakdown = scoreCalculator.calculateScore(true, 15, 45, 0);
        assertEquals(1000, breakdown.getBaseScore());
        assertEquals(750, breakdown.getTimeBonus());
        assertEquals(600, breakdown.getFlashBonus());
        assertEquals(2350, breakdown.getTotalScore());
    }

    @Test
    @DisplayName("Attempt using all flashes and near time limit")
    void testNearLimitAttempt() {
        // 45s limit, took 44s -> 1s remaining -> 25 time bonus
        // 3 flashes used -> 0 unused -> 0 flash bonus
        // Total = 1000 + 25 + 0 = 1025
        ScoreBreakdown breakdown = scoreCalculator.calculateScore(true, 44, 45, 3);
        assertEquals(1000, breakdown.getBaseScore());
        assertEquals(25, breakdown.getTimeBonus());
        assertEquals(0, breakdown.getFlashBonus());
        assertEquals(1025, breakdown.getTotalScore());
    }

    @Test
    @DisplayName("Attempt exceeding time limit yields zero time bonus but retains base score")
    void testExceededTimeLimitZeroTimeBonus() {
        ScoreBreakdown breakdown = scoreCalculator.calculateScore(true, 50, 45, 2);
        assertEquals(1000, breakdown.getBaseScore());
        assertEquals(0, breakdown.getTimeBonus());
        assertEquals(200, breakdown.getFlashBonus()); // 1 unused flash
        assertEquals(1200, breakdown.getTotalScore());
    }
}
