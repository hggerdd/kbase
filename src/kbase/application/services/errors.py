from __future__ import annotations


class ConflictError(Exception):
    """Raised when a write precondition no longer matches current state."""

