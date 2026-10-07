package com.memoryheist.model;

public class ScoreBreakdown {
    private int baseScore;
    private int timeBonus;
    private int flashBonus;
    private int totalScore;

    public ScoreBreakdown() {
    }

    public ScoreBreakdown(int baseScore, int timeBonus, int flashBonus, int totalScore) {
        this.baseScore = baseScore;
        this.timeBonus = timeBonus;
        this.flashBonus = flashBonus;
        this.totalScore = totalScore;
    }

    public int getBaseScore() {
        return baseScore;
    }

    public void setBaseScore(int baseScore) {
        this.baseScore = baseScore;
    }

    public int getTimeBonus() {
        return timeBonus;
    }

    public void setTimeBonus(int timeBonus) {
        this.timeBonus = timeBonus;
    }

    public int getFlashBonus() {
        return flashBonus;
    }

    public void setFlashBonus(int flashBonus) {
        this.flashBonus = flashBonus;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }
}
