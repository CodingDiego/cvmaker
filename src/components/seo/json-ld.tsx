import type { Thing, WithContext } from "schema-dts";

/**
 * Renders a JSON-LD <script> for structured data. Pass a typed graph built with
 * the schema-dts helpers in `@/lib/seo`. Safe to render in the <body> — search
 * engines pick it up anywhere in the document.
 */
export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is server-generated from trusted content; stringify is safe.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
