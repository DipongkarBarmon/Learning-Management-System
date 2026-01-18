import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Badge } from '../ui/badge.jsx'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const HeroSection = ({ onExplore, featuredCourse, enrolledIds }) => {
  const navigate = useNavigate()
  const isEnrolled = featuredCourse && enrolledIds?.has(featuredCourse._id)

  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
      {/* Background Elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700 ring-1 ring-inset ring-cyan-500/20">
              <span className="flex h-2 w-2 rounded-full bg-cyan-600 animate-pulse" />
              Start Learning Today
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl leading-[1.1]">
              Master new skills with <br />
              <span className="bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
                 LMS
              </span>
            </h1>

            <p className="text-lg leading-8 text-slate-600 max-w-xl">
              Unlock your potential with our expert-led courses. Whether you're a learner, instructor, or administrator, we provide the tools you need to succeed in the digital age.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={onExplore}
                className="bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-cyan-200 h-12 px-8 text-base"
              >
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative lg:ml-auto">
            <div className="relative rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="relative rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
                {featuredCourse ? (
                  <div className="group relative cursor-pointer" onClick={() => navigate(isEnrolled ? `/dashboard/learner/course/${featuredCourse._id}` : `/courses/${featuredCourse._id}`, { state: { preview: featuredCourse } })}>
                    <div className="aspect-video w-full overflow-hidden bg-slate-100">
                      {featuredCourse.image ? (
                        <img
                          src={featuredCourse.image}
                          alt={featuredCourse.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                          <PlayCircle size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="bg-cyan-50 text-cyan-700">Featured Course</Badge>
                        <span className="text-sm font-medium text-slate-500">{featuredCourse.totalVideos || 0} lessons</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{featuredCourse.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{featuredCourse.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {featuredCourse.instructor?.name?.[0] || 'I'}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {featuredCourse.instructor?.name || 'Instructor'}
                          </span>
                        </div>
                        {isEnrolled ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Enrolled</Badge>
                        ) : (
                          <span className="text-lg font-bold text-slate-900">
                            ${featuredCourse.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-slate-500">Loading featured course...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-900/5 animate-bounce duration-3000">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" />
                  ))}
                </div>
                <div className="text-sm font-medium text-slate-900">
                  Join our community
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

HeroSection.propTypes = {
  onExplore: PropTypes.func.isRequired,
  featuredCourse: PropTypes.object,
  enrolledIds: PropTypes.object,
}


