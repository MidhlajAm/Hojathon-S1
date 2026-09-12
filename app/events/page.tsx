import EventCard from "@/components/EventCard";
import { getIssue, listEvents } from "@/lib/db/store";
import { DEFAULT_CENTER } from "@/lib/geo";

export default async function EventsPage() {
  const events = listEvents(DEFAULT_CENTER);

  const recommended = events.filter((event) => event.recommendedFor);
  const rest = events.filter((event) => !event.recommendedFor);

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight-display sm:text-3xl">
          Civic events
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-[15px] text-muted">
          Clean-ups, grievance camps and ward walks near you. Turning up in
          person still moves things faster than a complaint alone.
        </p>
      </header>

      {recommended.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold tracking-tight-display">
            Because of what you reported
          </h2>
          <div className="mt-3 space-y-3">
            {recommended.map((event) => {
              const issue = event.recommendedFor
                ? getIssue(event.recommendedFor.issueId)
                : undefined;
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  recommendation={
                    event.recommendedFor
                      ? {
                          reason: event.recommendedFor.reason,
                          issueTitle: issue?.analysis.title,
                          issueId: event.recommendedFor.issueId,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight-display">Near you</h2>
        <div className="mt-3 space-y-3">
          {rest.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
