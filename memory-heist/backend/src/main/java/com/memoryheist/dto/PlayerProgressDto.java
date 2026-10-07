package com.memoryheist.dto;

import java.util.Map;
import java.util.Set;

public class PlayerProgressDto {
    private String playerId;
    private Set<String> completedLevelIds;
    private Map<String, Integer> bestScores;
    private int totalScore;
    private int totalAttempts;
    private int successfulHeists;

    public PlayerProgressDto() {
    }

    public PlayerProgressDto(String playerId, Set<String> completedLevelIds, Map<String, Integer> bestScores,
                             int totalScore, int totalAttempts, int successfulHeists) {
        this.playerId = playerId;
        this.completedLevelIds = completedLevelIds;
        this.bestScores = bestScores;
        this.totalScore = totalScore;
        this.totalAttempts = totalAttempts;
        this.successfulHeists = successfulHeists;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public Set<String> getCompletedLevelIds() {
        return completedLevelIds;
    }

    public void setCompletedLevelIds(Set<String> completedLevelIds) {
        this.completedLevelIds = completedLevelIds;
    }

    public Map<String, Integer> getBestScores() {
        return bestScores;
    }

    public void setBestScores(Map<String, Integer> bestScores) {
        this.bestScores = bestScores;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public int getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(int totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public int getSuccessfulHeists() {
        return successfulHeists;
    }

    public void setSuccessfulHeists(int successfulHeists) {
        this.successfulHeists = successfulHeists;
    }
}
