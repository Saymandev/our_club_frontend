# Our Club - Full-Stack Social Club Web Application

A comprehensive social club management platform built with the MERN stack, featuring modern UI/UX, real-time updates, and complete admin functionality.

![Our Club Preview](https://via.placeholder.com/1200x600/2563eb/ffffff?text=Our+Club+-+Social+Community+Platform)

## 🌟 Features

### 🏠 Public Features
- **Responsive Home Page** with hero section and mission statement
- **Real-time Announcements** with priority filtering
- **Historical Moments Gallery** showcasing club memories
- **Dark/Light Mode Toggle** with system preference detection
- **Mobile-First Design** optimized for all devices

### 🎯 Admin Dashboard
- **Secure Authentication** with JWT-based sessions
- **CRUD Operations** for announcements and historical moments
- **Media Management** with Cloudinary integration
- **Dashboard Analytics** with real-time statistics
- **Role-Based Access Control** (Admin/Moderator)

### 🔧 Technical Features
- **TypeScript** for type safety throughout the application
- **Responsive Design** with Tailwind CSS
- **State Management** using Zustand
- **Smooth Animations** with Framer Motion
- **RESTful API** with comprehensive error handling
- **File Upload** support for images and videos

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **React Hook Form** for form handling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Query** for API state management

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for media storage
- **Express Validator** for input validation
- **Bcrypt** for password hashing
- **CORS** and security middleware

## 📁 Project Structure

```
our_club/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   └── server.ts       # Main server file
│   ├── .env                # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── main.tsx        # App entry point
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **Cloudinary Account** (for media storage)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd our_club
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/our-club
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

#### Start the Backend Server
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration (Optional)
Create a `.env` file in the frontend directory for custom API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Start the Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Database Setup

#### MongoDB Collections
The application will automatically create the following collections:
- `users` - Admin users
- `announcements` - Club announcements
- `historicalmoments` - Club memories and moments

#### Create Initial Admin User
Use the registration endpoint or MongoDB directly to create your first admin user:

```bash
# Using the API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@ourclub.com",
    "password": "Admin123",
    "role": "admin"
  }'
```

## 🔐 Authentication & Demo Access

### Demo Credentials
For testing purposes, use these credentials on the login page:
- **Email:** admin@ourclub.com
- **Password:** Admin123

### API Authentication
The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user (admin only)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/update-password` - Update password

### Announcements Endpoints
- `GET /api/announcements` - Get published announcements (public)
- `GET /api/announcements/:id` - Get single announcement
- `GET /api/announcements/admin/all` - Get all announcements (admin)
- `POST /api/announcements` - Create announcement (admin)
- `PUT /api/announcements/:id` - Update announcement (admin)
- `DELETE /api/announcements/:id` - Delete announcement (admin)
- `PATCH /api/announcements/:id/toggle-publish` - Toggle publish status

### Historical Moments Endpoints
- `GET /api/historical-moments` - Get all moments (public)
- `GET /api/historical-moments/highlighted` - Get highlighted moments
- `GET /api/historical-moments/:id` - Get single moment
- `GET /api/historical-moments/admin/all` - Get all moments (admin)
- `POST /api/historical-moments` - Create moment (admin)
- `PUT /api/historical-moments/:id` - Update moment (admin)
- `DELETE /api/historical-moments/:id` - Delete moment (admin)

### Upload Endpoints
- `POST /api/upload/single` - Upload single file (admin)
- `POST /api/upload/multiple` - Upload multiple files (admin)

## 🎨 Customization

### Styling
The application uses Tailwind CSS with a custom design system:

- **Primary Colors:** Blue theme with custom palette
- **Typography:** Inter for body text, Poppins for headings
- **Dark Mode:** Automatic system detection with manual toggle
- **Responsive:** Mobile-first approach with custom breakpoints

### Theme Configuration
Modify `frontend/tailwind.config.js` to customize:
- Color schemes
- Typography
- Animations
- Responsive breakpoints

### Logo & Branding
- Replace logo in `frontend/src/components/Layout/Header.tsx`
- Update favicon and app icons in `frontend/public/`
- Modify app name and descriptions throughout the application

## 🚀 Deployment

### Backend Deployment (Node.js)

#### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-url
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-frontend-domain.com
```

#### Build and Deploy
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment (Static Files)

#### Build for Production
```bash
cd frontend
npm run build
```

#### Deploy to Static Hosting
The `dist` folder can be deployed to:
- **Vercel** - Zero-config deployment
- **Netlify** - Drag and drop deployment
- **GitHub Pages** - Free static hosting
- **AWS S3** - Scalable static hosting

### Database Deployment
- **MongoDB Atlas** - Cloud MongoDB service
- **Railway** - Simple database hosting
- **DigitalOcean** - Managed databases

## 🔧 Development

### Code Structure

#### Backend Architecture
- **MVC Pattern** - Models, Views (JSON), Controllers
- **Middleware Chain** - Authentication, validation, error handling
- **Service Layer** - Business logic separation
- **Utility Functions** - Reusable helper functions

#### Frontend Architecture
- **Component-Based** - Reusable UI components
- **Custom Hooks** - Shared state logic
- **Service Layer** - API communication
- **Store Management** - Zustand for global state

### Available Scripts

#### Backend
```bash
npm run dev        # Start development server with nodemon
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
```

#### Frontend
```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Coding Standards
- **TypeScript** for all new code
- **ESLint** configuration for consistent formatting
- **Conventional Commits** for commit messages
- **Component Documentation** with JSDoc comments

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### Backend won't start
- Check MongoDB connection
- Verify environment variables
- Ensure port 5000 is available

#### Frontend can't connect to API
- Verify backend is running on port 5000
- Check CORS configuration
- Verify API URL in frontend environment

#### Authentication issues
- Check JWT secret configuration
- Verify token expiration settings
- Ensure proper HTTPS in production

#### File upload failures
- Verify Cloudinary credentials
- Check file size limits (50MB default)
- Ensure proper file types (images/videos only)

### Support
For additional support, please:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed description

---

**Built with ❤️ for the community by the Our Club team** 