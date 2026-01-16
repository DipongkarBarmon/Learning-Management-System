import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edulearn_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const handleRequest = async (promise) => {
  try {
    const { data } = await promise
    return data?.data || data
  } catch (err) {
    console.error('API Error:', {
      url: err?.config?.url,
      method: err?.config?.method,
      status: err?.response?.status,
      message: err?.response?.data?.message,
      data: err?.response?.data,
      error: err.message
    })
    const message = err?.response?.data?.message || err.message || 'Unable to reach server'
    throw new Error(message)
  }
}

// Course catalogue is public for browsing
export const courseService = {
  getAll: () => handleRequest(api.get('/student/public-courses')),
  getMostViewed: (limit) => handleRequest(api.get('/student/public-courses', { params: { limit } })),
  getByTitleGroup: () => handleRequest(api.get('/student/public-courses')),
  getPublicDetails: async (courseId) => {
    const list = await handleRequest(api.get('/student/public-courses'))
    return Array.isArray(list) ? list.find((c) => `${c._id}` === `${courseId}`) : null
  },
}

export const learnerService = {
  enroll: ({ courseId, provider, accountNumber, secretKey }) =>
    handleRequest(api.post(`/course/enrolled/${courseId}`, { provider, accountNumber, secretKey })),
  myCourses: () => handleRequest(api.get('/student/my-course')),
  pendingCourses: () => handleRequest(api.get('/student/pending-courses')),
  courseContent: async (courseId) => {
    if (!courseId || courseId === 'undefined') {
      throw new Error('Course ID is required')
    }
    const course = await handleRequest(api.get(`/student/course/${courseId}/content`))
    return { course, yourProgress: course?.progress || 0 }
  },
  updateProgress: () => Promise.resolve(null),
  buyableCourses: () => handleRequest(api.get('/student/availabe-course')),
  // Bank functions for students
  updateBankInfo: (payload) => handleRequest(api.post('/bank/addBankInfo', payload)),
  addBalance: (payload) => handleRequest(api.post('/bank/addBalace', payload)),
  getBalance: () => handleRequest(api.get('/bank/chackAccount')),
  // Certificate functions
  certificates: () => handleRequest(api.get('/student/certificates')),
  getCertificate: (certificateId) => handleRequest(api.get(`/student/certificate/${certificateId}`)),
  generateCertificate: (courseId) => handleRequest(api.post(`/student/course/${courseId}/generate-certificate`)),
  getCourseProgress: (courseId) => handleRequest(api.get(`/student/course/${courseId}/progress`)),
  markLectureComplete: (courseId, lectureId) => handleRequest(api.post(`/student/course/${courseId}/lecture/${lectureId}/complete`)),
  // MCQ functions for learners
  getLectureMcqs: (lectureId) => handleRequest(api.get(`/instructor/get-mcq/${lectureId}`)),
}

export const instructorService = {
  createCourse: (formData) =>
    handleRequest(
      api.post('/course/add-course', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
  updateCourse: (courseId, payload) =>
    handleRequest(api.patch(`/course/updatecourseInfor/${courseId}`, payload)),
  addVideos: (courseId, formData) =>
    handleRequest(
      api.post(`/course/${courseId}/add-lecture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
  addResources: (courseId, resources) =>
    handleRequest(api.post(`/course/${courseId}/add-lecture`, resources)),
  deleteVideo: (courseId, videoId) => handleRequest(api.delete(`/course/${courseId}/deleteLecture/${videoId}`)),
  deleteResource: (courseId, resourceId) => handleRequest(api.delete(`/course/${courseId}/deleteLecture/${resourceId}`)),
  updateLectureInfo: (lectureId, payload) =>
    handleRequest(api.patch(`/course/updateLectureInfo/${lectureId}`, payload)),
  updateLectureResource: (formData) =>
    handleRequest(
      api.patch('/course/updateLectureResource', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
  // Download lecture resource through server proxy
  downloadResource: (lectureId) => `/api/v1/course/lecture/${lectureId}/download`,
  myCourses: () => handleRequest(api.get('/instructor/my-course')),
  earningsChart: () => Promise.resolve([]),
  courseDetails: (courseId) => handleRequest(api.get(`/instructor/course/${courseId}/details`)),
  pendingEnrollments: () => handleRequest(api.get('/instructor/pending-enrollments')),
  approveEnrollment: (courseId, studentId) => 
    handleRequest(api.post('/bank/instructor-validation', { courseId, studentId, status: 'approved' })),
  rejectEnrollment: (courseId, studentId) => 
    handleRequest(api.post('/bank/instructor-validation', { courseId, studentId, status: 'rejected' })),
  approvedStudents: (courseId) => Promise.resolve([]),
  updateThumbnail: (courseId, formData) =>
    handleRequest(
      api.patch(`/course/updatecourseImage/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
  // Bank functions for instructors
  updateBankInfo: (payload) => handleRequest(api.post('/bank/addBankInfo', payload)),
  addBalance: (payload) => handleRequest(api.post('/bank/addBalace', payload)),
  getBalance: () => handleRequest(api.get('/bank/chackAccount')),
  getTransactions: () => handleRequest(api.get('/bank/get-transaction')),
  // MCQ functions for instructors
  createMcq: (payload) => handleRequest(api.post('/instructor/create-mcq', payload)),
  getLectureMcqs: (lectureId) => handleRequest(api.get(`/instructor/get-mcq/${lectureId}`)),
  updateMcq: (mcqId, payload) => handleRequest(api.patch(`/instructor/update-mcq/${mcqId}`, payload)),
  deleteMcq: (mcqId) => handleRequest(api.delete(`/instructor/delete-mcq/${mcqId}`)),
}

export const adminService = {
  stats: () => Promise.resolve({}),
  // Bank functions for admin
  updateBankInfo: (payload) => handleRequest(api.post('/bank/addBankInfo', payload)),
  addBalance: (payload) => handleRequest(api.post('/bank/addBalace', payload)),
  getBalance: () => handleRequest(api.get('/bank/chackAccount')),
  // Transaction functions for admin
  getAllTransactions: () => handleRequest(api.get('/bank/all-transactions')),
  // User management for admin
  getAllUsers: () => handleRequest(api.get('/user/all-users')),
  getAllCourses: () => handleRequest(api.get('/instructor/all-course')),
}

// User profile service - available for all authenticated users
export const userService = {
  updatePassword: (payload) => handleRequest(api.post('/user/update-password', payload)),
  updateAccount: (payload) => handleRequest(api.post('/user/update-account', payload)),
  updateAvatar: (formData) => handleRequest(
    api.post('/user/change-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  ),
}

export default api


