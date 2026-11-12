package com.stationstories.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_SECONDS = 60;

    private static class Attempt {
        int count;
        Instant lastAttempt;

        Attempt(int count, Instant lastAttempt) {
            this.count = count;
            this.lastAttempt = lastAttempt;
        }
    }

    private final Map<String, Attempt> attemptsMap = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Attempt attempt = attemptsMap.get(key);
        if (attempt == null) {
            return false;
        }
        if (Instant.now().getEpochSecond() - attempt.lastAttempt.getEpochSecond() > LOCK_DURATION_SECONDS) {
            attemptsMap.remove(key);
            return false;
        }
        return attempt.count >= MAX_ATTEMPTS;
    }

    public int getRemainingAttempts(String key) {
        Attempt attempt = attemptsMap.get(key);
        if (attempt == null) {
            return MAX_ATTEMPTS;
        }
        if (Instant.now().getEpochSecond() - attempt.lastAttempt.getEpochSecond() > LOCK_DURATION_SECONDS) {
            attemptsMap.remove(key);
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - attempt.count);
    }

    public void recordFailedAttempt(String key) {
        attemptsMap.compute(key, (k, existing) -> {
            Instant now = Instant.now();
            if (existing == null || (now.getEpochSecond() - existing.lastAttempt.getEpochSecond() > LOCK_DURATION_SECONDS)) {
                return new Attempt(1, now);
            }
            existing.count++;
            existing.lastAttempt = now;
            return existing;
        });
    }

    public void resetAttempts(String key) {
        attemptsMap.remove(key);
    }
}
