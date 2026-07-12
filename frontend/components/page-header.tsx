export function PageHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="mb-2 text-sm font-semibold uppercase text-primary">{eyebrow}</p>
      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

