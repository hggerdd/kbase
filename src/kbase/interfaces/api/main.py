from __future__ import annotations

from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi import File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from kbase.application.capabilities.add_item_to_project import add_item_to_project
from kbase.application.capabilities.assign_labels import assign_labels
from kbase.application.capabilities.attach_asset_to_item import attach_asset_to_item
from kbase.application.capabilities.classify_item import classify_item
from kbase.application.capabilities.create_note import create_note
from kbase.application.capabilities.create_project import create_project
from kbase.application.capabilities.get_item import get_item
from kbase.application.capabilities.get_item_history import get_item_history
from kbase.application.capabilities.get_item_provenance import get_item_provenance
from kbase.application.capabilities.import_file_as_item import import_file_as_item
from kbase.application.capabilities.import_inbox_file import import_inbox_file
from kbase.application.capabilities.link_items import link_items
from kbase.application.capabilities.list_labels import list_labels
from kbase.application.capabilities.list_inbox_files import list_inbox_files
from kbase.application.capabilities.list_items import list_items
from kbase.application.capabilities.list_project_items import list_project_items
from kbase.application.capabilities.list_related_items import list_related_items
from kbase.application.capabilities.patch_item_metadata import patch_item_metadata
from kbase.application.capabilities.register_asset import register_asset
from kbase.application.capabilities.replace_labels import replace_labels
from kbase.application.capabilities.replace_content_part import replace_content_part
from kbase.application.capabilities.search_content import search_content
from kbase.application.capabilities.update_item_core import update_item_core
from kbase.application.dto.capabilities import (
    AddItemToProjectInput,
    AssignLabelsInput,
    AttachAssetToItemInput,
    ClassifyItemInput,
    CreateNoteInput,
    CreateNoteResult,
    CreateProjectInput,
    CreateFileItemInput,
    GetItemHistoryResult,
    GetItemInput,
    GetItemProvenanceResult,
    ImportInboxFileInput,
    ItemDetailResult,
    ListLabelsInput,
    ListInboxFilesResult,
    ListItemsInput,
    ListItemsResult,
    ListProjectItemsInput,
    ListProjectItemsResult,
    ListRelatedItemsInput,
    ListRelatedItemsResult,
    PatchItemMetadataInput,
    RegisterAssetInput,
    ReplaceContentPartInput,
    SearchContentInput,
    SearchContentResult,
    UpdateItemCoreInput,
)
from kbase.application.dto.common import AssetData, ItemSummary, LabelData, MetadataEntryData
from kbase.core.value_objects.actor import ActorContext
from kbase.core.value_objects.provenance import ProvenanceInput
from kbase.interfaces.api.schemas import (
    AddProjectItemRequest,
    AssignLabelsRequest,
    AttachAssetRequest,
    ClassifyItemRequest,
    CreateNoteRequest,
    CreateProjectRequest,
    ImportInboxFileRequest,
    LinkItemsRequest,
    PatchMetadataRequest,
    RegisterAssetRequest,
    ReplaceContentRequest,
    UpdateItemRequest,
)


def _actor_context(
    x_kbase_actor: str = Header(default="heiko"),
    x_kbase_request_id: str | None = Header(default=None),
) -> ActorContext:
    return ActorContext(principal_id=x_kbase_actor, request_id=x_kbase_request_id)


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


def create_app() -> FastAPI:
    app = FastAPI(title="kbase API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(ValueError)
    async def handle_value_error(_request: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

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
        limit: int = Query(default=100, ge=1, le=500),
        actor: ActorContext = Depends(_actor_context),
    ) -> list[LabelData]:
        return list_labels(ListLabelsInput(query=query, limit=limit, actor=actor))

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
        payload = await file.read()
        original_filename = Path(file.filename or "upload.bin").name
        import_file_as_item(
            CreateFileItemInput(
                title=original_filename,
                item_kind=_infer_file_item_kind(original_filename, file.content_type),
                original_filename=original_filename,
                mime_type=file.content_type,
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
        actor: ActorContext = Depends(_actor_context),
    ) -> ItemDetailResult:
        payload = await file.read()
        original_filename = Path(file.filename or "upload.bin").name
        return import_file_as_item(
            CreateFileItemInput(
                title=title,
                item_kind=item_kind or _infer_file_item_kind(original_filename, file.content_type),
                category_key=category_key,
                status=status,
                language_code=language_code,
                original_filename=original_filename,
                mime_type=file.content_type,
                size_bytes=len(payload),
                file_bytes=payload,
                link_to_item_id=link_to_item_id,
                link_type=link_type,
                link_note=link_note,
                actor=actor,
                provenance=_provenance("api.file_items.upload"),
            )
        )

    @app.get("/api/inbox/files", response_model=ListInboxFilesResult)
    def list_inbox_files_endpoint() -> ListInboxFilesResult:
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
