import PropTypes from 'prop-types'

export const CategoryCarousel = ({ categories }) => (
  <section className="mx-auto max-w-6xl px-6 py-12">
    <div className="mb-8">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Course Titles</p>
      <h2 className="text-2xl font-semibold text-slate-900">
        Explore categories shaped by learner demand
      </h2>
    </div>
    <div className="flex gap-4 overflow-x-auto pb-4">
      {categories.map((category) => (
        <div
          key={category._id}
          className="min-w-[240px] rounded-3xl border border-white/40 bg-white/80 p-5 shadow-lg"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Title</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{category._id}</h3>
          <p className="mt-3 text-sm text-slate-500">
            {category.totalCourses} courses · {category.totalEnrollments} learners
          </p>
          <div className="mt-4 space-y-2 text-xs text-slate-500">
            {(category.courses || []).slice(0, 3).map((course) => {
              const instructorName =
                course.instructor?.fullName ||
                course.instructor?.name ||
                course.instructor?.userName ||
                'Instructor'
              return (
                <p key={course._id} className="truncate">
                  {course.title} — <span className="text-slate-900">{instructorName}</span>
                </p>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  </section>
)

CategoryCarousel.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
}

