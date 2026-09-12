/* eslint-disable @next/next/no-img-element */

/**
 * Issue photos arrive from three places — seeded SVGs in /public, data URLs from
 * an upload with no Cloudinary account, and Cloudinary URLs once one is set.
 * `next/image` cannot span that range (data URLs in particular), so this uses a
 * plain img and is the single place that exception lives.
 */
export default function IssuePhoto({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`bg-[#dfe5ea] object-cover ${className}`}
    />
  );
}
