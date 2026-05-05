"""
Spaced Repetition Engine — SM-2 inspired algorithm.

This module computes the next review interval based on user's
self-reported performance quality after reviewing a question.

Quality ratings:
  - "again" → Reset. Card needs re-learning.
  - "good"  → Adequate recall. Standard interval growth.
  - "easy"  → Effortless recall. Accelerated interval growth.

Each question tracks:
  - interval:    Days until the next review.
  - repetitions: Number of consecutive correct reviews.
  - easeFactor:  Multiplier for interval growth (min 1.3).
"""

from datetime import datetime, timedelta

def compute_review(quality: str, interval: int, repetitions: int, ease_factor: float):
    """
    Compute next review schedule based on SM-2 algorithm variant.

    Args:
        quality: "again", "good", or "easy"
        interval: Current interval in days
        repetitions: Number of consecutive successful reviews
        ease_factor: Current ease factor (starts at 2.5)

    Returns:
        dict with updated interval, repetitions, easeFactor,
             lastReviewed, nextReviewDate, and status
    """
    now = datetime.utcnow()

    if quality == "again":
        # Failed — reset to beginning
        interval = 1
        repetitions = 0
        ease_factor = max(1.3, ease_factor - 0.20)
        status = "Practicing"

    elif quality == "good":
        # Correct — standard progression
        repetitions += 1
        if repetitions == 1:
            interval = 1
        elif repetitions == 2:
            interval = 3
        else:
            interval = round(interval * ease_factor)
        ease_factor = max(1.3, ease_factor - 0.05)
        status = "Revision"

    elif quality == "easy":
        # Effortless — accelerated progression
        repetitions += 1
        if repetitions == 1:
            interval = 3
        elif repetitions == 2:
            interval = 7
        else:
            interval = round(interval * ease_factor * 1.3)
        ease_factor = max(1.3, ease_factor + 0.10)
        status = "Mastered"

    else:
        raise ValueError(f"Invalid quality: {quality}")

    next_review = now + timedelta(days=interval)

    return {
        "interval": interval,
        "repetitions": repetitions,
        "easeFactor": round(ease_factor, 2),
        "lastReviewed": now,
        "nextReviewDate": next_review,
        "status": status,
    }
