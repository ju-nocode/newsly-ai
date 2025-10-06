// Simple in-memory rate limiter for Vercel serverless
// For production, use Redis (Upstash) or Vercel KV

const rateLimitMap = new Map();

export function rateLimit(options = {}) {
    const interval = options.interval || 60 * 1000; // 1 minute
    const maxRequests = options.maxRequests || 10;

    return {
        check: (identifier) => {
            const now = Date.now();
            const windowStart = now - interval;

            // Get or create request log for this identifier
            if (!rateLimitMap.has(identifier)) {
                rateLimitMap.set(identifier, []);
            }

            const requests = rateLimitMap.get(identifier);

            // Remove old requests outside the time window
            const recentRequests = requests.filter(timestamp => timestamp > windowStart);
            rateLimitMap.set(identifier, recentRequests);

            // Check if limit exceeded
            if (recentRequests.length >= maxRequests) {
                return {
                    success: false,
                    limit: maxRequests,
                    remaining: 0,
                    reset: Math.ceil((recentRequests[0] + interval) / 1000)
                };
            }

            // Add current request
            recentRequests.push(now);
            rateLimitMap.set(identifier, recentRequests);

            return {
                success: true,
                limit: maxRequests,
                remaining: maxRequests - recentRequests.length,
                reset: Math.ceil((now + interval) / 1000)
            };
        }
    };
}

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    for (const [identifier, requests] of rateLimitMap.entries()) {
        const recentRequests = requests.filter(timestamp => timestamp > fiveMinutesAgo);
        if (recentRequests.length === 0) {
            rateLimitMap.delete(identifier);
        } else {
            rateLimitMap.set(identifier, recentRequests);
        }
    }
}, 5 * 60 * 1000);
