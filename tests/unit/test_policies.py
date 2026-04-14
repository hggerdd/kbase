from __future__ import annotations

import pytest

from kbase.core.policies.classification_policy import (
    ensure_secondary_categories_do_not_repeat_primary,
    validate_primary_category,
)
from kbase.core.policies.metadata_policy import (
    build_typed_metadata_payload,
    ensure_metadata_field_matches_item_kind,
    ensure_metadata_key_allowed,
)


def test_metadata_policy_rejects_temporal_keys() -> None:
    with pytest.raises(ValueError):
        ensure_metadata_key_allowed("due_at")


def test_metadata_policy_rejects_wrong_item_kind() -> None:
    with pytest.raises(ValueError):
        ensure_metadata_field_matches_item_kind("gross_amount", "document", "note")


def test_build_typed_metadata_payload_for_boolean() -> None:
    payload = build_typed_metadata_payload("boolean", True)
    assert payload["value_bool"] == 1


def test_classification_policy_removes_primary_from_secondaries() -> None:
    assert ensure_secondary_categories_do_not_repeat_primary("research", ["research", "learning"]) == [
        "learning"
    ]


def test_project_category_validation() -> None:
    with pytest.raises(ValueError):
        validate_primary_category("project", "research")

