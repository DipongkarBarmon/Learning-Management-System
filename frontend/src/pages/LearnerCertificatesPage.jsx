import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { Award, Download, Eye, X } from 'lucide-react'
import html2canvas from 'html2canvas'

// Certificate Component - Kaggle-style design
const CertificateView = ({ certificate, onClose }) => {
  const certificateRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownload = async () => {
    const element = certificateRef.current
    if (!element) return

    setDownloading(true)
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      })
      
      const link = document.createElement('a')
      link.download = `${certificate.courseTitle}-certificate.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: print the certificate
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate */}
        <div 
          ref={certificateRef}
          className="relative aspect-[1.414/1] w-full bg-white p-8 print:p-12"
          style={{ minHeight: '500px' }}
        >
          {/* Decorative corner shapes - Kaggle style */}
          <div className="absolute right-0 top-0 h-64 w-64 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-yellow-400"></div>
            <div className="absolute right-8 top-16 h-40 w-40 rounded-full bg-emerald-500"></div>
            <div className="absolute -right-8 top-32 h-32 w-32 rounded-full bg-cyan-400"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-8 w-8 text-cyan-600" />
                <span className="text-2xl font-bold text-cyan-600">LMS ORG</span>
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                Certificate of Completion
              </p>
            </div>

            {/* Main content */}
            <div className="my-8 space-y-6">
              <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
                {certificate.studentName}
              </h1>
              <p className="text-sm uppercase tracking-[0.15em] text-slate-500">
                Has successfully completed the course
              </p>
              <h2 className="text-2xl font-semibold text-slate-800 md:text-3xl">
                {certificate.courseTitle}
              </h2>
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">
                  ON {formatDate(certificate.completionDate).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Footer with signatures */}
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="space-y-1">
                <div className="h-12 w-40">
                  {/* Signature placeholder - cursive style */}
                  <p className="font-serif text-2xl italic text-slate-700">
                    {certificate.instructorName?.split(' ')[0] || 'Instructor'}
                  </p>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <p className="text-xs font-medium uppercase text-slate-600">
                    {certificate.instructorName}
                  </p>
                  <p className="text-xs text-slate-500">Course Instructor</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-12 w-40">
                  <p className="font-serif text-2xl italic text-slate-700">LMS ORG</p>  
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <p className="text-xs font-medium uppercase text-slate-600">
                    LMS ORG Platform
                  </p>
                  <p className="text-xs text-slate-500">Learning Management System</p>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="text-right">
                <p className="text-xs text-slate-400">Certificate ID</p>
                <p className="font-mono text-xs text-slate-600">{certificate.certificateId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 border-t border-slate-100 bg-slate-50 p-4">
          <Button onClick={handleDownload} disabled={downloading}>
            <Download className="mr-2 h-4 w-4" />
            {downloading ? 'Downloading...' : 'Download Certificate'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export const LearnerCertificatesPage = () => {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewCertificate, setViewCertificate] = useState(null)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await learnerService.certificates()
        setCertificates(Array.isArray(data) ? data : [])
      } catch (err) {
        showToast({ type: 'error', title: 'Unable to load certificates', message: err.message })
        setCertificates([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading certificates...</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Achievements</p>
          <h1 className="text-3xl font-semibold text-slate-900">Your Certificates</h1>
          <p className="text-sm text-slate-500">View and download certificates you've earned by completing courses.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/learner')}>
          Back to dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Award className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">{certificates.length}</p>
          <p className="text-sm text-slate-500">Certificates Earned</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Award className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">{certificates.length}</p>
          <p className="text-sm text-slate-500">Courses Completed</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Award className="mx-auto h-8 w-8 text-cyan-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {certificates.length > 0 
              ? formatDate(certificates[0]?.completionDate) 
              : '-'
            }
          </p>
          <p className="text-sm text-slate-500">Latest Achievement</p>
        </div>
      </div>

      <DashboardSection
        title="All Certificates"
        description="Click on a certificate to view and download it."
      >
        {certificates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <div 
                key={cert._id || cert.certificateId} 
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                {/* Mini certificate preview */}
                <div className="relative aspect-[1.5/1] overflow-hidden bg-gradient-to-br from-slate-50 to-white p-6">
                  {/* Decorative elements */}
                  <div className="absolute right-0 top-0 h-24 w-24 overflow-hidden">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-400/30"></div>
                    <div className="absolute right-4 top-6 h-16 w-16 rounded-full bg-emerald-500/30"></div>
                    <div className="absolute right-0 top-12 h-12 w-12 rounded-full bg-cyan-400/30"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-cyan-600" />
                      <span className="text-xs font-semibold text-cyan-600">LearnHub</span>
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Certificate of Completion</p>
                    <h3 className="mt-3 text-lg font-bold text-slate-900 line-clamp-1">{cert.studentName}</h3>
                    <p className="mt-1 text-sm font-medium text-slate-700 line-clamp-1">{cert.courseTitle}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(cert.completionDate)}</p>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/60 group-hover:opacity-100">
                    <Button 
                      onClick={() => setViewCertificate(cert)}
                      className="transform scale-90 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Certificate
                    </Button>
                  </div>
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs text-slate-500">Instructor</p>
                    <p className="text-sm font-medium text-slate-700">{cert.instructorName}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setViewCertificate(cert)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <Award className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700">No Certificates Yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Complete all lectures in a course to earn your certificate.
            </p>
            <Button 
              className="mt-6" 
              onClick={() => navigate('/dashboard/learner/courses')}
            >
              View My Courses
            </Button>
          </div>
        )}
      </DashboardSection>

      {/* Certificate View Modal */}
      {viewCertificate && (
        <CertificateView 
          certificate={viewCertificate} 
          onClose={() => setViewCertificate(null)} 
        />
      )}
    </div>
  )
}

export default LearnerCertificatesPage
