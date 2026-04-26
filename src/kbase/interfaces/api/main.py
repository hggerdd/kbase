from __future__ import annotations

import mimetypes
import os
import re
from pathlib import Path
from urllib.parse import urlparse

from fastapi import Cookie, Depends, FastAPI, Header, HTTPException, Query, Request, Response
from fastapi import File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from kbase.application.capabilities.add_item_to_project import add_item_to_project
from kbase.application.capabilities.assign_labels import assign_labels
from kbase.application.capabilities.attach_asset_to_item import attach_asset_to_item
from kbase.application.capabilities.classify_item import classify_item
from kbase.application.capabilities.create_api_token import create_api_token
from kbase.application.capabilities.create_category import create_category
from kbase.application.capabilities.create_label import create_label
from kbase.application.capabilities.create_note import create_note
from kbase.application.capabilities.create_project import create_project
from kbase.application.capabilities.delete_label import delete_label
from kbase.application.capabilities.deactivate_label import deactivate_label
from kbase.application.capabilities.get_current_session import get_current_session
from kbase.application.capabilities.get_item import get_item
from kbase.application.capabilities.get_item_acl import get_item_acl
from kbase.application.capabilities.get_item_history import get_item_history
from kbase.application.capabilities.get_item_provenance import get_item_provenance
from kbase.application.capabilities.import_file_as_item import import_file_as_item
from kbase.application.capabilities.import_inbox_file import import_inbox_file
from kbase.application.capabilities.link_items import link_items
from kbase.application.capabilities.list_categories import list_categories
from kbase.application.capabilities.list_labels import list_labels
from kbase.application.capabilities.list_inbox_files import list_inbox_files
from kbase.application.capabilities.list_items import list_items
from kbase.application.capabilities.list_project_items import list_project_items
from kbase.application.capabilities.list_related_items import list_related_items
from kbase.application.capabilities.patch_item_metadata import patch_item_metadata
from kbase.application.capabilities.register_asset import register_asset
from kbase.application.capabilities.reactivate_label import reactivate_label
from kbase.application.capabilities.replace_item_acl import replace_item_acl
from kbase.application.capabilities.replace_labels import replace_labels
from kbase.application.capabilities.replace_content_part import replace_content_part
from kbase.application.capabilities.search_content import search_content
from kbase.application.capabilities.update_label import update_label
from kbase.application.capabilities.update_category import update_category
from kbase.application.capabilities.update_item_core import update_item_core
from kbase.application.capabilities.login_user import login_user
from kbase.application.capabilities.logout_user import logout_user
from kbase.application.dto.capabilities import (
    AddItemToProjectInput,
    AssignLabelsInput,
    AttachAssetToItemInput,
    CreateApiTokenInput,
    ClassifyItemInput,
    CreateCategoryInput,
    CreateLabelInput,
    CreateNoteInput,
    CreateNoteResult,
    CreateApiTokenResult,
    CreateProjectInput,
    CreateFileItemInput,
    DeleteLabelInput,
    DeleteLabelResult,
    DeactivateLabelInput,
    GetItemAclInput,
    GetItemHistoryResult,
    GetItemInput,
    GetItemProvenanceResult,
    GetSessionInput,
    ImportInboxFileInput,
    ItemDetailResult,
    ListCategoriesInput,
    ListCategoriesResult,
    ListLabelsInput,
    ListInboxFilesResult,
    ListItemsInput,
    ListItemsResult,
    ListProjectItemsInput,
    ListProjectItemsResult,
    ListRelatedItemsInput,
    ListRelatedItemsResult,
    LoginInput,
    LoginResult,
    LogoutInput,
    PatchItemMetadataInput,
    ReactivateLabelInput,
    RegisterAssetInput,
    ReplaceContentPartInput,
    ReplaceItemAclInput,
    SearchContentInput,
    SearchContentResult,
    UpdateCategoryInput,
    UpdateLabelInput,
    UpdateItemCoreInput,
)
from kbase.application.dto.common import AclEntryData, AssetData, CategoryData, ItemSummary, LabelData, MetadataEntryData, SessionData
from kbase.application.services.errors import ConflictError
from kbase.application.services.security import AuthenticationError, AuthorizationError, build_authenticated_actor
from kbase.core.value_objects.actor import ActorContext
from kbase.core.value_objects.provenance import ProvenanceInput
from kbase.infrastructure.files.item_file_store import ItemFileStore
from kbase.interfaces.api.schemas import (
    AddProjectItemRequest,
    AssignLabelsRequest,
    AttachAssetRequest,
    CreateApiTokenRequest,
    ClassifyItemRequest,
    CreateCategoryRequest,
    CreateLabelRequest,
    LoginRequest,
    CreateNoteRequest,
    CreateProjectRequest,
    ImportInboxFileRequest,
    LinkItemsRequest,
    PatchMetadataRequest,
    ReplaceItemAclRequest,
    RegisterAssetRequest,
    ReplaceContentRequest,
    UpdateCategoryRequest,
    UpdateLabelRequest,
    UpdateItemRequest,
)

SESSION_COOKIE_NAME = "kbase_session"
DEFAULT_MAX_UPLOAD_BYTES = 50 * 1024 * 1024
UPLOAD_READ_CHUNK_BYTES = 1024 * 1024
DEFAULT_DOWNLOAD_MIME_TYPE = "application/octet-stream"
MIME_TYPE_PATTERN = re.compile(
    r"^[a-z0-9][a-z0-9!#$&^_.+-]{0,126}/[a-z0-9][a-z0-9!#$&^_.+-]{0,126}$"
)
BROWSER_ACTIVE_MIME_TYPES = {
    "application/xhtml+xml",
    "application/xml",
    "image/svg+xml",
    "text/html",
    "text/xml",
}
LOCAL_DEVELOPMENT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


def _extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    prefix = "bearer "
    if not authorization.lower().startswith(prefix):
        return None
    token = authorization[len(prefix) :].strip()
    return token or None


def _authenticated_session(
    authorization: str | None = Header(default=None),
    session_cookie: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    x_kbase_request_id: str | None = Header(default=None),
) -> SessionData:
    return get_current_session(
        GetSessionInput(
            session_token=session_cookie,
            api_token=_extract_bearer_token(authorization),
            request_id=x_kbase_request_id,
        )
    )


def _actor_context(
    session: SessionData = Depends(_authenticated_session),
    x_kbase_request_id: str | None = Header(default=None),
) -> ActorContext:
    return build_authenticated_actor(session, request_id=x_kbase_request_id)


def _provenance(method_key: str) -> ProvenanceInput:
    return ProvenanceInput(method_key=method_key, data_class="canonical")


def _infer_file_item_kind(filename: str, mime_type: str | None) -> str:
    suffix = Path(filename).suffix.lower()
    if mime_type:
        if mime_type.startswith("image/"):
            return "image"
        if "spreadsheet" in mime_type or mime_type in {
            "application/vnd.ms-excel",
            "text/csv",
        }:
            return "spreadsheet"
    if suffix in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff"}:
        return "image"
    if suffix in {".xls", ".xlsx", ".csv", ".ods"}:
        return "spreadsheet"
    return "document"


def _normalize_mime_type(mime_type: str | None) -> str | None:
    if not mime_type:
        return None
    normalized = mime_type.split(";", 1)[0].strip().lower()
    if not MIME_TYPE_PATTERN.match(normalized):
        return None
    return normalized


def _safe_file_mime_type(filename: str, client_mime_type: str | None) -> str:
    guessed_mime_type = _normalize_mime_type(mimetypes.guess_type(filename)[0])
    if guessed_mime_type and guessed_mime_type not in BROWSER_ACTIVE_MIME_TYPES:
        return guessed_mime_type

    normalized_client_mime_type = _normalize_mime_type(client_mime_type)
    if normalized_client_mime_type and normalized_client_mime_type not in BROWSER_ACTIVE_MIME_TYPES:
        return normalized_client_mime_type

    return DEFAULT_DOWNLOAD_MIME_TYPE


def _trust_mode() -> str:
    mode = os.getenv("KBASE_TRUST_MODE", "local").strip().lower()
    if mode not in {"local", "lan", "production"}:
        raise ValueError("KBASE_TRUST_MODE must be one of: local, lan, production")
    return mode


def _parse_cors_origins(configured: str) -> list[str]:
    origins: list[str] = []
    for raw_origin in configured.split(","):
        origin = raw_origin.strip().rstrip("/")
        if not origin:
            continue
        if origin == "*":
            raise ValueError("KBASE_CORS_ORIGINS must not contain '*' when credentials are enabled")
        parsed = urlparse(origin)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path:
            raise ValueError(f"Invalid CORS origin: {origin}")
        origins.append(origin)
    return origins


def _cors_origins() -> list[str]:
    configured = os.getenv("KBASE_CORS_ORIGINS", "").strip()
    if configured:
        return _parse_cors_origins(configured)

    if _trust_mode() == "local":
        return LOCAL_DEVELOPMENT_CORS_ORIGINS

    return []


def _max_upload_bytes() -> int:
    configured = os.getenv("KBASE_MAX_UPLOAD_BYTES", "").strip()
    if not configured:
        return DEFAULT_MAX_UPLOAD_BYTES
    try:
        value = int(configured)
    except ValueError:
        raise ValueError("KBASE_MAX_UPLOAD_BYTES must be an integer byte count")
    if value < 1:
        raise ValueError("KBASE_MAX_UPLOAD_BYTES must be greater than zero")
    return value


async def _read_upload_bytes(file: UploadFile) -> bytes:
    max_bytes = _max_upload_bytes()
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(min(UPLOAD_READ_CHUNK_BYTES, max_bytes + 1))
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"Upload exceeds the configured {max_bytes} byte limit",
            )
        chunks.append(chunk)
    return b"".join(chunks)


def create_app() -> FastAPI:
    app = FastAPI(title="kbase API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(ValueError)
    async def handle_value_error(_request: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(AuthenticationError)
    async def handle_authentication_error(_request: Request, exc: AuthenticationError) -> JSONResponse:
        return JSONResponse(status_code=401, content={"detail": str(exc)})

    @app.exception_handler(AuthorizationError)
    async def handle_authorization_error(_request: Request, exc: AuthorizationError) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": str(exc)})

    @app.exception_handler(ConflictError)
    async def handle_conflict_error(_request: Request, exc: ConflictError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/api/auth/login", response_model=SessionData)
    def login_endpoint(
        payload: LoginRequest,
        response: Response,
        x_kbase_request_id: str | None = Header(default=None),
    ) -> SessionData:
        result = login_user(
            LoginInput(
                username=payload.username,
                password=payload.password,
                request_id=x_kbase_request_id,
            )
        )
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=result.session_token,
            httponly=True,
            samesite="lax",
            secure=False,
        )
        return result.session

    @app.post("/api/auth/logout", status_code=204)
    def logout_endpoint(
        response: Response,
        session_cookie: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    ) -> Response:
        if session_cookie:
            logout_user(LogoutInput(session_token=session_cookie))
        response.delete_cookie(SESSION_COOKIE_NAME)
        return response

    @app.get("/api/auth/session", response_model=SessionData)
    def current_session_endpoint(
        session: SessionData = Depends(_authenticated_session),
    ) -> SessionData:
        return session

    @app.post("/api/auth/tokens", response_model=CreateApiTokenResult)
    def create_api_token_endpoint(
        payload: CreateApiTokenRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> CreateApiTokenResult:
        return create_api_token(CreateApiTokenInput(token_label=payload.token_label, actor=actor))

    @app.post("/api/notes", response_model=CreateNoteResult)
    def create_note_endpoint(
        payload: CreateNoteRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> CreateNoteResult:
        return create_note(
            CreateNoteInput(
                title=payload.title,
                category_key=payload.category_key,
                status=payload.status,
                language_code=payload.language_code,
                markdown_body=payload.markdown_body,
                parent_item_id=payload.parent_item_id,
                project_ids=payload.project_ids,
                label_paths=payload.label_paths,
                metadata=payload.metadata,
                actor=actor,
                provenance=_provenance("api.create_note"),
            )
        )

    @app.get("/api/items/{item_id}", response_model=ItemDetailResult)
    def get_item_endpoint(
        item_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemDetailResult:
        return get_item(GetItemInput(item_id=item_id, actor=actor))

    @app.get("/api/items/{item_id}/files/{file_id}/content")
    def get_item_file_content_endpoint(
        item_id: str,
        file_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> FileResponse:
        detail = get_item(GetItemInput(item_id=item_id, actor=actor))
        item_file = next((entry for entry in detail.files if entry.id == file_id), None)
        if item_file is None:
            raise HTTPException(status_code=404, detail="File not found")

        file_store = ItemFileStore()
        try:
            target = file_store.resolve_relative_path(item_file.relative_path)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid file path")
        if not target.exists():
            raise HTTPException(status_code=404, detail="Stored file missing")

        return FileResponse(
            path=target,
            media_type=_safe_file_mime_type(item_file.original_filename or target.name, item_file.mime_type),
            filename=item_file.original_filename or target.name,
        )

    @app.get("/api/items/{item_id}/acl", response_model=list[AclEntryData])
    def get_item_acl_endpoint(
        item_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> list[AclEntryData]:
        return get_item_acl(GetItemAclInput(item_id=item_id, actor=actor))

    @app.put("/api/items/{item_id}/acl", response_model=list[AclEntryData])
    def replace_item_acl_endpoint(
        item_id: str,
        payload: ReplaceItemAclRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> list[AclEntryData]:
        return replace_item_acl(
            ReplaceItemAclInput(
                item_id=item_id,
                grants=[
                    {"principal_id": grant["principal_id"], "permission_key": grant["permission_key"]}
                    for grant in payload.grants
                ],
                actor=actor,
                provenance=_provenance("api.replace_item_acl"),
            )
        )

    @app.get("/api/items", response_model=ListItemsResult)
    def list_items_endpoint(
        item_kind: str | None = Query(default=None),
        category_key: str | None = Query(default=None),
        include_archived: bool = Query(default=False),
        limit: int = Query(default=50, ge=1, le=500),
        offset: int = Query(default=0, ge=0),
        actor: ActorContext = Depends(_actor_context),
    ) -> ListItemsResult:
        return list_items(
            ListItemsInput(
                item_kind=item_kind,
                category_key=category_key,
                include_archived=include_archived,
                limit=limit,
                offset=offset,
                actor=actor,
            )
        )

    @app.patch("/api/items/{item_id}", response_model=ItemSummary)
    def update_item_endpoint(
        item_id: str,
        payload: UpdateItemRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemSummary:
        return update_item_core(
            UpdateItemCoreInput(
                item_id=item_id,
                title=payload.title,
                category_key=payload.category_key,
                status=payload.status,
                language_code=payload.language_code,
                is_archived=payload.is_archived,
                actor=actor,
                provenance=_provenance("api.update_item_core"),
            )
        )

    @app.put("/api/items/{item_id}/content", response_model=ItemDetailResult)
    def replace_content_endpoint(
        item_id: str,
        payload: ReplaceContentRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemDetailResult:
        replace_content_part(
            ReplaceContentPartInput(
                item_id=item_id,
                part_kind=payload.part_kind,
                content_text=payload.content_text,
                content_format=payload.content_format,
                change_reason=payload.change_reason,
                expected_content_updated_at=payload.expected_content_updated_at,
                actor=actor,
                provenance=_provenance("api.replace_content_part"),
            )
        )
        return get_item(GetItemInput(item_id=item_id, actor=actor))

    @app.get("/api/search/content", response_model=SearchContentResult)
    def search_content_endpoint(
        query: str | None = Query(default=None),
        item_kinds: list[str] = Query(default=[]),
        category_keys: list[str] = Query(default=[]),
        label_paths: list[str] = Query(default=[]),
        label_path_prefixes: list[str] = Query(default=[]),
        statuses: list[str] = Query(default=[]),
        created_by_principal_ids: list[str] = Query(default=[]),
        project_id: str | None = Query(default=None),
        include_archived: bool = Query(default=False),
        limit: int = Query(default=50, ge=1, le=500),
        offset: int = Query(default=0, ge=0),
        actor: ActorContext = Depends(_actor_context),
    ) -> SearchContentResult:
        return search_content(
            SearchContentInput(
                query=query,
                item_kinds=item_kinds,
                category_keys=category_keys,
                label_paths=label_paths,
                label_path_prefixes=label_path_prefixes,
                statuses=statuses,
                created_by_principal_ids=created_by_principal_ids,
                project_id=project_id,
                include_archived=include_archived,
                limit=limit,
                offset=offset,
                actor=actor,
            )
        )

    @app.post("/api/items/{item_id}/labels", response_model=list[LabelData])
    def assign_labels_endpoint(
        item_id: str,
        payload: AssignLabelsRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> list[LabelData]:
        return assign_labels(
            AssignLabelsInput(
                item_id=item_id,
                label_paths=payload.label_paths,
                actor=actor,
                provenance=_provenance("api.assign_labels"),
            )
        )

    @app.put("/api/items/{item_id}/labels", response_model=list[LabelData])
    def replace_labels_endpoint(
        item_id: str,
        payload: AssignLabelsRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> list[LabelData]:
        return replace_labels(
            AssignLabelsInput(
                item_id=item_id,
                label_paths=payload.label_paths,
                actor=actor,
                provenance=_provenance("api.replace_labels"),
            )
        )

    @app.get("/api/labels", response_model=list[LabelData])
    def list_labels_endpoint(
        query: str | None = Query(default=None),
        include_inactive: bool = Query(default=False),
        parent_id: str | None = Query(default=None),
        full_path_prefix: str | None = Query(default=None),
        limit: int = Query(default=100, ge=1, le=500),
        actor: ActorContext = Depends(_actor_context),
    ) -> list[LabelData]:
        return list_labels(
            ListLabelsInput(
                query=query,
                include_inactive=include_inactive,
                parent_id=parent_id,
                full_path_prefix=full_path_prefix,
                limit=limit,
                actor=actor,
            )
        )

    @app.post("/api/labels", response_model=LabelData)
    def create_label_endpoint(
        payload: CreateLabelRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> LabelData:
        return create_label(
            CreateLabelInput(
                name=payload.name,
                parent_id=payload.parent_id,
                description=payload.description,
                meta=payload.meta,
                actor=actor,
                provenance=_provenance("api.create_label"),
            )
        )

    @app.patch("/api/labels/{label_id}", response_model=LabelData)
    def update_label_endpoint(
        label_id: str,
        payload: UpdateLabelRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> LabelData:
        if payload.name is None and "description" not in payload.model_fields_set:
            raise ValueError("At least one updatable field is required")
        return update_label(
            UpdateLabelInput(
                label_id=label_id,
                name=payload.name,
                description=payload.description,
                description_provided="description" in payload.model_fields_set,
                actor=actor,
                provenance=_provenance("api.update_label"),
            )
        )

    @app.delete("/api/labels/{label_id}", response_model=DeleteLabelResult)
    def delete_label_endpoint(
        label_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> DeleteLabelResult:
        return delete_label(
            DeleteLabelInput(
                label_id=label_id,
                actor=actor,
                provenance=_provenance("api.delete_label"),
            )
        )

    @app.post("/api/labels/{label_id}/deactivate", response_model=LabelData)
    def deactivate_label_endpoint(
        label_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> LabelData:
        return deactivate_label(
            DeactivateLabelInput(
                label_id=label_id,
                actor=actor,
                provenance=_provenance("api.deactivate_label"),
            )
        )

    @app.post("/api/labels/{label_id}/reactivate", response_model=LabelData)
    def reactivate_label_endpoint(
        label_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> LabelData:
        return reactivate_label(
            ReactivateLabelInput(
                label_id=label_id,
                actor=actor,
                provenance=_provenance("api.reactivate_label"),
            )
        )

    @app.get("/api/categories", response_model=ListCategoriesResult)
    def list_categories_endpoint(
        query: str | None = Query(default=None),
        applies_to_kind: str | None = Query(default=None),
        include_inactive: bool = Query(default=False),
        limit: int = Query(default=100, ge=1, le=500),
        offset: int = Query(default=0, ge=0),
        actor: ActorContext = Depends(_actor_context),
    ) -> ListCategoriesResult:
        return list_categories(
            ListCategoriesInput(
                query=query,
                applies_to_kind=applies_to_kind,
                include_inactive=include_inactive,
                limit=limit,
                offset=offset,
                actor=actor,
            )
        )

    @app.post("/api/categories", response_model=CategoryData)
    def create_category_endpoint(
        payload: CreateCategoryRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> CategoryData:
        return create_category(
            CreateCategoryInput(
                key=payload.key,
                label=payload.label,
                description=payload.description,
                applies_to_kind=payload.applies_to_kind,
                actor=actor,
                provenance=_provenance("api.create_category"),
            )
        )

    @app.patch("/api/categories/{category_key}", response_model=CategoryData)
    def update_category_endpoint(
        category_key: str,
        payload: UpdateCategoryRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> CategoryData:
        if (
            payload.label is None
            and "description" not in payload.model_fields_set
            and "applies_to_kind" not in payload.model_fields_set
            and payload.is_active is None
        ):
            raise ValueError("At least one updatable field is required")
        return update_category(
            UpdateCategoryInput(
                key=category_key,
                label=payload.label,
                description=payload.description,
                description_provided="description" in payload.model_fields_set,
                applies_to_kind=payload.applies_to_kind,
                applies_to_kind_provided="applies_to_kind" in payload.model_fields_set,
                is_active=payload.is_active,
                actor=actor,
                provenance=_provenance("api.update_category"),
            )
        )

    @app.post("/api/items/{item_id}/classification", response_model=ItemSummary)
    def classify_item_endpoint(
        item_id: str,
        payload: ClassifyItemRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemSummary:
        return classify_item(
            ClassifyItemInput(
                item_id=item_id,
                primary_category_key=payload.primary_category_key,
                secondary_category_keys=payload.secondary_category_keys,
                actor=actor,
                provenance=_provenance("api.classify_item"),
            )
        )

    @app.patch("/api/items/{item_id}/metadata", response_model=list[MetadataEntryData])
    def patch_metadata_endpoint(
        item_id: str,
        payload: PatchMetadataRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> list[MetadataEntryData]:
        return patch_item_metadata(
            PatchItemMetadataInput(
                item_id=item_id,
                set_fields=payload.set_fields,
                unset_fields=payload.unset_fields,
                actor=actor,
                provenance=_provenance("api.patch_item_metadata"),
            )
        )

    @app.post("/api/assets", response_model=AssetData)
    def register_asset_endpoint(
        payload: RegisterAssetRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> AssetData:
        return register_asset(
            RegisterAssetInput(
                storage_path=payload.storage_path,
                asset_kind=payload.asset_kind,
                original_filename=payload.original_filename,
                mime_type=payload.mime_type,
                size_bytes=payload.size_bytes,
                checksum_sha256=payload.checksum_sha256,
                actor=actor,
                provenance=_provenance("api.register_asset"),
            )
        )

    @app.post("/api/items/{item_id}/assets", response_model=ItemDetailResult)
    def attach_asset_endpoint(
        item_id: str,
        payload: AttachAssetRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemDetailResult:
        attach_asset_to_item(
            AttachAssetToItemInput(
                item_id=item_id,
                asset_id=payload.asset_id,
                relationship_role=payload.relationship_role,
                caption=payload.caption,
                sort_order=payload.sort_order,
                actor=actor,
                provenance=_provenance("api.attach_asset_to_item"),
            )
        )
        return get_item(GetItemInput(item_id=item_id, actor=actor))

    @app.post("/api/items/{item_id}/attachments/upload", response_model=ItemDetailResult)
    async def upload_attachment_endpoint(
        item_id: str,
        file: UploadFile = File(...),
        relationship_role: str = Form("attachment"),
        caption: str | None = Form(default=None),
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemDetailResult:
        payload = await _read_upload_bytes(file)
        original_filename = Path(file.filename or "upload.bin").name
        mime_type = _safe_file_mime_type(original_filename, file.content_type)
        import_file_as_item(
            CreateFileItemInput(
                title=original_filename,
                item_kind=_infer_file_item_kind(original_filename, mime_type),
                original_filename=original_filename,
                mime_type=mime_type,
                size_bytes=len(payload),
                file_bytes=payload,
                link_to_item_id=item_id,
                link_type=relationship_role,
                link_note=caption,
                actor=actor,
                provenance=_provenance("api.items.attachments.upload"),
            )
        )
        return get_item(GetItemInput(item_id=item_id, actor=actor))

    @app.post("/api/file-items/upload", response_model=ItemDetailResult)
    async def upload_file_item_endpoint(
        file: UploadFile = File(...),
        item_kind: str | None = Form(default=None),
        category_key: str | None = Form(default=None),
        title: str | None = Form(default=None),
        status: str | None = Form(default=None),
        language_code: str | None = Form(default=None),
        link_to_item_id: str | None = Form(default=None),
        link_type: str | None = Form(default=None),
        link_note: str | None = Form(default=None),
        project_ids: list[str] = Form(default=[]),
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemDetailResult:
        payload = await _read_upload_bytes(file)
        original_filename = Path(file.filename or "upload.bin").name
        mime_type = _safe_file_mime_type(original_filename, file.content_type)
        return import_file_as_item(
            CreateFileItemInput(
                title=title,
                item_kind=item_kind or _infer_file_item_kind(original_filename, mime_type),
                category_key=category_key,
                status=status,
                language_code=language_code,
                original_filename=original_filename,
                mime_type=mime_type,
                size_bytes=len(payload),
                file_bytes=payload,
                link_to_item_id=link_to_item_id,
                link_type=link_type,
                link_note=link_note,
                project_ids=project_ids,
                actor=actor,
                provenance=_provenance("api.file_items.upload"),
            )
        )

    @app.get("/api/inbox/files", response_model=ListInboxFilesResult)
    def list_inbox_files_endpoint(
        _actor: ActorContext = Depends(_actor_context),
    ) -> ListInboxFilesResult:
        return list_inbox_files()

    @app.post("/api/inbox/import", response_model=ItemDetailResult)
    def import_inbox_file_endpoint(
        payload: ImportInboxFileRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemDetailResult:
        return import_inbox_file(
            ImportInboxFileInput(
                inbox_relative_path=payload.inbox_relative_path,
                title=payload.title,
                item_kind=payload.item_kind,
                category_key=payload.category_key,
                status=payload.status,
                language_code=payload.language_code,
                link_to_item_id=payload.link_to_item_id,
                link_type=payload.link_type,
                link_note=payload.link_note,
                project_ids=payload.project_ids,
                label_paths=payload.label_paths,
                metadata=payload.metadata,
                actor=actor,
                provenance=_provenance("api.inbox.import"),
            )
        )

    @app.post("/api/links", response_model=ItemSummary)
    def link_items_endpoint(
        payload: LinkItemsRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemSummary:
        return link_items(
            LinkItemsInput(
                from_item_id=payload.from_item_id,
                to_item_id=payload.to_item_id,
                link_type=payload.link_type,
                note=payload.note,
                actor=actor,
                provenance=_provenance("api.link_items"),
            )
        )

    @app.get("/api/items/{item_id}/links", response_model=ListRelatedItemsResult)
    def list_related_items_endpoint(
        item_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> ListRelatedItemsResult:
        return list_related_items(ListRelatedItemsInput(item_id=item_id, actor=actor))

    @app.post("/api/projects", response_model=ItemSummary)
    def create_project_endpoint(
        payload: CreateProjectRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemSummary:
        return create_project(
            CreateProjectInput(
                title=payload.title,
                category_key=payload.category_key,
                description=payload.description,
                status=payload.status,
                actor=actor,
                provenance=_provenance("api.create_project"),
            )
        )

    @app.post("/api/projects/{project_id}/items", response_model=ItemSummary)
    def add_item_to_project_endpoint(
        project_id: str,
        payload: AddProjectItemRequest,
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemSummary:
        return add_item_to_project(
            AddItemToProjectInput(
                project_id=project_id,
                item_id=payload.item_id,
                role=payload.role,
                sort_order=payload.sort_order,
                actor=actor,
                provenance=_provenance("api.add_item_to_project"),
            )
        )

    @app.get("/api/projects/{project_id}/items", response_model=ListProjectItemsResult)
    def list_project_items_endpoint(
        project_id: str,
        limit: int = Query(default=50, ge=1, le=500),
        offset: int = Query(default=0, ge=0),
        actor: ActorContext = Depends(_actor_context),
    ) -> ListProjectItemsResult:
        return list_project_items(
            ListProjectItemsInput(
                project_id=project_id,
                limit=limit,
                offset=offset,
                actor=actor,
            )
        )

    @app.get("/api/items/{item_id}/history", response_model=GetItemHistoryResult)
    def get_item_history_endpoint(
        item_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> GetItemHistoryResult:
        return get_item_history(GetItemInput(item_id=item_id, actor=actor))

    @app.get("/api/items/{item_id}/provenance", response_model=GetItemProvenanceResult)
    def get_item_provenance_endpoint(
        item_id: str,
        actor: ActorContext = Depends(_actor_context),
    ) -> GetItemProvenanceResult:
        return get_item_provenance(GetItemInput(item_id=item_id, actor=actor))

    return app


app = create_app()
