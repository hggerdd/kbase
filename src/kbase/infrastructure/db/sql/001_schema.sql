PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;

-- =========================================================
-- FOUNDATION REFERENCE TABLES
-- =========================================================

CREATE TABLE IF NOT EXISTS item_kinds (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS item_categories (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    applies_to_kind TEXT,
    parent_key TEXT,
    full_path TEXT NOT NULL UNIQUE,
    depth INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (applies_to_kind) REFERENCES item_kinds(key),
    FOREIGN KEY (parent_key) REFERENCES item_categories(key)
);

CREATE TABLE IF NOT EXISTS content_part_kinds (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS asset_kinds (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS link_types (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    is_symmetric INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS permissions (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS subject_relation_types (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS metadata_groups (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    applies_to_kind TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (applies_to_kind) REFERENCES item_kinds(key)
);

CREATE TABLE IF NOT EXISTS metadata_fields (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    value_type TEXT NOT NULL,
    applies_to_kind TEXT,
    is_multivalue INTEGER NOT NULL DEFAULT 0,
    is_system INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (applies_to_kind) REFERENCES item_kinds(key)
);

CREATE TABLE IF NOT EXISTS group_fields (
    group_key TEXT NOT NULL,
    field_key TEXT NOT NULL,
    is_required INTEGER NOT NULL DEFAULT 0,
    order_no INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (group_key, field_key),
    FOREIGN KEY (group_key) REFERENCES metadata_groups(key),
    FOREIGN KEY (field_key) REFERENCES metadata_fields(key)
);

-- =========================================================
-- PRINCIPALS / MULTIUSER
-- =========================================================

CREATE TABLE IF NOT EXISTS principals (
    id TEXT PRIMARY KEY,
    principal_type TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS principal_memberships (
    principal_id TEXT NOT NULL,
    member_principal_id TEXT NOT NULL,
    role TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (principal_id, member_principal_id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (member_principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    principal_id TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    revoked_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS api_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_label TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    last_used_at TEXT,
    revoked_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
    principal_id TEXT NOT NULL,
    preference_key TEXT NOT NULL,
    value_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (principal_id, preference_key),
    FOREIGN KEY (principal_id) REFERENCES principals(id)
);

-- =========================================================
-- CORE ITEMS
-- =========================================================

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    item_kind TEXT NOT NULL,
    category_key TEXT,
    status TEXT,
    origin TEXT NOT NULL,
    language_code TEXT,
    created_by_principal_id TEXT,
    parent_item_id TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived_at TEXT,
    FOREIGN KEY (item_kind) REFERENCES item_kinds(key),
    FOREIGN KEY (category_key) REFERENCES item_categories(key),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    FOREIGN KEY (parent_item_id) REFERENCES items(id)
);

CREATE TABLE IF NOT EXISTS item_classifications (
    item_id TEXT NOT NULL,
    category_key TEXT NOT NULL,
    classification_role TEXT NOT NULL DEFAULT 'secondary',
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, category_key, classification_role),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (category_key) REFERENCES item_categories(key),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS content_parts (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    part_kind TEXT NOT NULL,
    sequence_no INTEGER NOT NULL DEFAULT 0,
    page_no INTEGER,
    heading_path TEXT,
    content_text TEXT NOT NULL,
    content_format TEXT NOT NULL DEFAULT 'markdown',
    source_method TEXT NOT NULL DEFAULT 'manual',
    source_data_class TEXT NOT NULL DEFAULT 'canonical',
    language_code TEXT,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (part_kind) REFERENCES content_part_kinds(key),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    UNIQUE (item_id, sequence_no)
);

CREATE TABLE IF NOT EXISTS content_part_versions (
    id TEXT PRIMARY KEY,
    content_part_id TEXT NOT NULL,
    version_no INTEGER NOT NULL,
    content_text TEXT NOT NULL,
    content_format TEXT NOT NULL,
    change_reason TEXT,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (content_part_id) REFERENCES content_parts(id),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    UNIQUE (content_part_id, version_no)
);

CREATE TABLE IF NOT EXISTS item_files (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    file_role TEXT NOT NULL,
    relative_path TEXT NOT NULL UNIQUE,
    original_filename TEXT,
    extension TEXT,
    mime_type TEXT,
    size_bytes INTEGER,
    checksum_sha256 TEXT,
    source_data_class TEXT NOT NULL DEFAULT 'canonical',
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

-- =========================================================
-- ASSETS
-- =========================================================

CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    asset_kind TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    original_filename TEXT,
    extension TEXT,
    mime_type TEXT,
    size_bytes INTEGER,
    checksum_sha256 TEXT,
    source_data_class TEXT NOT NULL DEFAULT 'canonical',
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (asset_kind) REFERENCES asset_kinds(key),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS item_assets (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    relationship_role TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    UNIQUE (item_id, asset_id, relationship_role)
);

-- =========================================================
-- STRUCTURE: LABELS, LINKS, METADATA
-- =========================================================

CREATE TABLE IF NOT EXISTS label_nodes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    full_path TEXT NOT NULL UNIQUE,
    parent_id TEXT,
    description TEXT,
    depth INTEGER NOT NULL DEFAULT 0,
    meta_json TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES label_nodes(id)
);

CREATE TABLE IF NOT EXISTS item_labels (
    item_id TEXT NOT NULL,
    label_id TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    confidence REAL,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, label_id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (label_id) REFERENCES label_nodes(id),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS item_links (
    id TEXT PRIMARY KEY,
    from_item_id TEXT NOT NULL,
    to_item_id TEXT NOT NULL,
    link_type TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    confidence REAL,
    note TEXT,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (from_item_id) REFERENCES items(id),
    FOREIGN KEY (to_item_id) REFERENCES items(id),
    FOREIGN KEY (link_type) REFERENCES link_types(key),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS item_metadata (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    field_key TEXT NOT NULL,
    value_text TEXT,
    value_number REAL,
    value_integer INTEGER,
    value_date TEXT,
    value_datetime TEXT,
    value_bool INTEGER,
    value_json TEXT,
    source TEXT NOT NULL DEFAULT 'manual',
    confidence REAL,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (field_key) REFERENCES metadata_fields(key),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

-- =========================================================
-- PROJECTS / CONTEXTS
-- =========================================================

CREATE TABLE IF NOT EXISTS project_items (
    project_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    role TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    added_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (project_id, item_id),
    FOREIGN KEY (project_id) REFERENCES items(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (added_by_principal_id) REFERENCES principals(id)
);

-- =========================================================
-- ACL / SUBJECTS
-- =========================================================

CREATE TABLE IF NOT EXISTS item_acl (
    item_id TEXT NOT NULL,
    principal_id TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    granted_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, principal_id, permission_key),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (permission_key) REFERENCES permissions(key),
    FOREIGN KEY (granted_by_principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS item_subjects (
    item_id TEXT NOT NULL,
    principal_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, principal_id, relation_type),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (relation_type) REFERENCES subject_relation_types(key)
);

-- =========================================================
-- AUDIT / PROVENANCE / SAVED QUERIES
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    item_id TEXT,
    actor_principal_id TEXT,
    operation_key TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id TEXT NOT NULL,
    payload_summary TEXT,
    occurred_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (actor_principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS provenance_records (
    id TEXT PRIMARY KEY,
    target_object_type TEXT NOT NULL,
    target_object_id TEXT NOT NULL,
    target_field_key TEXT,
    source_object_type TEXT,
    source_object_id TEXT,
    source_uri TEXT,
    method_key TEXT NOT NULL,
    data_class TEXT NOT NULL,
    confidence REAL,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

CREATE TABLE IF NOT EXISTS saved_queries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    query_json TEXT NOT NULL,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

-- =========================================================
-- INDICES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_items_item_kind ON items(item_kind);
CREATE INDEX IF NOT EXISTS idx_items_category_key ON items(category_key);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_by ON items(created_by_principal_id);
CREATE INDEX IF NOT EXISTS idx_items_parent ON items(parent_item_id);
CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at);
CREATE INDEX IF NOT EXISTS idx_items_archived ON items(is_archived);

CREATE INDEX IF NOT EXISTS idx_item_classifications_category ON item_classifications(category_key);
CREATE INDEX IF NOT EXISTS idx_item_classifications_created_by ON item_classifications(created_by_principal_id);
CREATE INDEX IF NOT EXISTS idx_item_categories_parent ON item_categories(parent_key);
CREATE INDEX IF NOT EXISTS idx_item_categories_full_path ON item_categories(full_path);

CREATE INDEX IF NOT EXISTS idx_content_parts_item_id ON content_parts(item_id);
CREATE INDEX IF NOT EXISTS idx_content_parts_part_kind ON content_parts(part_kind);
CREATE INDEX IF NOT EXISTS idx_content_parts_created_by ON content_parts(created_by_principal_id);
CREATE INDEX IF NOT EXISTS idx_content_part_versions_content_part_id ON content_part_versions(content_part_id);
CREATE INDEX IF NOT EXISTS idx_item_files_item_id ON item_files(item_id);
CREATE INDEX IF NOT EXISTS idx_item_files_role ON item_files(file_role);

CREATE INDEX IF NOT EXISTS idx_assets_kind ON assets(asset_kind);
CREATE INDEX IF NOT EXISTS idx_assets_mime_type ON assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_assets_checksum ON assets(checksum_sha256);
CREATE INDEX IF NOT EXISTS idx_item_assets_item_id ON item_assets(item_id);
CREATE INDEX IF NOT EXISTS idx_item_assets_asset_id ON item_assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_item_assets_role ON item_assets(relationship_role);

CREATE INDEX IF NOT EXISTS idx_item_links_from_item_id ON item_links(from_item_id);
CREATE INDEX IF NOT EXISTS idx_item_links_to_item_id ON item_links(to_item_id);
CREATE INDEX IF NOT EXISTS idx_item_links_link_type ON item_links(link_type);

CREATE INDEX IF NOT EXISTS idx_item_labels_label_id ON item_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_label_nodes_parent_id ON label_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_label_nodes_is_active ON label_nodes(is_active);

CREATE INDEX IF NOT EXISTS idx_item_metadata_item_id ON item_metadata(item_id);
CREATE INDEX IF NOT EXISTS idx_item_metadata_field_key ON item_metadata(field_key);
CREATE INDEX IF NOT EXISTS idx_item_metadata_value_date ON item_metadata(value_date);
CREATE INDEX IF NOT EXISTS idx_item_metadata_value_datetime ON item_metadata(value_datetime);
CREATE INDEX IF NOT EXISTS idx_item_metadata_created_by ON item_metadata(created_by_principal_id);

CREATE INDEX IF NOT EXISTS idx_project_items_item_id ON project_items(item_id);
CREATE INDEX IF NOT EXISTS idx_project_items_added_by ON project_items(added_by_principal_id);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_principal_id ON users(principal_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_item_acl_principal_id ON item_acl(principal_id);
CREATE INDEX IF NOT EXISTS idx_item_acl_permission_key ON item_acl(permission_key);
CREATE INDEX IF NOT EXISTS idx_item_subjects_principal_id ON item_subjects(principal_id);
CREATE INDEX IF NOT EXISTS idx_item_subjects_relation_type ON item_subjects(relation_type);

CREATE INDEX IF NOT EXISTS idx_audit_events_item_id ON audit_events(item_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_principal_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_occurred_at ON audit_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_provenance_target ON provenance_records(target_object_type, target_object_id);
CREATE INDEX IF NOT EXISTS idx_provenance_source ON provenance_records(source_object_type, source_object_id);
CREATE INDEX IF NOT EXISTS idx_saved_queries_created_by ON saved_queries(created_by_principal_id);
