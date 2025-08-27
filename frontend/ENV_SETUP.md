# Environment Setup for SehatBeat Frontend

## Problem
The clinical documents are not being created because the user authentication is not working. This happens when the required environment variables are not set up.

## Solution
You need to create a `.env` file in the `frontend` directory with the following variables:

### 1. Create `.env` file
Create a file named `.env` in the `frontend` directory (same level as `package.json`).

### 2. Add Required Variables
```env
# Clerk Authentication (Required for user login)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# Convex Database (Required for data storage)
VITE_CONVEX_URL=https://your-project.convex.cloud
```

### 3. Get Your Keys

#### Clerk Authentication Key:
1. Go to [clerk.com](https://clerk.com)
2. Sign up or log in
3. Create a new application
4. Go to "API Keys" in the sidebar
5. Copy the "Publishable key" (starts with `pk_test_`)

#### Convex URL:
1. Go to [convex.dev](https://convex.dev)
2. Sign up or log in
3. Create a new project
4. Copy the deployment URL (looks like `https://your-project.convex.cloud`)

### 4. Restart Development Server
After creating the `.env` file, restart your development server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 5. Test Authentication
1. Open the Clinical Docs page
2. You should see a "Sign In" button in the top navigation
3. Click it and sign in with your email
4. The debug information should show "User Loaded: Yes"
5. Now you should be able to create clinical documents

## Alternative: Test Without Authentication
If you want to test the document creation without setting up authentication, you can temporarily modify the code to use a mock user ID. However, this is not recommended for production.

## Troubleshooting
- **"User not loaded" error**: Check that your `.env` file is in the correct location
- **"Convex URL not found"**: Verify your Convex project is deployed and the URL is correct
- **"Clerk key invalid"**: Make sure you copied the publishable key, not the secret key

## Next Steps
Once authentication is working:
1. Create your first clinical document
2. Set up additional environment variables for AI features
3. Customize the application for your needs


