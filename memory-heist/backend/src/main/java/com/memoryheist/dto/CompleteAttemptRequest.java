package com.memoryheist.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CompleteAttemptRequest {
    @NotBlank(message = "playerId is required")
    private String playerId;

    @NotNull(message = "success flag is required")
    private Boolean success;

    @NotNull(message = "timeTakenSeconds is required")
    @Min(value = 0, message = "timeTakenSeconds must be non-negative")
    private Integer timeTakenSeconds;

    @NotNull(message = "flashesUsed is required")
    @Min(value = 0, message = "flashesUsed cannot be negative")
    @Max(value = 3, message = "flashesUsed cannot exceed 3")
    private Integer flashesUsed;

    @NotBlank(message = "reason is required")
    private String reason;

    public CompleteAttemptRequest() {
    }

    public CompleteAttemptRequest(String playerId, Boolean success, Integer timeTakenSeconds, Integer flashesUsed, String reason) {
        this.playerId = playerId;
        this.success = success;
        this.timeTakenSeconds = timeTakenSeconds;
        this.flashesUsed = flashesUsed;
        this.reason = reason;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public Integer getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(Integer timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public Integer getFlashesUsed() {
        return flashesUsed;
    }

    public void setFlashesUsed(Integer flashesUsed) {
        this.flashesUsed = flashesUsed;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
