from __future__ import annotations

from datetime import datetime, timedelta, timezone

from kbase.application.dto.common import SessionData
from kbase.application.services.mappers import to_session_data
from kbase.core.value_objects.actor import ActorContext
from kbase.infrastructure.auth.security import generate_secret_token, hash_token, verify_password


SESSION_TTL_HOURS = 12
READ_PERMISSIONS = ["view", "edit", "manage"]
WRITE_PERMISSIONS = ["edit", "manage"]
MANAGE_PERMISSIONS = ["manage"]


class AuthenticationError(Exception):
    pass


class AuthorizationError(Exception):
    pass


def build_authenticated_actor(session: SessionData, *, request_id: str | None) -> ActorContext:
    return ActorContext(principal_id=session.principal_id, request_id=request_id)


def expires_at(hours: int = SESSION_TTL_HOURS) -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def authenticate_user_credentials(*, repos, username: str, password: str) -> tuple[object, SessionData]:
    user = repos.security.get_user_by_username(username)
    if user is None or not user.is_active:
        raise AuthenticationError("Invalid credentials")
    if not verify_password(password, user.password_hash):
        raise AuthenticationError("Invalid credentials")
    principal = repos.security.get_principal(user.principal_id)
    if principal is None or not principal.is_active:
        raise AuthenticationError("User principal is inactive")
    principal_ids = repos.security.list_membership_principal_ids(principal.id)
    return user, to_session_data(
        user=user,
        principal=principal,
        principal_ids=principal_ids,
        auth_method="password",
    )


def login_with_password(*, repos, username: str, password: str) -> tuple[SessionData, str]:
    user, session = authenticate_user_credentials(
        repos=repos,
        username=username,
        password=password,
    )
    raw_token = generate_secret_token()
    repos.security.create_session(
        user_id=user.id,
        session_token_hash=hash_token(raw_token),
        expires_at=expires_at(),
    )
    return session.model_copy(update={"auth_method": "session"}), raw_token


def resolve_session(*, repos, session_token: str | None, api_token: str | None) -> SessionData:
    if session_token:
        session_row = repos.security.get_session_by_token_hash(hash_token(session_token))
        if session_row is None or session_row.revoked_at is not None or session_row.expires_at <= now_iso():
            raise AuthenticationError("Authentication required")
        repos.security.touch_session(session_row)
        user = repos.security.get_user_by_id(session_row.user_id)
        auth_method = "session"
    elif api_token:
        token_row = repos.security.get_api_token_by_hash(hash_token(api_token))
        if token_row is None or token_row.revoked_at is not None:
            raise AuthenticationError("Authentication required")
        repos.security.touch_api_token(token_row)
        user = repos.security.get_user_by_id(token_row.user_id)
        auth_method = "api_token"
    else:
        raise AuthenticationError("Authentication required")
    if user is None or not user.is_active:
        raise AuthenticationError("Authentication required")
    principal = repos.security.get_principal(user.principal_id)
    if principal is None or not principal.is_active:
        raise AuthenticationError("Authentication required")
    return to_session_data(
        user=user,
        principal=principal,
        principal_ids=repos.security.list_membership_principal_ids(principal.id),
        auth_method=auth_method,
    )


def create_api_token_for_actor(*, repos, actor: ActorContext, token_label: str) -> tuple[object, str]:
    user = repos.security.get_user_by_principal_id(actor.principal_id)
    if user is None or not user.is_active:
        raise AuthenticationError("Authenticated user not found")
    raw_secret = generate_secret_token()
    token = repos.security.create_api_token(
        user_id=user.id,
        token_label=token_label,
        token_hash=hash_token(raw_secret),
    )
    return token, raw_secret


def create_api_token_with_password(
    *,
    repos,
    username: str,
    password: str,
    token_label: str,
) -> tuple[object, str]:
    user, _session = authenticate_user_credentials(
        repos=repos,
        username=username,
        password=password,
    )
    raw_secret = generate_secret_token()
    token = repos.security.create_api_token(
        user_id=user.id,
        token_label=token_label,
        token_hash=hash_token(raw_secret),
    )
    return token, raw_secret


def ensure_item_access(*, repos, item_id: str, actor: ActorContext, permission_keys: list[str]) -> None:
    principal_ids = repos.security.list_membership_principal_ids(actor.principal_id)
    if not repos.security.user_can_access_item(
        item_id=item_id,
        principal_ids=principal_ids,
        permission_keys=permission_keys,
    ):
        raise AuthorizationError("Access to item is forbidden")


def grant_owner_permissions(*, repos, item_id: str, actor_principal_id: str) -> None:
    repos.security.grant_item_permissions(
        item_id=item_id,
        principal_id=actor_principal_id,
        permission_keys=["view", "edit", "manage"],
        granted_by_principal_id=actor_principal_id,
    )
