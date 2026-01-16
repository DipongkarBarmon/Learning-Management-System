import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { Maximize, Minimize, Play, Pause, Volume2, VolumeX, HelpCircle } from 'lucide-react'
import { McqQuiz } from '../components/mcq/McqQuiz.jsx'

export const LearnerVideoPlayer = () => {
  const { courseId, videoId } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const { showToast } = useToast()

  const [course, setCourse] = useState(null)
  const [video, setVideo] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)

  const autosaveRef = useRef(null)

  const load = useCallback(async () => {
    if (!courseId) {
      showToast({ type: 'error', title: 'Invalid course', message: 'Course ID is missing' })
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const content = await learnerService.courseContent(courseId)
      setCourse(content?.course)
      const found = (content?.course?.videos || []).find(
        (v) => v._id === videoId || v.videoId === videoId,
      )
      setVideo(found || content?.course?.videos?.[0] || null)
    } catch (err) {
      showToast({ type: 'error', title: 'Unable to load video', message: err.message })
    } finally {
      setLoading(false)
    }
  }, [courseId, showToast, videoId])

  useEffect(() => {
    load()
  }, [load])

  const updateProgress = useCallback(
    async (isCompleted = false) => {
      if (!videoRef.current || !video) return
      try {
        const currentTime = Math.floor(videoRef.current.currentTime || 0)
        await learnerService.updateProgress({
          courseId,
          videoId: video._id || video.videoId,
          currentTime,
          completed: isCompleted,
        })
        return true
      } catch (err) {
        console.error('Failed to update progress', err)
        return false
      }
    },
    [courseId, video],
  )

  const markCompleted = useCallback(async () => {
    setStatus('Updating progress...')
    
    // Mark lecture as complete for certificate tracking and progress
    try {
      await learnerService.markLectureComplete(courseId, video._id || video.videoId)
      setStatus('Progress updated successfully!')
      showToast({
        type: 'success',
        title: 'Lesson Complete!',
        message: 'Great job! Moving to the next lesson.',
      })
      // Find next video and navigate
      if (course?.videos) {
        const currentIndex = course.videos.findIndex((v) => v._id === videoId || v.videoId === videoId)
        const nextVideo = course.videos[currentIndex + 1]
        if (nextVideo) {
          navigate(`/dashboard/learner/course/${courseId}/video/${nextVideo._id || nextVideo.videoId}`)
        } else {
          navigate(`/dashboard/learner/course/${courseId}`)
        }
      }
    } catch (err) {
      console.error('Failed to mark lecture complete:', err)
      setStatus('Failed to update progress.')
      showToast({ type: 'error', title: 'Update Failed', message: err.message || 'Could not save completion.' })
    }
  }, [showToast, course, videoId, courseId, navigate, video])

  useEffect(() => {
    if (!video) return
    updateProgress(false) // Register that the user opened the video
  }, [video, updateProgress])

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => {
      const current = videoEl.currentTime
      const duration = videoEl.duration
      if (duration > 0) {
        setProgress((current / duration) * 100)
      }
    }
    const handleEnded = () => markCompleted()

    videoEl.addEventListener('play', handlePlay)
    videoEl.addEventListener('pause', handlePause)
    videoEl.addEventListener('timeupdate', handleTimeUpdate)
    videoEl.addEventListener('ended', handleEnded)

    return () => {
      videoEl.removeEventListener('play', handlePlay)
      videoEl.removeEventListener('pause', handlePause)
      videoEl.removeEventListener('timeupdate', handleTimeUpdate)
      videoEl.removeEventListener('ended', handleEnded)
    }
  }, [video, markCompleted])

  useEffect(() => {
    autosaveRef.current = setInterval(() => {
      if (isPlaying) {
        updateProgress(false)
      }
    }, 30000) // Autosave every 30 seconds

    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current)
    }
  }, [isPlaying, updateProgress])

  const togglePlay = () => {
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const percentage = x / width
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration * percentage
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'KeyF':
          toggleFullscreen()
          break
        case 'KeyM':
          toggleMute()
          break
        case 'ArrowLeft':
          if (videoRef.current) videoRef.current.currentTime -= 5
          break
        case 'ArrowRight':
          if (videoRef.current) videoRef.current.currentTime += 5
          break
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading video...</div>
  }

  if (!course || !video) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Video not found or not accessible. Try returning to the course page.
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(`/dashboard/learner/course/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Now playing</p>
          <h1 className="text-3xl font-bold text-slate-900">{video.title}</h1>
          <p className="text-sm text-slate-500">{course.title}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/dashboard/learner/course/${courseId}`)}>
          Back to Course
        </Button>
      </div>

      <div
        ref={playerRef}
        className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900"
      >
        <video
          ref={videoRef}
          key={video._id}
          className="h-full w-full"
          preload="metadata"
          crossOrigin="anonymous"
          onClick={togglePlay}
          src={video.url}
        >
          Your browser does not support the video tag.
        </video>

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
          {/* Progress Bar */}
          <div
            className="group/progress h-2.5 w-full cursor-pointer py-1"
            onClick={handleSeek}
          >
            <div className="relative h-0.5 w-full rounded-full bg-white/30">
              <div
                className="absolute h-full rounded-full bg-cyan-400"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute -top-1 h-3 w-3 rounded-full bg-white shadow transition-transform group-hover/progress:scale-110"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="mt-1 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</button>
              <button onClick={toggleMute}>{isMuted ? <VolumeX /> : <Volume2 />}</button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="bg-cyan-700 text-white hover:bg-cyan-800"
                onClick={markCompleted}
              >
                Mark as Complete
              </Button>
              <button onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize /> : <Maximize />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {status && (
        <div
          className={`mt-3 rounded-xl px-4 py-2 text-sm ${
            status.includes('successfully')
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {status}
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-xl font-bold text-slate-900">Resources for this lesson</h3>
        {course.resources?.length > 0 ? (
          <ResourceList resources={course.resources} />
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No resources available for this lesson.
          </p>
        )}
      </div>

      {/* Quiz Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-slate-900">Lecture Quiz</h3>
          {!showQuiz && (
            <Button onClick={() => setShowQuiz(true)} variant="outline">
              <HelpCircle className="mr-2 h-4 w-4" />
              Take Quiz
            </Button>
          )}
        </div>
        {showQuiz ? (
          <McqQuiz
            lectureId={video._id || video.videoId}
            lectureName={video.title}
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
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-slate-600">Test your knowledge after watching this lecture.</p>
            <Button className="mt-4" onClick={() => setShowQuiz(true)}>
              Start Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
