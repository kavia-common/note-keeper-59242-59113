import { component$, useSignal, useVisibleTask$, $, useStore } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { fetchNotes, deleteNote } from "~/lib/api";
import type { Note } from "~/lib/types";
import "~/styles/notes.css";

export default component$(() => {
  const notes = useSignal<Note[] | null>(null);
  const loading = useSignal<boolean>(false);
  const error = useSignal<string | null>(null);
  const query = useSignal<string>("");

  const ui = useStore({ success: "" });

  useVisibleTask$(async ({ cleanup }) => {
    const ctrl = new AbortController();
    cleanup(() => ctrl.abort());
    await load(ctrl.signal);
  });

  const load = $(async (signal?: AbortSignal) => {
    loading.value = true;
    error.value = null;
    ui.success = "";
    try {
      const data = await fetchNotes(signal);
      notes.value = data.sort((a, b) => {
        const ad = new Date(a.updated_at || a.created_at || 0).getTime();
        const bd = new Date(b.updated_at || b.created_at || 0).getTime();
        return bd - ad;
      });
    } catch (e: any) {
      error.value = e?.message || "Failed to load notes.";
    } finally {
      loading.value = false;
    }
  });

  const onDelete = $(async (n: Note) => {
    if (!confirm(`Delete note "${n.title}"?`)) return;
    try {
      await deleteNote(n.id);
      ui.success = "Note deleted.";
      notes.value = (notes.value || []).filter((x) => x.id !== n.id);
    } catch (e: any) {
      error.value = e?.message || "Failed to delete note.";
    }
  });

  const filtered = () => {
    const list = notes.value || [];
    const q = query.value.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  };

  return (
    <div class="container">
      <div class="header">
        <h1 class="title">My Notes</h1>
        <div class="actions">
          <button class="button" onClick$={() => load()}>
            Refresh
          </button>
          <Link href="/notes/new">
            <button class="button primary">New Note</button>
          </Link>
        </div>
      </div>

      <div class="card">
        <div class="field" style={{ marginBottom: "8px" }}>
          <label class="label" for="search">Search</label>
          <input
            id="search"
            class="input"
            type="text"
            placeholder="Search by title or content..."
            value={query.value}
            onInput$={(e, el) => (query.value = el.value)}
          />
          <div class="helper">Type to filter notes locally.</div>
        </div>

        {error.value && <div class="alert" role="alert">{error.value}</div>}
        {ui.success && <div class="success" role="status">{ui.success}</div>}

        {loading.value && <div>Loading notes...</div>}

        {!loading.value && filtered().length === 0 && (
          <div class="helper">No notes found. Create your first one!</div>
        )}

        <div class="list">
          {filtered().map((n) => (
            <div class="list-item" key={String(n.id)}>
              <div class="item-meta">
                <h3 class="item-title">{n.title || "(Untitled)"}</h3>
                <div class="item-date">
                  {n.updated_at
                    ? `Updated ${new Date(n.updated_at).toLocaleString()}`
                    : n.created_at
                    ? `Created ${new Date(n.created_at).toLocaleString()}`
                    : ""}
                </div>
              </div>
              <div class="item-actions">
                <Link href={`/notes/${encodeURIComponent(String(n.id))}`}>
                  <button class="button">Edit</button>
                </Link>
                <button class="button danger" onClick$={() => onDelete(n)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Notes",
  meta: [{ name: "description", content: "View and manage your notes" }],
};
