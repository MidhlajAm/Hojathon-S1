import CameraSlot from "@/components/CameraSlot";
import FilterTabs from "@/components/FilterTabs";
import IssueCard from "@/components/IssueCard";
import SearchField from "@/components/SearchField";
import { DEFAULT_CENTER } from "@/lib/geo";
import { listIssues } from "@/lib/db/store";
import type { FeedFilter } from "@/lib/types";

const FILTERS = [
  { value: "nearby", label: "Nearby" },
  { value: "trending", label: "Trending" },
  { value: "recent", label: "Recent" },
  { value: "unresolved", label: "Unresolved" },
] as const;

export default async function HomePage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const raw = typeof searchParams.filter === "string" ? searchParams.filter : "";
  const filter = (FILTERS.some((option) => option.value === raw)
    ? raw
    : "nearby") as FeedFilter;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;

  const issues = listIssues({ filter, near: DEFAULT_CENTER, query });

  return (
    <div className="mx-auto max-w-2xl">
      <header className="md:hidden">
        <h1 className="flex items-baseline gap-1.5 pb-4">
          <span className="text-xl font-bold tracking-tight-display">Civic</span>
          <span className="text-xl font-normal tracking-tight-display text-muted">
            Connect
          </span>
        </h1>
      </header>

      <SearchField defaultValue={query} />

      <div className="mt-4">
        <CameraSlot />
      </div>

      <div className="mt-6">
        <FilterTabs basePath="/" options={FILTERS} active={filter} />
      </div>

      {issues.length === 0 ? (
        <p className="mt-8 rounded-card border border-rule bg-surface p-6 text-[15px] text-muted">
          {query
            ? `Nothing matches "${query}" yet. Try a place name, or report it yourself.`
            : "No reports here yet. Yours would be the first."}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {issues.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} priority={index === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
