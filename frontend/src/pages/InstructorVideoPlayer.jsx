import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { ResourceList } from '../components/dashboard/ResourceList.jsx'
import { Button } from '../components/ui/button.jsx'
import { Modal } from '../components/ui/modal.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import { useToast } from '../hooks/useToast.js'
import { McqManager } from '../components/mcq/McqManager.jsx'
import { HelpCircle, Edit2, Upload } from 'lucide-react'

export const InstructorVideoPlayer = () => {
  const { courseId, videoId } = useParams()
  const [course, setCourse] = useState(null)
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [videoFiles, setVideoFiles] = useState([])
  const [showMcqManager, setShowMcqManager] = useState(false)
  // Edit lecture state
  const [showEditLecture, setShowEditLecture] = useState(false)
  const [lectureForm, setLectureForm] = useState({ title: '', description: '' })
  const [updatingLecture, setUpdatingLecture] = useState(false)
  // Update resource state
  const [showResourceModal, setShowResourceModal] = useState(false)
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
        const found = (data?.videos || []).find(
          (item) => item.videoId === videoId || item._id === videoId,
        )
        setVideo(found || data?.videos?.[0] || null)
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to load video',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, videoId, showToast])

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    const videoFilesWithDuration = []

    for (const file of files) {
      const duration = await getVideoDuration(file)
      videoFilesWithDuration.push({
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        duration: Math.round(duration),
      })
    }

    setVideoFiles(videoFilesWithDuration)
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
        title: 'No videos selected',
        message: 'Please select at least one video file',
      })
      return
    }

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
        title: 'Videos uploaded',
        message: `${videoFiles.length} video(s) have been uploaded successfully`,
      })

      setShowUploadModal(false)
      setVideoFiles([])

      // Reload course data
      const data = await instructorService.courseDetails(courseId)
      setCourse(data)
      const found = (data?.videos || []).find(
        (item) => item.videoId === videoId || item._id === videoId,
      )
      setVideo(found || data?.videos?.[0] || null)
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
    return <div className="px-6 py-12 text-center text-slate-500">Preparing player...</div>
  }

  if (!course || !video) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Video not found.
        <div className="mt-4">
          <Button onClick={() => navigate(`/dashboard/instructor/course/${courseId}`)}>
            Back to course
          </Button>
        </div>
      </div>
    )
  }

  const currentVideoId = video.videoId || video._id

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Now previewing</p>
          <h1 className="text-2xl font-semibold text-slate-900">{video.title}</h1>
          <p className="text-sm text-slate-500">{course.title}</p>
          {video.description && <p className="mt-1 text-xs text-slate-400">{video.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => {
            setLectureForm({ title: video.title || '', description: video.description || '' })
            setShowEditLecture(true)
          }}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Info
          </Button>
          <Button variant="outline" onClick={() => {
            setResourceFile(null)
            setResourceType(video.resourseType || 'video')
            setShowResourceModal(true)
          }}>
            <Upload className="mr-2 h-4 w-4" />
            Update Resource
          </Button>
          <Button variant="outline" onClick={() => setShowMcqManager(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Manage Quiz
          </Button>
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>
            Upload videos
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/dashboard/instructor/course/${courseId}`)}>
            Back to course
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
          <video
            key={video.videoId || video._id}
            controls
            className="h-full w-full object-cover"
            src={video.url}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All lessons</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(course.videos || []).map((item) => {
                const itemId = item.videoId || item._id
                return (
                <Button
                  key={itemId}
                  variant={itemId === currentVideoId ? 'default' : 'outline'}
                  onClick={() =>
                    navigate(`/dashboard/instructor/course/${courseId}/video/${item.videoId || item._id}`)
                  }
                >
                  {item.title}
                </Button>
              )})}
            </div>
          </div>
          <div>
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
        title="Upload videos"
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
            <p className="mt-1 text-xs text-slate-500">You can select multiple video files</p>
          </div>

          {videoFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Video details</p>
              {videoFiles.map((video, index) => {
                const seconds = video.duration || 0
                const hours = Math.floor(seconds / 3600)
                const minutes = Math.floor((seconds % 3600) / 60)
                const secs = Math.floor(seconds % 60)
                const durationText = hours > 0 
                  ? `${hours}h ${minutes}m ${secs}s`
                  : minutes > 0 
                  ? `${minutes}m ${secs}s` 
                  : `${secs}s`
                
                return (
                  <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-600">Video {index + 1}</p>
                    <Input
                      type="text"
                      placeholder="Video title"
                      value={video.title}
                      onChange={(e) => handleVideoMetadataChange(index, 'title', e.target.value)}
                    />
                    <div className="rounded-lg bg-slate-100 px-3 py-2">
                      <p className="text-xs text-slate-600">Duration: <span className="font-medium text-slate-900">{durationText}</span></p>
                      <p className="text-xs text-slate-500 mt-1">Auto-detected from video file</p>
                    </div>
                    <p className="text-xs text-slate-500">File: {video.file.name}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* MCQ Manager Modal */}
      <McqManager
        lectureId={video?._id || video?.videoId || ''}
        lectureName={video?.title}
        isOpen={showMcqManager}
        onClose={() => setShowMcqManager(false)}
      />

      {/* Edit Lecture Info Modal */}
      <Modal
        open={showEditLecture}
        onClose={() => setShowEditLecture(false)}
        title="Edit Lecture Information"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditLecture(false)}>
              Cancel
            </Button>
            <Button
              disabled={updatingLecture}
              onClick={async () => {
                try {
                  setUpdatingLecture(true)
                  const lectureId = video._id || video.videoId
                  await instructorService.updateLectureInfo(lectureId, {
                    ...lectureForm,
                    courseId: courseId
                  })
                  showToast({ type: 'success', title: 'Lecture updated', message: 'Lecture information updated successfully' })
                  setShowEditLecture(false)
                  // Reload course data
                  const data = await instructorService.courseDetails(courseId)
                  setCourse(data)
                  const found = (data?.videos || []).find(
                    (item) => item.videoId === videoId || item._id === videoId,
                  )
                  setVideo(found || data?.videos?.[0] || null)
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
        open={showResourceModal}
        onClose={() => {
          setShowResourceModal(false)
          setResourceFile(null)
        }}
        title="Update Lecture Resource"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setShowResourceModal(false)
              setResourceFile(null)
            }}>
              Cancel
            </Button>
            <Button
              disabled={updatingResource || !resourceFile}
              onClick={async () => {
                try {
                  setUpdatingResource(true)
                  const lectureId = video._id || video.videoId
                  const formData = new FormData()
                  formData.append('resource', resourceFile)
                  formData.append('lectureId', lectureId)
                  formData.append('couserId', courseId)
                  formData.append('resourseType', resourceType)
                  
                  await instructorService.updateLectureResource(formData)
                  showToast({ type: 'success', title: 'Resource updated', message: 'Lecture resource updated successfully' })
                  setShowResourceModal(false)
                  setResourceFile(null)
                  // Reload course data
                  const data = await instructorService.courseDetails(courseId)
                  setCourse(data)
                  const found = (data?.videos || []).find(
                    (item) => item.videoId === videoId || item._id === videoId,
                  )
                  setVideo(found || data?.videos?.[0] || null)
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
            <p className="text-sm text-slate-600">{video?.title}</p>
          </div>
          <div>
            <Label htmlFor="resource-type">Resource Type</Label>
            <select
              id="resource-type"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="picture">Picture</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div>
            <Label htmlFor="resource-file">New Resource File</Label>
            <input
              id="resource-file"
              type="file"
              accept={
                resourceType === 'video' ? 'video/*' :
                resourceType === 'audio' ? 'audio/*' :
                resourceType === 'picture' ? 'image/*' :
                '.pdf,.doc,.docx,.ppt,.pptx'
              }
              onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
            {resourceFile && (
              <p className="mt-1 text-xs text-slate-500">Selected: {resourceFile.name}</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}




