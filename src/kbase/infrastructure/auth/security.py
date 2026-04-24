from __future__ import annotations

import base64
import hashlib
import hmac
import secrets


PBKDF2_ITERATIONS = 600_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return "pbkdf2_sha256${iterations}${salt}${digest}".format(
        iterations=PBKDF2_ITERATIONS,
        salt=base64.b64encode(salt).decode("ascii"),
        digest=base64.b64encode(digest).decode("ascii"),
    )


def verify_password(password: str, password_hash: str) -> bool:
    algorithm, raw_iterations, raw_salt, raw_digest = password_hash.split("$", 3)
    if algorithm != "pbkdf2_sha256":
        return False
    iterations = int(raw_iterations)
    salt = base64.b64decode(raw_salt.encode("ascii"))
    expected = base64.b64decode(raw_digest.encode("ascii"))
    actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(actual, expected)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_secret_token() -> str:
    return secrets.token_urlsafe(32)
