import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <span style={{ color: "#E8E6E1" }}>/</span>}
          {item.href ? (
            <Link href={item.href} style={{ color: "#8A8A8E", textDecoration: "none" }}>{item.label}</Link>
          ) : (
            <span style={{ color: "#0A0A0B" }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
