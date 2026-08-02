"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Languages,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const LANGUAGE_OPTIONS = [
  { code: "", label: "All languages" },
  { code: "gaa", label: "Ga" },
  { code: "tw", label: "Twi" },
  { code: "ee", label: "Ewe" },
  { code: "ha", label: "Hausa" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "APPROVED", label: "Approved" },
  { value: "DRAFT", label: "Draft" },
  { value: "REVIEW_REQUIRED", label: "Needs review" },
  { value: "REJECTED", label: "Rejected" },
];

const LANGUAGE_LABELS = {
  gaa: "Ga",
  tw: "Twi",
  ee: "Ewe",
  ha: "Hausa",
};

const STATUS_STYLES = {
  APPROVED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-amber-50 text-amber-700",
  REVIEW_REQUIRED: "bg-blue-50 text-blue-700",
  REJECTED: "bg-red-50 text-red-700",
};

function formatModuleName(value) {
  if (!value) return "General";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function AdminTranslationsPage() {
  const [entries, setEntries] = useState([]);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [moduleName, setModuleName] = useState("");
  const [section, setSection] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const [segmentOpen, setSegmentOpen] = useState(false);

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [sectionEditorOpen, setSectionEditorOpen] =
  useState(false);

  const fetchTranslations = useCallback(
    async (requestedPage = pagination.page) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(requestedPage),
          limit: String(pagination.limit),
        });

        if (search) params.set("search", search);
        if (moduleName) params.set("module", moduleName);
        if (section) params.set("section", section);
        if (language) params.set("language", language);
        if (status) params.set("status", status);

        const response = await fetch(
          `/api/admin/translations?${params.toString()}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load translations."
          );
        }

        setEntries(data.entries || []);
        setModules(data.modules || []);
        setSections(data.sections || []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: 30,
            total: 0,
            totalPages: 1,
          }
        );
      } catch (fetchError) {
        console.error(
          "Translation dashboard loading error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load translations."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      language,
      moduleName,
      pagination.limit,
      pagination.page,
      search,
      section,
      status,
    ]
  );

useEffect(() => {
  fetchTranslations(1);
}, [search, moduleName, section, language, status]);


  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const changeModule = (value) => {
  setModuleName(value);
  setSection("");
};

const clearFilters = () => {
  setSearchInput("");
  setSearch("");
  setModuleName("");
  setSection("");
  setLanguage("");
  setStatus("");
};

const hasFilters =
  Boolean(search) ||
  Boolean(moduleName) ||
  Boolean(section) ||
  Boolean(language) ||
  Boolean(status);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1700px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
          <div className="relative px-6 py-8 sm:px-8 lg:px-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-40 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Languages size={25} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                      Amoakay Language Centre
                    </p>

                    <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                      Translation Management
                    </h1>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  Manage approved terminology, review language
                  drafts, and prepare new translations for the
                  Amoakay Deals marketplace.
                </p>
              </div>

                <div className="flex flex-col gap-3 sm:flex-row">
  <button
    type="button"
    onClick={() => setSegmentOpen(true)}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-400"
  >
    <Plus size={18} />
    Create Segment
  </button>

  <button
    type="button"
    onClick={() => setCreateOpen(true)}
    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/15"
  >
    <Plus size={18} />
    New Translation
  </button>
</div>

            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardCard
            label="Translation entries"
            value={pagination.total}
          />

          <DashboardCard
            label="Modules"
            value={modules.length}
           />

          <DashboardCard
            label="Sections"
            value={sections.length}
          />

          <DashboardCard
            label="Languages"
            value="4"
          />

          <DashboardCard
            label="Current page"
            value={`${pagination.page}/${pagination.totalPages}`}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500" />

            <h2 className="font-black text-slate-900">
              Search and filters
            </h2>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.7fr_0.9fr_1fr_0.9fr_0.9fr_auto]">
            <form
              onSubmit={handleSearch}
              className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-emerald-500"
            >
              <Search
                size={18}
                className="ml-4 mt-3.5 shrink-0 text-slate-400"
              />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search key or English text..."
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
              />

              <button
                type="submit"
                className="bg-slate-950 px-5 text-sm font-bold text-white"
              >
                Search
              </button>
            </form>

            <select
              value={moduleName}
              onChange={(event) =>
              changeModule(event.target.value)
               }
             className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
             >
           <option value="">All modules</option>

           {modules.map((item) => (
          <option key={item} value={item}>
          {formatModuleName(item)}
          </option>
           ))}
          </select>

            <select
              value={section}
              onChange={(event) =>
                setSection(event.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="">All sections</option>

              {sections.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
            >
              {LANGUAGE_OPTIONS.map((item) => (
                <option
                  key={item.code || "all"}
                  value={item.code}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
            >
              {STATUS_OPTIONS.map((item) => (
                <option
                  key={item.value || "all"}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={17} />
              Clear
            </button>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Translation entries
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {pagination.total} entries found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
  <button
    type="button"
    onClick={() => setSectionEditorOpen(true)}
    disabled={!section || entries.length === 0}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
  >
    <Languages size={16} />
    Edit entire section
  </button>

  <button
    type="button"
    onClick={() =>
      fetchTranslations(pagination.page)
    }
    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
  >
    <RefreshCw size={16} />
    Refresh
  </button>
</div>

          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() =>
                fetchTranslations(pagination.page)
              }
            />
          ) : entries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <TranslationEntryRow
                    key={entry.id}
                    entry={entry}
                    onEdit={() => setSelectedEntry(entry)}
                />
              ))}
            </div>
          )}

          <Pagination
            pagination={pagination}
            loading={loading}
            onPageChange={fetchTranslations}
          />
        </section>
      </div>

{sectionEditorOpen && (
  <SectionTranslationModal
    entries={entries}
    section={section}
    moduleName={moduleName}
    onClose={() =>
      setSectionEditorOpen(false)
    }
    onSaved={() => {
      setSectionEditorOpen(false);
      fetchTranslations(pagination.page);
    }}
  />
)}

{selectedEntry && (
  <EditTranslationModal
    entry={selectedEntry}
    onClose={() => setSelectedEntry(null)}
    onSaved={() => {
      setSelectedEntry(null);
      fetchTranslations(pagination.page);
    }}
  />
)}

       {segmentOpen && (
     <CreateSegmentModal
    onClose={() => setSegmentOpen(false)}
    onCreated={() => {
      setSegmentOpen(false);
      fetchTranslations(1);
    }}
  />
)}

      {createOpen && (
        <CreateTranslationModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            fetchTranslations(1);
          }}
        />
      )}
    </main>
  );
}

function DashboardCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function TranslationEntryRow({
  entry,
  onEdit,
}) {
  const values = Object.fromEntries(
    (entry.values || []).map((item) => [
      item.language,
      item,
    ])
  );

  return (
    <article className="p-5 transition hover:bg-slate-50/70 sm:p-7">
      <div className="grid gap-5 xl:grid-cols-[310px_1fr]">
        <div className="min-w-0">
         <div className="flex flex-wrap items-center gap-2">
  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
    {formatModuleName(entry.module)}
  </span>

  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
    {entry.section}
  </span>
</div>

          <p className="mt-3 break-words font-mono text-xs font-bold text-emerald-700">
            {entry.key}
          </p>

          <h3 className="mt-2 text-lg font-black leading-6 text-slate-950">
            {entry.sourceText}
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {["gaa", "tw", "ee", "ha"].map((code) => (
            <LanguageValueCard
              key={code}
              language={code}
              value={values[code]}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
         <button
          type="button"
           onClick={onEdit}
           className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
          Edit translations
         </button>
      </div>
    </article>
  );
}

function LanguageValueCard({ language, value }) {
  const status = value?.status || "MISSING";

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-wide text-slate-500">
          {LANGUAGE_LABELS[language]}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${
            STATUS_STYLES[status] ||
            "bg-slate-100 text-slate-500"
          }`}
        >
          {status.replaceAll("_", " ")}
        </span>
      </div>

      <p
        className={`mt-3 line-clamp-4 text-sm leading-6 ${
          value?.translation
            ? "font-semibold text-slate-800"
            : "italic text-slate-400"
        }`}
      >
        {value?.translation || "No translation yet"}
      </p>

      {value?.origin && (
        <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Origin: {value.origin.replaceAll("_", " ")}
        </p>
      )}
    </div>
  );
}

function Pagination({
  pagination,
  loading,
  onPageChange,
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <p className="text-sm text-slate-500">
        Page {pagination.page} of{" "}
        {pagination.totalPages}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading || pagination.page <= 1}
          onClick={() =>
            onPageChange(pagination.page - 1)
          }
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          disabled={
            loading ||
            pagination.page >= pagination.totalPages
          }
          onClick={() =>
            onPageChange(pagination.page + 1)
          }
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="text-center">
        <LoaderCircle
          size={34}
          className="mx-auto animate-spin text-emerald-600"
        />

        <p className="mt-3 text-sm font-bold text-slate-600">
          Loading translations...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-bold text-red-600">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <Languages
        size={42}
        className="mx-auto text-slate-300"
      />

      <h3 className="mt-4 text-lg font-black text-slate-900">
        No translations found
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Change the filters or create a new entry.
      </p>
    </div>
  );
}

function CreateTranslationModal({
  onClose,
  onCreated,
}) {
const [form, setForm] = useState({
  module: "frontend",
  key: "",
  section: "",
  sourceText: "",
  description: "",
});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/translations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create translation."
        );
      }

      onCreated();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              New translation entry
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create the English source first.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="space-y-5 p-6"
        >
         
         <label className="block">
    <span className="text-sm font-black text-slate-700">
      Module
    </span>

    <select
      value={form.module}
      onChange={(event) =>
        updateField("module", event.target.value)
      }
      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
    >
      <option value="frontend">Frontend</option>
      <option value="customer">Customer</option>
      <option value="seller">Seller</option>
      <option value="admin">Admin</option>
    </select>
  </label>

          <Field
            label="Translation key"
            value={form.key}
            onChange={(value) =>
              updateField("key", value)
            }
            placeholder="productDetails.addToCart"
            required
          />

          <Field
            label="Section"
            value={form.section}
            onChange={(value) =>
              updateField("section", value)
            }
            placeholder="productDetails"
            required
          />

          <Field
            label="English source text"
            value={form.sourceText}
            onChange={(value) =>
              updateField("sourceText", value)
            }
            placeholder="Add to Cart"
            required
          />

          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Description
            </span>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              rows={4}
              placeholder="Explain where this text appears."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2 size={17} />
              )}

              Create entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTranslationModal({
  entries,
  section,
  moduleName,
  onClose,
  onSaved,
}) {
  const createInitialRows = () =>
    entries.map((entry) => {
      const values = Object.fromEntries(
        (entry.values || []).map((item) => [
          item.language,
          item,
        ])
      );

      return {
        entryId: entry.id,
        key: entry.key,
        sourceText: entry.sourceText,
        values: {
          gaa: {
            translation:
              values.gaa?.translation || "",
            status:
              values.gaa?.status || "DRAFT",
          },
          tw: {
            translation:
              values.tw?.translation || "",
            status:
              values.tw?.status || "DRAFT",
          },
          ee: {
            translation:
              values.ee?.translation || "",
            status:
              values.ee?.status || "DRAFT",
          },
          ha: {
            translation:
              values.ha?.translation || "",
            status:
              values.ha?.status || "DRAFT",
          },
        },
      };
    });

  const [rows, setRows] = useState(
    createInitialRows
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateTranslation = (
    entryId,
    language,
    field,
    value
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.entryId === entryId
          ? {
              ...row,
              values: {
                ...row.values,
                [language]: {
                  ...row.values[language],
                  [field]: value,
                },
              },
            }
          : row
      )
    );
  };

  const applyStatusToAll = (
    language,
    status
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) => ({
        ...row,
        values: {
          ...row.values,
          [language]: {
            ...row.values[language],
            status,
          },
        },
      }))
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/translations/bulk-edit",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entries: rows.map((row) => ({
              entryId: row.entryId,
              values: Object.entries(
                row.values
              ).map(([language, value]) => ({
                language,
                translation:
                  value.translation,
                status: value.status,
              })),
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save section translations."
        );
      }

      onSaved();
    } catch (submitError) {
      setError(
        submitError.message ||
          "Unable to save section translations."
      );
    } finally {
      setSaving(false);
    }
  };

  const languages = [
    { code: "gaa", label: "Ga" },
    { code: "tw", label: "Twi" },
    { code: "ee", label: "Ewe" },
    { code: "ha", label: "Hausa" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="mx-auto flex h-full max-w-[1800px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
              Bulk section editor
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
              {section}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatModuleName(moduleName)} ·{" "}
              {rows.length} entries
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
            <div className="flex min-w-max items-center gap-4">
              <span className="text-sm font-black text-slate-700">
                Apply status to every row:
              </span>

              {languages.map((language) => (
                <label
                  key={language.code}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs font-black uppercase text-slate-500">
                    {language.label}
                  </span>

                  <select
                    defaultValue=""
                    onChange={(event) => {
                      if (!event.target.value)
                        return;

                      applyStatusToAll(
                        language.code,
                        event.target.value
                      );

                      event.target.value = "";
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                  >
                    <option value="">
                      Choose status
                    </option>
                    <option value="DRAFT">
                      Draft
                    </option>
                    <option value="REVIEW_REQUIRED">
                      Needs review
                    </option>
                    <option value="APPROVED">
                      Approved
                    </option>
                    <option value="REJECTED">
                      Rejected
                    </option>
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-[1500px] w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-950 text-white">
                <tr>
                  <th className="w-[260px] border-r border-white/10 px-4 py-4 text-left text-xs font-black uppercase tracking-wide">
                    English
                  </th>

                  {languages.map((language) => (
                    <th
                      key={language.code}
                      className="min-w-[290px] border-r border-white/10 px-4 py-4 text-left text-xs font-black uppercase tracking-wide last:border-r-0"
                    >
                      {language.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.entryId}
                    className="border-b border-slate-200 align-top"
                  >
                    <td className="border-r border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="font-black text-slate-950">
                        {row.sourceText}
                      </p>

                      <p className="mt-2 break-all font-mono text-[10px] font-semibold leading-4 text-emerald-700">
                        {row.key}
                      </p>
                    </td>

                    {languages.map((language) => {
                      const value =
                        row.values[
                          language.code
                        ];

                      return (
                        <td
                          key={language.code}
                          className="border-r border-slate-200 px-4 py-4 last:border-r-0"
                        >
                          <textarea
                            value={
                              value.translation
                            }
                            onChange={(event) =>
                              updateTranslation(
                                row.entryId,
                                language.code,
                                "translation",
                                event.target.value
                              )
                            }
                            rows={3}
                            placeholder={`Enter ${language.label} translation`}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          />

                          <select
                            value={value.status}
                            onChange={(event) =>
                              updateTranslation(
                                row.entryId,
                                language.code,
                                "status",
                                event.target.value
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                          >
                            <option value="DRAFT">
                              Draft
                            </option>
                            <option value="REVIEW_REQUIRED">
                              Needs review
                            </option>
                            <option value="APPROVED">
                              Approved
                            </option>
                            <option value="REJECTED">
                              Rejected
                            </option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
            {error && (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle2 size={17} />
                )}

                Save entire section
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTranslationModal({
  entry,
  onClose,
  onSaved,
}) {
  const existingValues = Object.fromEntries(
    (entry.values || []).map((item) => [
      item.language,
      item,
    ])
  );

  const [form, setForm] = useState({
    module: entry.module || "frontend",
    section: entry.section || "",
    sourceText: entry.sourceText || "",
    description: entry.description || "",
    values: {
      gaa: {
        translation:
          existingValues.gaa?.translation || "",
        status:
          existingValues.gaa?.status || "DRAFT",
      },
      tw: {
        translation:
          existingValues.tw?.translation || "",
        status:
          existingValues.tw?.status || "DRAFT",
      },
      ee: {
        translation:
          existingValues.ee?.translation || "",
        status:
          existingValues.ee?.status || "DRAFT",
      },
      ha: {
        translation:
          existingValues.ha?.translation || "",
        status:
          existingValues.ha?.status || "DRAFT",
      },
    },
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateLanguage = (
    language,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      values: {
        ...current.values,
        [language]: {
          ...current.values[language],
          [field]: value,
        },
      },
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/translations/${entry.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            module: form.module,
            section: form.section,
            sourceText: form.sourceText,
            description: form.description,
            values: Object.entries(form.values).map(
              ([language, value]) => ({
                language,
                translation: value.translation,
                status: value.status,
              })
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save translations."
        );
      }

      onSaved();
    } catch (submitError) {
      setError(
        submitError.message ||
          "Unable to save translations."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
              Edit translation
            </p>

            <h2 className="mt-1 truncate text-xl font-black text-slate-950">
              {entry.sourceText}
            </h2>

            <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-400">
              {entry.key}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-slate-700">
                Module
              </span>

              <select
                value={form.module}
                onChange={(event) =>
                  updateField(
                    "module",
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="frontend">
                  Frontend
                </option>
                <option value="customer">
                  Customer
                </option>
                <option value="seller">
                  Seller
                </option>
                <option value="admin">
                  Admin
                </option>
              </select>
            </label>

            <Field
              label="Section"
              value={form.section}
              onChange={(value) =>
                updateField("section", value)
              }
              placeholder="productDetails.gallery"
              required
            />
          </div>

          <Field
            label="English source text"
            value={form.sourceText}
            onChange={(value) =>
              updateField("sourceText", value)
            }
            placeholder="Next Image"
            required
          />

          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Description
            </span>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Explain where this text appears."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Language translations
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the translation and select its review status.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {[
                { code: "gaa", label: "Ga" },
                { code: "tw", label: "Twi" },
                { code: "ee", label: "Ewe" },
                { code: "ha", label: "Hausa" },
              ].map((language) => (
                <TranslationEditorCard
                  key={language.code}
                  code={language.code}
                  label={language.label}
                  value={
                    form.values[language.code]
                  }
                  onChange={updateLanguage}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="sticky bottom-0 flex flex-col-reverse justify-end gap-3 border-t border-slate-200 bg-white py-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2 size={17} />
              )}

              Save translations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TranslationEditorCard({
  code,
  label,
  value,
  onChange,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-black text-slate-950">
          {label}
        </h4>

        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
          {code}
        </span>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-wide text-slate-500">
          Translation
        </span>

        <textarea
          value={value.translation}
          onChange={(event) =>
            onChange(
              code,
              "translation",
              event.target.value
            )
          }
          rows={4}
          placeholder={`Enter ${label} translation`}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-wide text-slate-500">
          Status
        </span>

        <select
          value={value.status}
          onChange={(event) =>
            onChange(
              code,
              "status",
              event.target.value
            )
          }
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="DRAFT">Draft</option>
          <option value="REVIEW_REQUIRED">
            Needs review
          </option>
          <option value="APPROVED">
            Approved
          </option>
          <option value="REJECTED">
            Rejected
          </option>
        </select>
      </label>
    </div>
  );
}

function CreateSegmentModal({
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    module: "frontend",
    page: "",
    subsection: "",
    description: "",
    labels: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const section = [
    form.page.trim(),
    form.subsection.trim(),
  ]
    .filter(Boolean)
    .join(".");

  const parsedLabels = form.labels
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "/api/admin/translations/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            module: form.module,
            section,
            description: form.description,
            labels: parsedLabels,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create translation segment."
        );
      }

      setResult(data);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Create translation segment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add English labels and let the system generate
              the translation keys automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="space-y-5 p-6"
        >
          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Module
            </span>

            <select
              value={form.module}
              onChange={(event) =>
                updateField(
                  "module",
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="frontend">
                Frontend
              </option>
              <option value="customer">
                Customer
              </option>
              <option value="seller">
                Seller
              </option>
              <option value="admin">
                Admin
              </option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Page"
              value={form.page}
              onChange={(value) =>
                updateField("page", value)
              }
              placeholder="Product Details"
              required
            />

            <Field
              label="Section"
              value={form.subsection}
              onChange={(value) =>
                updateField(
                  "subsection",
                  value
                )
              }
              placeholder="Purchase"
              required
            />
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Generated section
            </p>

            <p className="mt-1 break-all font-mono text-sm font-bold text-emerald-900">
              {section || "Waiting for page and section"}
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-black text-slate-700">
              English labels
            </span>

            <p className="mt-1 text-xs text-slate-500">
              Enter one label per line. No translation
              keys are required.
            </p>

            <textarea
              value={form.labels}
              onChange={(event) =>
                updateField(
                  "labels",
                  event.target.value
                )
              }
              rows={12}
              required
              placeholder={`Add to Cart
Buy Now
Quantity
In Stock
Out of Stock
Select Colour
Select Storage`}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Description
            </span>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Explain where this segment appears."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-slate-700">
              {parsedLabels.length} label
              {parsedLabels.length === 1 ? "" : "s"} ready
            </p>
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-black text-emerald-800">
                Segment created successfully
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <ResultCard
                  label="Created"
                  value={result.summary?.created || 0}
                />

                <ResultCard
                  label="Updated"
                  value={result.summary?.updated || 0}
                />

                <ResultCard
                  label="Skipped"
                  value={result.summary?.skipped || 0}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={
                result ? onCreated : onClose
              }
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700"
            >
              {result ? "Close and refresh" : "Cancel"}
            </button>

            {!result && (
              <button
                type="submit"
                disabled={
                  saving ||
                  !section ||
                  parsedLabels.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle2 size={17} />
                )}

                Generate segment
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />
    </label>
  );
}