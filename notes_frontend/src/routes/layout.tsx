import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";
import styles from "./styles.css?inline";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

// PUBLIC_INTERFACE
export default component$(() => {
  useStyles$(styles);
  return (
    <>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
        <Link href="/notes" style={{ textDecoration: "none", color: "inherit" }}>
          <strong>Notes</strong>
        </Link>
      </header>
      <main>
        <Slot />
      </main>
    </>
  );
});
