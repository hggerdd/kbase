from __future__ import annotations

from sqlalchemy.orm import Session, sessionmaker

from kbase.infrastructure.db.session import get_session_factory


class SqlAlchemyUnitOfWork:
    def __init__(self, session_factory: sessionmaker[Session] | None = None) -> None:
        self._session_factory = session_factory or get_session_factory()
        self.session: Session | None = None

    def __enter__(self) -> "SqlAlchemyUnitOfWork":
        self.session = self._session_factory()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:  # type: ignore[no-untyped-def]
        assert self.session is not None
        if exc_type is None:
            self.session.commit()
        else:
            self.session.rollback()
        self.session.close()

