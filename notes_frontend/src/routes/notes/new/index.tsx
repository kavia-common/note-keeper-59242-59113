import { component$, useSignal, $, useStore } from "@builder.io/qwik";
import { type DocumentHead, useNavigate } from "@builder.io/qwik-city";
import { createNote } from "~/lib/api";
import "~/styles/notes.css";

export default component$(() => {
  const title = useSignal("");
  const content = useSignal("");
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);
  const nav = useNavigate();
  const ui = useStore({ success: "" });

  const submit = $(async () => {
    error.value = null;
    ui.success = "";
    if (!title.value.trim()) {
      error.value = "Title is required.";
      return;
    }
    loading.value = true;
    try {
      await createNote({ title: title.value.trim(), content: content.value });
      ui.success = "Note created.";
      // Redirect to list after a short delay
      setTimeout(() => nav("/notes"), 400);
    } catch (e: any) {
      error.value = e?.message || "Failed to create note.";
    } finally {
      loading.value = false;
    }
  });

  return (
    <div class="container">
      <div class="header">
        <h1 class="title">New Note</h1>
        <div class="actions">
          <button class="button" onClick$={() => nav("/notes")}>
            Back
          </button>
          <button class="button primary" disabled={loading.value} onClick$={submit}>
            {loading.value ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div class="card">
        {error.value && <div class="alert" role="alert">{error.value}</div>}
        {ui.success && <div class="success" role="status">{ui.success}</div>}

        <div class="form">
          <div class="field">
            <label class="label" for="title">Title</label>
            <input
              id="title"
              class="input"
              type="text"
              placeholder="e.g. Grocery list"
              value={title.value}
              onInput$={(e, el) => (title.value = el.value)}
            />
          </div>
          <div class="field">
            <label class="label" for="content">Content</label>
            <textarea
              id="content"
              class="textarea"
              placeholder="Write your note here..."
              value={content.value}
              onInput$={(e, el) => (content.value = el.value)}
            />
          </div>
          <div class="helper">Your note will be saved to the server.</div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "New Note",
  meta: [{ name: "description", content: "Create a new note" }],
};
