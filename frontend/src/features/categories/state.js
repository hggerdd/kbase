export function buildCategoryTree(categories) {
  const nodesByKey = new Map(categories.map((category) => [category.key, { ...category, children: [] }]));
  const roots = [];

  for (const node of nodesByKey.values()) {
    const parent = node.parent_key ? nodesByKey.get(node.parent_key) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortNodes(nodes) {
    nodes.sort((left, right) => (left.full_path || left.key).localeCompare(right.full_path || right.key));
    nodes.forEach((node) => sortNodes(node.children));
  }

  sortNodes(roots);
  return roots;
}

export function collectCategoryKeys(nodes) {
  return nodes.flatMap((node) => [node.key, ...collectCategoryKeys(node.children)]);
}

export function collectCategoryAncestors(categoryKey, categories) {
  const categoriesByKey = new Map(categories.map((category) => [category.key, category]));
  const ancestors = [];
  let current = categoriesByKey.get(categoryKey) ?? null;

  while (current?.parent_key) {
    ancestors.push(current.parent_key);
    current = categoriesByKey.get(current.parent_key) ?? null;
  }

  return ancestors;
}
