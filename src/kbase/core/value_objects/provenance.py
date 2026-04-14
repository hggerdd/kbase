from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ProvenanceInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    method_key: str
    data_class: str = "canonical"
    source_object_type: str | None = None
    source_object_id: str | None = None
    source_uri: str | None = None

