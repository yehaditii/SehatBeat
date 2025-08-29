import React, { useState, useEffect } from 'react';

interface ValidationResult {
  isValid: boolean;
  suggestedCategory: string;
  warnings: string[];
  errors: string[];
}

interface FileAnalysis {
  fileName: string;
  fileType: string;
  fileSize: number;
  suggestedCategory: string;
  confidence: number;
}

export const useDocumentValidation = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    suggestedCategory: '',
    warnings: [],
    errors: []
  });

  // File type to category mapping with confidence scores
  const fileTypeCategoryMap: Record<string, { category: string; confidence: number }[]> = {
    'application/pdf': [
      { category: 'Consultation', confidence: 0.8 },
      { category: 'Prescription', confidence: 0.7 },
      { category: 'Lab Report', confidence: 0.7 },
      { category: 'Assessment', confidence: 0.6 },
      { category: 'Other', confidence: 0.3 }
    ],
    'image/jpeg': [
      { category: 'Lab Report', confidence: 0.9 },
      { category: 'Assessment', confidence: 0.8 },
      { category: 'Consultation', confidence: 0.6 },
      { category: 'Other', confidence: 0.4 }
    ],
    'image/png': [
      { category: 'Lab Report', confidence: 0.9 },
      { category: 'Assessment', confidence: 0.8 },
      { category: 'Consultation', confidence: 0.6 },
      { category: 'Other', confidence: 0.4 }
    ],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      { category: 'Consultation', confidence: 0.9 },
      { category: 'Prescription', confidence: 0.7 },
      { category: 'Lab Report', confidence: 0.6 },
      { category: 'Other', confidence: 0.4 }
    ]
  };

  // Keywords that suggest specific categories
  const categoryKeywords: Record<string, string[]> = {
    'Prescription': ['prescription', 'medication', 'drug', 'dosage', 'pharmacy', 'rx', 'medic', 'tablet', 'capsule', 'syrup'],
    'Lab Report': ['lab', 'test', 'result', 'blood', 'urine', 'cbc', 'metabolic', 'panel', 'analysis', 'report'],
    'Consultation': ['medical', 'history', 'diagnosis', 'treatment', 'patient', 'clinical', 'examination', 'consultation'],
    'Assessment': ['assessment', 'evaluation', 'diagnosis', 'examination', 'review', 'analysis'],
    'Other': ['other', 'misc', 'general', 'document', 'file']
  };

  const analyzeFile = (file: File): FileAnalysis => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    // Check file type mapping
    let suggestedCategory = 'Other';
    let confidence = 0.3;
    
    if (fileTypeCategoryMap[fileType]) {
      const typeSuggestions = fileTypeCategoryMap[fileType];
      suggestedCategory = typeSuggestions[0].category;
      confidence = typeSuggestions[0].confidence;
    }
    
    // Check filename keywords for better suggestions
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (fileName.includes(keyword)) {
          suggestedCategory = category;
          confidence = Math.max(confidence, 0.9);
          break;
        }
      }
    }
    
    // Special case: resume files should not be medical documents
    if (fileName.includes('resume') || fileName.includes('cv') || fileName.includes('curriculum')) {
      suggestedCategory = 'Other';
      confidence = 0.95;
    }
    
    return {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      suggestedCategory,
      confidence
    };
  };

  const validateDocument = (
    file: File,
    title: string,
    category: string,
    description: string,
    tags: string[]
  ): ValidationResult => {
    const analysis = analyzeFile(file);
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check for obvious mismatches
    if (file.name.includes('resume') && category === 'Prescription') {
      errors.push('Resume files should not be categorized as prescriptions');
    }
    
    if (file.name.includes('resume') && description.toLowerCase().includes('paracetamol')) {
      errors.push('Resume files should not contain medication information');
    }
    
    // Check category appropriateness
    if (analysis.suggestedCategory !== category && analysis.confidence > 0.7) {
      warnings.push(`Consider using category "${analysis.suggestedCategory}" instead of "${category}"`);
    }
    
    // Check title-content consistency
    if (title.toLowerCase().includes('resume') && category !== 'Other') {
      warnings.push('Resume documents should typically use "Other" category');
    }
    
    // Check description-category consistency
    if (description.toLowerCase().includes('paracetamol') && category !== 'Prescription') {
      warnings.push('Medication information suggests this should be a prescription');
    }
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      errors.push('File size exceeds 10MB limit');
    }
    
    // Check required fields
    if (!title.trim()) {
      errors.push('Title is required');
    }
    
    if (!category) {
      errors.push('Category is required');
    }
    
    const isValid = errors.length === 0;
    
    return {
      isValid,
      suggestedCategory: analysis.suggestedCategory,
      warnings,
      errors
    };
  };

  return {
    validateDocument,
    analyzeFile,
    validationResult,
    setValidationResult
  };
};

// Smart category suggestion component
export const CategorySuggestion: React.FC<{
  file: File | null;
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({ file, currentCategory, onCategoryChange }) => {
  const { analyzeFile } = useDocumentValidation();
  
  if (!file) return null;
  
  const analysis = analyzeFile(file);
  
  if (analysis.suggestedCategory === currentCategory) {
    return (
      <div className="text-green-600 text-sm mt-2">
        ✅ Category matches file content perfectly
      </div>
    );
  }
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
      <div className="text-blue-800 text-sm font-medium">
        💡 Smart Suggestion
      </div>
      <div className="text-blue-700 text-sm mt-1">
        Based on your file "{file.name}", we suggest using category: 
        <button
          className="ml-2 text-blue-600 underline hover:text-blue-800"
          onClick={() => onCategoryChange(analysis.suggestedCategory)}
        >
          {analysis.suggestedCategory}
        </button>
      </div>
      <div className="text-blue-600 text-xs mt-1">
        Confidence: {Math.round(analysis.confidence * 100)}%
      </div>
    </div>
  );
};

// Validation display component
export const ValidationDisplay: React.FC<{
  validationResult: ValidationResult;
}> = ({ validationResult }) => {
  if (validationResult.errors.length === 0 && validationResult.warnings.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      {validationResult.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="text-red-800 font-medium">❌ Validation Errors</div>
          <ul className="text-red-700 text-sm mt-2 list-disc list-inside">
            {validationResult.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {validationResult.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-yellow-800 font-medium">⚠️ Suggestions</div>
          <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside">
            {validationResult.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
