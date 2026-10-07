package com.memoryheist.controller;

import com.memoryheist.dto.PlayerProgressDto;
import com.memoryheist.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public ResponseEntity<PlayerProgressDto> getProgress(@RequestParam(required = false, defaultValue = "") String playerId) {
        return ResponseEntity.ok(progressService.getPlayerProgress(playerId));
    }
}
