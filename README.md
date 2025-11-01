# AI-Powered Full-Stack Code Generator

A web-based application that generates complete full-stack web applications from natural language descriptions using OpenAI's API.

## Features

- **User Authentication**: Secure email/password registration and login with JWT tokens
- **Code Generation**: Generate React frontend + Node.js/Python backend code from natural language prompts
- **Code Preview**: File explorer and syntax-highlighted code viewer
- **Refinement**: Iteratively improve generated code with follow-up prompts
- **Export**: Download generated code as ZIP or JSON
- **History**: View and manage past generations
- **Multi-Framework Support**: Choose between Node.js (Express) and Python (FastAPI) for backend

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Fetch API for HTTP requests
- CSS for styling

### Backend
- Node.js with Express.js
- PostgreSQL for data persistence
- JWT for authentication
- Bcrypt for password hashing
- OpenAI API integration
- Archiver for ZIP export

### Infrastructure
- Docker & Docker Compose for containerization
- PostgreSQL 14 database

## Getting Started

### Prerequisites
- Node.js 18+ or Docker & Docker Compose
- OpenAI API key (get one at https://platform.openai.com/api-keys)
- PostgreSQL 14+ (if running without Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd compyle-matrix-multiplier
   ```

2. **Set up environment variables**
   ```bash
   # Copy and update backend .env
   cp backend/.env.example backend/.env
   # Add your OpenAI API key to backend/.env

   # Copy and update frontend .env
   cp frontend/.env.example frontend/.env
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Manual Setup (Without Docker)

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your values**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/code_generator
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   OPENAI_API_KEY=sk-your-openai-api-key-here
   NODE_ENV=development
   PORT=3001
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Generations
- `POST /api/generations` - Create new generation
- `GET /api/generations` - List user's projects
- `GET /api/generations/:id` - Get specific project
- `POST /api/generations/:id/refine` - Refine generated code
- `POST /api/generations/:id/export` - Export code (ZIP or JSON)

## Project Structure

```
compyle-matrix-multiplier/
├── backend/
│   ├── src/
│   │   ├── routes/              # Express route handlers
│   │   ├── services/            # Business logic (AI, code parsing)
│   │   ├── db/
│   │   │   ├── models/          # Database models
│   │   │   └── migrate.ts       # Migration runner
│   │   ├── middleware/          # Auth middleware
│   │   ├── utils/               # JWT utilities
│   │   ├── config/              # Database config
│   │   └── index.ts             # Express app entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API service
│   │   ├── App.tsx              # Root component
│   │   └── index.tsx            # React entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── migrations/              # SQL migration files
├── docker-compose.yml
└── README.md
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Generations Table
```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  initial_prompt TEXT NOT NULL,
  generated_code JSONB NOT NULL,
  frontend_framework VARCHAR(50) DEFAULT 'react',
  backend_framework VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  refinements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage

### Creating a Code Generation

1. **Login or Sign Up**
   - Navigate to `/login` and create an account or login

2. **Generate Code**
   - Click "New Generation" on the dashboard
   - Enter a natural language description of your app
   - Select backend framework (Node.js or Python)
   - Click "Generate Code"

3. **Preview Code**
   - View generated files in the file explorer
   - Click files to view their contents
   - Copy files to clipboard as needed

4. **Refine Code**
   - Enter a refinement prompt (e.g., "Add a delete button")
   - Click "Refine" to update the code
   - Changes are reflected in real-time

5. **Export Code**
   - Click "Download ZIP" to export as a complete project
   - Or click "Export JSON" to get the structured data

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `OPENAI_API_KEY` - Your OpenAI API key
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001/api)

## Error Handling

### Common Errors

**"Code generation failed"**
- Check that OpenAI API key is valid
- Ensure you have sufficient API quota
- Try with a simpler prompt

**"Email already in use"**
- Use a different email for signup
- Try logging in if you already have an account

**"Not authenticated"**
- Login required
- Check that JWT token is stored in localStorage
- Token may have expired

## Development

### Running Tests

```bash
# Backend
cd backend
npm run typecheck

# Frontend
cd frontend
npm run build
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the build/ directory with a static server
```

## Deployment

### Docker Deployment

1. **Build images**
   ```bash
   docker-compose build
   ```

2. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Cloud Deployment Options

- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, Railway, AWS Lambda, DigitalOcean
- **Database**: AWS RDS, Heroku Postgres, Railway

## Performance Optimization

- Rate limiting on `/api/generations` to prevent abuse
- Pagination for project list (default: 20 per page)
- Async code generation with status polling
- ZIP export streaming to handle large files
- React component memoization for list items

## Security Considerations

- Password hashing with bcrypt (salt rounds: 10)
- JWT token expiration: 7 days
- CORS configuration for cross-origin requests
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- HTTPS recommended for production

## Known Limitations

- OpenAI API costs apply to each generation
- Generated code requires customization for production
- Python backend generation may require additional setup
- Large projects may exceed LLM token limits

## Future Enhancements

- Multiple LLM provider support (Anthropic, Google, etc.)
- Custom code templates
- Team collaboration
- Git integration
- Code diff viewer
- Performance analytics
- User project templates

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run `npm run db:migrate` to initialize schema
- Check OpenAI API key format

### Frontend can't connect to API
- Verify REACT_APP_API_URL in .env
- Check backend is running on correct port
- Look for CORS errors in browser console
- Check network tab for API requests

### Database connection fails
- Verify PostgreSQL service is running
- Check connection string (host, port, credentials)
- Ensure database name exists
- Check firewall/network access

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and environment details

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Changelog

### v1.0.0 (Initial Release)
- User authentication system
- Code generation with OpenAI
- Code preview and refinement
- ZIP export functionality
- Project history and management
- Multi-backend support (Node.js and Python)