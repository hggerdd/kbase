from __future__ import annotations

import json
from datetime import date, datetime
from typing import Any

from kbase.core.rules.modelling_rules import FORBIDDEN_METADATA_KEYS


def ensure_metadata_key_allowed(field_key: str) -> None:
    if field_key in FORBIDDEN_METADATA_KEYS:
        raise ValueError(f"Metadata field '{field_key}' must not be stored in item_metadata")


def ensure_metadata_field_matches_item_kind(
    field_key: str,
    field_applies_to_kind: str | None,
    item_kind: str,
) -> None:
    if field_applies_to_kind and field_applies_to_kind != item_kind:
        raise ValueError(
            f"Metadata field '{field_key}' is not valid for item_kind '{item_kind}'"
        )


def build_typed_metadata_payload(value_type: str, value: Any) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "value_text": None,
        "value_number": None,
        "value_integer": None,
        "value_date": None,
        "value_datetime": None,
        "value_bool": None,
        "value_json": None,
    }

    if value_type == "string":
        payload["value_text"] = str(value)
    elif value_type == "number":
        payload["value_number"] = float(value)
    elif value_type == "integer":
        payload["value_integer"] = int(value)
    elif value_type == "date":
        if isinstance(value, date) and not isinstance(value, datetime):
            payload["value_date"] = value.isoformat()
        else:
            payload["value_date"] = str(value)
    elif value_type == "datetime":
        if isinstance(value, datetime):
            payload["value_datetime"] = value.isoformat()
        else:
            payload["value_datetime"] = str(value)
    elif value_type == "boolean":
        payload["value_bool"] = 1 if bool(value) else 0
    elif value_type == "json":
        payload["value_json"] = json.dumps(value, ensure_ascii=True, sort_keys=True)
    else:
        raise ValueError(f"Unsupported metadata field value_type '{value_type}'")

    return payload
