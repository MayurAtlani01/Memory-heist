package com.memoryheist.controller;

import com.memoryheist.dto.CompleteAttemptRequest;
import com.memoryheist.dto.CreateAttemptRequest;
import com.memoryheist.model.Attempt;
import com.memoryheist.service.AttemptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private final AttemptService attemptService;

    public AttemptController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping
    public ResponseEntity<Attempt> createAttempt(@Valid @RequestBody CreateAttemptRequest request) {
        Attempt created = attemptService.createAttempt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Attempt> completeAttempt(
            @PathVariable String id,
            @Valid @RequestBody CompleteAttemptRequest request) {
        Attempt completed = attemptService.completeAttempt(id, request);
        return ResponseEntity.ok(completed);
    }
}
