import type { Thing, WithContext } from "schema-dts";

/**
 * Renders a JSON-LD <script> for structured data. Pass a typed graph built with
 * the schema-dts helpers in `@/lib/seo`. Safe to render in the <body> — search
 * engines pick it up anywhere in the document.
 */
export function JsonLd<T extends Thing>({ data, id }: { data: WithContext<T>; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
