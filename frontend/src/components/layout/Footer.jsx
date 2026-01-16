import { Link } from 'react-router-dom'

const footerLinks = [
  {
    title: 'Product',
    items: [
      { label: 'Courses', to: '/courses' },
      { label: 'Login', to: '/login' },
      { label: 'Signup', to: '/signup' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help Center', to: '/support' },
    ],
  },
]

export const Footer = () => (
  <footer className="mt-auto bg-slate-950 text-slate-100">
    <div className="mx-auto flex max-w-6xl flex-wrap gap-10 px-6 py-12">
      <div className="max-w-sm space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white font-bold">
            EL
          </span>
          EduLearn
        </div>
        <p className="text-sm text-slate-300">
          Future-ready LMS experience across learner, instructor, and admin journeys.
          Modular, insightful, and delightful to use every day.
        </p>
      </div>
      <div className="flex flex-1 flex-wrap gap-10">
        {footerLinks.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {section.title}
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              {section.items.map((item) => (
                <Link key={item.label} to={item.to} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
      © {new Date().getFullYear()} EduLearn. All rights reserved.
    </div>
  </footer>
)


