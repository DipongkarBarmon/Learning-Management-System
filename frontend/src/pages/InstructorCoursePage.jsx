import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Modal } from '../components/ui/modal.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import { useToast } from '../hooks/useToast.js'
import { McqManager } from '../components/mcq/McqManager.jsx'
import { HelpCircle, Play, Edit2, Image, Upload } from 'lucide-react'

export const InstructorCoursePage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [videoFiles, setVideoFiles] = useState([])
  const [mcqLecture, setMcqLecture] = useState(null) // For MCQ manager modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '' })
  const [updating, setUpdating] = useState(false)
  // Lecture edit state
  const [editLecture, setEditLecture] = useState(null)
  const [lectureForm, setLectureForm] = useState({ title: '', description: '' })
  const [updatingLecture, setUpdatingLecture] = useState(false)
  // Lecture resource update state
  const [resourceLecture, setResourceLecture] = useState(null)
  const [resourceFile, setResourceFile] = useState(null)
  const [resourceType, setResourceType] = useState('video')
  const [updatingResource, setUpdatingResource] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await instructorService.courseDetails(courseId)
        setCourse(data)
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to fetch course',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, showToast])

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    const lectureFiles = []

    for (const file of files) {
      const duration = await getVideoDuration(file)
      lectureFiles.push({
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        duration: Math.round(duration),
      })
    }

    setVideoFiles(lectureFiles)
  }

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.onerror = () => {
        resolve(0)
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const handleVideoMetadataChange = (index, field, value) => {
    setVideoFiles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    )
  }

  const handleUpload = async () => {
    if (!videoFiles.length) {
      showToast({
        type: 'error',
        title: 'No files selected',
        message: 'Please select at least one file for the lecture',
      })
      return
    }

    // Validate video files have title and duration
    const hasInvalidData = videoFiles.some((v) => !v.title || v.duration <= 0)
    if (hasInvalidData) {
      showToast({
        type: 'error',
        title: 'Invalid video data',
        message: 'Please provide title for all videos. Make sure files are valid videos.',
      })
      return
    }

    try {
      setUploading(true)
      
      // Upload each video separately (backend expects single file per request)
      for (const video of videoFiles) {
        const formData = new FormData()
        formData.append('resource', video.file)
        formData.append('title', video.title)
        formData.append('description', video.title)
        formData.append('resourseType', 'video')

        await instructorService.addVideos(courseId, formData)
      }

      showToast({
        type: 'success',
        title: 'Lecture added',
        message: `${videoFiles.length} lecture(s) added successfully`,
      })

      setShowUploadModal(false)
      setVideoFiles([])

      // Reload course data
      const data = await instructorService.courseDetails(courseId)
      setCourse(data)
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Upload failed',
        message: err.message,
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading course details...</div>
  }

  if (!course) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Course not found. Please go back to your dashboard.
        <div className="mt-4">
          <Button onClick={() => navigate('/dashboard/instructor')}>Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Course management</p>
          <h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">{course.description}</p>
          <p className="text-sm font-medium text-indigo-600">${course.price}</p>
          <div className="mt-2 flex items-center gap-4">
            <button 
              onClick={() => {
                setEditForm({
                  title: course.title || '',
                  description: course.description || '',
                  price: course.price || ''
                })
                setShowEditModal(true)
              }}
              className="flex items-center gap-1 text-xs font-medium text-cyan-700 hover:text-cyan-800 hover:underline"
            >
              <Edit2 className="h-3 w-3" />
              Edit Course Info
            </button>
            <label htmlFor="thumb-upload" className="flex items-center gap-1 cursor-pointer text-xs font-medium text-cyan-700 hover:text-cyan-800 hover:underline">
              <Image className="h-3 w-3" />
              Change Thumbnail
            </label>
            <input
              id="thumb-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  try {
                    const fd = new FormData()
                    fd.append('image', e.target.files[0])
                    await instructorService.updateThumbnail(courseId, fd)
                    showToast({ type: 'success', title: 'Thumbnail updated', message: 'Course thumbnail updated successfully' })
                    // Reload
                    const data = await instructorService.courseDetails(courseId)
                    setCourse(data)
                  } catch (err) {
                    showToast({ type: 'error', title: 'Update failed', message: err.message })
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>
            Add Lecture
          </Button>
          <Button
            variant="outline"
            disabled={!course.videos?.length}
            onClick={() =>
              course.videos?.length &&
              navigate(
                `/dashboard/instructor/course/${courseId}/video/${course.videos?.[0]?.videoId || course.videos?.[0]?._id
                }`,
              )
            }
          >
            Preview first lesson
          </Button>
          <Button onClick={() => navigate('/dashboard/instructor')}>Back to dashboard</Button>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Published lessons</h2>
            <p className="text-sm text-slate-500">{course.totalVideos || 0} lectures</p>
          </div>
          <div className="mt-6 space-y-4">
            {(course.videos || []).map((lecture) => {
              return (
                <div
                  key={lecture.videoId || lecture._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="rounded-lg p-2 text-emerald-600 bg-emerald-50">
                      <Play className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{lecture.title}</p>
                      <p className="text-xs text-slate-500">{lecture.description || 'Video lesson'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditLecture(lecture)
                        setLectureForm({ title: lecture.title || '', description: lecture.description || '' })
                      }}
                      title="Edit lecture info"
                    >
                      <Edit2 className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setResourceLecture(lecture)
                        setResourceFile(null)
                        setResourceType('video')
                      }}
                      title="Update video file"
                    >
                      <Upload className="mr-1 h-4 w-4" />
                      Replace
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMcqLecture(lecture)}
                    >
                      <HelpCircle className="mr-1 h-4 w-4" />
                      Quiz
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/dashboard/instructor/course/${courseId}/video/${lecture.videoId || lecture._id}`,
                        )
                      }
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Play
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Key metrics</h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-500">
              <div className="flex items-center justify-between">
                <dt>Students enrolled</dt>
                <dd className="font-semibold text-slate-900">{course.totalEnrolled}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Total earnings (80%)</dt>
                <dd className="font-semibold text-slate-900">${course.instructorEarnings}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Resources</dt>
                <dd className="font-semibold text-slate-900">{course.totalResources}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Resources</h3>
            {course.resources?.length ? (
              <div className="mt-4">
                <ResourceList resources={course.resources} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No resources uploaded.</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showUploadModal}
        onClose={() => {
          setShowUploadModal(false)
          setVideoFiles([])
        }}
        title="Add Lecture"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false)
                setVideoFiles([])
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !videoFiles.length}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select video files
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">You can select multiple video files (MP4, WebM, etc.)</p>
          </div>

          {videoFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Video details</p>
              {videoFiles.map((video, index) => {
                const seconds = video.duration || 0
                const hours = Math.floor(seconds / 3600)
                const minutes = Math.floor((seconds % 3600) / 60)
                const secs = Math.floor(seconds % 60)

                return (
                  <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-600">Video {index + 1}</p>
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                        {seconds > 0 ? `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${secs}s` : 'Processing...'}
                      </span>
                    </div>
                    <Input
                      type="text"
                      placeholder="Video title"
                      value={video.title}
                      onChange={(e) => handleVideoMetadataChange(index, 'title', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">File: {video.file.name}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* MCQ Manager Modal */}
      {mcqLecture && (
        <McqManager
          lectureId={mcqLecture._id || mcqLecture.videoId}
          lectureName={mcqLecture.title}
          isOpen={!!mcqLecture}
          onClose={() => setMcqLecture(null)}
        />
      )}

      {/* Edit Course Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Course Information"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={updating}
              onClick={async () => {
                try {
                  setUpdating(true)
                  await instructorService.updateCourse(courseId, editForm)
                  showToast({ type: 'success', title: 'Course updated', message: 'Course information updated successfully' })
                  setShowEditModal(false)
                  // Reload course data
                  const data = await instructorService.courseDetails(courseId)
                  setCourse(data)
                } catch (err) {
                  showToast({ type: 'error', title: 'Update failed', message: err.message })
                } finally {
                  setUpdating(false)
                }
              }}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Course Title</Label>
            <Input
              id="edit-title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="Enter course title"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Enter course description"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="edit-price">Price ($)</Label>
            <Input
              id="edit-price"
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </Modal>

      {/* Edit Lecture Info Modal */}
      <Modal
        open={!!editLecture}
        onClose={() => setEditLecture(null)}
        title="Edit Lecture Information"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditLecture(null)}>
              Cancel
            </Button>
            <Button
              disabled={updatingLecture}
              onClick={async () => {
                try {
                  setUpdatingLecture(true)
                  const lectureId = editLecture._id || editLecture.videoId
                  await instructorService.updateLectureInfo(lectureId, {
                    ...lectureForm,
                    courseId: courseId
                  })
                  showToast({ type: 'success', title: 'Lecture updated', message: 'Lecture information updated successfully' })
                  setEditLecture(null)
                  // Reload course data
                  const data = await instructorService.courseDetails(courseId)
                  setCourse(data)
                } catch (err) {
                  showToast({ type: 'error', title: 'Update failed', message: err.message })
                } finally {
                  setUpdatingLecture(false)
                }
              }}
            >
              {updatingLecture ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="lecture-title">Lecture Title</Label>
            <Input
              id="lecture-title"
              value={lectureForm.title}
              onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
              placeholder="Enter lecture title"
            />
          </div>
          <div>
            <Label htmlFor="lecture-description">Description</Label>
            <Textarea
              id="lecture-description"
              value={lectureForm.description}
              onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
              placeholder="Enter lecture description"
              rows={4}
            />
          </div>
        </div>
      </Modal>

      {/* Update Lecture Resource Modal */}
      <Modal
        open={!!resourceLecture}
        onClose={() => {
          setResourceLecture(null)
          setResourceFile(null)
        }}
        title="Update Lecture Resource"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setResourceLecture(null)
              setResourceFile(null)
            }}>
              Cancel
            </Button>
            <Button
              disabled={updatingResource || !resourceFile}
              onClick={async () => {
                try {
                  setUpdatingResource(true)
                  const lectureId = resourceLecture._id || resourceLecture.videoId
                  const formData = new FormData()
                  formData.append('resource', resourceFile)
                  formData.append('lectureId', lectureId)
                  formData.append('couserId', courseId)
                  formData.append('resourseType', resourceType)
                  
                  await instructorService.updateLectureResource(formData)
                  showToast({ type: 'success', title: 'Resource updated', message: 'Lecture resource updated successfully' })
                  setResourceLecture(null)
                  setResourceFile(null)
                  // Reload course data
                  const data = await instructorService.courseDetails(courseId)
                  setCourse(data)
                } catch (err) {
                  showToast({ type: 'error', title: 'Update failed', message: err.message })
                } finally {
                  setUpdatingResource(false)
                }
              }}
            >
              {updatingResource ? 'Uploading...' : 'Update Resource'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Current Lecture</Label>
            <p className="text-sm text-slate-600">{resourceLecture?.title}</p>
          </div>
          <div>
            <Label htmlFor="resource-file">New Video File</Label>
            <input
              id="resource-file"
              type="file"
              accept="video/*"
              onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">Select a new video file to replace the current one</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

