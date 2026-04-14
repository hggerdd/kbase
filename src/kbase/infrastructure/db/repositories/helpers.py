from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return uuid.uuid4().hex


def metadata_value_from_row(row: Any) -> Any:
    if row.value_text is not None:
        return row.value_text
    if row.value_number is not None:
        return row.value_number
    if row.value_integer is not None:
        return row.value_integer
    if row.value_date is not None:
        return row.value_date
    if row.value_datetime is not None:
        return row.value_datetime
    if row.value_bool is not None:
        return bool(row.value_bool)
    if row.value_json is not None:
        return json.loads(row.value_json)
    return None
