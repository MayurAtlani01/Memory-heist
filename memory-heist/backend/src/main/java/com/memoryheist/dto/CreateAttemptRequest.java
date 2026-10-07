package com.memoryheist.dto;

import com.memoryheist.model.GameMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateAttemptRequest {
    @NotBlank(message = "levelId is required")
    private String levelId;

    @NotBlank(message = "playerId is required")
    private String playerId;

    @NotNull(message = "mode is required")
    private GameMode mode;

    public CreateAttemptRequest() {
    }

    public CreateAttemptRequest(String levelId, String playerId, GameMode mode) {
        this.levelId = levelId;
        this.playerId = playerId;
        this.mode = mode;
    }

    public String getLevelId() {
        return levelId;
    }

    public void setLevelId(String levelId) {
        this.levelId = levelId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public GameMode getMode() {
        return mode;
    }

    public void setMode(GameMode mode) {
        this.mode = mode;
    }
}
