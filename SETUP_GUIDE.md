# Setup Guide - Hostify by Abdullah

## Project Overview

Hostify by Abdullah is a full-stack apartment booking application built with:
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for image handling
- **Database**: MongoDB (MongoDB Atlas or Local)

## Required Software

Before starting, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **MongoDB** (choose one):
   - **Option A**: MongoDB Atlas (Cloud - Recommended)
     - Free account at: https://www.mongodb.com/cloud/atlas
   - **Option B**: MongoDB Community Server (Local)
     - Download from: https://www.mongodb.com/try/download/community

4. **Code Editor** (Optional but recommended)
   - Visual Studio Code: https://code.visualstudio.com/
   - Or any text editor of your choice

5. **API Testing Tool** (Optional)
   - Postman: https://www.postman.com/downloads/
   - Or any REST client

## Step-by-Step Installation

### Step 1: Clone or Download Project

If you have the project files, navigate to the project directory:
```bash
cd myweb
```

### Step 2: Install Backend Dependencies

Open terminal/command prompt in the project root directory and run:

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- dotenv
- multer
- jsonwebtoken
- bcryptjs
- cors

### Step 3: Set Up MongoDB

#### Option A: MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 - Free tier)
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password (save these!)
   - Set privileges to "Read and write to any database"
5. Whitelist IP address:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (for development)
6. Get connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string

#### Option B: Local MongoDB

1. Install MongoDB Community Server
2. Start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory (same level as `server.js`):

```env
# MongoDB Connection URI
# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hostify-apartments?retryWrites=true&w=majority

# For Local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/hostify-apartments

# Server Port
PORT=5000

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Expiration (optional, default is 7d)
JWT_EXPIRE=7d

# API Base URL (for frontend)
API_BASE_URL=http://localhost:5000/api
```

**Important Security Notes:**
- Replace `username` and `password` in MONGODB_URI with your actual MongoDB credentials
- Replace `JWT_SECRET` with a strong random string (at least 32 characters)
- Never commit `.env` file to version control

### Step 5: Create Initial Admin User

After starting the server, you can create an admin user via API:

**Using Postman or curl:**

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@hostify.com",
  "password": "admin123456",
  "role": "admin"
}
```

Or manually in MongoDB:
```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@hostify.com",
  password: "$2a$10$...", // Hashed password
  role: "admin",
  isActive: true
})
```

### Step 6: Start the Backend Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📍 API available at http://localhost:5000
```

### Step 7: Access the Frontend

1. Open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8000` (Python 3)
   - Or use Live Server extension in VS Code

2. The frontend will connect to the backend API automatically

## Project Structure

```
myweb/
├── .env                          # Environment variables (create this)
├── .gitignore                    # Git ignore file
├── package.json                  # Node.js dependencies
├── server.js                     # Main server file
├── SETUP_GUIDE.md               # This file
├── README.md                     # Project documentation
│
├── models/                       # Mongoose models
│   ├── User.js                  # User model (admin/user roles)
│   ├── Category.js              # Apartment category model
│   ├── Apartment.js             # Apartment model
│   └── Booking.js               # Booking model
│
├── routes/                       # Express routes
│   ├── authRoutes.js            # Authentication routes
│   ├── categoryRoutes.js        # Category CRUD routes
│   ├── apartmentRoutes.js       # Apartment CRUD routes (with file upload)
│   ├── bookingRoutes.js         # Booking CRUD routes
│   ├── mediaRoutes.js           # Media/file upload routes
│   └── searchRoutes.js          # Search functionality routes
│
├── middleware/                   # Express middleware
│   └── auth.js                  # JWT authentication middleware
│
├── utils/                        # Utility files
│   ├── apiService.js            # Frontend API service layer
│   └── loadingHandler.js        # Loading/error handling utilities
│
├── js/                           # Frontend JavaScript
│   └── api-integration.js       # Frontend-backend integration
│
├── uploads/                      # Uploaded images (created automatically)
│
├── assets/                       # Static assets
│   ├── logo/                    # Logo files
│   ├── banner/                  # Banner images
│   └── assetap*/                # Apartment images
│
└── *.html                        # Frontend HTML pages
    ├── index.html               # Homepage
    ├── apartment-detail.html    # Apartment detail page
    ├── admin.html               # Admin dashboard
    └── login.html               # Login page
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/update` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

### Categories (Admin only for CUD)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Apartments
- `GET /api/apartments` - Get all apartments (public)
- `GET /api/apartments/:id` - Get single apartment (public)
- `POST /api/apartments` - Create apartment (Admin, with file upload)
- `PUT /api/apartments/:id` - Update apartment (Admin)
- `DELETE /api/apartments/:id?cleanup=true` - Delete apartment (Admin, optional cleanup)

### Bookings
- `GET /api/bookings` - Get bookings (User sees own, Admin sees all)
- `GET /api/bookings/:id` - Get single booking (protected)
- `POST /api/bookings` - Create booking (User/Admin)
- `PUT /api/bookings/:id` - Update booking (User own/Admin any)
- `DELETE /api/bookings/:id` - Delete booking (User own/Admin any)

### Media
- `POST /api/media/upload` - Upload single image
- `POST /api/media/upload-multiple` - Upload multiple images
- `GET /api/media/files` - List all uploaded files
- `GET /api/media/:filename` - Get/download file
- `DELETE /api/media/:filename` - Delete file

### Search
- `GET /api/search` - Search apartments with filters
- `GET /api/search/categories` - Search categories
- `GET /api/search/bookings` - Search bookings

## Testing the Application

### 1. Test Backend API

Use Postman to test all endpoints:

1. **Register a user:**
   ```
   POST http://localhost:5000/api/auth/register
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. **Login:**
   ```
   POST http://localhost:5000/api/auth/login
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
   Save the token from response.

3. **Create category (with token):**
   ```
   POST http://localhost:5000/api/categories
   Headers: Authorization: Bearer YOUR_TOKEN
   {
     "name": "2 BHK",
     "description": "Two bedroom apartment"
   }
   ```

4. **Create apartment (with token and file upload):**
   ```
   POST http://localhost:5000/api/apartments
   Headers: Authorization: Bearer YOUR_TOKEN
   Body: form-data
   - title: "Test Apartment"
   - location: "Islamabad"
   - price: 15000
   - bedrooms: 2
   - bathrooms: 2
   - capacity: 4
   - category: CATEGORY_ID
   - mainImage: [FILE]
   ```

### 2. Test Frontend

1. Open `index.html` in browser
2. You should see apartments loaded from database
3. Click on an apartment to view details
4. Try booking functionality
5. Login as admin to access admin panel

## Common Issues and Solutions

### Issue: MongoDB Connection Failed
**Solution:**
- Check MongoDB URI in `.env` file
- Verify MongoDB is running (if local)
- Check network access in MongoDB Atlas
- Verify username/password are correct

### Issue: JWT Authentication Failed
**Solution:**
- Check JWT_SECRET is set in `.env`
- Verify token is being sent in Authorization header
- Check token hasn't expired

### Issue: File Upload Not Working
**Solution:**
- Check `uploads/` folder exists (created automatically)
- Verify file size is under 5MB
- Check file type is allowed (jpg, png, gif, webp)

### Issue: CORS Errors
**Solution:**
- CORS is enabled in server.js
- Verify frontend is accessing correct API URL
- Check API_BASE_URL in environment

### Issue: Port Already in Use
**Solution:**
- Change PORT in `.env` file
- Or kill the process using port 5000:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -ti:5000 | xargs kill`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-here` |
| `JWT_EXPIRE` | Token expiration time | `7d` (7 days) |
| `API_BASE_URL` | Frontend API base URL | `http://localhost:5000/api` |

## Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Update MONGODB_URI to production database
- [ ] Set proper CORS origins
- [ ] Update API_BASE_URL to production URL
- [ ] Remove or secure admin creation endpoint
- [ ] Set up proper file storage (S3, Cloudinary, etc.)
- [ ] Enable HTTPS
- [ ] Set up error logging
- [ ] Configure rate limiting
- [ ] Set up database backups

## Support

For issues or questions:
- Check the README.md for API documentation
- Review error messages in server console
- Verify all environment variables are set correctly
- Ensure all dependencies are installed

## License

ISC

