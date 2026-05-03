from __future__ import annotations

from kbase.application.capabilities.add_item_to_project import add_item_to_project
from kbase.application.capabilities.assign_labels import assign_labels
from kbase.application.capabilities.attach_asset_to_item import attach_asset_to_item
from kbase.application.capabilities.classify_item import classify_item
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
from kbase.application.capabilities.link_items import link_items
from kbase.application.capabilities.list_labels import list_labels
from kbase.application.capabilities.list_categories import list_categories
from kbase.application.capabilities.list_items import list_items
from kbase.application.capabilities.list_project_items import list_project_items
from kbase.application.capabilities.list_related_items import list_related_items
from kbase.application.capabilities.patch_item_metadata import patch_item_metadata
from kbase.application.capabilities.register_asset import register_asset
from kbase.application.capabilities.reactivate_label import reactivate_label
from kbase.application.capabilities.replace_item_projects import replace_item_projects
from kbase.application.capabilities.rename_label import rename_label
from kbase.application.capabilities.replace_item_acl import replace_item_acl
from kbase.application.capabilities.replace_labels import replace_labels
from kbase.application.capabilities.replace_content_part import replace_content_part
from kbase.application.capabilities.search_content import search_content
from kbase.application.capabilities.update_item_core import update_item_core
from kbase.application.capabilities.update_category import update_category
from kbase.application.capabilities.unlink_items import unlink_items
from kbase.application.dto.capabilities import (
    AddItemToProjectInput,
    AssignLabelsInput,
    AttachAssetToItemInput,
    ClassifyItemInput,
    CreateCategoryInput,
    CreateLabelInput,
    CreateNoteInput,
    CreateProjectInput,
    DeleteCategoryInput,
    DeleteLabelInput,
    DeactivateLabelInput,
    GetItemInput,
    LinkItemsInput,
    ListCategoriesInput,
    ListLabelsInput,
    ListItemsInput,
    ListProjectItemsInput,
    ListRelatedItemsInput,
    PatchItemMetadataInput,
    RegisterAssetInput,
    ReactivateLabelInput,
    RenameLabelInput,
    ReplaceContentPartInput,
    ReplaceItemAclInput,
    ReplaceItemProjectsInput,
    SearchContentInput,
    UnlinkItemsInput,
    UpdateCategoryInput,
    UpdateItemCoreInput,
)
from kbase.core.value_objects.actor import ActorContext
from kbase.core.value_objects.provenance import ProvenanceInput


def actor() -> ActorContext:
    return ActorContext(principal_id="heiko")


def provenance(method: str) -> ProvenanceInput:
    return ProvenanceInput(method_key=method, data_class="canonical")


def test_create_note_and_get_item(session_factory) -> None:
    created = create_note(
        CreateNoteInput(
            title="ETF Strategy",
            category_key="decision",
            markdown_body="# Decision\nUse PEA",
            label_paths=["finance/investing"],
            metadata={"description": "Initial draft"},
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    item = get_item(
        GetItemInput(item_id=created.item.id, actor=actor()),
        session_factory=session_factory,
    )

    assert item.item.title == "ETF Strategy"
    assert item.primary_content_part is not None
    assert item.primary_content_part.content_text.startswith("# Decision")
    assert item.labels[0].full_path == "finance/investing"
    assert item.metadata[0].field_key == "description"


def test_replace_content_part_creates_history_and_provenance(session_factory) -> None:
    created = create_note(
        CreateNoteInput(
            title="Search",
            category_key="research",
            markdown_body="initial",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    replace_content_part(
        ReplaceContentPartInput(
            item_id=created.item.id,
            content_text="updated",
            change_reason="refine",
            actor=actor(),
            provenance=provenance("test.replace_content_part"),
        ),
        session_factory=session_factory,
    )

    history = get_item_history(
        GetItemInput(item_id=created.item.id, actor=actor()),
        session_factory=session_factory,
    )
    provenance_result = get_item_provenance(
        GetItemInput(item_id=created.item.id, actor=actor()),
        session_factory=session_factory,
    )

    assert len(history.events) >= 2
    assert any(event.operation_key == "replace_content_part" for event in history.events)
    assert any(record.method_key == "test.replace_content_part" for record in provenance_result.records)


def test_asset_link_project_and_search_flow(session_factory) -> None:
    note = create_note(
        CreateNoteInput(
            title="Waschmaschine",
            category_key="research",
            markdown_body="Bosch vs Siemens",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    project = create_project(
        CreateProjectInput(
            title="Haushalt 2026",
            description="Household project",
            actor=actor(),
            provenance=provenance("test.create_project"),
        ),
        session_factory=session_factory,
    )
    add_item_to_project(
        AddItemToProjectInput(
            project_id=project.id,
            item_id=note.item.id,
            actor=actor(),
            provenance=provenance("test.add_item_to_project"),
        ),
        session_factory=session_factory,
    )
    assign_labels(
        AssignLabelsInput(
            item_id=note.item.id,
            label_paths=["household/appliances"],
            actor=actor(),
            provenance=provenance("test.assign_labels"),
        ),
        session_factory=session_factory,
    )
    patch_item_metadata(
        PatchItemMetadataInput(
            item_id=note.item.id,
            set_fields={"research_subject": "washing machine"},
            actor=actor(),
            provenance=provenance("test.patch_item_metadata"),
        ),
        session_factory=session_factory,
    )
    asset = register_asset(
        RegisterAssetInput(
            storage_path="kb/items/images/demo/bosch.jpg",
            asset_kind="source_file",
            original_filename="bosch.jpg",
            mime_type="image/jpeg",
            actor=actor(),
            provenance=provenance("test.register_asset"),
        ),
        session_factory=session_factory,
    )
    attach_asset_to_item(
        AttachAssetToItemInput(
            item_id=note.item.id,
            asset_id=asset.id,
            relationship_role="attachment",
            actor=actor(),
            provenance=provenance("test.attach_asset_to_item"),
        ),
        session_factory=session_factory,
    )

    search_result = search_content(
        SearchContentInput(
            query="Bosch",
            project_id=project.id,
            label_paths=["household/appliances"],
            actor=actor(),
        ),
        session_factory=session_factory,
    )

    assert len(search_result.items) == 1
    assert search_result.items[0].title == "Waschmaschine"


def test_linked_items_are_returned(session_factory) -> None:
    source = create_note(
        CreateNoteInput(
            title="Research",
            category_key="research",
            markdown_body="Body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    target = create_note(
        CreateNoteInput(
            title="Decision",
            category_key="decision",
            markdown_body="Decision body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    link_items(
        LinkItemsInput(
            from_item_id=source.item.id,
            to_item_id=target.item.id,
            link_type="decision_for",
            actor=actor(),
            provenance=provenance("test.link_items"),
        ),
        session_factory=session_factory,
    )
    item = get_item(GetItemInput(item_id=source.item.id, actor=actor()), session_factory=session_factory)
    assert item.related_items[0].title == "Decision"


def test_update_item_core_updates_title_status_and_language(session_factory) -> None:
    created = create_note(
        CreateNoteInput(
            title="Old title",
            category_key="research",
            markdown_body="Body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    updated = update_item_core(
        UpdateItemCoreInput(
            item_id=created.item.id,
            title="New title",
            status="active",
            language_code="de",
            actor=actor(),
            provenance=provenance("test.update_item_core"),
        ),
        session_factory=session_factory,
    )

    assert updated.title == "New title"
    item = get_item(GetItemInput(item_id=created.item.id, actor=actor()), session_factory=session_factory)
    assert item.item.status == "active"
    assert item.item.language_code == "de"


def test_archived_items_are_hidden_by_default_and_search_can_include_them(session_factory) -> None:
    created = create_note(
        CreateNoteInput(
            title="Archive me",
            category_key="reference",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    update_item_core(
        UpdateItemCoreInput(
            item_id=created.item.id,
            is_archived=True,
            actor=actor(),
            provenance=provenance("test.update_item_core"),
        ),
        session_factory=session_factory,
    )

    listed = list_items(ListItemsInput(actor=actor()), session_factory=session_factory)
    hidden_search = search_content(
        SearchContentInput(query="Archive me", actor=actor()),
        session_factory=session_factory,
    )
    visible_search = search_content(
        SearchContentInput(query="Archive me", include_archived=True, actor=actor()),
        session_factory=session_factory,
    )

    assert all(item.id != created.item.id for item in listed.items)
    assert hidden_search.items == []
    assert [item.id for item in visible_search.items] == [created.item.id]


def test_list_items_filters_by_kind_and_category(session_factory) -> None:
    create_note(
        CreateNoteInput(
            title="Research note",
            category_key="research",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    create_note(
        CreateNoteInput(
            title="Decision note",
            category_key="decision",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    create_project(
        CreateProjectInput(
            title="Side project",
            actor=actor(),
            provenance=provenance("test.create_project"),
        ),
        session_factory=session_factory,
    )

    filtered = list_items(
        ListItemsInput(item_kind="note", category_key="research", actor=actor()),
        session_factory=session_factory,
    )

    assert [item.title for item in filtered.items] == ["Research note"]


def test_classify_item_sets_primary_and_secondary_categories(session_factory) -> None:
    created = create_note(
        CreateNoteInput(
            title="Laptop research",
            category_key="research",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    classify_item(
        ClassifyItemInput(
            item_id=created.item.id,
            primary_category_key="decision",
            secondary_category_keys=["learning", "decision"],
            actor=actor(),
            provenance=provenance("test.classify_item"),
        ),
        session_factory=session_factory,
    )

    item = get_item(GetItemInput(item_id=created.item.id, actor=actor()), session_factory=session_factory)
    assert item.item.category_key == "decision"
    assert item.classifications == ["learning"]


def test_patch_item_metadata_can_unset_existing_field(session_factory) -> None:
    created = create_note(
        CreateNoteInput(
            title="Metadata note",
            category_key="research",
            markdown_body="body",
            metadata={"description": "keep", "research_subject": "washing machine"},
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    metadata_rows = patch_item_metadata(
        PatchItemMetadataInput(
            item_id=created.item.id,
            set_fields={"description": "updated"},
            unset_fields=["research_subject"],
            actor=actor(),
            provenance=provenance("test.patch_item_metadata"),
        ),
        session_factory=session_factory,
    )

    assert [row.field_key for row in metadata_rows] == ["description"]
    assert metadata_rows[0].value == "updated"


def test_list_related_items_returns_linked_item_refs(session_factory) -> None:
    first = create_note(
        CreateNoteInput(
            title="First",
            category_key="research",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    second = create_note(
        CreateNoteInput(
            title="Second",
            category_key="reference",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    link_items(
        LinkItemsInput(
            from_item_id=first.item.id,
            to_item_id=second.item.id,
            link_type="related",
            actor=actor(),
            provenance=provenance("test.link_items"),
        ),
        session_factory=session_factory,
    )

    result = list_related_items(
        ListRelatedItemsInput(item_id=first.item.id, actor=actor()),
        session_factory=session_factory,
    )

    assert [entry.title for entry in result.related_items] == ["Second"]


def test_unlink_items_removes_existing_link(session_factory) -> None:
    first = create_note(
        CreateNoteInput(
            title="First",
            category_key="research",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    second = create_note(
        CreateNoteInput(
            title="Second",
            category_key="reference",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    link_items(
        LinkItemsInput(
            from_item_id=first.item.id,
            to_item_id=second.item.id,
            link_type="related",
            actor=actor(),
            provenance=provenance("test.link_items"),
        ),
        session_factory=session_factory,
    )
    linked_detail = get_item(GetItemInput(item_id=first.item.id, actor=actor()), session_factory=session_factory)
    link_id = linked_detail.outgoing_links[0].id

    result = unlink_items(
        UnlinkItemsInput(link_id=link_id, actor=actor(), provenance=provenance("test.unlink_items")),
        session_factory=session_factory,
    )

    assert result.id == first.item.id
    related = list_related_items(
        ListRelatedItemsInput(item_id=first.item.id, actor=actor()),
        session_factory=session_factory,
    )
    assert related.related_items == []


def test_list_project_items_returns_only_project_members(session_factory) -> None:
    project = create_project(
        CreateProjectInput(
            title="Migration",
            actor=actor(),
            provenance=provenance("test.create_project"),
        ),
        session_factory=session_factory,
    )
    note_in_project = create_note(
        CreateNoteInput(
            title="Included",
            category_key="research",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    note_outside = create_note(
        CreateNoteInput(
            title="Outside",
            category_key="reference",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    add_item_to_project(
        AddItemToProjectInput(
            project_id=project.id,
            item_id=note_in_project.item.id,
            actor=actor(),
            provenance=provenance("test.add_item_to_project"),
        ),
        session_factory=session_factory,
    )

    result = list_project_items(
        ListProjectItemsInput(project_id=project.id, actor=actor()),
        session_factory=session_factory,
    )

    assert [item.title for item in result.items] == ["Included"]
    assert note_outside.item.id not in [item.id for item in result.items]


def test_create_note_can_attach_project_during_create(session_factory) -> None:
    project = create_project(
        CreateProjectInput(
            title="Home office",
            actor=actor(),
            provenance=provenance("test.create_project"),
        ),
        session_factory=session_factory,
    )

    note = create_note(
        CreateNoteInput(
            title="Desk research",
            category_key="research",
            markdown_body="body",
            project_ids=[project.id],
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    item = get_item(GetItemInput(item_id=note.item.id, actor=actor()), session_factory=session_factory)
    assert [project_ref.id for project_ref in item.projects] == [project.id]


def test_replace_item_projects_swaps_project_membership(session_factory) -> None:
    first_project = create_project(
        CreateProjectInput(
            title="Inbox",
            actor=actor(),
            provenance=provenance("test.create_project"),
        ),
        session_factory=session_factory,
    )
    second_project = create_project(
        CreateProjectInput(
            title="Launch",
            actor=actor(),
            provenance=provenance("test.create_project"),
        ),
        session_factory=session_factory,
    )
    note = create_note(
        CreateNoteInput(
            title="Project note",
            category_key="research",
            markdown_body="body",
            project_ids=[first_project.id],
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    replace_item_projects(
        ReplaceItemProjectsInput(
            item_id=note.item.id,
            project_ids=[second_project.id],
            actor=actor(),
            provenance=provenance("test.replace_item_projects"),
        ),
        session_factory=session_factory,
    )

    item = get_item(GetItemInput(item_id=note.item.id, actor=actor()), session_factory=session_factory)
    assert [project_ref.id for project_ref in item.projects] == [second_project.id]

    first_project_items = list_project_items(
        ListProjectItemsInput(project_id=first_project.id, actor=actor()),
        session_factory=session_factory,
    )
    assert first_project_items.items == []


def test_search_content_filters_by_status_and_creator(session_factory) -> None:
    wife_actor = ActorContext(principal_id="wife")
    shared = create_note(
        CreateNoteInput(
            title="Shared note",
            category_key="reference",
            status="active",
            markdown_body="family context",
            actor=wife_actor,
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    replace_item_acl(
        ReplaceItemAclInput(
            item_id=shared.item.id,
            grants=[
                {"principal_id": "wife", "permission_key": "view"},
                {"principal_id": "wife", "permission_key": "edit"},
                {"principal_id": "wife", "permission_key": "manage"},
                {"principal_id": "heiko", "permission_key": "view"},
            ],
            actor=wife_actor,
            provenance=provenance("test.replace_item_acl"),
        ),
        session_factory=session_factory,
    )
    create_note(
        CreateNoteInput(
            title="Heiko note",
            category_key="reference",
            status="draft",
            markdown_body="private context",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    result = search_content(
        SearchContentInput(
            statuses=["active"],
            created_by_principal_ids=["wife"],
            actor=actor(),
        ),
        session_factory=session_factory,
    )

    assert [item.title for item in result.items] == ["Shared note"]


def test_create_project_defaults_to_project_general(session_factory) -> None:
    project = create_project(
        CreateProjectInput(
            title="Default category project",
            actor=actor(),
            provenance=provenance("test.create_project"),
        ),
        session_factory=session_factory,
    )

    item = get_item(GetItemInput(item_id=project.id, actor=actor()), session_factory=session_factory)
    assert item.item.item_kind == "project"
    assert item.item.category_key == "project_general"


def test_delete_category_removes_unused_category_and_blocks_used_category(session_factory) -> None:
    create_note(
        CreateNoteInput(
            title="Uses research",
            category_key="research",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    deleted = delete_category(
        DeleteCategoryInput(
            key="learning",
            actor=actor(),
            provenance=provenance("test.delete_category"),
        ),
        session_factory=session_factory,
    )
    assert deleted.deleted is True

    try:
        delete_category(
            DeleteCategoryInput(
                key="research",
                actor=actor(),
                provenance=provenance("test.delete_category"),
            ),
            session_factory=session_factory,
        )
    except ValueError as error:
        assert str(error) == "Category 'research' is still in use and cannot be deleted"
    else:
        raise AssertionError("Expected delete_category to reject an in-use category")


def test_category_hierarchy_lists_moves_and_searches_subtrees(session_factory) -> None:
    parent = create_category(
        CreateCategoryInput(
            key="knowledge",
            label="Knowledge",
            applies_to_kind="note",
            actor=actor(),
            provenance=provenance("test.create_category"),
        ),
        session_factory=session_factory,
    )
    child = create_category(
        CreateCategoryInput(
            key="knowledge_research",
            label="Knowledge Research",
            applies_to_kind="note",
            parent_key=parent.key,
            actor=actor(),
            provenance=provenance("test.create_category"),
        ),
        session_factory=session_factory,
    )
    assert child.parent_key == "knowledge"
    assert child.full_path == "knowledge/knowledge_research"
    assert child.depth == 1

    create_note(
        CreateNoteInput(
            title="Hierarchy note",
            category_key="knowledge_research",
            markdown_body="body",
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    exact_parent = search_content(
        SearchContentInput(category_keys=["knowledge"], actor=actor()),
        session_factory=session_factory,
    )
    subtree = search_content(
        SearchContentInput(category_path_prefixes=["knowledge"], actor=actor()),
        session_factory=session_factory,
    )
    assert exact_parent.items == []
    assert [item.title for item in subtree.items] == ["Hierarchy note"]

    listed = list_categories(
        ListCategoriesInput(full_path_prefix="knowledge", actor=actor()),
        session_factory=session_factory,
    )
    assert [category.full_path for category in listed.categories] == [
        "knowledge",
        "knowledge/knowledge_research",
    ]

    other_parent = create_category(
        CreateCategoryInput(
            key="archive_notes",
            label="Archive Notes",
            applies_to_kind="note",
            actor=actor(),
            provenance=provenance("test.create_category"),
        ),
        session_factory=session_factory,
    )
    moved = update_category(
        UpdateCategoryInput(
            key="knowledge_research",
            parent_key=other_parent.key,
            parent_key_provided=True,
            actor=actor(),
            provenance=provenance("test.update_category"),
        ),
        session_factory=session_factory,
    )
    assert moved.full_path == "archive_notes/knowledge_research"


def test_category_hierarchy_rejects_cross_kind_parent_and_child_delete(session_factory) -> None:
    create_category(
        CreateCategoryInput(
            key="note_parent",
            label="Note Parent",
            applies_to_kind="note",
            actor=actor(),
            provenance=provenance("test.create_category"),
        ),
        session_factory=session_factory,
    )

    try:
        create_category(
            CreateCategoryInput(
                key="document_child",
                label="Document Child",
                applies_to_kind="document",
                parent_key="note_parent",
                actor=actor(),
                provenance=provenance("test.create_category"),
            ),
            session_factory=session_factory,
        )
    except ValueError as error:
        assert str(error) == "Child category must use the same applies_to_kind as its parent"
    else:
        raise AssertionError("Expected cross-kind category parent to be rejected")

    create_category(
        CreateCategoryInput(
            key="note_child",
            label="Note Child",
            applies_to_kind="note",
            parent_key="note_parent",
            actor=actor(),
            provenance=provenance("test.create_category"),
        ),
        session_factory=session_factory,
    )

    try:
        delete_category(
            DeleteCategoryInput(
                key="note_parent",
                actor=actor(),
                provenance=provenance("test.delete_category"),
            ),
            session_factory=session_factory,
        )
    except ValueError as error:
        assert str(error) == "Category 'note_parent' has child categories and cannot be deleted"
    else:
        raise AssertionError("Expected delete_category to reject categories with children")


def test_replace_labels_replaces_existing_item_labels(session_factory) -> None:
    created = create_note(
        CreateNoteInput(
            title="Replace labels",
            category_key="research",
            markdown_body="body",
            label_paths=["alpha/one", "beta/two"],
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    result = replace_labels(
        AssignLabelsInput(
            item_id=created.item.id,
            label_paths=["beta/two", "gamma/three"],
            actor=actor(),
            provenance=provenance("test.replace_labels"),
        ),
        session_factory=session_factory,
    )

    assert [label.full_path for label in result] == ["beta/two", "gamma/three"]
    item = get_item(GetItemInput(item_id=created.item.id, actor=actor()), session_factory=session_factory)
    assert [label.full_path for label in item.labels] == ["beta/two", "gamma/three"]


def test_list_labels_returns_known_labels(session_factory) -> None:
    create_note(
        CreateNoteInput(
            title="Label inventory",
            category_key="research",
            markdown_body="body",
            label_paths=["finance/investing", "household/appliances"],
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    labels = list_labels(ListLabelsInput(actor=actor(), limit=20), session_factory=session_factory)
    assert "finance/investing" in [label.full_path for label in labels]


def test_label_lifecycle_supports_create_rename_deactivate_and_reactivate(session_factory) -> None:
    root = create_label(
        CreateLabelInput(
            name="finance",
            actor=actor(),
            provenance=provenance("test.create_label"),
        ),
        session_factory=session_factory,
    )
    child = create_label(
        CreateLabelInput(
            name="investing",
            parent_id=root.id,
            actor=actor(),
            provenance=provenance("test.create_label"),
        ),
        session_factory=session_factory,
    )
    grandchild = create_label(
        CreateLabelInput(
            name="etf",
            parent_id=child.id,
            actor=actor(),
            provenance=provenance("test.create_label"),
        ),
        session_factory=session_factory,
    )

    renamed = rename_label(
        RenameLabelInput(
            label_id=child.id,
            name="assets",
            actor=actor(),
            provenance=provenance("test.rename_label"),
        ),
        session_factory=session_factory,
    )
    assert renamed.full_path == "finance/assets"

    listed = list_labels(
        ListLabelsInput(full_path_prefix="finance/assets", actor=actor(), limit=20),
        session_factory=session_factory,
    )
    assert [label.full_path for label in listed] == ["finance/assets", "finance/assets/etf"]

    deactivated = deactivate_label(
        DeactivateLabelInput(
            label_id=child.id,
            actor=actor(),
            provenance=provenance("test.deactivate_label"),
        ),
        session_factory=session_factory,
    )
    assert deactivated.is_active is False

    active_only = list_labels(ListLabelsInput(actor=actor(), limit=20), session_factory=session_factory)
    assert "finance/assets" not in [label.full_path for label in active_only]

    inactive_visible = list_labels(
        ListLabelsInput(actor=actor(), limit=20, include_inactive=True),
        session_factory=session_factory,
    )
    assert "finance/assets/etf" in [label.full_path for label in inactive_visible]

    reactivated = reactivate_label(
        ReactivateLabelInput(
            label_id=child.id,
            actor=actor(),
            provenance=provenance("test.reactivate_label"),
        ),
        session_factory=session_factory,
    )
    assert reactivated.is_active is True

    final_labels = list_labels(
        ListLabelsInput(full_path_prefix="finance/assets", actor=actor(), limit=20),
        session_factory=session_factory,
    )
    assert [label.full_path for label in final_labels] == ["finance/assets", "finance/assets/etf"]


def test_delete_label_removes_subtree_and_item_assignments(session_factory) -> None:
    created = create_note(
        CreateNoteInput(
            title="Delete labels",
            category_key="research",
            markdown_body="body",
            label_paths=["finance/assets/etf", "finance/tax"],
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    labels = list_labels(
        ListLabelsInput(full_path_prefix="finance/assets", actor=actor(), limit=20),
        session_factory=session_factory,
    )
    root = next(label for label in labels if label.full_path == "finance/assets")

    result = delete_label(
        DeleteLabelInput(
            label_id=root.id,
            actor=actor(),
            provenance=provenance("test.delete_label"),
        ),
        session_factory=session_factory,
    )

    assert result.deleted_count == 2
    remaining_labels = list_labels(
        ListLabelsInput(actor=actor(), include_inactive=True, limit=20),
        session_factory=session_factory,
    )
    assert "finance/assets" not in [label.full_path for label in remaining_labels]
    item = get_item(GetItemInput(item_id=created.item.id, actor=actor()), session_factory=session_factory)
    assert [label.full_path for label in item.labels] == ["finance/tax"]


def test_search_content_can_filter_by_label_branch(session_factory) -> None:
    create_note(
        CreateNoteInput(
            title="Depot plan",
            category_key="research",
            markdown_body="ETF allocation",
            label_paths=["finance/bank/depot/data"],
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )
    create_note(
        CreateNoteInput(
            title="Salary note",
            category_key="research",
            markdown_body="Income tax",
            label_paths=["finance/income/data"],
            actor=actor(),
            provenance=provenance("test.create_note"),
        ),
        session_factory=session_factory,
    )

    result = search_content(
        SearchContentInput(
            label_path_prefixes=["finance/bank"],
            actor=actor(),
        ),
        session_factory=session_factory,
    )

    assert [item.title for item in result.items] == ["Depot plan"]
