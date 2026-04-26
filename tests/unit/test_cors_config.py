from __future__ import annotations

import pytest

from kbase.interfaces.api.main import LOCAL_DEVELOPMENT_CORS_ORIGINS, _cors_origins


def test_local_trust_mode_uses_development_cors_defaults(monkeypatch) -> None:
    monkeypatch.delenv("KBASE_CORS_ORIGINS", raising=False)
    monkeypatch.setenv("KBASE_TRUST_MODE", "local")

    assert _cors_origins() == LOCAL_DEVELOPMENT_CORS_ORIGINS


def test_lan_and_production_require_explicit_cors_origins(monkeypatch) -> None:
    monkeypatch.delenv("KBASE_CORS_ORIGINS", raising=False)

    monkeypatch.setenv("KBASE_TRUST_MODE", "lan")
    assert _cors_origins() == []

    monkeypatch.setenv("KBASE_TRUST_MODE", "production")
    assert _cors_origins() == []


def test_configured_cors_origins_are_explicit_and_normalized(monkeypatch) -> None:
    monkeypatch.setenv("KBASE_TRUST_MODE", "production")
    monkeypatch.setenv(
        "KBASE_CORS_ORIGINS",
        " https://kb.example.test/, http://192.168.1.20:5173 ",
    )

    assert _cors_origins() == [
        "https://kb.example.test",
        "http://192.168.1.20:5173",
    ]


def test_wildcard_cors_origin_is_rejected_with_credentials(monkeypatch) -> None:
    monkeypatch.setenv("KBASE_CORS_ORIGINS", "*")

    with pytest.raises(ValueError, match="must not contain"):
        _cors_origins()


def test_cors_origin_must_be_an_origin_not_a_path(monkeypatch) -> None:
    monkeypatch.setenv("KBASE_CORS_ORIGINS", "https://kb.example.test/app")

    with pytest.raises(ValueError, match="Invalid CORS origin"):
        _cors_origins()
