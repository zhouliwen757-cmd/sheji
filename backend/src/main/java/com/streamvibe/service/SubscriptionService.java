package com.streamvibe.service;

import com.streamvibe.entity.Subscription;
import com.streamvibe.entity.User;
import com.streamvibe.repository.SubscriptionRepository;
import com.streamvibe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public boolean toggleSubscription(@NonNull Long subscriberId, @NonNull Long channelId) {
        if (subscriberId.equals(channelId)) {
            throw new RuntimeException("不能订阅自己");
        }
        
        User subscriber = userRepository.findById(subscriberId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        User channel = userRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("频道不存在"));
        
        return subscriptionRepository.findBySubscriberIdAndChannelId(subscriberId, channelId)
            .map(existing -> {
                Subscription sub = Objects.requireNonNull(existing);
                subscriptionRepository.delete(sub);
                // 更新关注数和粉丝数
                subscriber.setFollowingCount(Math.max(0, subscriber.getFollowingCount() - 1));
                channel.setSubscribersCount(Math.max(0, channel.getSubscribersCount() - 1));
                userRepository.save(subscriber);
                userRepository.save(channel);
                return false;
            })
            .orElseGet(() -> {
                Subscription subscription = new Subscription();
                subscription.setSubscriber(subscriber);
                subscription.setChannel(channel);
                subscriptionRepository.save(subscription);
                // 更新关注数和粉丝数
                subscriber.setFollowingCount(subscriber.getFollowingCount() + 1);
                channel.setSubscribersCount(channel.getSubscribersCount() + 1);
                userRepository.save(subscriber);
                userRepository.save(channel);
                return true;
            });
    }
    
    public boolean isSubscribed(Long subscriberId, Long channelId) {
        return subscriptionRepository.existsBySubscriberIdAndChannelId(subscriberId, channelId);
    }
    
    public Page<Subscription> getSubscriptions(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return subscriptionRepository.findBySubscriberIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    public Page<Subscription> getSubscribers(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return subscriptionRepository.findByChannelIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    public List<User> getSubscribedChannels(Long userId) {
        return subscriptionRepository.findBySubscriberIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 100))
                .getContent()
                .stream()
                .map(Subscription::getChannel)
                .toList();
    }
    
    public Long getSubscribersCount(Long userId) {
        return subscriptionRepository.countByChannelId(userId);
    }
    
    public Long getSubscriptionsCount(Long userId) {
        return subscriptionRepository.countBySubscriberId(userId);
    }
}
