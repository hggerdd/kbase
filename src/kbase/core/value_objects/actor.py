from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ActorContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    principal_id: str
    acting_as_principal_id: str | None = None
    request_id: str | None = None

