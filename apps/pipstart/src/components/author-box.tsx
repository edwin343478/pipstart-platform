import Link from "next/link";

type AuthorBoxProps = {
  author: { description: string; href: string; name: string };
  className?: string;
};

export function AuthorBox({ author, className }: AuthorBoxProps) {
  return (
    <aside className={className} aria-label="About the author">
      <p>Written and reviewed by</p>
      <h2>
        <Link href={author.href}>{author.name}</Link>
      </h2>
      <p>{author.description}</p>
    </aside>
  );
}
