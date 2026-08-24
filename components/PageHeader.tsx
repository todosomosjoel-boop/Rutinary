export default function PageHeader({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return <header className="page-header">{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{text && <p>{text}</p>}</header>;
}
