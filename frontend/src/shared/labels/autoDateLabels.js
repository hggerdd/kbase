import { createLabel, fetchLabels, reactivateLabel } from "../../features/labels/api.js";

function uniqueLabelPaths(labelPaths) {
  return [...new Set((labelPaths ?? []).map((entry) => String(entry).trim()).filter(Boolean))];
}

export function buildAutoDateLabelParts(date = new Date()) {
  const year = String(date.getFullYear());
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
  return ["Date", year, month];
}

export function buildAutoDateLabelPath(date = new Date()) {
  return buildAutoDateLabelParts(date).join("/");
}

export async function ensureAutoDateLabelPath(date = new Date()) {
  const parts = buildAutoDateLabelParts(date);
  let labels = await fetchLabels({ includeInactive: true, limit: 500 });
  let parentId = null;
  let fullPath = "";

  for (const part of parts) {
    fullPath = fullPath ? `${fullPath}/${part}` : part;
    let existing = labels.find((label) => label.full_path === fullPath) ?? null;

    if (existing && !existing.is_active) {
      await reactivateLabel(existing.id);
      existing = { ...existing, is_active: true };
    }

    if (!existing) {
      const created = await createLabel({
        name: part,
        parent_id: parentId,
        description: null,
      });
      existing = created?.id
        ? created
        : null;
      if (!existing) {
        labels = await fetchLabels({ includeInactive: true, limit: 500 });
        existing = labels.find((label) => label.full_path === fullPath) ?? null;
      } else {
        labels = [...labels, existing];
      }
    }

    if (!existing?.id) {
      throw new Error(`Could not create auto label path '${fullPath}'`);
    }

    parentId = existing.id;
  }

  return fullPath;
}

export async function appendAutoDateLabelPaths(labelPaths, date = new Date()) {
  const autoDateLabelPath = await ensureAutoDateLabelPath(date);
  return uniqueLabelPaths([...labelPaths, autoDateLabelPath]);
}
