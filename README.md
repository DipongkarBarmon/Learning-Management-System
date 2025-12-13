This is the backend project of JavaScript

# Learning Management System — Backend

A Node.js + Express backend for a Learning Management System (LMS). It provides user authentication, course and lecture management, MCQ quizzes, student enrollments, instructor banking and transactions, and file uploads via Multer + Cloudinary.

## Tech Stack
- Node.js, Express
- MongoDB, Mongoose
- Multer (file uploads), Cloudinary (media storage)
- EJS views for simple pages
- JWT auth (access + refresh tokens)

## Project Structure
```
ProjectBackend/
	public/temp/                # Multer temp uploads
	src/
		app.js, index.js          # Server bootstrap
		constants.js              # Constants and configs
		controllers/              # Route handlers
		db/index.js               # DB connection
		middlewares/              # auth, multer
		models/                   # Mongoose schemas
		routes/                   # Express routers
		utils/                    # helpers (responses, errors, cloudinary)
		views/                    # EJS templates
```

## Prerequisites
- Node.js 18+
- MongoDB connection string
- Cloudinary account (cloud name, API key, secret)

## Environment Variables
Create a `.env` at project root with:
```
PORT=8000
MONGODB_URI=your-mongodb-uri
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ADMIN_ID=admin_user_object_id
```

## Install & Run
```bash
npm install
npm run dev
# or
npm start
```
Server starts at `http://localhost:8000`.

## Authentication
- Register: `POST /api/v1/user/register`
	- multipart/form-data: `avatar` file + fields `fullname,email,phone,password,role`
- Login: `POST /api/v1/user/login`
	- json: `email,password`
- Logout: `POST /api/v1/user/logout` (JWT required)
- Refresh: `POST /api/v1/user/refesh-token`

## File Uploads
- Multer writes to `public/temp/`, Cloudinary uploads file by `path`.
- Accepted fields by routes:
	- Course image: `image`
	- Lecture resource: `resource`
	- User avatar: `avatar`

Common client formats:
- JSON for metadata + files via multipart/form-data.
- For MCQ `options`, send JSON array (recommended) or comma-separated string.

## Core APIs (Examples)

### Courses
- Create course: `POST /api/v1/add-course` (JWT)
```bash
curl -X POST http://localhost:8000/api/v1/add-course \
	-H "Authorization: Bearer YOURTOKEN" \
	-F "image=@/path/to/image.png" \
	-F "title=My Course" -F "description=Desc" -F "price=10"
```
- Update course info: `PATCH /api/v1/updatecourseInfor/:id` (JWT)
- Update course image: `PATCH /api/v1/updatecourseImage/:id` (JWT, field `image`)
- Delete course: `DELETE /api/v1/deleteCourse/:id` (JWT)

### Lectures
- Add lecture: `POST /api/v1/course/:couserId/add-lecture` (JWT, field `resource`)
- Update lecture info: `PATCH /api/v1/course/updateLectureInfo/:id` (JWT)
- Update lecture resource: `PATCH /api/v1/course/updateLectureResource` (JWT)
	- multipart: `resource` + body: `lectureId, courseId, resourseType`
- Delete lecture: `DELETE /api/v1/course/:couserId/deleteLecture/:id` (JWT)

### MCQ
- Create MCQ: `POST /api/v1/mcq` (JWT instructor/admin)
```bash
curl -X POST http://localhost:8000/api/v1/mcq \
	-H "Authorization: Bearer YOURTOKEN" \
	-H "Content-Type: application/json" \
	-d '{
		"lectureId": "LECTURE_ID",
		"question": "Capital of France?",
		"options": ["Paris","Rome","Berlin","Madrid"],
		"correctAns": "Paris"
	}'
```
- List lecture MCQs: `GET /api/v1/mcq/:lectureId`

### Student
- My courses: `GET /api/v1/student/my-course` (JWT)
- Available courses: `GET /api/v1/student/availabe-course` (JWT)
- Enroll: `POST /api/v1/course/enrolled/:id` (JWT, body `secretKey`)

### Bank
- Setup bank: `POST /api/v1/bank/addBankInfo`
- Add balance: `POST /api/v1/bank/addBalace`
	- json: `balance, accountNumber, secretKey`
- Check account: `GET /api/v1/bank/chackAccount`
- Instructor validation (approve/reject): `POST /api/v1/bank/instructorValidation`
	- json: `courseId, status` (updates studentsEnrolled status from pending to status)

## Common Errors & Fixes
- MulterError: Unexpected field
	- Ensure client uses expected field names: `avatar`, `image`, `resource`.
- Avatar/Resource not found
	- Controllers expect `req.file.path` or scan `req.files`. Send as multipart.
- CastError: ObjectId
	- Ensure IDs are 24-char hex strings and correct param/body field names.
- bcrypt: data and hash arguments required
	- Use `bcrypt.compare(plaintext, hashed)` and fetch a single bank doc via `findOne`.
- MCQ options
	- Send `options` as JSON array or comma-separated; objects will be normalized via `text|label|value|option` keys.

## Development Notes
- JWT middleware `authorization.js` protects many routes.
- Cloudinary deletes previous media before upload where applicable.
- Use `arrayFilters` to update `studentsEnrolled` status in place.

## License
- Proprietary (no license specified).

