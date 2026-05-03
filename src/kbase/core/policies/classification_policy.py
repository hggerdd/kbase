from __future__ import annotations

from kbase.core.rules.modelling_rules import PROJECT_ITEM_KIND


def category_applies_to_item_kind(category_applies_to_kind: str | None, item_kind: str) -> bool:
    return category_applies_to_kind is None or category_applies_to_kind == item_kind


def category_can_be_child_of_parent(
    *,
    child_applies_to_kind: str | None,
    parent_applies_to_kind: str | None,
) -> bool:
    return parent_applies_to_kind is None or child_applies_to_kind == parent_applies_to_kind


def validate_primary_category(item_kind: str, category_kind: str | None) -> None:
    if category_kind is None:
        return
    if item_kind == PROJECT_ITEM_KIND and not category_kind.startswith(
        ("project_", "case_", "topic_", "life_")
    ):
        raise ValueError(f"Category '{category_kind}' is not valid for project items")


def ensure_secondary_categories_do_not_repeat_primary(
    primary_category: str | None,
    secondary_categories: list[str] | None,
) -> list[str]:
    secondaries = secondary_categories or []
    if primary_category is None:
        return secondaries
    return [category for category in secondaries if category != primary_category]
