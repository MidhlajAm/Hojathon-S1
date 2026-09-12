import Link from "next/link";
import { CameraIcon } from "./icons";

/**
 * The top of the feed.
 *
 * Taking a photo is the most characteristic action in this product, so the home
 * page opens with the camera rather than a headline about civic engagement.
 */
export default function CameraSlot() {
  return (
    <Link
      href="/report"
      className="group flex items-center gap-4 rounded-card border border-dashed border-[#b9c6d1] bg-surface p-4 transition-colors hover:border-action hover:bg-white sm:p-5"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ground text-ink transition-colors group-hover:bg-action group-hover:text-white sm:h-16 sm:w-16">
        <CameraIcon className="h-7 w-7" />
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-semibold leading-6 tracking-tight-display text-ink">
          Saw something broken? Point your camera at it.
        </span>
        <span className="mt-0.5 block text-sm leading-5 text-muted">
          The agent works out what it is, who fixes it, and writes the complaint.
          You approve before anything is sent.
        </span>
      </span>
    </Link>
  );
}
