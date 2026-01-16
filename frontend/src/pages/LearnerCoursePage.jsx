import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { Progress } from '../components/ui/progress.jsx'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { useToast } from '../hooks/useToast.js'
import { McqQuiz } from '../components/mcq/McqQuiz.jsx'
import { HelpCircle, Play, X, Award } from 'lucide-react'

export const LearnerCoursePage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(0)
  const [courseProgress, setCourseProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingCert, setGeneratingCert] = useState(false)
  const [quizLecture, setQuizLecture] = useState(null) // For quiz modal
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      if (!courseId) {
        showToast({
          type: 'error',
          title: 'Invalid course',
          message: 'Course ID is missing. Please go back to your dashboard.',
        })
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await learnerService.courseContent(courseId)
        setCourse(data?.course)
        setProgress(data?.yourProgress || 0)
        
        // Load certificate progress
        try {
          const progressData = await learnerService.getCourseProgress(courseId)
          setCourseProgress(progressData)
        } catch {
          // Progress endpoint may fail if no lectures completed yet
        }
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to open course',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, showToast])

  const handleGenerateCertificate = async () => {
    try {
      setGeneratingCert(true)
      await learnerService.generateCertificate(courseId)
      showToast({
        type: 'success',
        title: 'Certificate Generated!',
        message: 'Your certificate has been generated. View it in Certificates page.',
      })
      navigate('/dashboard/learner/certificates')
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Cannot Generate Certificate',
        message: err.message || 'Complete all lectures first.',
      })
    } finally {
      setGeneratingCert(false)
    }
  }

  const isAllLecturesComplete = courseProgress?.completionPercentage === 100

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading course...</div>
  }

  if (!course) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Course not found. Please return to your dashboard.
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/learner')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Enrolled course</p>
          <h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">{course.description}</p>
          <p className="text-xs text-slate-400">Instructor: {course.instructor?.fullName}</p>
        </div>
        <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Overall progress</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{progress}%</p>
          <Progress className="mt-3" value={progress} />
          
          {/* Course completion progress for certificate */}
          {courseProgress && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Lectures Completed</p>
              <p className="text-sm font-medium text-slate-700">
                {courseProgress.completedLectures} / {courseProgress.totalLectures}
              </p>
              <Progress className="mt-2" value={courseProgress.completionPercentage} />
            </div>
          )}
          
          <Button className="mt-4 w-full" onClick={() => navigate('/dashboard/learner/courses')}>
            Manage courses
          </Button>
          
          {/* Generate Certificate Button */}
          {isAllLecturesComplete && (
            <Button
              className="mt-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={handleGenerateCertificate}
              disabled={generatingCert}
            >
              <Award className="mr-2 h-4 w-4" />
              {generatingCert ? 'Generating...' : 'Get Certificate'}
            </Button>
          )}
          
          {progress >= 100 && (
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => navigate('/dashboard/learner/certificates')}
            >
              View certificate
            </Button>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Video lessons</h2>
            <p className="text-sm text-slate-500">{course.videos?.length || 0} lessons</p>
          </div>
          <div className="mt-6 space-y-4">
            {(course.videos || []).length ? (
              (course.videos || []).map((video) => (
                <div
                  key={video._id || video.videoId}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{video.title}</p>
                    <p className="text-xs text-slate-500">
                      {video.completed ? 'Completed' : 'Not completed'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuizLecture(video)}
                    >
                      <HelpCircle className="mr-1 h-4 w-4" />
                      Quiz
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/dashboard/learner/course/${courseId}/video/${video._id || video.videoId}`,
                        )
                      }
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Watch
                    </Button>
                    {video.completed && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No lessons have been uploaded for this course yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Resources</h3>
          {course.resources?.length ? (
            <div className="mt-4">
              <ResourceList resources={course.resources} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No extra resources yet.</p>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      {quizLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Lesson Quiz</h2>
                <p className="text-sm text-slate-500">{quizLecture.title}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setQuizLecture(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <McqQuiz
              lectureId={quizLecture._id || quizLecture.videoId}
              lectureName={quizLecture.title}
              onComplete={(score) => {
                if (score.percentage >= 70) {
                  showToast({
                    type: 'success',
                    title: 'Quiz Passed!',
                    message: `You scored ${score.percentage}%`,
                  })
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

