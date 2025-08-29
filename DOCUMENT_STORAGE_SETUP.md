# Document Storage System Setup Guide

## Overview

This document storage system provides a secure, scalable solution for storing and managing medical documents, prescriptions, lab results, insurance documents, and other important files in your SehatBeat application. The system is built on Convex's secure storage infrastructure with comprehensive access control and metadata management.

## Features

### 🔒 Security & Privacy
- **User-based access control**: Documents are only accessible to their owners
- **Sharing capabilities**: Controlled document sharing with other users
- **Privacy settings**: Public/private document visibility options
- **Audit trail**: Track who uploaded, when, and modifications

### 📁 Document Categories
- **Medical Records**: Patient history, diagnoses, treatment plans
- **Prescriptions**: Medication prescriptions and dosage instructions
- **Lab Results**: Test results, blood work, imaging reports
- **Insurance**: Insurance cards, policy documents, claims
- **ID Documents**: Driver's license, passport, government IDs
- **Other**: Miscellaneous medical documents

### 🏷️ Metadata & Organization
- **Rich metadata**: File type, size, upload date, expiry dates
- **Tagging system**: Flexible tagging for easy organization
- **Search capabilities**: Full-text search across titles, descriptions, and tags
- **Category filtering**: Organize documents by medical category

## Database Schema

### Documents Table Structure

```typescript
documents: defineTable({
  userId: v.id("users"),                    // Document owner
  title: v.string(),                        // Document title
  description: v.optional(v.string()),      // Document description
  fileName: v.string(),                     // Original filename
  fileType: v.string(),                     // MIME type
  fileSize: v.number(),                     // File size in bytes
  storageId: v.id("_storage"),              // Convex storage reference
  category: v.union(...),                   // Document category
  tags: v.array(v.string()),                // Searchable tags
  isPrivate: v.boolean(),                   // Privacy setting
  uploadedAt: v.number(),                   // Upload timestamp
  lastModified: v.number(),                 // Last modification
  metadata: v.optional(v.object({...})),    // Extended metadata
  accessControl: v.optional(v.object({...})), // Sharing settings
})
```

### Indexes for Performance

- `by_user`: Quick access to user's documents
- `by_user_and_category`: Filter by user and category
- `by_user_and_upload_date`: Sort by upload date
- `by_category`: Category-based queries
- `by_file_type`: File type filtering

## API Endpoints

### HTTP Endpoints

#### 1. File Upload
```
POST /upload
Content-Type: multipart/form-data

Form fields:
- file: The file to upload
- userId: User ID (Convex ID)
- title: Document title
- description: Document description (optional)
- category: Document category
- tags: Comma-separated tags (optional)
- isPrivate: "true" or "false"
```

**Response:**
```json
{
  "success": true,
  "documentId": "convex_document_id",
  "message": "Document uploaded successfully"
}
```

#### 2. File Download
```
GET /download/:documentId?userId=:userId

Parameters:
- documentId: Document ID from Convex
- userId: User ID for access control
```

#### 3. Document Information
```
GET /document/:documentId?userId=:userId

Parameters:
- documentId: Document ID from Convex
- userId: User ID for access control
```

#### 4. Health Check
```
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Convex Functions

#### Document Management

```typescript
// Upload a document
const uploadResult = await convex.mutation(api.documents.saveDocumentMetadata, {
  userId: "user_id",
  title: "Document Title",
  description: "Document description",
  fileName: "filename.pdf",
  fileType: "application/pdf",
  fileSize: 1024000,
  storageId: "storage_id",
  category: "medical_record",
  tags: ["tag1", "tag2"],
  isPrivate: true,
});

// Get user documents
const documents = await convex.query(api.documents.getUserDocuments, {
  userId: "user_id",
  category: "medical_record", // optional
  limit: 10, // optional
});

// Search documents
const searchResults = await convex.query(api.documents.searchDocuments, {
  userId: "user_id",
  query: "blood test",
  category: "lab_result", // optional
  tags: ["urgent"], // optional
});

// Update document
const updateResult = await convex.mutation(api.documents.updateDocument, {
  documentId: "document_id",
  userId: "user_id",
  title: "Updated Title",
  description: "Updated description",
});

// Delete document
const deleteResult = await convex.mutation(api.documents.deleteDocument, {
  documentId: "document_id",
  userId: "user_id",
});
```

#### Document Sharing

```typescript
// Share document with other users
const shareResult = await convex.mutation(api.documents.shareDocument, {
  documentId: "document_id",
  userId: "user_id",
  sharedWithUserIds: ["user2_id", "user3_id"],
  requireApproval: false,
});

// Revoke access
const revokeResult = await convex.mutation(api.documents.revokeDocumentAccess, {
  documentId: "document_id",
  userId: "user_id",
  userIdsToRevoke: ["user2_id"],
});
```

#### Statistics & Analytics

```typescript
// Get document statistics
const stats = await convex.query(api.documents.getDocumentStats, {
  userId: "user_id",
});

// Response includes:
// - totalDocuments: Total number of documents
// - totalSize: Total storage used in bytes
// - documentsByCategory: Count by category
// - documentsByType: Count by file type
// - recentUploads: Documents uploaded in last 30 days
```

## File Upload Process

### 1. Frontend Implementation

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const DocumentUpload = () => {
  const saveDocument = useMutation(api.documents.saveDocumentMetadata);
  
  const handleFileUpload = async (file: File) => {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", currentUserId);
      formData.append("title", documentTitle);
      formData.append("description", documentDescription);
      formData.append("category", selectedCategory);
      formData.append("tags", selectedTags.join(","));
      formData.append("isPrivate", isPrivate.toString());

      // Upload to HTTP endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        console.log("Document uploaded:", result.documentId);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.xls,.xlsx"
      />
      {/* Additional form fields for metadata */}
    </div>
  );
};
```

### 2. File Validation

The system automatically validates:
- **File size**: Maximum 10MB per file
- **File types**: PDF, images (JPEG, PNG, GIF), text, Word, Excel
- **Required fields**: userId, title, category
- **Access control**: User ownership verification

## Security Features

### Access Control Levels

1. **Owner Access**: Full read/write/delete permissions
2. **Shared Access**: Read-only access for shared users
3. **Public Access**: Read access for all authenticated users
4. **Private Access**: Owner-only access

### Data Protection

- **Encrypted storage**: Files stored securely in Convex storage
- **Signed URLs**: Temporary, secure download links
- **User isolation**: Users can only access their own documents
- **Audit logging**: Track all document operations

## Usage Examples

### Medical Practice Scenario

```typescript
// Doctor uploads patient lab results
const labResult = await convex.mutation(api.documents.saveDocumentMetadata, {
  userId: "doctor_user_id",
  title: "Patient Lab Results - John Doe",
  description: "Complete blood count and metabolic panel",
  fileName: "lab_results_john_doe.pdf",
  fileType: "application/pdf",
  fileSize: 245760,
  storageId: "storage_id_from_upload",
  category: "lab_result",
  tags: ["patient", "blood test", "CBC", "urgent"],
  isPrivate: true,
  metadata: {
    patientId: "patient_id",
    labTestId: "lab_test_id",
    expiryDate: Date.now() + (365 * 24 * 60 * 60 * 1000),
    documentNumber: "LAB-2024-001",
    issuingAuthority: "City Medical Lab",
  },
});

// Share with patient
await convex.mutation(api.documents.shareDocument, {
  documentId: labResult.documentId,
  userId: "doctor_user_id",
  sharedWithUserIds: ["patient_user_id"],
  requireApproval: false,
});
```

### Insurance Document Management

```typescript
// Upload insurance card
const insuranceCard = await convex.mutation(api.documents.saveDocumentMetadata, {
  userId: "user_id",
  title: "Blue Cross Insurance Card",
  description: "Primary health insurance coverage",
  fileName: "insurance_card.jpg",
  fileType: "image/jpeg",
  fileSize: 512000,
  storageId: "storage_id_from_upload",
  category: "insurance",
  tags: ["insurance", "blue cross", "primary coverage"],
  isPrivate: false, // Insurance cards are typically shared
  metadata: {
    expiryDate: Date.now() + (365 * 24 * 60 * 60 * 1000),
    documentNumber: "INS-2024-001",
    issuingAuthority: "Blue Cross Blue Shield",
  },
});
```

## Testing & Development

### Seed Sample Data

```typescript
// Run in Convex dashboard or via API
await convex.mutation(api.seedDocuments.seedSampleDocuments, {});

// Clear all documents
await convex.mutation(api.seedDocuments.clearAllDocuments, {});
```

### Testing Upload Endpoint

```bash
# Test file upload
curl -X POST http://localhost:8000/upload \
  -F "file=@test.pdf" \
  -F "userId=test_user_id" \
  -F "title=Test Document" \
  -F "category=medical_record" \
  -F "isPrivate=true"

# Test health check
curl http://localhost:8000/health
```

## Performance Considerations

### Optimization Strategies

1. **Indexed Queries**: Use defined indexes for efficient data retrieval
2. **Pagination**: Implement pagination for large document lists
3. **Lazy Loading**: Load document content on-demand
4. **Caching**: Cache frequently accessed document metadata

### Storage Limits

- **File Size**: Maximum 10MB per file
- **Total Storage**: Limited by Convex plan limits
- **File Count**: No practical limit on document count
- **Metadata**: Efficient storage with indexed fields

## Monitoring & Maintenance

### Health Checks

- **Storage Health**: Monitor storage usage and limits
- **API Performance**: Track upload/download response times
- **Error Rates**: Monitor failed uploads and access attempts
- **User Activity**: Track document creation and access patterns

### Backup & Recovery

- **Automatic Backups**: Convex provides automatic data backup
- **Version Control**: Track document modifications
- **Recovery Procedures**: Document restoration processes

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check file size limits (10MB max)
   - Verify file type is allowed
   - Ensure all required fields are provided

2. **Access Denied**
   - Verify user authentication
   - Check document ownership
   - Confirm sharing permissions

3. **Storage Errors**
   - Check Convex storage limits
   - Verify storage configuration
   - Monitor storage health

### Error Codes

- `400`: Bad Request (missing fields, invalid data)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (access denied)
- `404`: Not Found (document doesn't exist)
- `413`: Payload Too Large (file too big)
- `500`: Internal Server Error (server issues)

## Future Enhancements

### Planned Features

1. **Advanced Search**: Full-text search with AI-powered relevance
2. **Document OCR**: Extract text from images and PDFs
3. **Version Control**: Track document revisions and changes
4. **Integration**: Connect with external medical systems
5. **Analytics**: Advanced reporting and insights
6. **Compliance**: HIPAA and GDPR compliance features

### Scalability Improvements

1. **CDN Integration**: Global content delivery
2. **Compression**: Automatic file compression
3. **Thumbnails**: Generate preview images
4. **Batch Operations**: Bulk upload and processing

## Support & Resources

### Documentation

- **API Reference**: Complete function documentation
- **Code Examples**: Working implementation samples
- **Best Practices**: Security and performance guidelines

### Community

- **GitHub Issues**: Report bugs and request features
- **Discord**: Join the developer community
- **Documentation**: Keep up with latest updates

---

This document storage system provides a robust foundation for managing medical documents securely and efficiently. For additional support or questions, please refer to the API documentation or contact the development team.
