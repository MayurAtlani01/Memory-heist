package com.memoryheist.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "levels")
public class Level {
    @Id
    private String id;
    private int levelNumber;
    private String name;
    private String description;
    private String difficulty; // EASY, MEDIUM, HARD, EXPERT, MASTER
    private int width;
    private int height;
    private int memorizeTimeSeconds;
    private int timeLimitSeconds;

    // Grid representing tiles: 0=EMPTY, 1=WALL, 2=DOOR, 3=KEY, 4=DIAMOND, 5=EXIT, 6=ENTRANCE
    private int[][] grid;

    private Position entrance;
    private Position key;
    private Position door;
    private Position diamond;
    private Position exit;

    private List<GuardDefinition> guards;

    public Level() {
    }

    public Level(String id, int levelNumber, String name, String description, String difficulty,
                 int width, int height, int memorizeTimeSeconds, int timeLimitSeconds,
                 int[][] grid, Position entrance, Position key, Position door, Position diamond, Position exit,
                 List<GuardDefinition> guards) {
        this.id = id;
        this.levelNumber = levelNumber;
        this.name = name;
        this.description = description;
        this.difficulty = difficulty;
        this.width = width;
        this.height = height;
        this.memorizeTimeSeconds = memorizeTimeSeconds;
        this.timeLimitSeconds = timeLimitSeconds;
        this.grid = grid;
        this.entrance = entrance;
        this.key = key;
        this.door = door;
        this.diamond = diamond;
        this.exit = exit;
        this.guards = guards;
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

    public int[][] getGrid() {
        return grid;
    }

    public void setGrid(int[][] grid) {
        this.grid = grid;
    }

    public Position getEntrance() {
        return entrance;
    }

    public void setEntrance(Position entrance) {
        this.entrance = entrance;
    }

    public Position getKey() {
        return key;
    }

    public void setKey(Position key) {
        this.key = key;
    }

    public Position getDoor() {
        return door;
    }

    public void setDoor(Position door) {
        this.door = door;
    }

    public Position getDiamond() {
        return diamond;
    }

    public void setDiamond(Position diamond) {
        this.diamond = diamond;
    }

    public Position getExit() {
        return exit;
    }

    public void setExit(Position exit) {
        this.exit = exit;
    }

    public List<GuardDefinition> getGuards() {
        return guards;
    }

    public void setGuards(List<GuardDefinition> guards) {
        this.guards = guards;
    }
}
