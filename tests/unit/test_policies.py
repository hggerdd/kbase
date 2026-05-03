from __future__ import annotations

import pytest

from kbase.core.policies.classification_policy import (
    category_applies_to_item_kind,
    category_can_be_child_of_parent,
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


def test_global_category_applies_to_every_item_kind() -> None:
    assert category_applies_to_item_kind(None, "note") is True
    assert category_applies_to_item_kind(None, "image") is True
    assert category_applies_to_item_kind("note", "note") is True
    assert category_applies_to_item_kind("document", "note") is False


def test_category_parent_scope_allows_global_parent_to_have_specific_children() -> None:
    assert category_can_be_child_of_parent(child_applies_to_kind="note", parent_applies_to_kind=None) is True
    assert category_can_be_child_of_parent(child_applies_to_kind=None, parent_applies_to_kind=None) is True
    assert category_can_be_child_of_parent(child_applies_to_kind="note", parent_applies_to_kind="note") is True
    assert category_can_be_child_of_parent(child_applies_to_kind=None, parent_applies_to_kind="note") is False
    assert category_can_be_child_of_parent(child_applies_to_kind="image", parent_applies_to_kind="note") is False


def test_project_category_validation() -> None:
    with pytest.raises(ValueError):
        validate_primary_category("project", "research")
