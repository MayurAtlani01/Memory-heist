package com.memoryheist.controller;

import com.memoryheist.dto.LevelSummaryDto;
import com.memoryheist.model.Level;
import com.memoryheist.service.LevelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
public class LevelController {

    private final LevelService levelService;

    public LevelController(LevelService levelService) {
        this.levelService = levelService;
    }

    @GetMapping
    public ResponseEntity<List<LevelSummaryDto>> getAllLevels(
            @RequestParam(required = false) String playerId) {
        return ResponseEntity.ok(levelService.getLevelSummaries(playerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Level> getLevelById(@PathVariable String id) {
        return ResponseEntity.ok(levelService.getLevelById(id));
    }
}
