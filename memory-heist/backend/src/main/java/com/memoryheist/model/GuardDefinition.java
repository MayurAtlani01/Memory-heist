package com.memoryheist.model;

import java.util.List;

public class GuardDefinition {
    private String id;
    private List<Position> patrolPath;
    private int moveIntervalMs;
    private String initialFacing; // UP, DOWN, LEFT, RIGHT
    private int visionRange;

    public GuardDefinition() {
    }

    public GuardDefinition(String id, List<Position> patrolPath, int moveIntervalMs, String initialFacing, int visionRange) {
        this.id = id;
        this.patrolPath = patrolPath;
        this.moveIntervalMs = moveIntervalMs;
        this.initialFacing = initialFacing;
        this.visionRange = visionRange;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<Position> getPatrolPath() {
        return patrolPath;
    }

    public void setPatrolPath(List<Position> patrolPath) {
        this.patrolPath = patrolPath;
    }

    public int getMoveIntervalMs() {
        return moveIntervalMs;
    }

    public void setMoveIntervalMs(int moveIntervalMs) {
        this.moveIntervalMs = moveIntervalMs;
    }

    public String getInitialFacing() {
        return initialFacing;
    }

    public void setInitialFacing(String initialFacing) {
        this.initialFacing = initialFacing;
    }

    public int getVisionRange() {
        return visionRange;
    }

    public void setVisionRange(int visionRange) {
        this.visionRange = visionRange;
    }
}
