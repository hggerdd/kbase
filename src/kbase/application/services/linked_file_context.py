from __future__ import annotations

from kbase.application.services.capability_support import record_write, require_item_write
from kbase.core.rules.modelling_rules import FILE_ITEM_KINDS
from kbase.core.value_objects.actor import ActorContext
from kbase.core.value_objects.provenance import ProvenanceInput

ATTACHMENT_LINK_TYPE = "attachment"


def inherited_context_for_file_item(repos, *, source_item_id: str) -> dict[str, object]:  # type: ignore[no-untyped-def]
    source = repos.items.get(source_item_id)
    if source is None or source.item_kind != "note":
        return {"category_key": None, "label_paths": [], "project_ids": []}

    return {
        "category_key": source.category_key,
        "label_paths": [label.full_path for label in repos.labels.list_labels_for_item(source.id)],
        "project_ids": [project.id for project in repos.projects.list_projects_for_item(source.id)],
    }


def exclusive_attachment_file_items(repos, *, source_item_id: str):  # type: ignore[no-untyped-def]
    targets = []
    for link in repos.links.list_links(source_item_id):
        if link.link_type != ATTACHMENT_LINK_TYPE:
            continue
        if repos.links.count_incoming_links(link.to_item_id) != 1:
            continue
        target = repos.items.get(link.to_item_id)
        if target is not None and target.item_kind in FILE_ITEM_KINDS:
            targets.append(target)
    return targets


def propagate_context_to_exclusive_attachments(
    repos,  # type: ignore[no-untyped-def]
    *,
    source_item_id: str,
    actor: ActorContext,
    provenance: ProvenanceInput,
    category_key_provided: bool = False,
    label_paths: list[str] | None = None,
    project_ids: list[str] | None = None,
) -> None:
    source = repos.items.get(source_item_id)
    if source is None or source.item_kind != "note":
        return

    for target in exclusive_attachment_file_items(repos, source_item_id=source.id):
        require_item_write(repos, item_id=target.id, actor_principal_id=actor.principal_id)

        if category_key_provided:
            repos.items.update_core(
                target,
                title=None,
                category_key=source.category_key,
                status=None,
                language_code=None,
                is_archived=None,
            )

        if label_paths is not None:
            repos.labels.replace_labels(
                item_id=target.id,
                label_paths=label_paths,
                created_by_principal_id=actor.principal_id,
            )

        if project_ids is not None:
            repos.projects.replace_item_projects(
                item_id=target.id,
                project_ids=project_ids,
                added_by_principal_id=actor.principal_id,
            )

        changed_fields = [
            field
            for field, changed in (
                ("category", category_key_provided),
                ("labels", label_paths is not None),
                ("projects", project_ids is not None),
            )
            if changed
        ]
        record_write(
            repos=repos,
            item_id=target.id,
            actor_principal_id=actor.principal_id,
            operation_key="propagate_linked_file_context",
            target_table="items",
            target_id=target.id,
            payload_summary=", ".join(changed_fields),
            target_object_type="item",
            target_object_id=target.id,
            target_field_key="linked_note_context",
            provenance=provenance,
        )
