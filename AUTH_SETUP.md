# Auth0 Authentication Setup

This application uses NextAuth.js with Auth0 for authentication. Follow these steps to set up authentication:

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

## 3. Environment Variables

Create a `.env.local` file in the `boss-hunter-frontend` directory with the following variables:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Auth0 Configuration
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_ISSUER=https://your-domain.auth0.com
```

### Generate NEXTAUTH_SECRET

You can generate a secure secret using:
```bash
openssl rand -base64 32
```

## 4. Start the Application

```bash
npm run dev
```

## 5. Test Authentication

1. Visit `http://localhost:3000`
2. You should be redirected to the sign-in page
3. Click "Sign in with Auth0"
4. Complete the Auth0 authentication flow
5. You should be redirected back to the application

## Features

- **Protected Routes**: All routes except authentication pages require authentication
- **User Profile**: Shows user information and sign-out functionality
- **Custom Pages**: Custom sign-in, sign-out, and error pages
- **Session Management**: Automatic session handling with NextAuth.js

## Troubleshooting

- Make sure all environment variables are set correctly
- Verify Auth0 application settings match the URLs above
- Check browser console for any authentication errors
- Ensure the Auth0 domain is correct in the AUTH0_ISSUER variable 