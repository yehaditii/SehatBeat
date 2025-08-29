import React, { useState, useCallback } from 'react';
import { useDocumentValidation, CategorySuggestion, ValidationDisplay } from './DocumentUploadValidation';

interface DocumentUploadData {
  title: string;
  category: string;
  description: string;
  tags: string[];
  isPrivate: boolean;
  file: File | null;
}

interface EnhancedDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: DocumentUploadData) => Promise<void>;
}

export const EnhancedDocumentUploadModal: React.FC<EnhancedDocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [formData, setFormData] = useState<DocumentUploadData>({
    title: '',
    category: '',
    description: '',
    tags: [],
    isPrivate: false,
    file: null
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { validateDocument, validationResult, setValidationResult } = useDocumentValidation();

  // Real-time validation as user types
  const validateForm = useCallback(() => {
    if (formData.file) {
      const result = validateDocument(
        formData.file,
        formData.title,
        formData.category,
        formData.description,
        formData.tags
      );
      setValidationResult(result);
    }
  }, [formData, validateDocument, setValidationResult]);

  // Validate on form changes
  React.useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, file }));
    setValidationResult({
      isValid: true,
      suggestedCategory: '',
      warnings: [],
      errors: []
    });
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert('Please select a file');
      return;
    }

    // Final validation before upload
    const finalValidation = validateDocument(
      formData.file,
      formData.title,
      formData.category,
      formData.description,
      formData.tags
    );

    if (!finalValidation.isValid) {
      setValidationResult(finalValidation);
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(formData);
      // Reset form on success
      setFormData({
        title: '',
        category: '',
        description: '',
        tags: [],
        isPrivate: false,
        file: null
      });
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            📁 Upload Clinical Document
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select file
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.xls,.xlsx"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {formData.file && (
              <div className="mt-2 text-sm text-gray-600">
                📎 {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter document title"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select category</option>
              <option value="medical_record">🏥 Medical Records</option>
              <option value="prescription">💊 Prescriptions</option>
              <option value="lab_result">🔬 Lab Results</option>
              <option value="insurance">🛡️ Insurance</option>
              <option value="id_document">🆔 ID Documents</option>
              <option value="other">📄 Other</option>
            </select>
            
            {/* Smart category suggestion */}
            {formData.file && formData.category && (
              <CategorySuggestion
                file={formData.file}
                currentCategory={formData.category}
                onCategoryChange={handleCategoryChange}
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md h-20 resize-none"
              placeholder="Enter document description or notes"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            
            {/* Display tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
              Make document private
            </label>
          </div>

          {/* Validation Display */}
          <ValidationDisplay validationResult={validationResult} />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validationResult.isValid || isUploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? '⏳ Uploading...' : '📤 Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
