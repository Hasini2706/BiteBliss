package com.onlinefood.controller;

import com.onlinefood.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String prompt = request.getOrDefault("message", "Suggest a popular dish");
        Map<String, Object> response = aiService.askAssistant(prompt);
        return ResponseEntity.ok(response);
    }
}
