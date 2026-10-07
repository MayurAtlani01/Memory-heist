package com.memoryheist.service;

import com.memoryheist.model.ScoreBreakdown;
import org.springframework.stereotype.Component;

@Component
public class ScoreCalculator {

    public static final int BASE_COMPLETION_BONUS = 1000;
    public static final int POINTS_PER_REMAINING_SECOND = 25;
    public static final int POINTS_PER_UNUSED_FLASH = 200;

    /**
     * Calculates the score breakdown for a heist attempt according to the documented formula.
     * Failed attempts always result in 0 points.
     * Successful attempts receive:
     * - Base completion bonus: 1,000 points
     * - Time bonus: 25 points per remaining second
     * - Flash bonus: 200 points per unused memory flash
     *
     * @param success          whether the heist succeeded
     * @param timeTakenSeconds duration player took in seconds
     * @param timeLimitSeconds total allowed time limit for the level
     * @param flashesUsed      number of memory flashes consumed (0-3)
     * @return ScoreBreakdown containing baseScore, timeBonus, flashBonus, and totalScore
     */
    public ScoreBreakdown calculateScore(boolean success, int timeTakenSeconds, int timeLimitSeconds, int flashesUsed) {
        if (!success) {
            return new ScoreBreakdown(0, 0, 0, 0);
        }

        int baseScore = BASE_COMPLETION_BONUS;
        int remainingSeconds = Math.max(0, timeLimitSeconds - timeTakenSeconds);
        int timeBonus = remainingSeconds * POINTS_PER_REMAINING_SECOND;

        int unusedFlashes = Math.max(0, 3 - Math.min(3, Math.max(0, flashesUsed)));
        int flashBonus = unusedFlashes * POINTS_PER_UNUSED_FLASH;

        int totalScore = baseScore + timeBonus + flashBonus;

        return new ScoreBreakdown(baseScore, timeBonus, flashBonus, totalScore);
    }
}
