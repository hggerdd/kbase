-- =========================================================
-- REFERENCE DATA
-- =========================================================

INSERT OR IGNORE INTO item_kinds (key, label, description) VALUES
('note', 'Note', 'Human-readable knowledge item'),
('document', 'Document', 'Document-like source item'),
('image', 'Image', 'Image or scan item'),
('spreadsheet', 'Spreadsheet', 'Tabular data source item'),
('summary', 'Summary', 'Derived or standalone summary item'),
('task', 'Task', 'Actionable item planned for later phase'),
('event', 'Event', 'Scheduled item planned for later phase'),
('project', 'Project', 'Context or container item');

INSERT OR IGNORE INTO item_categories (key, label, description, applies_to_kind) VALUES
('research', 'Research', 'Research note or investigation', 'note'),
('decision', 'Decision', 'Decision note', 'note'),
('learning', 'Learning', 'Learning note', 'note'),
('reference', 'Reference', 'Reference note', 'note'),
('process', 'Process', 'Process or how-to note', 'note'),
('comparison_note', 'Comparison Note', 'Comparison-oriented note', 'note'),
('income_document', 'Income Document', 'Income-related document', 'document'),
('invoice', 'Invoice', 'Invoice or bill', 'document'),
('offer', 'Offer', 'Offer or quotation', 'document'),
('bank_statement', 'Bank Statement', 'Bank statement or account extract', 'document'),
('insurance_document', 'Insurance Document', 'Insurance-related document', 'document'),
('school_document', 'School Document', 'School-related document', 'document'),
('medical_document', 'Medical Document', 'Medical document', 'document'),
('product_document', 'Product Document', 'Manual or specification', 'document'),
('contract_document', 'Contract Document', 'Contract or agreement', 'document'),
('scan', 'Scan', 'Scanned image', 'image'),
('screenshot', 'Screenshot', 'Screenshot image', 'image'),
('photo', 'Photo', 'Regular photo', 'image'),
('product_reference', 'Product Reference', 'Reference image', 'image'),
('comparison_table', 'Comparison Table', 'Comparison spreadsheet', 'spreadsheet'),
('data_table', 'Data Table', 'General data spreadsheet', 'spreadsheet'),
('task_general', 'General Task', 'General actionable task', 'task'),
('review_task', 'Review Task', 'Task for reviewing something', 'task'),
('household_task', 'Household Task', 'Task related to household', 'task'),
('admin_task', 'Admin Task', 'Administrative task', 'task'),
('appointment', 'Appointment', 'Scheduled appointment', 'event'),
('deadline_event', 'Deadline Event', 'Deadline represented as event', 'event'),
('family_event', 'Family Event', 'Family-related event', 'event'),
('school_event', 'School Event', 'School-related event', 'event'),
('project_general', 'Project', 'General project context', 'project'),
('case_context', 'Case Context', 'Case or process context', 'project'),
('topic_space', 'Topic Space', 'Topic-based workspace', 'project'),
('life_area', 'Life Area', 'Long-lived life area context', 'project');

INSERT OR IGNORE INTO content_part_kinds (key, label, description) VALUES
('markdown_body', 'Markdown Body', 'Primary markdown body'),
('text_chunk', 'Text Chunk', 'Chunked text'),
('ocr_text', 'OCR Text', 'OCR extracted text'),
('summary', 'Summary', 'Generated or manual summary'),
('caption', 'Caption', 'Caption or image description'),
('keywords', 'Keywords', 'Keyword list');

INSERT OR IGNORE INTO asset_kinds (key, label, description) VALUES
('source_file', 'Source File', 'Original uploaded or imported file'),
('preview_image', 'Preview Image', 'Rendered preview asset'),
('derived_file', 'Derived File', 'Derived or transformed file'),
('thumbnail', 'Thumbnail', 'Thumbnail image'),
('ocr_output', 'OCR Output', 'OCR-derived output');

INSERT OR IGNORE INTO link_types (key, label, description, symmetric) VALUES
('related', 'Related', 'General relation between items', 1),
('references', 'References', 'Item references another item', 0),
('attachment', 'Attachment', 'Supporting attachment relation', 0),
('summary_of', 'Summary Of', 'This item summarizes another item', 0),
('source_of', 'Source Of', 'This item is source for another item', 0),
('includes', 'Includes', 'Container includes another item', 0),
('decision_for', 'Decision For', 'Decision belongs to another item', 0),
('review_for', 'Review For', 'Task or event reviews another item', 0),
('duplicate_of', 'Duplicate Of', 'Potential duplicate relation', 1),
('derived_from', 'Derived From', 'Generated or extracted from another item', 0);

INSERT OR IGNORE INTO permissions (key, label, description) VALUES
('view', 'View', 'Can view item'),
('edit', 'Edit', 'Can edit item'),
('manage', 'Manage', 'Can manage permissions and metadata');

INSERT OR IGNORE INTO subject_relation_types (key, label, description) VALUES
('concerns', 'Concerns', 'The item concerns this principal'),
('owned_by', 'Owned By', 'The item is owned by this principal'),
('managed_for', 'Managed For', 'The item is managed on behalf of this principal'),
('about', 'About', 'The item is about this principal');

INSERT OR IGNORE INTO principals (id, principal_type, name, slug, is_active, created_at, updated_at) VALUES
('heiko', 'person', 'Heiko', 'heiko', 1, '2026-04-12T00:00:00+00:00', '2026-04-12T00:00:00+00:00'),
('wife', 'person', 'Wife', 'wife', 1, '2026-04-12T00:00:00+00:00', '2026-04-12T00:00:00+00:00'),
('son', 'person', 'Son', 'son', 1, '2026-04-12T00:00:00+00:00', '2026-04-12T00:00:00+00:00'),
('pair', 'group', 'Pair', 'pair', 1, '2026-04-12T00:00:00+00:00', '2026-04-12T00:00:00+00:00'),
('family', 'group', 'Family', 'family', 1, '2026-04-12T00:00:00+00:00', '2026-04-12T00:00:00+00:00'),
('parents_of_son', 'group', 'Parents Of Son', 'parents_of_son', 1, '2026-04-12T00:00:00+00:00', '2026-04-12T00:00:00+00:00');

INSERT OR IGNORE INTO principal_memberships (principal_id, member_principal_id, role, created_at) VALUES
('pair', 'heiko', NULL, '2026-04-12T00:00:00+00:00'),
('pair', 'wife', NULL, '2026-04-12T00:00:00+00:00'),
('family', 'heiko', NULL, '2026-04-12T00:00:00+00:00'),
('family', 'wife', NULL, '2026-04-12T00:00:00+00:00'),
('family', 'son', NULL, '2026-04-12T00:00:00+00:00'),
('parents_of_son', 'heiko', NULL, '2026-04-12T00:00:00+00:00'),
('parents_of_son', 'wife', NULL, '2026-04-12T00:00:00+00:00');

INSERT OR IGNORE INTO metadata_groups (key, label, description, applies_to_kind) VALUES
('general', 'General', 'General item and document metadata', NULL),
('classification', 'Classification', 'Classification and state metadata', NULL),
('document_details', 'Document Details', 'Document-specific metadata', 'document'),
('review', 'Review', 'Review-related metadata', NULL),
('research', 'Research', 'Research and decision metadata', 'note'),
('finance_income', 'Finance Income', 'Income document metadata', 'document'),
('finance_bank_statement', 'Finance Bank Statement', 'Bank statement metadata', 'document'),
('offers', 'Offers', 'Offer document metadata', 'document'),
('task_details', 'Task Details', 'Task-specific metadata', 'task'),
('event_details', 'Event Details', 'Event-specific metadata', 'event'),
('project_details', 'Project Details', 'Project and context metadata', 'project');

INSERT OR IGNORE INTO metadata_fields (key, label, description, value_type, applies_to_kind, is_multivalue, is_system) VALUES
('document_date', 'Document Date', 'Date of the document', 'date', 'document', 0, 0),
('issuer', 'Issuer', 'Issuer of the document', 'string', 'document', 0, 0),
('recipient', 'Recipient', 'Recipient of the document', 'string', 'document', 0, 0),
('is_scanned', 'Is Scanned', 'Whether content is scanned', 'boolean', NULL, 0, 0),
('ocr_status', 'OCR Status', 'OCR processing status', 'string', NULL, 0, 0),
('summary_status', 'Summary Status', 'Summary generation status', 'string', NULL, 0, 0),
('reviewed_by_user', 'Reviewed By User', 'Whether a user reviewed the content', 'boolean', NULL, 0, 0),
('language_override', 'Language Override', 'Manually overridden language', 'string', NULL, 0, 0),
('description', 'Description', 'Short description', 'string', NULL, 0, 0),
('research_subject', 'Research Subject', 'Subject of research', 'string', 'note', 0, 0),
('decision_stage', 'Decision Stage', 'Stage of a decision', 'string', 'note', 0, 0),
('budget_max', 'Budget Max', 'Maximum budget', 'number', 'note', 0, 0),
('selected_option', 'Selected Option', 'Selected option', 'string', 'note', 0, 0),
('comparison_exists', 'Comparison Exists', 'Whether a comparison exists', 'boolean', 'note', 0, 0),
('gross_amount', 'Gross Amount', 'Gross amount', 'number', 'document', 0, 0),
('net_amount', 'Net Amount', 'Net amount', 'number', 'document', 0, 0),
('currency', 'Currency', 'Currency code', 'string', NULL, 0, 0),
('payment_date', 'Payment Date', 'Payment date', 'date', 'document', 0, 0),
('period_start', 'Period Start', 'Period start', 'date', NULL, 0, 0),
('period_end', 'Period End', 'Period end', 'date', NULL, 0, 0),
('bank_name', 'Bank Name', 'Bank name', 'string', 'document', 0, 0),
('account_reference', 'Account Reference', 'Bank account reference', 'string', 'document', 0, 0),
('statement_period_start', 'Statement Period Start', 'Statement period start', 'date', 'document', 0, 0),
('statement_period_end', 'Statement Period End', 'Statement period end', 'date', 'document', 0, 0),
('vendor', 'Vendor', 'Vendor or supplier', 'string', 'document', 0, 0),
('offer_number', 'Offer Number', 'Offer number', 'string', 'document', 0, 0),
('valid_until', 'Valid Until', 'Offer validity date', 'date', 'document', 0, 0),
('total_amount', 'Total Amount', 'Total amount', 'number', 'document', 0, 0),
('priority', 'Priority', 'Priority level', 'string', NULL, 0, 0),
('estimated_effort_minutes', 'Estimated Effort Minutes', 'Estimated effort in minutes', 'integer', NULL, 0, 0),
('is_blocked', 'Is Blocked', 'Whether the item is blocked', 'boolean', NULL, 0, 0),
('blocking_note', 'Blocking Note', 'Reason for blocking', 'string', NULL, 0, 0),
('all_day', 'All Day', 'Whether event lasts all day', 'boolean', 'event', 0, 0),
('location', 'Location', 'Location of an event or note', 'string', NULL, 0, 0),
('attendee_notes', 'Attendee Notes', 'Notes about attendees', 'string', 'event', 0, 0),
('period_label', 'Period Label', 'Human-readable time period label', 'string', 'project', 0, 0);

INSERT OR IGNORE INTO group_fields (group_key, field_key, is_required, order_no) VALUES
('general', 'description', 0, 10),
('general', 'language_override', 0, 20),
('general', 'reviewed_by_user', 0, 30),
('document_details', 'document_date', 0, 10),
('document_details', 'issuer', 0, 20),
('document_details', 'recipient', 0, 30),
('document_details', 'is_scanned', 0, 40),
('document_details', 'ocr_status', 0, 50),
('research', 'research_subject', 0, 10),
('research', 'decision_stage', 0, 20),
('research', 'budget_max', 0, 30),
('research', 'selected_option', 0, 40),
('research', 'comparison_exists', 0, 50),
('finance_income', 'gross_amount', 0, 10),
('finance_income', 'net_amount', 0, 20),
('finance_income', 'currency', 0, 30),
('finance_income', 'payment_date', 0, 40),
('finance_bank_statement', 'bank_name', 0, 10),
('finance_bank_statement', 'account_reference', 0, 20),
('finance_bank_statement', 'statement_period_start', 0, 30),
('finance_bank_statement', 'statement_period_end', 0, 40),
('offers', 'vendor', 0, 10),
('offers', 'offer_number', 0, 20),
('offers', 'valid_until', 0, 30),
('offers', 'total_amount', 0, 40),
('task_details', 'priority', 0, 10),
('task_details', 'estimated_effort_minutes', 0, 20),
('task_details', 'is_blocked', 0, 30),
('task_details', 'blocking_note', 0, 40),
('event_details', 'all_day', 0, 10),
('event_details', 'location', 0, 20),
('event_details', 'attendee_notes', 0, 30),
('project_details', 'description', 0, 10),
('project_details', 'period_start', 0, 20),
('project_details', 'period_end', 0, 30),
('project_details', 'period_label', 0, 40);
