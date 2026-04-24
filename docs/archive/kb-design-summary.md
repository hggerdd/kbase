# Personal Knowledge Base -- Final Design (Summary)

Status: historical design summary. It describes the broad product model, not the
complete current implementation. Prefer `README.md`, `DATA_MAP.md`, and
`todo.md` for current state and open work.

## Core Principles

-   Content-centric system with minimal base elements
-   Separation of technical type and semantic classification
-   ULID as global identifier (DB + filesystem)
-   No domain-specific tables (no hardcoded business logic)
-   Extend via metadata, labels, links, and relations

------------------------------------------------------------------------

## Core Entities

### Items

-   Central object representing notes, documents, images, tasks, events
-   `item_kind`: note, document, image, spreadsheet, task, event
-   `category_key`: semantic meaning (e.g. research, invoice)

### Content Parts

-   Markdown, extracted text, summaries

### Files

-   Stored in filesystem, linked via `item_files`

------------------------------------------------------------------------

## Metadata System

-   Flexible metadata via:
    -   `metadata_groups`
    -   `metadata_fields`
    -   `item_metadata`
-   Typed values (number, date, text, json)

------------------------------------------------------------------------

## Relationships

-   `item_links` for connections (research → decision, task → note)
-   Typed links (related, review_for, derived_from)

------------------------------------------------------------------------

## Labels

-   Hierarchical (`finance/income`, `household/appliances`)
-   Used for navigation, not permissions

------------------------------------------------------------------------

## Multiuser Model (Principals)

-   Persons + Groups (heiko, wife, son, pair, family)
-   `item_acl` for permissions (view/edit/manage)
-   `item_subjects` for semantic relation (concerns, owned_by)

------------------------------------------------------------------------

## Tasks & Events

### Tasks

-   `item_kind = task`
-   `item_states` (open, done, cancelled)
-   `datetime_properties` (due_at)
-   `recurrence_rules`

### Events

-   `item_kind = event`
-   `start_at`, `end_at`
-   notifications

------------------------------------------------------------------------

## Recurrence & Notifications

-   `recurrence_rules` (RRULE-based)
-   `item_occurrences` (instances)
-   `notifications` (relative/absolute triggers)

------------------------------------------------------------------------

## Observations (Time Series)

### Observation Series

-   Defines metric (weight, sleep, balance)
-   Linked to principal

### Observations

-   timestamp + value
-   NOT stored as notes

Use cases: - weight tracking - finance tracking - health tracking

------------------------------------------------------------------------

## File System Structure

    kb/
      inbox/
        raw/
        processing/
        rejected/
      workspaces/
        projects/
        reviews/
      items/
        notes/
        documents/
        images/
        spreadsheets/

### File Naming

    <prefix>_<ulid>_<slug>.<ext>

------------------------------------------------------------------------

## Key Use Cases

### Knowledge

-   Notes, research, decisions

### Documents

-   income, bank, offers, contracts

### Family / Multiuser

-   personal vs shared vs child-related

### Tasks / Events

-   deadlines, recurring reviews

### Time Series

-   weight, health, finances

------------------------------------------------------------------------

## Final Architecture

### 3 Core Dimensions

1.  Knowledge (notes, documents)
2.  Action (tasks, events)
3.  State/Time (observations, states)

------------------------------------------------------------------------

## Conclusion

This system forms a: - scalable personal data OS - structured knowledge
base - agent-friendly data layer - extensible without schema redesign

Generated: 2026-04-12T18:56:22.875058 UTC
