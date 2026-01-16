const highlights = [
  {
    title: 'Learner journeys',
    description: 'Smart progress tracking and certificate automation.',
  },
  {
    title: 'Instructor cockpit',
    description: 'Launch courses, manage content, and analyze earnings.',
  },
  {
    title: 'Admin control',
    description: 'Watch revenue trends with monthly bar charts.',
  },
]

export const ValueStrip = () => (
  <section id="dashboards" className="mx-auto max-w-6xl px-6 py-12">
    <div className="rounded-[32px] bg-slate-900 p-10 text-slate-200">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboards</p>
      <h2 className="mt-2 text-3xl font-semibold text-white">Built for every role</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {highlights.map((highlight) => (
          <div key={highlight.title} className="rounded-2xl bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">{highlight.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{highlight.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)



