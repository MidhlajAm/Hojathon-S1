import Form from "next/form";
import { SearchIcon } from "./icons";

/**
 * `next/form` submits with a client-side navigation and works without JS, so a
 * search is a shareable URL rather than transient component state.
 */
export default function SearchField({ defaultValue }: { defaultValue?: string }) {
  return (
    <Form action="/" className="relative">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search issues and places"
        aria-label="Search issues and places"
        className="w-full rounded-lg border border-rule bg-surface py-2.5 pl-10 pr-3 text-[15px] text-ink placeholder:text-muted focus:border-action focus:outline-none"
      />
    </Form>
  );
}
