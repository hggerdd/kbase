from __future__ import annotations

from sqlalchemy import Select, and_, exists, literal, or_, select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import (
    ApiTokenModel,
    ItemAclModel,
    ItemModel,
    PrincipalMembershipModel,
    PrincipalModel,
    UserModel,
    UserSessionModel,
)
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class SecurityRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_user_by_username(self, username: str) -> UserModel | None:
        stmt = select(UserModel).where(UserModel.username == username)
        return self.session.scalar(stmt)

    def get_user_by_id(self, user_id: str) -> UserModel | None:
        return self.session.get(UserModel, user_id)

    def get_user_by_principal_id(self, principal_id: str) -> UserModel | None:
        stmt = select(UserModel).where(UserModel.principal_id == principal_id)
        return self.session.scalar(stmt)

    def get_principal(self, principal_id: str) -> PrincipalModel | None:
        return self.session.get(PrincipalModel, principal_id)

    def list_membership_principal_ids(self, principal_id: str) -> list[str]:
        rows = self.session.execute(
            select(literal(principal_id)).union_all(
                select(PrincipalMembershipModel.principal_id).where(
                    PrincipalMembershipModel.member_principal_id == principal_id
                )
            )
        )
        return [row[0] for row in rows]

    def create_session(
        self,
        *,
        user_id: str,
        session_token_hash: str,
        expires_at: str,
    ) -> UserSessionModel:
        now = utc_now()
        session = UserSessionModel(
            id=new_id(),
            user_id=user_id,
            session_token_hash=session_token_hash,
            created_at=now,
            expires_at=expires_at,
            last_seen_at=now,
            revoked_at=None,
        )
        self.session.add(session)
        self.session.flush()
        return session

    def get_session_by_token_hash(self, token_hash: str) -> UserSessionModel | None:
        stmt = select(UserSessionModel).where(UserSessionModel.session_token_hash == token_hash)
        return self.session.scalar(stmt)

    def touch_session(self, session_row: UserSessionModel) -> None:
        session_row.last_seen_at = utc_now()
        self.session.flush()

    def revoke_session(self, session_row: UserSessionModel) -> None:
        session_row.revoked_at = utc_now()
        self.session.flush()

    def create_api_token(
        self,
        *,
        user_id: str,
        token_label: str,
        token_hash: str,
    ) -> ApiTokenModel:
        token = ApiTokenModel(
            id=new_id(),
            user_id=user_id,
            token_label=token_label,
            token_hash=token_hash,
            created_at=utc_now(),
            last_used_at=None,
            revoked_at=None,
        )
        self.session.add(token)
        self.session.flush()
        return token

    def get_api_token_by_hash(self, token_hash: str) -> ApiTokenModel | None:
        stmt = select(ApiTokenModel).where(ApiTokenModel.token_hash == token_hash)
        return self.session.scalar(stmt)

    def touch_api_token(self, token_row: ApiTokenModel) -> None:
        token_row.last_used_at = utc_now()
        self.session.flush()

    def list_item_acl(self, item_id: str) -> list[ItemAclModel]:
        stmt = (
            select(ItemAclModel)
            .where(ItemAclModel.item_id == item_id)
            .order_by(ItemAclModel.principal_id.asc(), ItemAclModel.permission_key.asc())
        )
        return list(self.session.scalars(stmt))

    def replace_item_acl(
        self,
        *,
        item_id: str,
        entries: list[tuple[str, str]],
        granted_by_principal_id: str,
    ) -> list[ItemAclModel]:
        self.session.query(ItemAclModel).filter(ItemAclModel.item_id == item_id).delete()
        now = utc_now()
        created: list[ItemAclModel] = []
        for principal_id, permission_key in entries:
            row = ItemAclModel(
                item_id=item_id,
                principal_id=principal_id,
                permission_key=permission_key,
                granted_by_principal_id=granted_by_principal_id,
                created_at=now,
            )
            self.session.add(row)
            created.append(row)
        self.session.flush()
        return created

    def grant_item_permissions(
        self,
        *,
        item_id: str,
        principal_id: str,
        permission_keys: list[str],
        granted_by_principal_id: str,
    ) -> None:
        existing = {
            (row.principal_id, row.permission_key)
            for row in self.list_item_acl(item_id)
        }
        now = utc_now()
        for permission_key in permission_keys:
            if (principal_id, permission_key) in existing:
                continue
            self.session.add(
                ItemAclModel(
                    item_id=item_id,
                    principal_id=principal_id,
                    permission_key=permission_key,
                    granted_by_principal_id=granted_by_principal_id,
                    created_at=now,
                )
            )
        self.session.flush()

    def user_can_access_item(
        self,
        *,
        item_id: str,
        principal_ids: list[str],
        permission_keys: list[str],
    ) -> bool:
        any_acl = exists(select(literal(1)).where(ItemAclModel.item_id == item_id))
        matching_acl = exists(
            select(literal(1)).where(
                and_(
                    ItemAclModel.item_id == item_id,
                    ItemAclModel.principal_id.in_(principal_ids),
                    ItemAclModel.permission_key.in_(permission_keys),
                )
            )
        )
        stmt = select(ItemModel.id).where(
            and_(
                ItemModel.id == item_id,
                or_(~any_acl, matching_acl),
            )
        )
        return self.session.scalar(stmt) is not None

    def apply_access_filter(
        self,
        stmt: Select,
        *,
        principal_ids: list[str],
        permission_keys: list[str],
    ) -> Select:
        matching_acl = exists(
            select(literal(1)).where(
                and_(
                    ItemAclModel.item_id == ItemModel.id,
                    ItemAclModel.principal_id.in_(principal_ids),
                    ItemAclModel.permission_key.in_(permission_keys),
                )
            )
        )
        any_acl = exists(select(literal(1)).where(ItemAclModel.item_id == ItemModel.id))
        return stmt.where(or_(~any_acl, matching_acl))
