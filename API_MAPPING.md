# Backend-Frontend API Route Mapping

## Issues Found & Status

### ✅ Working Routes

#### User Routes (`/api/v1/user/*`)
- ✅ POST `/register` → Frontend: signup function
- ✅ POST `/login` → Frontend: login function
- ✅ GET `/logout` → Frontend: logout function (requires auth)
- ✅ POST `/refesh-token` → Available
- ✅ POST `/Updata-Password` → Available (typo in backend: "Updata")
- ✅ POST `/update-account` → Available
- ✅ POST `/change-profile` → Available

### ⚠️ Issues & Mismatches

#### 1. **Course Listing** (CRITICAL)
**Problem:** Frontend expects public course listing, but backend requires authentication

- **Frontend expects:** Public course browsing (homepage, all courses page)
  - `courseService.getAll()` → `GET /student/availabe-course`
  - `courseService.getMostViewed()` → `GET /student/availabe-course`
  
- **Backend requires:** JWT authentication via `varifyJwt` middleware
  - `/student/availabe-course` requires logged-in user
  
**Impact:** Unauthenticated users cannot browse courses on homepage

**Solution:** Add public course endpoint or make `/student/availabe-course` public

#### 2. **Instructor Course Listing**
**Problem:** Instructors reuse student endpoint instead of having their own

- **Frontend:** `instructorService.myCourses()` → `GET /student/availabe-course`
- **Expected:** Should get courses created by the instructor
- **Current:** Gets all available courses (not enrolled)

**Solution:** Add instructor-specific endpoint: `GET /instructor/my-courses`

#### 3. **Bank Routes Missing Auth**
**Security Risk:** Bank routes have NO authentication

- `POST /bank/addBankInfo` - No auth ❌
- `POST /bank/addBalace` - No auth ❌  
- `GET /bank/chackAccount` - No auth ❌

**Solution:** Add `varifyJwt` middleware to bank routes

#### 4. **Typos in Routes**
- Backend: `/student/availabe-course` (should be "available")
- Backend: `POST /Updata-Password` (should be "Update")
- Backend: `GET /bank/chackAccount` (should be "check")
- Backend: `POST /bank/addBalace` (should be "Balance")

#### 5. **Missing Endpoints**

**Admin routes:** Frontend has `adminService.stats()` but backend has no admin controller/routes

**Instructor approved students:**
- Frontend: `GET /instructor/approve-students/:courseId`
- Backend: Route doesn't exist

**Certificates:**
- Frontend: `learnerService.certificates()` - Not implemented
- Backend: No certificate routes

## Complete Route Mapping

### Backend Routes

#### User (`/api/v1/user`)
```
POST   /register
POST   /login
GET    /logout (auth)
POST   /refesh-token
POST   /Updata-Password (auth)
POST   /update-account (auth)
POST   /change-profile (auth)
```

#### Instructor (`/api/v1/instructor`)
```
POST   /add-course (auth)
PATCH  /updatecourseInfor/:id (auth)
PATCH  /updatecourseImage/:id (auth)
DELETE /deleteCourse/:id (auth)
POST   /course/:couserId/add-lecture (auth)
PATCH  /course/:couserId/updateLectureInfo/:id (auth)
PATCH  /course/:couserId/updateLectureResource/:id (auth)
DELETE /course/:couserId/deleteLecture/:id (auth)
POST   /course/enrolled/:id (auth)
```

#### Student (`/api/v1/student`)
```
GET /my-course (auth)
GET /availabe-course (auth) ⚠️ Should be public for browsing
```

#### Bank (`/api/v1/bank`)
```
POST /addBankInfo ⚠️ No auth
POST /addBalace ⚠️ No auth
GET  /chackAccount ⚠️ No auth
```

### Frontend API Calls

#### courseService
- `getAll()` → `GET /student/availabe-course` ⚠️
- `getMostViewed()` → `GET /student/availabe-course` ⚠️
- `getPublicDetails()` → `GET /student/availabe-course` ⚠️

#### learnerService
- `enroll()` → `POST /instructor/course/enrolled/:id` ✅
- `myCourses()` → `GET /student/my-course` ✅
- `courseContent()` → `GET /student/my-course` ✅
- `buyableCourses()` → `GET /student/availabe-course` ⚠️
- `updateBankInfo()` → `POST /bank/addBankInfo` ⚠️
- `getBalance()` → `GET /bank/chackAccount` ⚠️

#### instructorService
- `createCourse()` → `POST /instructor/add-course` ✅
- `addVideos()` → `POST /instructor/course/:id/add-lecture` ✅
- `deleteVideo()` → `DELETE /instructor/course/:id/deleteLecture/:id` ✅
- `myCourses()` → `GET /student/availabe-course` ❌ Wrong endpoint
- `courseDetails()` → Uses courseService ⚠️
- `approvedStudents()` → `GET /instructor/approve-students/:id` ❌ Doesn't exist
- `updateThumbnail()` → `PATCH /instructor/updatecourseImage/:id` ✅

## Priority Fixes

### High Priority
1. ✅ Add public course browsing endpoint
2. ✅ Add authentication to bank routes
3. ✅ Create instructor "my courses" endpoint

### Medium Priority
4. Fix typos in route names
5. Add admin routes and controller
6. Add approved students endpoint

### Low Priority
7. Implement certificate functionality
8. Add earnings chart for instructors
