import Link from "next/link";

const LAB_PROJECTS = [
  {
    slug: "quadrant-rails",
    title: "Quadrant Rails + Data View",
    tag: "Data UX",
    summary: "Thick outer rails make axis strength obvious at a glance. Tap to reveal a conventional bar chart.",
  },
  {
    slug: "dose-visual-lab",
    title: "Dose Visualization Lab",
    tag: "Dose UX",
    summary: "Explore different ways to visually encode dose and trip intensity on the spore radar.",
  },
  {
    slug: "spore-data-radar",
    title: "Spore Data Radar",
    tag: "Data Viz",
    summary: "Use gill length as an organic radar chart for experience dimensions.",
  },
  {
    slug: "spore-animations",
    title: "Spore Print Animation Lab",
    tag: "Animation",
    summary: "Experiment with breathing, gill, and aura animations for the spore print.",
  },
  {
    slug: "spore-dial",
    title: "Spore Dial Prototype",
    tag: "Interaction",
    summary: "Early prototype of a radial strain selector using a spore-print dial.",
  },
];

export default function LabIndexPage() {
  return (
    <main className="min-h-screen bg-[var(--shell-bg)] text-[var(--ink-main)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ink-subtle)]">
            Lab · Experiments
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Tripdar Lab
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-soft)] max-w-2xl">
            A playground for experimental UI, animation, and data visualizations 
            before they graduate into the main Tripdar experience.
          </p>
        </header>

        {/* Project grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          {LAB_PROJECTS.map((project) => (
            <Link key={project.slug} href={`/lab/${project.slug}`}>
              <article className="group rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-4 sm:px-5 sm:py-5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] transition-all duration-200">
                {/* Top row: tag + slug */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-[var(--shell-bg)] px-2 py-[2px] text-[11px] font-medium text-[var(--accent)]">
                    {project.tag}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-subtle)]">
                    /lab/{project.slug}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-2 text-base sm:text-lg font-semibold tracking-tight text-[var(--ink-main)]">
                  {project.title}
                </h2>

                {/* Summary */}
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {project.summary}
                </p>

                {/* Footer row */}
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--ink-subtle)]">
                  <span>Click to open</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Back link */}
        <footer className="text-center pt-4">
          <Link 
            href="/"
            className="text-sm text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors"
          >
            ← Back to Tripdar
          </Link>
        </footer>
      </div>
    </main>
  );
}

