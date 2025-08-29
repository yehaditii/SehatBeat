import React, { useState } from 'react';
import { EnhancedDocumentUploadModal } from './EnhancedDocumentUploadModal';

// Example usage component
export const DocumentUploadExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpload = async (data: any) => {
    console.log('Uploading document:', data);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically:
    // 1. Upload file to Convex storage
    // 2. Save metadata using api.documents.saveDocumentMetadata
    // 3. Handle success/error states
    
    console.log('Document uploaded successfully!');
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          📁 Document Management System
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🚀 Enhanced Document Upload
          </h2>
          
          <p className="text-gray-600 mb-4">
            This enhanced upload system prevents logical mismatches and provides smart suggestions:
          </p>
          
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>✅ <strong>Smart Validation:</strong> Prevents resume files from being categorized as prescriptions</li>
            <li>✅ <strong>Category Suggestions:</strong> AI-powered category recommendations based on file content</li>
            <li>✅ <strong>Real-time Feedback:</strong> Immediate validation as you type</li>
            <li>✅ <strong>Content Consistency:</strong> Checks title, description, and category alignment</li>
            <li>✅ <strong>File Type Analysis:</strong> Suggests appropriate categories based on file format</li>
          </ul>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📤 Open Enhanced Upload Modal
          </button>
        </div>

        {/* Example scenarios */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Good Example
            </h3>
            <p className="text-green-700 text-sm">
              <strong>File:</strong> blood_test_results.pdf<br/>
              <strong>Category:</strong> Lab Results<br/>
              <strong>Title:</strong> Blood Test Results - March 2024<br/>
              <strong>Notes:</strong> Complete blood count and metabolic panel
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Problem Example (Now Fixed!)
            </h3>
            <p className="text-red-700 text-sm">
              <strong>File:</strong> Aman resume.pdf<br/>
              <strong>Category:</strong> Prescription ← <strong>WRONG!</strong><br/>
              <strong>Title:</strong> aman<br/>
              <strong>Notes:</strong> paracetamol ← <strong>WRONG!</strong>
            </p>
            <p className="text-green-700 text-sm mt-2">
              <strong>✅ Fixed:</strong> System now prevents this mismatch and suggests "Other" category
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🔧 How the Validation System Works
          </h3>
          
          <div className="space-y-3 text-blue-700 text-sm">
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
              <div>
                <strong>File Analysis:</strong> Analyzes filename, type, and size to suggest appropriate categories
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
              <div>
                <strong>Content Validation:</strong> Checks for logical mismatches between file content and metadata
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
              <div>
                <strong>Smart Suggestions:</strong> Provides category recommendations with confidence scores
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
              <div>
                <strong>Real-time Feedback:</strong> Shows validation errors and warnings as you type
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      <EnhancedDocumentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};
