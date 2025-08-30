import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, Upload, X, FileText, Microscope, Stethoscope, Pill, File } from "lucide-react";

interface EnhancedClinicalDocsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, metadata: {
    title: string;
    category: string;
    description?: string;
    tags: string[];
    priority: boolean;
  }) => Promise<void>;
  isUploading: boolean;
}

const EnhancedClinicalDocsUploadModal: React.FC<EnhancedClinicalDocsUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [priority, setPriority] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  }>({
    isValid: false,
    warnings: [],
    suggestions: [],
  });

  // Category mapping with icons
  const categoryIcons: Record<string, React.ReactNode> = {
    medical_record: <Stethoscope className="w-4 h-4" />,
    prescription: <Pill className="w-4 h-4" />,
    lab_result: <Microscope className="w-4 h-4" />,
    insurance: <FileText className="w-4 h-4" />,
    id_document: <File className="w-4 h-4" />,
    other: <FileText className="w-4 h-4" />,
  };

  // Category display names
  const categoryNames: Record<string, string> = {
    medical_record: "Medical Record",
    prescription: "Prescription",
    lab_result: "Lab Report",
    insurance: "Insurance",
    id_document: "ID Document",
    other: "Other",
  };

  // Validate form and provide smart suggestions
  const validateForm = useCallback(() => {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Title validation
    if (title.trim().length < 3) {
      warnings.push("Title should be at least 3 characters long");
    }

    // Category validation
    if (!category) {
      warnings.push("Please select a document category");
    }

    // File validation
    if (!selectedFile) {
      warnings.push("Please select a file to upload");
    } else {
      // Smart category suggestions based on file content
      const fileName = selectedFile.name.toLowerCase();
      
      if (fileName.includes("lab") || fileName.includes("test") || fileName.includes("result")) {
        if (category !== "lab_result") {
          suggestions.push("Consider 'Lab Report' category for this file");
        }
      } else if (fileName.includes("prescription") || fileName.includes("rx") || fileName.includes("med")) {
        if (category !== "prescription") {
          suggestions.push("Consider 'Prescription' category for this file");
        }
      } else if (fileName.includes("medical") || fileName.includes("record") || fileName.includes("history")) {
        if (category !== "medical_record") {
          suggestions.push("Consider 'Medical Record' category for this file");
        }
      }
    }

    // Tags validation
    if (tags.length === 0) {
      suggestions.push("Add tags to help organize your documents");
    }

    // Content validation
    if (content.trim().length < 10) {
      suggestions.push("Add more detailed notes for better document organization");
    }

    const isValid = warnings.length === 0 && title.trim() && category && selectedFile !== null;
    
    setValidation({
      isValid,
      warnings,
      suggestions,
    });

    return isValid;
  }, [title, category, content, tags, selectedFile]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Auto-generate title if not set
      if (!title.trim()) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setTitle(fileName);
      }
      
      // Auto-suggest category based on file name
      const fileName = file.name.toLowerCase();
      if (fileName.includes("lab") || fileName.includes("test") || fileName.includes("result")) {
        setCategory("lab_result");
      } else if (fileName.includes("prescription") || fileName.includes("rx") || fileName.includes("med")) {
        setCategory("prescription");
      } else if (fileName.includes("medical") || fileName.includes("record") || fileName.includes("history")) {
        setCategory("medical_record");
      }
      
      // Validate form after a short delay to ensure state updates
      setTimeout(() => validateForm(), 100);
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      validateForm();
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    validateForm();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (selectedFile) {
      try {
        await onUpload(selectedFile, {
          title: title.trim(),
          category,
          description: content.trim() || undefined,
          tags,
          priority,
        });
        
        // Reset form after successful upload
        resetForm();
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setContent("");
    setTags([]);
    setTagInput("");
    setPriority(false);
    setSelectedFile(null);
    setValidation({
      isValid: false,
      warnings: [],
      suggestions: [],
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Check if category matches file content
  const isCategoryMatch = () => {
    if (!selectedFile || !category) return false;
    
    const fileName = selectedFile.name.toLowerCase();
    
    if (category === "lab_result" && (fileName.includes("lab") || fileName.includes("test") || fileName.includes("result"))) {
      return true;
    }
    if (category === "prescription" && (fileName.includes("prescription") || fileName.includes("rx") || fileName.includes("med"))) {
      return true;
    }
    if (category === "medical_record" && (fileName.includes("medical") || fileName.includes("record") || fileName.includes("history"))) {
      return true;
    }
    
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Upload Clinical Document
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Selection */}
            <div>
              <Label htmlFor="file" className="text-sm font-medium text-gray-700">
                Select File *
              </Label>
              <div className="mt-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTimeout(() => validateForm(), 100);
                }}
                placeholder="Enter document title"
                className="mt-2"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category *
              </Label>
              <Select value={category} onValueChange={(value) => {
                setCategory(value);
                setTimeout(() => validateForm(), 100);
              }}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {categoryIcons[key]}
                        {name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Category match indicator */}
              {category && selectedFile && isCategoryMatch() && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Category matches file content perfectly
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                Notes (optional)
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add any notes about this upload"
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                Tags
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X className="w-3 h-3 ml-1" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="priority"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
              />
              <Label htmlFor="priority">Priority document</Label>
            </div>

            {/* Validation Messages */}
            {(validation.warnings.length > 0 || validation.suggestions.length > 0) && (
              <div className="space-y-2">
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {warning}
                  </div>
                ))}
                {validation.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2 text-blue-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
                             <Button
                 type="submit"
                 disabled={isUploading}
                 className="bg-blue-600 hover:bg-blue-700"
               >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Upload Document"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedClinicalDocsUploadModal;
