package com.streamvibe.controller;

import com.streamvibe.dto.ApiResponse;
import com.streamvibe.entity.Subscription;
import com.streamvibe.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Boolean>> toggleSubscription(
            @RequestParam @NonNull Long channelId,
            Authentication authentication) {
        Long subscriberId = Long.parseLong(authentication.getName());
        boolean subscribed = subscriptionService.toggleSubscription(subscriberId, channelId);
        return ResponseEntity.ok(ApiResponse.success(subscribed ? "订阅成功" : "取消订阅", subscribed));
    }
    
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkSubscription(
            @RequestParam @NonNull Long channelId,
            Authentication authentication) {
        Long subscriberId = Long.parseLong(authentication.getName());
        boolean subscribed = subscriptionService.isSubscribed(subscriberId, channelId);
        return ResponseEntity.ok(ApiResponse.success(subscribed));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Subscription>>> getSubscriptions(
            @RequestParam @NonNull Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Subscription> subscriptions = subscriptionService.getSubscriptions(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(subscriptions));
    }
    
    @GetMapping("/subscribers")
    public ResponseEntity<ApiResponse<Page<Subscription>>> getSubscribers(
            @RequestParam @NonNull Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Subscription> subscribers = subscriptionService.getSubscribers(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(subscribers));
    }
}
