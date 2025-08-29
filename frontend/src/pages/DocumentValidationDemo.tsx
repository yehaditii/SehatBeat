import React, { useState } from 'react';
import { EnhancedClinicalDocsUploadModal } from '@/components/EnhancedClinicalDocsUploadModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const DocumentValidationDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);

  const handleUpload = async (data: any) => {
    console.log('Uploading document:', data);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add to upload history
    const uploadRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      ...data,
      status: 'success'
    };
    
    setUploadHistory(prev => [uploadRecord, ...prev]);
    
    console.log('Document uploaded successfully!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 Enhanced Document Validation Demo
        </h1>
        <p className="text-xl text-gray-600">
          Experience the smart validation system that prevents logical mismatches
        </p>
      </div>

      {/* Demo Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📁 Try the Enhanced Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Test the enhanced validation system with different file types and content:
            </p>
            
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>Good Example:</strong> blood_test.pdf + Lab Report + "blood count"
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <strong>Bad Example:</strong> resume.pdf + Prescription + "paracetamol"
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Smart Suggestions:</strong> Automatic category recommendations
              </div>
            </div>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4"
              size="lg"
            >
              🧪 Test Enhanced Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✨ Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <strong>Smart File Analysis</strong>
                  <p className="text-sm text-gray-600">Analyzes filename, type, and content for category suggestions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <strong>Real-time Validation</strong>
                  <p className="text-sm text-gray-600">Shows errors and warnings as you type</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <strong>Content Consistency</strong>
                  <p className="text-sm text-gray-600">Prevents mismatched uploads and suggests improvements</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <strong>One-click Fixes</strong>
                  <p className="text-sm text-gray-600">Apply suggested categories with a single click</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Upload History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadHistory.map((record) => (
                <div key={record.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{record.title}</div>
                      <div className="text-sm text-gray-600">
                        {record.file.name} • {record.category} • {record.tags.join(', ')}
                      </div>
                      {record.content && (
                        <div className="text-sm text-gray-500 mt-1">{record.content}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{record.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Modal */}
      <EnhancedClinicalDocsUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        isUploading={false}
      />
    </div>
  );
};

export default DocumentValidationDemo;
