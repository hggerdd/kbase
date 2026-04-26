import { marked } from "marked";

const BLOCKED_TAGS = new Set([
  "base",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "math",
  "meta",
  "object",
  "script",
  "select",
  "style",
  "svg",
  "textarea",
]);

const URL_ATTRS = new Set(["href", "src", "xlink:href"]);

function isUnsafeUrl(value) {
  const normalized = String(value ?? "").trim().replace(/[\u0000-\u001f\s]+/g, "").toLowerCase();
  return normalized.startsWith("javascript:") || normalized.startsWith("data:text/html");
}

function sanitizeWithDomParser(html) {
  const parser = new DOMParser();
  const document = parser.parseFromString(String(html ?? ""), "text/html");

  for (const element of [...document.body.querySelectorAll("*")]) {
    const tagName = element.tagName.toLowerCase();
    if (BLOCKED_TAGS.has(tagName)) {
      element.remove();
      continue;
    }

    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" || name === "style") {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (URL_ATTRS.has(name) && isUnsafeUrl(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  return document.body.innerHTML;
}

function sanitizeWithFallback(html) {
  return String(html ?? "")
    .replace(/<\s*(script|style|iframe|object|embed|svg|math|form|textarea|select|input|link|meta|base)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|svg|math|form|textarea|select|input|link|meta|base)\b[^>]*\/?\s*>/gi, "")
    .replace(/\s+on[a-z0-9_-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(srcdoc|style)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src|xlink:href)\s*=\s*(["'])\s*(javascript:|data:text\/html)[\s\S]*?\2/gi, "");
}

export function sanitizeRichHtml(html) {
  if (typeof DOMParser !== "undefined") {
    return sanitizeWithDomParser(html);
  }
  return sanitizeWithFallback(html);
}

export async function renderMarkdownToSafeHtml(markdown) {
  const rendered = await Promise.resolve(marked.parse(String(markdown ?? "")));
  return sanitizeRichHtml(rendered);
}
