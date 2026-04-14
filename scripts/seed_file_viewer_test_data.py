from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from kbase.application.capabilities.import_file_as_item import import_file_as_item
from kbase.application.capabilities.replace_content_part import replace_content_part
from kbase.application.capabilities.search_content import search_content
from kbase.application.dto.capabilities import (
    CreateFileItemInput,
    ReplaceContentPartInput,
    SearchContentInput,
)
from kbase.core.rules.modelling_rules import FILE_ITEM_KINDS
from kbase.core.value_objects.actor import ActorContext
from kbase.core.value_objects.provenance import ProvenanceInput


def actor() -> ActorContext:
    return ActorContext(principal_id="heiko")


def provenance(method_key: str) -> ProvenanceInput:
    return ProvenanceInput(method_key=method_key, data_class="canonical")


SEED_ITEMS = [
    {
        "title": "File Viewer Seed Salary January 2025",
        "item_kind": "document",
        "category_key": "income_document",
        "filename": "salary_january_2025.txt",
        "labels": ["test", "year/2025", "finance/income", "income/salary"],
        "metadata": {"issuer": "Acme Payroll", "document_date": "2025-01-31", "description": "Monthly salary statement"},
        "body": "# Salary January 2025\n\nNet salary statement for January 2025.\n\n- Employer: Acme Payroll\n- Status: booked",
    },
    {
        "title": "File Viewer Seed Salary February 2026",
        "item_kind": "document",
        "category_key": "income_document",
        "filename": "salary_february_2026.txt",
        "labels": ["test", "year/2026", "finance/income", "income/salary"],
        "metadata": {"issuer": "Acme Payroll", "document_date": "2026-02-28", "description": "Monthly salary statement"},
        "body": "# Salary February 2026\n\nIncome document for February 2026.\n\n- Employer: Acme Payroll\n- Notes: year-over-year comparison ready",
    },
    {
        "title": "File Viewer Seed Annual Bonus 2025",
        "item_kind": "document",
        "category_key": "income_document",
        "filename": "annual_bonus_2025.txt",
        "labels": ["test", "year/2025", "finance/income", "income/bonus"],
        "metadata": {"issuer": "Acme Payroll", "document_date": "2025-12-15", "description": "Annual bonus letter"},
        "body": "# Annual Bonus 2025\n\nBonus confirmation for fiscal year 2025.\n\n- Type: bonus\n- Category: income",
    },
    {
        "title": "File Viewer Seed Tax Refund Notice 2026",
        "item_kind": "document",
        "category_key": "invoice",
        "filename": "tax_refund_notice_2026.txt",
        "labels": ["test", "year/2026", "finance/income", "income/refund"],
        "metadata": {"issuer": "Tax Office", "document_date": "2026-05-08", "description": "Refund notice"},
        "body": "# Tax Refund Notice 2026\n\nRefund decision for tax year 2025.\n\n- Agency: Tax Office\n- Action: archive and review",
    },
    {
        "title": "File Viewer Seed Bank Statement Q1 2025",
        "item_kind": "document",
        "category_key": "bank_statement",
        "filename": "bank_statement_q1_2025.txt",
        "labels": ["test", "year/2025", "finance/income", "bank/statement"],
        "metadata": {"bank_name": "Example Bank", "statement_period_start": "2025-01-01", "statement_period_end": "2025-03-31"},
        "body": "# Bank Statement Q1 2025\n\nQuarterly statement covering incoming salary and refunds.\n\n- Bank: Example Bank",
    },
    {
        "title": "File Viewer Seed Offer Side Project 2026",
        "item_kind": "document",
        "category_key": "offer",
        "filename": "offer_side_project_2026.txt",
        "labels": ["test", "year/2026", "finance/income", "offers/freelance"],
        "metadata": {"vendor": "Client North", "valid_until": "2026-07-31", "description": "Freelance offer"},
        "body": "# Offer Side Project 2026\n\nOffer for freelance work.\n\n- Vendor: Client North\n- Priority: medium",
    },
    {
        "title": "File Viewer Seed Receipt Scan 2025",
        "item_kind": "image",
        "category_key": "scan",
        "filename": "receipt_scan_2025.png",
        "labels": ["test", "year/2025", "finance/income", "scan/raw"],
        "metadata": {"description": "Scanned income-related receipt"},
        "body": "# Receipt Scan 2025\n\nScanned attachment related to an income reimbursement.\n\n- Format: PNG scan",
    },
    {
        "title": "File Viewer Seed Dashboard Screenshot 2026",
        "item_kind": "image",
        "category_key": "screenshot",
        "filename": "dashboard_screenshot_2026.png",
        "labels": ["test", "year/2026", "finance/income", "review/screenshots"],
        "metadata": {"description": "Screenshot of yearly income dashboard"},
        "body": "# Dashboard Screenshot 2026\n\nScreenshot of an internal dashboard showing income trends.\n\n- Use: reference",
    },
    {
        "title": "File Viewer Seed Comparison 2025",
        "item_kind": "spreadsheet",
        "category_key": "comparison_table",
        "filename": "income_comparison_2025.csv",
        "labels": ["test", "year/2025", "finance/income", "analysis/comparison"],
        "metadata": {"description": "Comparison table for income sources"},
        "body": "# Income Comparison 2025\n\nSpreadsheet summary comparing multiple income streams.\n\n- View: yearly comparison",
    },
    {
        "title": "File Viewer Seed Income Table 2026",
        "item_kind": "spreadsheet",
        "category_key": "data_table",
        "filename": "income_table_2026.csv",
        "labels": ["test", "year/2026", "finance/income", "analysis/table"],
        "metadata": {"description": "Raw tabular income data"},
        "body": "# Income Table 2026\n\nRaw data table for income planning.\n\n- View: monthly entries\n- State: active",
    },
]


def main() -> None:
    existing = search_content(
        SearchContentInput(
            query="File Viewer Seed",
            item_kinds=list(FILE_ITEM_KINDS),
            actor=actor(),
            limit=200,
        )
    )
    existing_titles = {item.title for item in existing.items}

    created = 0
    skipped = 0

    for seed in SEED_ITEMS:
        if seed["title"] in existing_titles:
            skipped += 1
            continue

        payload_bytes = seed["body"].encode("utf-8")
        detail = import_file_as_item(
            CreateFileItemInput(
                title=seed["title"],
                item_kind=seed["item_kind"],
                category_key=seed["category_key"],
                original_filename=seed["filename"],
                file_bytes=payload_bytes,
                mime_type="text/plain" if seed["filename"].endswith(".txt") else "text/csv" if seed["filename"].endswith(".csv") else "image/png",
                size_bytes=len(payload_bytes),
                label_paths=seed["labels"],
                metadata=seed["metadata"],
                actor=actor(),
                provenance=provenance("script.seed_file_viewer.import"),
            )
        )
        replace_content_part(
            ReplaceContentPartInput(
                item_id=detail.item.id,
                content_text=seed["body"],
                actor=actor(),
                provenance=provenance("script.seed_file_viewer.summary"),
            )
        )
        created += 1

    print(f"Created {created} file-viewer seed items, skipped {skipped} existing items.")


if __name__ == "__main__":
    main()
