package com.memoryheist.dto;

public class LevelSummaryDto {
    private String id;
    private int levelNumber;
    private String name;
    private String description;
    private String difficulty;
    private int width;
    private int height;
    private int memorizeTimeSeconds;
    private int timeLimitSeconds;
    private int guardCount;
    private Integer bestScore; // Populated if playerId provided
    private Boolean completed; // Populated if playerId provided

    public LevelSummaryDto() {
    }

    public LevelSummaryDto(String id, int levelNumber, String name, String description, String difficulty,
                           int width, int height, int memorizeTimeSeconds, int timeLimitSeconds, int guardCount) {
        this.id = id;
        this.levelNumber = levelNumber;
        this.name = name;
        this.description = description;
        this.difficulty = difficulty;
        this.width = width;
        this.height = height;
        this.memorizeTimeSeconds = memorizeTimeSeconds;
        this.timeLimitSeconds = timeLimitSeconds;
        this.guardCount = guardCount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getLevelNumber() {
        return levelNumber;
    }

    public void setLevelNumber(int levelNumber) {
        this.levelNumber = levelNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getMemorizeTimeSeconds() {
        return memorizeTimeSeconds;
    }

    public void setMemorizeTimeSeconds(int memorizeTimeSeconds) {
        this.memorizeTimeSeconds = memorizeTimeSeconds;
    }

    public int getTimeLimitSeconds() {
        return timeLimitSeconds;
    }

    public void setTimeLimitSeconds(int timeLimitSeconds) {
        this.timeLimitSeconds = timeLimitSeconds;
    }

    public int getGuardCount() {
        return guardCount;
    }

    public void setGuardCount(int guardCount) {
        this.guardCount = guardCount;
    }

    public Integer getBestScore() {
        return bestScore;
    }

    public void setBestScore(Integer bestScore) {
        this.bestScore = bestScore;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}
