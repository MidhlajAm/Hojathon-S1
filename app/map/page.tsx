import MapExplorer from "@/components/MapExplorer";
import { listIssues } from "@/lib/db/store";
import { DEFAULT_CENTER } from "@/lib/geo";

export default async function MapPage(props: PageProps<"/map">) {
  const searchParams = await props.searchParams;
  const selected =
    typeof searchParams.issue === "string" ? searchParams.issue : undefined;

  const issues = listIssues({ filter: "nearby", near: DEFAULT_CENTER });

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight-display sm:text-3xl">
          What is broken around you
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Every open report in {DEFAULT_CENTER.label}, coloured by severity.
        </p>
      </header>

      <MapExplorer issues={issues} initialSelectedId={selected} />
    </div>
  );
}
