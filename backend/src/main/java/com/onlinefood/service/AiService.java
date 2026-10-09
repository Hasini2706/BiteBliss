package com.onlinefood.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onlinefood.entity.MenuItem;
import com.onlinefood.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Value("${ai.api.key:}")
    private String apiKey;

    @Value("${ai.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    @Value("${ai.api.model:openai/gpt-4o-mini}")
    private String apiModel;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> askAssistant(String userMessage) {
        Map<String, Object> result = new HashMap<>();

        if (apiKey == null || apiKey.trim().isEmpty()) {
            // Check system environment fallback
            String envKey = System.getenv("AI_API_KEY");
            if (envKey != null && !envKey.trim().isEmpty()) {
                apiKey = envKey.trim();
            }
        }

        if (apiKey == null || apiKey.trim().isEmpty()) {
            result.put("message", "AI Assistant key is not configured. Please set AI_API_KEY environment variable.");
            result.put("items", Collections.emptyList());
            return result;
        }

        // Clean API key in case of accidental whitespace
        String cleanKey = apiKey.replaceAll("\\s+", "");

        try {
            // Get available menu items for context
            List<MenuItem> allItems = menuItemRepository.findAll();
            String menuSummary = allItems.stream()
                    .limit(40)
                    .map(item -> String.format("ID:%d, Name:'%s', Price:₹%.0f, Cat:'%s', Veg:%s, Rating:%.1f",
                            item.getId(), item.getName(), item.getPrice(), item.getCategory(), item.getIsVeg() ? "Veg" : "Non-Veg", item.getRating()))
                    .collect(Collectors.joining("; "));

            String systemPrompt = "You are 'BiteBliss AI', a friendly and expert culinary assistant for the BiteBliss online food ordering platform. "
                    + "Help users choose dishes based on their taste, cravings, spice tolerance, dietary preference (veg/non-veg), or budget. "
                    + "Here is a sample of our active menu:\n" + menuSummary + "\n"
                    + "Always reply warmly and concisely (2-4 sentences). Recommend 1 to 3 specific dishes from our menu that fit the request, and mention why they will love them.";

            Map<String, Object> requestBodyMap = new HashMap<>();
            requestBodyMap.put("model", apiModel);
            requestBodyMap.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userMessage)
            ));
            requestBodyMap.put("max_tokens", 450);
            requestBodyMap.put("temperature", 0.7);

            String requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .timeout(Duration.ofSeconds(25))
                    .header("Authorization", "Bearer " + cleanKey)
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "http://localhost:8081")
                    .header("X-Title", "BiteBliss Online Food Ordering")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    String aiText = choices.get(0).path("message").path("content").asText();
                    result.put("message", aiText);

                    // Find matching dishes to attach as clickable cards
                    List<Map<String, Object>> suggestedDishes = new ArrayList<>();
                    String lowerAiText = aiText.toLowerCase();
                    for (MenuItem item : allItems) {
                        if (lowerAiText.contains(item.getName().toLowerCase()) && suggestedDishes.size() < 3) {
                            Map<String, Object> dish = new HashMap<>();
                            dish.put("id", item.getId());
                            dish.put("name", item.getName());
                            dish.put("price", item.getPrice());
                            dish.put("imageUrl", item.getImageUrl());
                            dish.put("isVeg", item.getIsVeg());
                            dish.put("rating", item.getRating());
                            suggestedDishes.add(dish);
                        }
                    }
                    result.put("items", suggestedDishes);
                    return result;
                }
            }

            logger.error("AI API returned status {}: {}", response.statusCode(), response.body());
            result.put("message", "I had a momentary hiccup reaching our kitchen chef! Here are our most popular dishes right now.");
            result.put("items", getFallbackSuggestions(allItems));
            return result;

        } catch (Exception e) {
            logger.error("Error communicating with AI service", e);
            result.put("message", "Hello! I recommend trying our famous Hyderabadi Chicken Dum Biryani or Paneer Tikka Biryani today!");
            result.put("items", getFallbackSuggestions(menuItemRepository.findAll()));
            return result;
        }
    }

    private List<Map<String, Object>> getFallbackSuggestions(List<MenuItem> items) {
        return items.stream()
                .limit(2)
                .map(item -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", item.getId());
                    map.put("name", item.getName());
                    map.put("price", item.getPrice());
                    map.put("imageUrl", item.getImageUrl());
                    map.put("isVeg", item.getIsVeg());
                    map.put("rating", item.getRating());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
