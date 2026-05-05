"""
Spaced Repetition Engine — SuperMemo-2 (SM-2) Algorithm.

Quality scores (q):
5: perfect response
4: correct response after a hesitation
3: correct response recalled with serious difficulty
2: incorrect response; where the correct one seemed easy to recall
1: incorrect response; the correct one remembered
0: complete blackout

Algorithm:
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
If q < 3, interval = 1, repetitions = 0
"""
from datetime import datetime, timedelta

def compute_review(quality: int, interval: int, repetitions: int, ease_factor: float):
    now = datetime.utcnow()
    
    if quality < 0 or quality > 5:
        raise ValueError("Quality must be between 0 and 5.")

    if quality >= 3:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * ease_factor)
        repetitions += 1
    else:
        repetitions = 0
        interval = 1

    # Update ease factor
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if ease_factor < 1.3:
        ease_factor = 1.3

    next_review = now + timedelta(days=interval)
    
    if quality >= 4:
        status = "Mastered"
    elif quality >= 3:
        status = "Revision"
    else:
        status = "Practicing"

    return {
        "interval": interval,
        "repetitions": repetitions,
        "easeFactor": round(ease_factor, 2),
        "lastReviewed": now,
        "nextReviewDate": next_review,
        "status": status,
    }
