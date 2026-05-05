from fastapi import HTTPException, Request, status
from collections import defaultdict
import time
from typing import Callable

# Simple in-memory token bucket rate limiter
# In a real distributed production environment, use Redis (e.g., via slowapi or fastapi-limiter)
class RateLimiter:
    def __init__(self, requests: int, window: int):
        self.requests = requests
        self.window = window
        self.users = defaultdict(list)

    async def __call__(self, request: Request):
        # Identify user by IP or Authentication header
        # Here we use client IP for simplicity, or fallback to host
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Clean up old requests
        self.users[client_ip] = [req_time for req_time in self.users[client_ip] if now - req_time < self.window]
        
        if len(self.users[client_ip]) >= self.requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in {self.window} seconds."
            )
        
        self.users[client_ip].append(now)

# Usage: Depends(RateLimiter(requests=100, window=60))
