import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { instructorService } from '../../services/api.js'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Textarea } from '../ui/textarea.jsx'
import { useToast } from '../../hooks/useToast.js'

export const LaunchCoursePage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    lumpSumPayment: "",
  })

  const [numVideos, setNumVideos] = useState(0)
  const [videos, setVideos] = useState([])

  // Syllabus State
  const [syllabus, setSyllabus] = useState([])

  // Resources State
  const [resources, setResources] = useState([])

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const allFilled = videos.every((v) => v.title && v.duration && v.file)
    if (!allFilled) {
      setError("Please complete all video fields before submitting.")
      setIsSubmitting(false)
      return
    }

    const cleanedResources = resources
      .map((resource) => ({
        title: resource.title.trim(),
        mediaType: resource.mediaType.trim(),
        url: resource.url.trim(),
      }))
      .filter((resource) => resource.title || resource.mediaType || resource.url)

    const cleanedSyllabus = syllabus
      .map(s => ({ title: s.title.trim(), description: s.description.trim() }))
      .filter(s => s.title)

    const fd = new FormData()
    fd.append("title", form.title)
    fd.append("description", form.description)
    fd.append("price", form.price)
    fd.append("lumpSumPayment", form.lumpSumPayment)

    if (form.thumbnail) {
      fd.append("thumbnail", form.thumbnail)
    }

    fd.append("videoTitles", JSON.stringify(videos.map(v => v.title)))
    fd.append("videoDurations", JSON.stringify(videos.map(v => Number(v.duration))))

    videos.forEach((v) => fd.append("files", v.file))

    if (cleanedResources.length) {
      fd.append("resources", JSON.stringify(cleanedResources))
    }

    if (cleanedSyllabus.length) {
      fd.append("syllabus", JSON.stringify(cleanedSyllabus))
    }

    try {
      await instructorService.createCourse(fd)
      setSuccess("Course launched successfully!")
      showToast({
        type: 'success',
        title: 'Course created',
        message: 'Your course is live for learners.',
      })
      setTimeout(() => navigate('/dashboard/instructor'), 1500)
    } catch (err) {
      setError(err.message)
      showToast({
        type: 'error',
        title: 'Unable to launch course',
        message: err.message,
      })
      setIsSubmitting(false)
    }
  }

  const addResource = () => {
    setResources([...resources, { title: "", mediaType: "", url: "" }])
  }

  const addSyllabusItem = () => {
    setSyllabus([...syllabus, { title: "", description: "" }])
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Launch New Course</h1>
      <p className="text-slate-500 mb-6">Upload videos and publish your course.</p>

      {error && <div className="mb-4 rounded-lg bg-orange-50 p-4 text-orange-800">{error}</div>}
      {success && <div className="p-4 bg-emerald-100 text-emerald-700 rounded-lg mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Basic Info */}
        <div className="space-y-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Basic Information</h2>
          <Input placeholder="Course Title" required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea placeholder="Course Description" rows={3} required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" placeholder="Price ($)" required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input type="number" placeholder="Lump Sum Payment ($)" required
              value={form.lumpSumPayment}
              onChange={(e) => setForm({ ...form, lumpSumPayment: e.target.value })}
            />
          </div>
          <div>
            <label className="font-medium block mb-2 text-sm text-slate-600">Course Thumbnail (Optional)</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })}
                />
              </label>
              {form.thumbnail && <span className="text-sm text-slate-600">{form.thumbnail.name}</span>}
            </div>
          </div>
        </div>

        {/* Syllabus Section */}
        <div className="space-y-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800">Syllabus / Curriculum</h2>
            <Button type="button" variant="outline" size="sm" onClick={addSyllabusItem}>+ Add Topic</Button>
          </div>
          {syllabus.length === 0 && <p className="text-sm text-slate-500 italic">No syllabus topics added yet.</p>}
          {syllabus.map((item, i) => (
            <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3">
              <Input
                placeholder={`Topic ${i + 1} Title`}
                value={item.title}
                onChange={(e) => {
                  const s = [...syllabus]
                  s[i].title = e.target.value
                  setSyllabus(s)
                }}
              />
              <Textarea
                placeholder="What will be covered in this topic?"
                rows={2}
                value={item.description}
                onChange={(e) => {
                  const s = [...syllabus]
                  s[i].description = e.target.value
                  setSyllabus(s)
                }}
              />
            </div>
          ))}
        </div>

        {/* Video Upload Section */}
        <div className="space-y-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Course Videos</h2>
          <div>
            <label className="font-medium text-sm text-slate-600 mb-2 block">How many videos?</label>
            <Input
              type="number"
              min="1"
              value={numVideos}
              onChange={(e) => {
                const count = Number(e.target.value)
                setNumVideos(count)
                setVideos(Array.from(
                  { length: count },
                  () => ({ title: "", duration: "", file: null })
                ))
              }}
            />
          </div>

          {videos.map((v, i) => (
            <div key={i} className="p-5 border border-indigo-100 rounded-xl bg-indigo-50/30 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-indigo-900">Video {i + 1}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Video Title"
                  value={v.title}
                  onChange={(e) => {
                    const c = [...videos]
                    c[i].title = e.target.value
                    setVideos(c)
                  }}
                />
                <Input type="number" placeholder="Duration (seconds)"
                  value={v.duration}
                  onChange={(e) => {
                    const c = [...videos]
                    c[i].duration = e.target.value
                    setVideos(c)
                  }}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className={`
                  flex items-center justify-center px-4 py-2 rounded-lg cursor-pointer transition-all
                  ${v.file ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}
                `}>
                  <span className="text-sm font-medium">{v.file ? 'Change Video' : 'Select Video File'}</span>
                  <input type="file" accept="video/*" className="hidden"
                    onChange={(e) => {
                      const c = [...videos]
                      c[i].file = e.target.files[0]
                      setVideos(c)
                    }}
                  />
                </label>
                {v.file ? (
                  <span className="text-sm text-emerald-600 font-medium truncate max-w-xs">
                    ✓ {v.file.name}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400 italic">No file selected</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resources Section */}
        <div className="space-y-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800">Additional Resources</h2>
            <Button type="button" variant="outline" size="sm" onClick={addResource}>+ Add Resource</Button>
          </div>
          {resources.map((r, i) => (
            <div key={i} className="p-4 border border-green-100 rounded-xl bg-green-50/30 grid md:grid-cols-3 gap-3">
              <Input placeholder="Title"
                value={r.title}
                onChange={(e) => {
                  const c = [...resources]
                  c[i].title = e.target.value
                  setResources(c)
                }}
              />
              <Input placeholder="Type (e.g. pdf)"
                value={r.mediaType}
                onChange={(e) => {
                  const c = [...resources]
                  c[i].mediaType = e.target.value
                  setResources(c)
                }}
              />
              <Input placeholder="URL"
                value={r.url}
                onChange={(e) => {
                  const c = [...resources]
                  c[i].url = e.target.value
                  setResources(c)
                }}
              />
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full py-4 text-lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Uploading Course Content...</span>
            </div>
          ) : (
            "Launch Course"
          )}
        </Button>
      </form>
    </div>
  )
}
