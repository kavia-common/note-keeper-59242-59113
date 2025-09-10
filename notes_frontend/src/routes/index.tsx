import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

// PUBLIC_INTERFACE
export default component$(() => {
  // Redirect to /notes on mount (CSR). SSR fallback shows a link.
  useVisibleTask$(() => {
    try {
      if (typeof window !== "undefined") {
        window.location.replace("/notes");
      }
    } catch {
      // ignore
    }
  });

  return (
    <div class="page-container">
      <h1 class="main-title">Notes App</h1>
      <p>
        Redirecting to <code>/notes</code>...
      </p>
      <p>
        If you are not redirected, click{" "}
        <Link href="/notes">here to open the notes</Link>.
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Notes",
  meta: [
    {
      name: "description",
      content: "Notes application",
    },
  ],
};
