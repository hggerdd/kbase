export const FILE_ITEM_KINDS = ["document", "image", "spreadsheet", "summary"];

export const FILE_TREE_LAYOUTS = [
  { id: "category-label-file", label: "Category > Label > File" },
  { id: "label-category-file", label: "Label > Category > File" },
  { id: "category-file", label: "Category > File" },
];

export function getPrimaryFilename(detail) {
  const primaryFile = detail.files?.[0];
  return primaryFile?.original_filename ?? primaryFile?.relative_path ?? detail.item.title;
}

export function getSummaryMarkdown(detail) {
  if (detail.primary_content_part?.content_text) {
    return detail.primary_content_part.content_text;
  }

  const summaryPart = detail.content_parts?.find((part) => part.part_kind === "summary" && part.content_text);
  if (summaryPart) {
    return summaryPart.content_text;
  }

  return "";
}

export function getItemLabels(detail) {
  return (detail.labels ?? []).map((label) => label.full_path);
}

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function labelMatchesFilter(labelPath, filterPath) {
  const normalizedLabel = normalizeValue(labelPath);
  const normalizedFilter = normalizeValue(filterPath);
  return normalizedLabel === normalizedFilter || normalizedLabel.startsWith(`${normalizedFilter}/`);
}

export function itemMatchesFileFilters(detail, filters) {
  const query = normalizeValue(filters.query);
  const categoryPrefix = normalizeValue(filters.categoryPrefix);
  const labels = filters.selectedLabels ?? [];
  const filename = normalizeValue(getPrimaryFilename(detail));
  const title = normalizeValue(detail.item.title);
  const categoryKey = normalizeValue(detail.item.category_key);
  const summary = normalizeValue(getSummaryMarkdown(detail));
  const itemLabels = getItemLabels(detail).map(normalizeValue);

  if (query) {
    const haystack = [filename, title, categoryKey, summary, ...itemLabels].join(" ");
    if (!haystack.includes(query)) {
      return false;
    }
  }

  if (categoryPrefix && !categoryKey.startsWith(categoryPrefix)) {
    return false;
  }

  if (labels.length > 0 && !labels.every((label) => itemLabels.some((itemLabel) => labelMatchesFilter(itemLabel, label)))) {
    return false;
  }

  return true;
}

function buildFileLeaf(detail) {
  const primaryFile = detail.files?.[0];
  const originalFilename = getPrimaryFilename(detail);
  return {
    id: `file:${detail.item.id}`,
    type: "file",
    label: originalFilename,
    itemId: detail.item.id,
    itemKind: detail.item.item_kind ?? null,
    filename: originalFilename,
    mimeType: primaryFile?.mime_type ?? null,
  };
}

function addGroup(map, id, label) {
  if (!map.has(id)) {
    map.set(id, {
      id,
      type: "group",
      label,
      children: [],
    });
  }
  return map.get(id);
}

function appendLeaf(group, leaf) {
  group.children.push(leaf);
}

function ensureNestedGroup(root, segments, prefixId) {
  let currentGroup = root;
  let path = prefixId;
  for (const segment of segments) {
    path = `${path}/${segment}`;
    let nextGroup = currentGroup.children.find((child) => child.type === "group" && child.id === path);
    if (!nextGroup) {
      nextGroup = { id: path, type: "group", label: segment, children: [] };
      currentGroup.children.push(nextGroup);
    }
    currentGroup = nextGroup;
  }
  return currentGroup;
}

function getCategorySegments(categoryKey) {
  if (!categoryKey) {
    return ["uncategorized"];
  }

  return [categoryKey];
}

export function buildFileTree(details, { treeLayout, selectedLabels = [], categoryPrefix = "" }) {
  const rootMap = new Map();

  for (const detail of details) {
    const fileLeaf = buildFileLeaf(detail);
    const categoryKey = detail.item.category_key ?? "uncategorized";
    const categorySegments = getCategorySegments(categoryKey);
    const itemLabels = getItemLabels(detail);
    const displayLabels =
      selectedLabels.length > 0
        ? itemLabels.filter((label) => selectedLabels.some((selectedLabel) => labelMatchesFilter(label, selectedLabel)))
        : itemLabels;
    const labelSegments = displayLabels.length > 0 ? displayLabels : ["unlabeled"];

    if (treeLayout === "category-file") {
      const categoryRootId = `category:${categoryKey}`;
      const categoryRoot = addGroup(rootMap, categoryRootId, categorySegments[0] ?? categoryKey);
      const categoryParent =
        categorySegments.length > 1 ? ensureNestedGroup(categoryRoot, categorySegments.slice(1), categoryRootId) : categoryRoot;
      appendLeaf(categoryParent, fileLeaf);
      continue;
    }

    if (treeLayout === "label-category-file") {
      for (const labelPath of labelSegments) {
        const labelRoot = addGroup(rootMap, `label:${labelPath}`, labelPath);
        const categoryNode = ensureNestedGroup(labelRoot, categorySegments, `label:${labelPath}/category`);
        appendLeaf(categoryNode, fileLeaf);
      }
      continue;
    }

    const categoryRootId = `category:${categoryKey}`;
    const categoryRoot = addGroup(rootMap, categoryRootId, categorySegments[0] ?? categoryKey);
    const categoryParent =
      categorySegments.length > 1 ? ensureNestedGroup(categoryRoot, categorySegments.slice(1), categoryRootId) : categoryRoot;
    for (const labelPath of labelSegments) {
      let labelNode = categoryParent.children.find((child) => child.type === "group" && child.id === `category:${categoryKey}/label:${labelPath}`);
      if (!labelNode) {
        labelNode = {
          id: `category:${categoryKey}/label:${labelPath}`,
          type: "group",
          label: labelPath,
          children: [],
        };
        categoryParent.children.push(labelNode);
      }
      appendLeaf(labelNode, fileLeaf);
    }
  }

  function sortNodes(nodes) {
    return nodes
      .map((node) =>
        node.type === "group"
          ? { ...node, children: sortNodes(node.children) }
          : node,
      )
      .sort((left, right) => {
        if (left.type !== right.type) {
          return left.type === "group" ? -1 : 1;
        }
        return left.label.localeCompare(right.label);
      });
  }

  return sortNodes([...rootMap.values()]);
}
