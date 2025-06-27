# Auth0 Authentication Setup

This application uses NextAuth.js with Auth0 for authentication and MongoDB for data storage. Follow these steps to set up authentication and database integration:

## 1. Create an Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application or use an existing one
3. Choose "Single Page Application" as the application type
4. Go to the "Settings" tab and note down:
   - Domain
   - Client ID
   - Client Secret

## 2. Configure Auth0 Application Settings

In your Auth0 application settings:

### Allowed Callback URLs:
```
http://localhost:3000/api/auth/callback/auth0
```

### Allowed Logout URLs:
```
http://localhost:3000
```

### Allowed Web Origins:
```
http://localhost:3000
```

## 3. Set Up MongoDB Database

### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string

### Option B: Local MongoDB
1. Install MongoDB locally
2. Start the MongoDB service
3. Use connection string: `mongodb://localhost:27017/boss-hunter`

## 4. Environment Variables

Create a `.env.local` file in the `boss-hunter-frontend` directory with the following variables:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Auth0 Configuration
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_ISSUER=https://your-domain.auth0.com

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Letta AI Configuration (for character generation)
LETTA_API_KEY=your-letta-api-key
LETTA_AGENT_ID=your-character-creator-agent-id
LETTA_IMAGE_AGENT_ID=your-image-generator-agent-id
```

### Generate NEXTAUTH_SECRET

You can generate a secure secret using:
```bash
openssl rand -base64 32
```

## 5. Backend Environment Variables

Create a `.env` file in the `boss-hunter-backend` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/boss-hunter
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/boss-hunter

# Letta AI Configuration
LETTA_API_KEY=your-letta-api-key
LETTA_AGENT_ID=your-character-creator-agent-id
LETTA_BOSS_AGENT_ID=your-boss-agent-id
LETTA_IMAGE_AGENT_ID=your-image-generator-agent-id

# Server Configuration
PORT=3001
```

## 6. Start the Application

1. Start the backend server:
```bash
cd boss-hunter-backend
npm install
npm start
```

2. Start the frontend application:
```bash
cd boss-hunter-frontend
npm install
npm run dev
```

## 7. Test Authentication

1. Visit `http://localhost:3000`
2. You should be redirected to the sign-in page
3. Click "Sign in with Auth0"
4. Complete the Auth0 authentication flow
5. You should be redirected back to the application
6. Your user data will be automatically stored in MongoDB

## Features

- **Protected Routes**: All routes except authentication pages require authentication
- **User Profile**: Shows user information and sign-out functionality
- **Custom Pages**: Custom sign-in, sign-out, and error pages
- **Session Management**: Automatic session handling with NextAuth.js
- **Database Integration**: User data, characters, and battle history stored in MongoDB
- **Character Management**: Create, edit, and manage characters
- **Battle History**: Track all battles with detailed statistics
- **User Statistics**: View win rates, battle counts, and achievements

## Data Flow

1. **User Login**: Auth0 authenticates user and provides session
2. **User Creation**: NextAuth callback creates/updates user in MongoDB
3. **Character Creation**: Characters are stored with user association
4. **Battle Recording**: All battles are automatically recorded with participant data
5. **Statistics**: Real-time calculation of user statistics and leaderboards

## Troubleshooting

- Make sure all environment variables are set correctly
- Verify Auth0 application settings match the URLs above
- Check MongoDB connection string and credentials
- Ensure backend server is running on port 3001
- Check browser console for any authentication errors
- Verify Letta AI API keys and agent IDs are correct

## API Integration

The frontend communicates with the backend API for:
- User management (create, update, retrieve)
- Character management (create, edit, delete)
- Battle history and statistics
- Global leaderboards and statistics

All API calls include user authentication via Auth0 session tokens. 