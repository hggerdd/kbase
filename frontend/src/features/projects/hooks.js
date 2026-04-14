import { useEffect, useMemo, useState } from "react";
import {
  addProjectItem,
  createProject,
  createProjectNote,
  fetchProject,
  fetchProjects,
  searchProjectCandidates,
  uploadFileToProject,
} from "./api.js";
import { isFileKind } from "./state.js";

const initialDraft = {
  title: "",
  category_key: "project_general",
  description: "",
  status: "active",
};

const initialNoteDraft = {
  title: "",
  category_key: "research",
  markdown_body: "",
};

const initialUploadDraft = {
  title: "",
  item_kind: "document",
  category_key: "",
  status: "",
};

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getMetadataValue(metadata, fieldKey) {
  return metadata.find((entry) => entry.field_key === fieldKey)?.value ?? null;
}

function itemMatchesQuery(item, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    item.title,
    item.category_key,
    item.status,
    item.item_kind,
    item.match_reason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function useProjectsWorkspace() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [projectItems, setProjectItems] = useState([]);
  const [search, setSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [draft, setDraft] = useState(initialDraft);
  const [noteDraft, setNoteDraft] = useState(initialNoteDraft);
  const [uploadDraft, setUploadDraft] = useState(initialUploadDraft);
  const [uploadFile, setUploadFile] = useState(null);
  const [candidateQuery, setCandidateQuery] = useState("");
  const [candidateResults, setCandidateResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectLoading, setProjectLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const items = await fetchProjects();
      setProjects(items);
      setSelectedId((current) => {
        if (!items.length) {
          return null;
        }
        if (current && items.some((item) => item.id === current)) {
          return current;
        }
        return items[0].id;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProject(projectId) {
    if (!projectId) {
      setProjectDetail(null);
      setProjectItems([]);
      setProjectLoading(false);
      return;
    }

    setProjectLoading(true);
    setError("");
    try {
      const payload = await fetchProject(projectId);
      setProjectDetail(payload.detail);
      setProjectItems(payload.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setProjectLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    void loadProject(selectedId);
  }, [selectedId]);

  const filteredProjects = useMemo(() => {
    const query = normalizeText(search);
    return projects.filter((project) => {
      if (statusFilter !== "all" && (project.status ?? "active") !== statusFilter) {
        return false;
      }
      return itemMatchesQuery(project, query);
    });
  }, [projects, search, statusFilter]);

  const filteredItems = useMemo(() => {
    const query = normalizeText(itemSearch);
    return projectItems.filter((item) => {
      if (kindFilter !== "all" && item.item_kind !== kindFilter) {
        return false;
      }
      return itemMatchesQuery(item, query);
    });
  }, [kindFilter, itemSearch, projectItems]);

  const projectMetrics = useMemo(() => {
    const counts = projectItems.reduce((accumulator, item) => {
      accumulator[item.item_kind] = (accumulator[item.item_kind] ?? 0) + 1;
      return accumulator;
    }, {});

    return {
      description: getMetadataValue(projectDetail?.metadata ?? [], "description"),
      totalItems: projectItems.length,
      noteCount: counts.note ?? 0,
      fileCount: (counts.document ?? 0) + (counts.image ?? 0) + (counts.spreadsheet ?? 0),
      kinds: counts,
    };
  }, [projectDetail, projectItems]);

  const availableKinds = useMemo(() => {
    return Object.keys(projectMetrics.kinds).sort((left, right) => left.localeCompare(right));
  }, [projectMetrics.kinds]);

  const notes = useMemo(() => projectItems.filter((item) => item.item_kind === "note"), [projectItems]);
  const files = useMemo(() => projectItems.filter((item) => isFileKind(item.item_kind)), [projectItems]);

  async function handleCreateProject(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const created = await createProject({
        title: draft.title,
        category_key: draft.category_key,
        description: draft.description || null,
        status: draft.status || null,
      });
      setDraft(initialDraft);
      setNotice("Project created");
      await loadProjects();
      setSelectedId(created.id);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function refreshActiveProject(projectId = selectedId) {
    await loadProjects();
    await loadProject(projectId);
  }

  async function handleCandidateSearch(event) {
    event.preventDefault();
    if (!candidateQuery.trim()) {
      setCandidateResults([]);
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      const results = await searchProjectCandidates(candidateQuery.trim());
      setCandidateResults(results.filter((item) => item.id !== selectedId));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddItemToProject(itemId) {
    if (!selectedId || !itemId) {
      return;
    }

    setActionLoading(true);
    setError("");
    setNotice("");
    try {
      await addProjectItem(selectedId, itemId);
      setNotice("Item linked to project");
      await loadProject(selectedId);
      setCandidateResults((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateProjectNote(event) {
    event.preventDefault();
    if (!selectedId) {
      return false;
    }

    setActionLoading(true);
    setError("");
    setNotice("");
    try {
      await createProjectNote({
        title: noteDraft.title,
        category_key: noteDraft.category_key,
        markdown_body: noteDraft.markdown_body,
        project_ids: [selectedId],
      });
      setNoteDraft(initialNoteDraft);
      setNotice("Note created in project");
      await refreshActiveProject(selectedId);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleProjectUpload(event) {
    event.preventDefault();
    if (!selectedId || !uploadFile) {
      return false;
    }

    setUploading(true);
    setUploadProgress({
      bytesPerSecond: null,
      etaSeconds: null,
      loaded: 0,
      percent: 0,
      total: uploadFile.size ?? null,
    });
    setError("");
    setNotice("");
    try {
      await uploadFileToProject(selectedId, uploadFile, {
        ...uploadDraft,
        onProgress: setUploadProgress,
      });
      setUploadDraft(initialUploadDraft);
      setUploadFile(null);
      setNotice("File uploaded into project");
      await refreshActiveProject(selectedId);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setUploadProgress(null);
      setUploading(false);
    }
  }

  return {
    actionLoading,
    availableKinds,
    candidateQuery,
    candidateResults,
    draft,
    error,
    filteredItems,
    filteredProjects,
    files,
    handleAddItemToProject,
    handleCandidateSearch,
    handleCreateProject,
    handleCreateProjectNote,
    handleProjectUpload,
    itemSearch,
    kindFilter,
    loading,
    noteDraft,
    notes,
    notice,
    projectDetail,
    projectItems,
    projectLoading,
    projectMetrics,
    projects,
    saving,
    search,
    selectedId,
    setCandidateQuery,
    setDraft,
    setItemSearch,
    setKindFilter,
    setNoteDraft,
    setSearch,
    setSelectedId,
    setStatusFilter,
    setUploadDraft,
    setUploadFile,
    statusFilter,
    uploadDraft,
    uploadFile,
    uploading,
    uploadProgress,
  };
}
