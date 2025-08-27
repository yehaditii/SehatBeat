# Clinical Documentation Setup Guide

## Overview
The clinical documentation system allows users to create, manage, and organize their medical documents in a secure and structured way.

## Features
- **Document Creation**: Create new clinical documents with titles, content, categories, and tags
- **Document Management**: Edit, delete, and organize documents by category
- **Search & Filter**: Search through documents by title, content, or tags
- **Categories**: Organize documents into Consultation, Lab Report, Assessment, and other categories
- **Tags**: Add custom tags for better organization and priority marking
- **Privacy**: Mark documents as private for sensitive information
- **Statistics**: View document counts and statistics

## Backend Functions

### Core Functions
- `createClinicalDoc`: Create a new clinical document
- `getClinicalDocs`: Get all documents for a user
- `getClinicalDocById`: Get a specific document by ID
- `getClinicalDocsByCategory`: Get documents filtered by category
- `getClinicalDocStats`: Get document statistics and counts
- `updateClinicalDoc`: Update an existing document
- `deleteClinicalDoc`: Delete a document
- `seedClinicalDocs`: Seed sample documents for testing

### Database Schema
The `clinicalDocs` table includes:
- `userId`: Reference to the user who owns the document
- `title`: Document title
- `content`: Document content/text
- `category`: Document category (Consultation, Lab Report, Assessment, etc.)
- `tags`: Array of tags for organization
- `attachments`: Optional array of file URLs
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `doctorId`: Optional reference to a doctor
- `isPrivate`: Boolean for private documents

### Indexes
- `by_user`: For querying documents by user
- `by_user_and_category`: For filtering documents by user and category

## Frontend Components

### ClinicalDocs Page
The main page (`/clinical-docs`) provides:
- Document creation modal
- Document editing modal
- Category-based tabs (All, Consultations, Lab Reports, Assessments)
- Search functionality
- Statistics cards
- Document list with actions (edit, delete)

### UI Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button` with various variants
- `Badge` for tags and status
- `Input` for search and form fields
- `Textarea` for document content
- `Select` for category selection
- `Dialog` for modals
- `Tabs` for category navigation

## Usage

### Creating a Document
1. Click "New Document" button
2. Fill in title, category, content, and tags
3. Set privacy settings
4. Click "Create Document"

### Editing a Document
1. Click the edit icon on any document
2. Modify the fields as needed
3. Click "Update Document"

### Deleting a Document
1. Click the delete icon on any document
2. Confirm deletion in the popup

### Searching Documents
Use the search bar to find documents by:
- Document title
- Content text
- Tag names

### Filtering by Category
Use the tabs to view documents by category:
- All Documents: Shows all documents
- Consultations: Medical consultation notes
- Lab Reports: Laboratory test results
- Assessments: Medical assessments and evaluations

## Testing

### Seed Data
Use the `seedClinicalDocs` function to create sample documents:
```typescript
// In the Convex dashboard or via API call
await seedClinicalDocs({ userId: "your_user_id" });
```

### Sample Documents
The seed function creates:
- Cardiology consultation notes
- Lab results (blood count)
- Physical therapy assessment
- Dermatology follow-up
- Diabetes management plan

## Security Features
- User isolation: Users can only access their own documents
- Private documents: Mark sensitive documents as private
- Authentication required: All operations require user authentication

## Future Enhancements
- File upload support for attachments
- Document sharing with healthcare providers
- Advanced search and filtering
- Document templates
- Export functionality
- Integration with external medical systems

## Troubleshooting

### Common Issues
1. **Documents not loading**: Check if user is authenticated and has a profile
2. **Create/Edit not working**: Verify all required fields are filled
3. **Search not working**: Ensure search term is not empty
4. **Category filtering issues**: Check if documents have correct category values

### Debug Steps
1. Check browser console for errors
2. Verify Convex functions are properly deployed
3. Check database schema and indexes
4. Verify user authentication state

## API Reference

### createClinicalDoc
```typescript
await createClinicalDoc({
  userId: "user_id",
  title: "Document Title",
  content: "Document content...",
  category: "Consultation",
  tags: ["tag1", "tag2"],
  isPrivate: false,
  doctorId: "optional_doctor_id"
});
```

### getClinicalDocs
```typescript
const docs = await getClinicalDocs({ userId: "user_id" });
```

### updateClinicalDoc
```typescript
await updateClinicalDoc({
  docId: "document_id",
  updates: {
    title: "New Title",
    content: "Updated content...",
    tags: ["new", "tags"]
  }
});
```

### deleteClinicalDoc
```typescript
await deleteClinicalDoc({ docId: "document_id" });
```

