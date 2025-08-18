# SehatBeat Frontend Setup with Convex Integration

## Prerequisites

1. Node.js 18+ installed
2. Convex account and project created
3. Clerk account and application created

## Environment Setup

Create a `.env` file in the `frontend` directory with the following variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Convex Database
VITE_CONVEX_URL=your_convex_deployment_url_here

# Optional: AI Service (for AI Assistant)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## Installation Steps

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Backend (Convex)**
   ```bash
   cd ../backend
   npm run dev:backend
   ```

3. **Start the Frontend**
   ```bash
   cd ../frontend
   npm run dev
   ```

4. **Seed the Database**
   - Open your Convex dashboard
   - Go to the Functions tab
   - Run the `seedData` function to populate the database with sample medicines and doctors

## Database Schema

The application uses the following Convex tables:

- **users**: User profiles extending Clerk authentication
- **medicines**: Medicine catalog with categories and details
- **orders**: User medicine orders with status tracking
- **reminders**: Medication, appointment, and lab test reminders
- **labTests**: Scheduled and completed lab tests
- **doctors**: Doctor directory with specializations
- **clinicalDocs**: Clinical documentation and notes
- **conversations**: AI assistant chat history
- **appointments**: Doctor appointments
- **cartItems**: Shopping cart items

## Available Hooks

The application provides custom hooks for easy Convex integration:

- `useCurrentUser()`: Get current authenticated user
- `useMedicines(category?, search?)`: Get medicines with filtering
- `useCart()`: Shopping cart management
- `useReminders(activeOnly?)`: Reminder management
- `useLabTests()`: Lab test management
- `useDoctors(specialization?, location?)`: Doctor directory
- `useClinicalDocs()`: Clinical document management
- `useConversation()`: AI assistant conversations
- `useAppointments()`: Appointment booking
- `useOrders()`: Order management

## Features

### Real-time Updates
All data syncs automatically across devices using Convex's real-time subscriptions.

### Authentication
Seamless integration with Clerk for user authentication and profile management.

### File Storage
Built-in support for uploading lab reports and clinical documents.

### Type Safety
Full TypeScript support with generated types from Convex schema.

## Troubleshooting

1. **Convex URL not found**: Make sure your Convex project is deployed and the URL is correct
2. **Authentication issues**: Verify your Clerk publishable key is correct
3. **Database errors**: Check that the schema is properly deployed to Convex
4. **Real-time not working**: Ensure you're using the Convex provider in your app

## Next Steps

1. Customize the medicine catalog with your own products
2. Add more doctor specializations
3. Implement payment processing for orders
4. Add AI integration for the assistant
5. Set up email notifications for reminders
