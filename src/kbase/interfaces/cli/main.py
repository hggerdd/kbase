from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import click
import typer

from kbase.application.capabilities.add_item_to_project import add_item_to_project
from kbase.application.capabilities.assign_labels import assign_labels
from kbase.application.capabilities.attach_asset_to_item import attach_asset_to_item
from kbase.application.capabilities.classify_item import classify_item
from kbase.application.capabilities.create_api_token_with_password import create_api_token_with_password_flow
from kbase.application.capabilities.create_label import create_label
from kbase.application.capabilities.create_note import create_note
from kbase.application.capabilities.create_project import create_project
from kbase.application.capabilities.create_category import create_category
from kbase.application.capabilities.delete_category import delete_category
from kbase.application.capabilities.delete_label import delete_label
from kbase.application.capabilities.deactivate_label import deactivate_label
from kbase.application.capabilities.get_item import get_item
from kbase.application.capabilities.get_item_history import get_item_history
from kbase.application.capabilities.get_item_provenance import get_item_provenance
from kbase.application.capabilities.import_file_as_item import import_file_as_item
from kbase.application.capabilities.import_inbox_file import import_inbox_file
from kbase.application.capabilities.link_items import link_items
from kbase.application.capabilities.list_categories import list_categories
from kbase.application.capabilities.list_labels import list_labels
from kbase.application.capabilities.list_items import list_items
from kbase.application.capabilities.list_inbox_files import list_inbox_files
from kbase.application.capabilities.list_project_items import list_project_items
from kbase.application.capabilities.list_related_items import list_related_items
from kbase.application.capabilities.patch_item_metadata import patch_item_metadata
from kbase.application.capabilities.register_asset import register_asset
from kbase.application.capabilities.reactivate_label import reactivate_label
from kbase.application.capabilities.rename_label import rename_label
from kbase.application.capabilities.replace_content_part import replace_content_part
from kbase.application.capabilities.search_content import search_content
from kbase.application.capabilities.update_category import update_category
from kbase.application.capabilities.update_item_core import update_item_core
from kbase.application.dto.capabilities import (
    AddItemToProjectInput,
    AssignLabelsInput,
    AttachAssetToItemInput,
    ClassifyItemInput,
    CreateCategoryInput,
    CreateApiTokenWithPasswordInput,
    CreateLabelInput,
    CreateFileItemInput,
    CreateNoteInput,
    CreateProjectInput,
    DeleteCategoryInput,
    DeleteLabelInput,
    DeactivateLabelInput,
    GetItemInput,
    ImportInboxFileInput,
    LinkItemsInput,
    ListCategoriesInput,
    ListItemsInput,
    ListLabelsInput,
    ListProjectItemsInput,
    ListRelatedItemsInput,
    PatchItemMetadataInput,
    RegisterAssetInput,
    ReactivateLabelInput,
    RenameLabelInput,
    ReplaceContentPartInput,
    SearchContentInput,
    UpdateCategoryInput,
    UpdateItemCoreInput,
    GetSessionInput,
)
from kbase.application.capabilities.get_current_session import get_current_session
from kbase.application.services.security import AuthenticationError
from kbase.core.value_objects.actor import ActorContext
from kbase.core.value_objects.provenance import ProvenanceInput


app = typer.Typer(no_args_is_help=True)
auth_app = typer.Typer(no_args_is_help=True)
note_app = typer.Typer(no_args_is_help=True)
item_app = typer.Typer(no_args_is_help=True)
content_app = typer.Typer(no_args_is_help=True)
category_app = typer.Typer(no_args_is_help=True)
label_app = typer.Typer(no_args_is_help=True)
classify_app = typer.Typer(no_args_is_help=True)
metadata_app = typer.Typer(no_args_is_help=True)
asset_app = typer.Typer(no_args_is_help=True)
file_item_app = typer.Typer(no_args_is_help=True)
inbox_app = typer.Typer(no_args_is_help=True)
link_app = typer.Typer(no_args_is_help=True)
project_app = typer.Typer(no_args_is_help=True)
history_app = typer.Typer(no_args_is_help=True)
provenance_app = typer.Typer(no_args_is_help=True)
search_app = typer.Typer(no_args_is_help=True)
workflow_app = typer.Typer(no_args_is_help=True)

app.add_typer(auth_app, name="auth")
app.add_typer(note_app, name="note")
app.add_typer(item_app, name="item")
app.add_typer(content_app, name="content")
app.add_typer(category_app, name="category")
app.add_typer(label_app, name="label")
app.add_typer(classify_app, name="classify")
app.add_typer(metadata_app, name="metadata")
app.add_typer(asset_app, name="asset")
app.add_typer(file_item_app, name="file-item")
app.add_typer(inbox_app, name="inbox")
app.add_typer(link_app, name="link")
app.add_typer(project_app, name="project")
app.add_typer(history_app, name="history")
app.add_typer(provenance_app, name="provenance")
app.add_typer(search_app, name="search")
app.add_typer(workflow_app, name="workflow")

LOCAL_ACTOR_OPTION_HELP = (
    "Use explicit local actor mode instead of session/token auth. Requires root --allow-local-actor."
)


@app.callback()
def app_callback(
    ctx: typer.Context,
    api_token: str | None = typer.Option(
        None,
        "--api-token",
        envvar="KBASE_API_TOKEN",
        help="Bearer token for normal CLI commands.",
    ),
    session_token: str | None = typer.Option(
        None,
        "--session-token",
        envvar="KBASE_SESSION_TOKEN",
        help="Session token for normal CLI commands.",
    ),
    allow_local_actor: bool = typer.Option(
        False,
        "--allow-local-actor",
        envvar="KBASE_CLI_ALLOW_LOCAL_ACTOR",
        help="Allow the compatibility-only --actor override for local development.",
    ),
) -> None:
    ctx.obj = {
        "api_token": api_token,
        "session_token": session_token,
        "allow_local_actor": allow_local_actor,
    }


def _auth_config() -> dict[str, Any]:
    ctx = click.get_current_context()
    root = ctx.find_root()
    return root.obj if isinstance(root.obj, dict) else {}


def _actor_option() -> str | None:
    return typer.Option(None, "--actor", help=LOCAL_ACTOR_OPTION_HELP)


def _actor_context(actor: str | None = None, request_id: str | None = None) -> ActorContext:
    auth = _auth_config()
    if actor is not None:
        if not auth.get("allow_local_actor"):
            raise typer.BadParameter(
                "The --actor override is disabled by default. Re-run with --allow-local-actor to use local actor mode."
            )
        return ActorContext(principal_id=actor, request_id=request_id)

    try:
        session = get_current_session(
            GetSessionInput(
                session_token=auth.get("session_token"),
                api_token=auth.get("api_token"),
                request_id=request_id,
            )
        )
    except AuthenticationError as exc:
        raise typer.BadParameter(
            "Authentication required. Use --api-token/--session-token or set KBASE_API_TOKEN/KBASE_SESSION_TOKEN. "
            "Use 'kbase auth token-create' to bootstrap a CLI token."
        ) from exc
    return ActorContext(principal_id=session.principal_id, request_id=request_id)


def _provenance(method_key: str) -> ProvenanceInput:
    return ProvenanceInput(method_key=method_key, data_class="canonical")


def _parse_json_map(raw: str | None) -> dict[str, Any]:
    if not raw:
        return {}
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise typer.BadParameter("Expected a JSON object")
    return value


def _read_text_input(
    *,
    body: str | None,
    body_file: Path | None,
    stdin: bool,
) -> str:
    if body is not None:
        return body
    if body_file is not None:
        return body_file.read_text(encoding="utf-8")
    if stdin:
        return sys.stdin.read()
    return ""


def _emit(result, as_json: bool) -> None:  # type: ignore[no-untyped-def]
    if as_json:
        typer.echo(result.model_dump_json(indent=2))
    else:
        typer.echo(json.dumps(result.model_dump(mode="json"), indent=2))


def _infer_file_item_kind(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff"}:
        return "image"
    if suffix in {".xls", ".xlsx", ".csv", ".ods"}:
        return "spreadsheet"
    return "document"


@auth_app.command("token-create")
def auth_token_create_command(
    username: str = typer.Option(..., "--username"),
    password: str = typer.Option(
        ...,
        "--password",
        prompt=True,
        hide_input=True,
    ),
    token_label: str = typer.Option("cli", "--token-label"),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = create_api_token_with_password_flow(
        CreateApiTokenWithPasswordInput(
            username=username,
            password=password,
            token_label=token_label,
        )
    )
    _emit(result, as_json)


@note_app.command("create")
def create_note_command(
    title: str = typer.Option(...),
    category: str = typer.Option(..., "--category"),
    body: str = typer.Option(None, "--body"),
    body_file: Path | None = typer.Option(None, "--body-file"),
    stdin: bool = typer.Option(False, "--stdin"),
    status: str | None = typer.Option(None, "--status"),
    language: str | None = typer.Option(None, "--language"),
    parent_item_id: str | None = typer.Option(None, "--parent-item-id"),
    project_ids: list[str] = typer.Option(None, "--project-id"),
    labels: list[str] = typer.Option(None, "--label"),
    metadata_json: str | None = typer.Option(None, "--metadata-json"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    markdown_body = _read_text_input(body=body, body_file=body_file, stdin=stdin)
    result = create_note(
        CreateNoteInput(
            title=title,
            category_key=category,
            status=status,
            language_code=language,
            markdown_body=markdown_body,
            parent_item_id=parent_item_id,
            project_ids=project_ids or [],
            label_paths=labels or [],
            metadata=_parse_json_map(metadata_json),
            actor=_actor_context(actor),
            provenance=_provenance("cli.create_note"),
        )
    )
    _emit(result, as_json)


@item_app.command("get")
def get_item_command(
    item_id: str,
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = get_item(GetItemInput(item_id=item_id, actor=_actor_context(actor)))
    _emit(result, as_json)


@item_app.command("list")
def list_items_command(
    item_kind: str | None = typer.Option(None, "--item-kind"),
    category: str | None = typer.Option(None, "--category"),
    include_archived: bool = typer.Option(False, "--include-archived"),
    limit: int = typer.Option(50, "--limit"),
    offset: int = typer.Option(0, "--offset"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = list_items(
        ListItemsInput(
            item_kind=item_kind,
            category_key=category,
            include_archived=include_archived,
            limit=limit,
            offset=offset,
            actor=_actor_context(actor),
        )
    )
    _emit(result, as_json)


@item_app.command("update")
def update_item_command(
    item_id: str,
    title: str | None = typer.Option(None, "--title"),
    category: str | None = typer.Option(None, "--category"),
    status: str | None = typer.Option(None, "--status"),
    language: str | None = typer.Option(None, "--language"),
    archived: bool | None = typer.Option(None, "--archived"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = update_item_core(
        UpdateItemCoreInput(
            item_id=item_id,
            title=title,
            category_key=category,
            status=status,
            language_code=language,
            is_archived=archived,
            actor=_actor_context(actor),
            provenance=_provenance("cli.update_item_core"),
        )
    )
    _emit(result, as_json)


@content_app.command("replace")
def replace_content_command(
    item_id: str,
    body: str = typer.Option(None, "--body"),
    body_file: Path | None = typer.Option(None, "--body-file"),
    stdin: bool = typer.Option(False, "--stdin"),
    part_kind: str = typer.Option("markdown_body", "--part-kind"),
    change_reason: str | None = typer.Option(None, "--reason"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    content_text = _read_text_input(body=body, body_file=body_file, stdin=stdin)
    result = replace_content_part(
        ReplaceContentPartInput(
            item_id=item_id,
            part_kind=part_kind,
            content_text=content_text,
            change_reason=change_reason,
            actor=_actor_context(actor),
            provenance=_provenance("cli.replace_content_part"),
        )
    )
    _emit(result, as_json)


@search_app.command("content")
def search_content_command(
    query: str | None = typer.Option(None, "--query"),
    item_kind: list[str] = typer.Option(None, "--item-kind"),
    category: list[str] = typer.Option(None, "--category"),
    label: list[str] = typer.Option(None, "--label"),
    status: list[str] = typer.Option(None, "--status"),
    created_by: list[str] = typer.Option(None, "--created-by"),
    project_id: str | None = typer.Option(None, "--project-id"),
    include_archived: bool = typer.Option(False, "--include-archived"),
    limit: int = typer.Option(50, "--limit"),
    offset: int = typer.Option(0, "--offset"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = search_content(
        SearchContentInput(
            query=query,
            item_kinds=item_kind or [],
            category_keys=category or [],
            label_paths=label or [],
            statuses=status or [],
            created_by_principal_ids=created_by or [],
            project_id=project_id,
            include_archived=include_archived,
            limit=limit,
            offset=offset,
            actor=_actor_context(actor),
        )
    )
    _emit(result, as_json)


@category_app.command("list")
def list_categories_command(
    query: str | None = typer.Option(None, "--query"),
    applies_to_kind: str | None = typer.Option(None, "--applies-to-kind"),
    parent_key: str | None = typer.Option(None, "--parent-key"),
    full_path_prefix: str | None = typer.Option(None, "--full-path-prefix"),
    include_inactive: bool = typer.Option(False, "--include-inactive"),
    limit: int = typer.Option(100, "--limit"),
    offset: int = typer.Option(0, "--offset"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = list_categories(
        ListCategoriesInput(
            query=query,
            applies_to_kind=applies_to_kind,
            parent_key=parent_key,
            full_path_prefix=full_path_prefix,
            include_inactive=include_inactive,
            limit=limit,
            offset=offset,
            actor=_actor_context(actor),
        )
    )
    _emit(result, as_json)


@category_app.command("create")
def create_category_command(
    key: str = typer.Option(..., "--key"),
    label: str = typer.Option(..., "--label"),
    description: str | None = typer.Option(None, "--description"),
    applies_to_kind: str | None = typer.Option(None, "--applies-to-kind"),
    parent_key: str | None = typer.Option(None, "--parent-key"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = create_category(
        CreateCategoryInput(
            key=key,
            label=label,
            description=description,
            applies_to_kind=applies_to_kind,
            parent_key=parent_key,
            actor=_actor_context(actor),
            provenance=_provenance("cli.create_category"),
        )
    )
    _emit(result, as_json)


@category_app.command("update")
def update_category_command(
    key: str,
    label: str | None = typer.Option(None, "--label"),
    description: str | None = typer.Option(None, "--description"),
    applies_to_kind: str | None = typer.Option(None, "--applies-to-kind"),
    parent_key: str | None = typer.Option(None, "--parent-key"),
    active: bool | None = typer.Option(None, "--active/--inactive"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    if label is None and description is None and applies_to_kind is None and parent_key is None and active is None:
        raise typer.BadParameter("At least one update option is required")
    result = update_category(
        UpdateCategoryInput(
            key=key,
            label=label,
            description=description,
            description_provided=description is not None,
            applies_to_kind=applies_to_kind,
            applies_to_kind_provided=applies_to_kind is not None,
            parent_key=parent_key,
            parent_key_provided=parent_key is not None,
            is_active=active,
            actor=_actor_context(actor),
            provenance=_provenance("cli.update_category"),
        )
    )
    _emit(result, as_json)


@category_app.command("delete")
def delete_category_command(
    key: str,
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = delete_category(
        DeleteCategoryInput(
            key=key,
            actor=_actor_context(actor),
            provenance=_provenance("cli.delete_category"),
        )
    )
    _emit(result, as_json)


@label_app.command("assign")
def assign_labels_command(
    item_id: str,
    label: list[str] = typer.Option(..., "--label"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = assign_labels(
        AssignLabelsInput(
            item_id=item_id,
            label_paths=label,
            actor=_actor_context(actor),
            provenance=_provenance("cli.assign_labels"),
        )
    )
    typer.echo(json.dumps([entry.model_dump(mode="json") for entry in result], indent=2))


@label_app.command("list")
def list_labels_command(
    query: str | None = typer.Option(None, "--query"),
    include_inactive: bool = typer.Option(False, "--include-inactive"),
    parent_id: str | None = typer.Option(None, "--parent-id"),
    full_path_prefix: str | None = typer.Option(None, "--prefix"),
    limit: int = typer.Option(100, "--limit"),
    actor: str | None = _actor_option(),
) -> None:
    result = list_labels(
        ListLabelsInput(
            query=query,
            include_inactive=include_inactive,
            parent_id=parent_id,
            full_path_prefix=full_path_prefix,
            limit=limit,
            actor=_actor_context(actor),
        )
    )
    typer.echo(json.dumps([entry.model_dump(mode="json") for entry in result], indent=2))


@label_app.command("create")
def create_label_command(
    name: str = typer.Option(..., "--name"),
    parent_id: str | None = typer.Option(None, "--parent-id"),
    description: str | None = typer.Option(None, "--description"),
    meta_json: str | None = typer.Option(None, "--meta-json"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = create_label(
        CreateLabelInput(
            name=name,
            parent_id=parent_id,
            description=description,
            meta=_parse_json_map(meta_json),
            actor=_actor_context(actor),
            provenance=_provenance("cli.create_label"),
        )
    )
    _emit(result, as_json)


@label_app.command("rename")
def rename_label_command(
    label_id: str,
    name: str = typer.Option(..., "--name"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = rename_label(
        RenameLabelInput(
            label_id=label_id,
            name=name,
            actor=_actor_context(actor),
            provenance=_provenance("cli.rename_label"),
        )
    )
    _emit(result, as_json)


@label_app.command("deactivate")
def deactivate_label_command(
    label_id: str,
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = deactivate_label(
        DeactivateLabelInput(
            label_id=label_id,
            actor=_actor_context(actor),
            provenance=_provenance("cli.deactivate_label"),
        )
    )
    _emit(result, as_json)


@label_app.command("reactivate")
def reactivate_label_command(
    label_id: str,
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = reactivate_label(
        ReactivateLabelInput(
            label_id=label_id,
            actor=_actor_context(actor),
            provenance=_provenance("cli.reactivate_label"),
        )
    )
    _emit(result, as_json)


@label_app.command("delete")
def delete_label_command(
    label_id: str,
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = delete_label(
        DeleteLabelInput(
            label_id=label_id,
            actor=_actor_context(actor),
            provenance=_provenance("cli.delete_label"),
        )
    )
    _emit(result, as_json)


@classify_app.command("set")
def classify_item_command(
    item_id: str,
    category: str = typer.Option(..., "--category"),
    secondary: list[str] = typer.Option(None, "--secondary"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = classify_item(
        ClassifyItemInput(
            item_id=item_id,
            primary_category_key=category,
            secondary_category_keys=secondary or [],
            actor=_actor_context(actor),
            provenance=_provenance("cli.classify_item"),
        )
    )
    _emit(result, as_json)


@metadata_app.command("patch")
def patch_metadata_command(
    item_id: str,
    set_json: str | None = typer.Option(None, "--set-json"),
    unset: list[str] = typer.Option(None, "--unset"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = patch_item_metadata(
        PatchItemMetadataInput(
            item_id=item_id,
            set_fields=_parse_json_map(set_json),
            unset_fields=unset or [],
            actor=_actor_context(actor),
            provenance=_provenance("cli.patch_item_metadata"),
        )
    )
    typer.echo(json.dumps([entry.model_dump(mode="json") for entry in result], indent=2))


@asset_app.command("register")
def register_asset_command(
    storage_path: str = typer.Option(..., "--storage-path"),
    asset_kind: str = typer.Option(..., "--asset-kind"),
    original_filename: str | None = typer.Option(None, "--original-filename"),
    mime_type: str | None = typer.Option(None, "--mime-type"),
    size_bytes: int | None = typer.Option(None, "--size-bytes"),
    checksum_sha256: str | None = typer.Option(None, "--checksum-sha256"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = register_asset(
        RegisterAssetInput(
            storage_path=storage_path,
            asset_kind=asset_kind,
            original_filename=original_filename,
            mime_type=mime_type,
            size_bytes=size_bytes,
            checksum_sha256=checksum_sha256,
            actor=_actor_context(actor),
            provenance=_provenance("cli.register_asset"),
        )
    )
    _emit(result, as_json)


@asset_app.command("attach")
def attach_asset_command(
    item_id: str,
    asset_id: str,
    relationship_role: str = typer.Option(..., "--role"),
    caption: str | None = typer.Option(None, "--caption"),
    sort_order: int = typer.Option(0, "--sort-order"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = attach_asset_to_item(
        AttachAssetToItemInput(
            item_id=item_id,
            asset_id=asset_id,
            relationship_role=relationship_role,
            caption=caption,
            sort_order=sort_order,
            actor=_actor_context(actor),
            provenance=_provenance("cli.attach_asset_to_item"),
        )
    )
    _emit(result, as_json)


@file_item_app.command("import")
def import_file_item_command(
    path: Path = typer.Option(..., "--path"),
    item_kind: str | None = typer.Option(None, "--item-kind"),
    title: str | None = typer.Option(None, "--title"),
    category: str | None = typer.Option(None, "--category"),
    status: str | None = typer.Option(None, "--status"),
    language: str | None = typer.Option(None, "--language"),
    link_to_item_id: str | None = typer.Option(None, "--link-to-item-id"),
    link_type: str | None = typer.Option(None, "--link-type"),
    link_note: str | None = typer.Option(None, "--link-note"),
    project_ids: list[str] = typer.Option(None, "--project-id"),
    labels: list[str] = typer.Option(None, "--label"),
    metadata_json: str | None = typer.Option(None, "--metadata-json"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    payload = path.read_bytes()
    result = import_file_as_item(
        CreateFileItemInput(
            title=title,
            item_kind=item_kind or _infer_file_item_kind(path),
            category_key=category,
            status=status,
            language_code=language,
            original_filename=path.name,
            size_bytes=len(payload),
            file_bytes=payload,
            link_to_item_id=link_to_item_id,
            link_type=link_type,
            link_note=link_note,
            project_ids=project_ids or [],
            label_paths=labels or [],
            metadata=_parse_json_map(metadata_json),
            actor=_actor_context(actor),
            provenance=_provenance("cli.file_item.import"),
        )
    )
    _emit(result, as_json)


@inbox_app.command("list")
def list_inbox_command(
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    _actor_context()
    result = list_inbox_files()
    _emit(result, as_json)


@inbox_app.command("import")
def import_inbox_command(
    inbox_relative_path: str = typer.Option(..., "--path"),
    item_kind: str | None = typer.Option(None, "--item-kind"),
    title: str | None = typer.Option(None, "--title"),
    category: str | None = typer.Option(None, "--category"),
    status: str | None = typer.Option(None, "--status"),
    language: str | None = typer.Option(None, "--language"),
    link_to_item_id: str | None = typer.Option(None, "--link-to-item-id"),
    link_type: str | None = typer.Option(None, "--link-type"),
    link_note: str | None = typer.Option(None, "--link-note"),
    project_ids: list[str] = typer.Option(None, "--project-id"),
    labels: list[str] = typer.Option(None, "--label"),
    metadata_json: str | None = typer.Option(None, "--metadata-json"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = import_inbox_file(
        ImportInboxFileInput(
            inbox_relative_path=inbox_relative_path,
            title=title,
            item_kind=item_kind,
            category_key=category,
            status=status,
            language_code=language,
            link_to_item_id=link_to_item_id,
            link_type=link_type,
            link_note=link_note,
            project_ids=project_ids or [],
            label_paths=labels or [],
            metadata=_parse_json_map(metadata_json),
            actor=_actor_context(actor),
            provenance=_provenance("cli.inbox.import"),
        )
    )
    _emit(result, as_json)


@link_app.command("add")
def link_add_command(
    from_item_id: str = typer.Option(..., "--from-item-id"),
    to_item_id: str = typer.Option(..., "--to-item-id"),
    link_type: str = typer.Option(..., "--link-type"),
    note: str | None = typer.Option(None, "--note"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = link_items(
        LinkItemsInput(
            from_item_id=from_item_id,
            to_item_id=to_item_id,
            link_type=link_type,
            note=note,
            actor=_actor_context(actor),
            provenance=_provenance("cli.link_items"),
        )
    )
    _emit(result, as_json)


@link_app.command("list")
def link_list_command(
    item_id: str,
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = list_related_items(ListRelatedItemsInput(item_id=item_id, actor=_actor_context(actor)))
    _emit(result, as_json)


@project_app.command("create")
def project_create_command(
    title: str = typer.Option(..., "--title"),
    category: str = typer.Option("project_general", "--category"),
    description: str | None = typer.Option(None, "--description"),
    status: str | None = typer.Option(None, "--status"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = create_project(
        CreateProjectInput(
            title=title,
            category_key=category,
            description=description,
            status=status,
            actor=_actor_context(actor),
            provenance=_provenance("cli.create_project"),
        )
    )
    _emit(result, as_json)


@project_app.command("add-item")
def project_add_item_command(
    project_id: str,
    item_id: str,
    role: str | None = typer.Option(None, "--role"),
    sort_order: int = typer.Option(0, "--sort-order"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = add_item_to_project(
        AddItemToProjectInput(
            project_id=project_id,
            item_id=item_id,
            role=role,
            sort_order=sort_order,
            actor=_actor_context(actor),
            provenance=_provenance("cli.add_item_to_project"),
        )
    )
    _emit(result, as_json)


@project_app.command("list-items")
def project_list_items_command(
    project_id: str,
    limit: int = typer.Option(50, "--limit"),
    offset: int = typer.Option(0, "--offset"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = list_project_items(
        ListProjectItemsInput(
            project_id=project_id,
            limit=limit,
            offset=offset,
            actor=_actor_context(actor),
        )
    )
    _emit(result, as_json)


@history_app.command("show")
def history_show_command(
    item_id: str,
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = get_item_history(GetItemInput(item_id=item_id, actor=_actor_context(actor)))
    _emit(result, as_json)


@provenance_app.command("show")
def provenance_show_command(
    item_id: str,
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    result = get_item_provenance(GetItemInput(item_id=item_id, actor=_actor_context(actor)))
    _emit(result, as_json)


@workflow_app.command("notes-core")
def workflow_notes_core_command(
    title: str = typer.Option(..., "--title"),
    category: str = typer.Option(..., "--category"),
    body: str = typer.Option(None, "--body"),
    body_file: Path | None = typer.Option(None, "--body-file"),
    stdin: bool = typer.Option(False, "--stdin"),
    project_title: str | None = typer.Option(None, "--project-title"),
    project_category: str = typer.Option("project_general", "--project-category"),
    label: list[str] = typer.Option(None, "--label"),
    metadata_json: str | None = typer.Option(None, "--metadata-json"),
    actor: str | None = _actor_option(),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    created_project = None
    if project_title:
        created_project = create_project(
            CreateProjectInput(
                title=project_title,
                category_key=project_category,
                actor=_actor_context(actor),
                provenance=_provenance("cli.workflow.notes_core.project"),
            )
        )

    note = create_note(
        CreateNoteInput(
            title=title,
            category_key=category,
            markdown_body=_read_text_input(body=body, body_file=body_file, stdin=stdin),
            project_ids=[created_project.id] if created_project else [],
            label_paths=label or [],
            metadata=_parse_json_map(metadata_json),
            actor=_actor_context(actor),
            provenance=_provenance("cli.workflow.notes_core.note"),
        )
    )

    payload = {
        "workflow": "notes_core",
        "project": created_project.model_dump(mode="json") if created_project else None,
        "note": note.model_dump(mode="json"),
    }
    typer.echo(json.dumps(payload, indent=2) if as_json else json.dumps(payload, indent=2))


def run() -> None:
    app()


if __name__ == "__main__":
    run()
