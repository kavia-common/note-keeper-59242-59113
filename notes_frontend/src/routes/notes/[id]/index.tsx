import { component$, useSignal, useVisibleTask$, $, useStore } from "@builder.io/qwik";
import { type DocumentHead, useLocation, useNavigate, Link } from "@builder.io/qwik-city";
import { fetchNote, updateNote, deleteNote } from "~/lib/api";
import type { Note } from "~/lib/types";
import "~/styles/notes.css";

export default component$(() => {
  const loc = useLocation();
  const nav = useNavigate();
  const id = decodeURIComponent(loc.params["id"] || "");
  const loading = useSignal(false);
  const saving = useSignal(false);
  const error = useSignal<string | null>(null);
  const note = useSignal<Note | null>(null);
  const form = useStore({ title: "", content: "" });
  const ui = useStore({ success: "" });

  useVisibleTask$(async ({ cleanup }) => {
    const ctrl = new AbortController();
    cleanup(() => ctrl.abort());
    loading.value = true;
    error.value = null;
    try {
      const n = await fetchNote(id, ctrl.signal);
      note.value = n;
      form.title = n.title || "";
      form.content = n.content || "";
    } catch (e: any) {
      error.value = e?.message || "Failed to load note.";
    } finally {
      loading.value = false;
    }
  });

  const save = $(async () => {
    if (!note.value) return;
    if (!form.title.trim()) {
      error.value = "Title is required.";
      return;
    }
    saving.value = true;
    error.value = null;
    ui.success = "";
    try {
      const updated = await updateNote(note.value.id, {
        title: form.title.trim(),
        content: form.content,
      });
      note.value = updated;
      ui.success = "Note updated.";
    } catch (e: any) {
      error.value = e?.message || "Failed to update note.";
    } finally {
      saving.value = false;
    }
  });

  const remove = $(async () => {
    if (!note.value) return;
    if (!confirm(`Delete note "${note.value.title}"?`)) return;
    try {
      await deleteNote(note.value.id);
      nav("/notes");
    } catch (e: any) {
      error.value = e?.message || "Failed to delete note.";
    }
  });

  return (
    <div class="container">
      <div class="header">
        <h1 class="title">Edit Note</h1>
        <div class="actions">
          <Link href="/notes"><button class="button">Back</button></Link>
          <button class="button danger" onClick$={remove}>Delete</button>
          <button class="button primary" disabled={saving.value} onClick$={save}>
            {saving.value ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div class="card">
        {loading.value && <div>Loading note...</div>}
        {error.value && <div class="alert" role="alert">{error.value}</div>}
        {ui.success && <div class="success" role="status">{ui.success}</div>}

        {!loading.value && note.value && (
          <div class="form">
            <div class="field">
              <label class="label" for="title">Title</label>
              <input
                id="title"
                class="input"
                type="text"
                value={form.title}
                onInput$={(e, el) => (form.title = el.value)}
              />
            </div>

            <div class="field">
              <label class="label" for="content">Content</label>
              <textarea
                id="content"
                class="textarea"
                value={form.content}
                onInput$={(e, el) => (form.content = el.value)}
              />
            </div>

            <div class="footer">
              <div class="helper">
                {note.value.updated_at
                  ? `Last updated ${new Date(note.value.updated_at).toLocaleString()}`
                  : note.value.created_at
                  ? `Created ${new Date(note.value.created_at).toLocaleString()}`
                  : ""}
              </div>
              <div class="actions">
                <button class="button" onClick$={() => window.history.back()}>
                  Cancel
                </button>
                <button class="button primary" onClick$={save} disabled={saving.value}>
                  {saving.value ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Edit Note",
  meta: [{ name: "description", content: "Edit a note" }],
};
