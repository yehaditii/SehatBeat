import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Eye, 
  Calendar,
  User,
  Plus,
  Star,
  Edit,
  Trash2,
  X,
  Brain
} from "lucide-react";
// import { useClinicalDocs } from "@/hooks/useConvex"; // Temporarily disabled to fix white screen
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { useMutation as useConvexMutation } from "convex/react";
import EnhancedClinicalDocsUploadModal from "@/components/EnhancedClinicalDocsUploadModal";
import AIPDFReader from "@/components/AIPDFReader";

const ClinicalDocs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  
  // Mock functions for now to get the app working
  const clinicalDocs: any[] = []; // Empty array for now, will be populated from Convex later
  
  const [localDocs, setLocalDocs] = useState<any[]>([]);
  
  // Load documents from localStorage on component mount
  useEffect(() => {
    const savedDocs = localStorage.getItem('clinicalDocs');
    if (savedDocs) {
      try {
        const parsedDocs = JSON.parse(savedDocs);
        setLocalDocs(parsedDocs);
        console.log("Loaded documents from localStorage:", parsedDocs);
      } catch (error) {
        console.error("Error loading documents from localStorage:", error);
      }
    }
  }, []);
  
  // Calculate stats from actual documents
  const calculateStats = () => {
    const allDocs = [...(clinicalDocs || []), ...localDocs];
    const now = Date.now();
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const totalDocuments = allDocs.length;
    const thisMonth = allDocs.filter(doc => doc.createdAt && doc.createdAt >= oneMonthAgo).length;
    
    // Count by category
    const byCategory: { [key: string]: number } = {};
    allDocs.forEach(doc => {
      const category = doc.category || 'Other';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    
    // Count priority items (documents marked as priority)
    const priorityItems = allDocs.filter(doc => doc.priority).length;
    
    return { totalDocuments, thisMonth, byCategory, priorityItems };
  };
  
  // Use state for stats to ensure proper updates
  const [clinicalDocsStats, setClinicalDocsStats] = useState(() => calculateStats());
  
  // Recalculate stats whenever documents change
  useEffect(() => {
    const newStats = calculateStats();
    setClinicalDocsStats(newStats);
    console.log("Stats updated:", newStats);
  }, [localDocs]);

  const addClinicalDoc = async (docData: any) => {
    console.log("addClinicalDoc called with:", docData);
    
    // Create a new document with local ID
    const now = Date.now();
    const newDoc = {
      _id: `local-${now}`,
      _creationTime: now,
      createdAt: now,
      userId: 'local',
      title: docData.title,
      content: docData.content,
      category: docData.category,
      tags: docData.tags || [],
      attachments: docData.attachments || [],
      fileType: docData.fileType,
      fileName: docData.fileName,
      updatedAt: now,
      priority: docData.priority || false,
      isPrivate: false,
    };
    
    // Add to local state
    setLocalDocs(prev => [newDoc, ...prev]);
    
    // Save to localStorage for persistence
    const existingDocs = JSON.parse(localStorage.getItem('clinicalDocs') || '[]');
    const updatedDocs = [newDoc, ...existingDocs];
    localStorage.setItem('clinicalDocs', JSON.stringify(updatedDocs));
    
    console.log("Document saved locally and to localStorage:", newDoc);
    return newDoc._id;
  };
  const updateDoc = async (docId: string, updates: any) => {
    console.log("updateDoc called with:", docId, updates);
    
    // Handle local document updates
    if (String(docId).startsWith('local-')) {
      console.log("Updating local document");
      const updatedDocs = localDocs.map(d => d._id === docId ? {
        ...d,
        ...updates,
        updatedAt: Date.now(),
      } : d);
      
      setLocalDocs(updatedDocs);
      
      // Update localStorage
      localStorage.setItem('clinicalDocs', JSON.stringify(updatedDocs));
      
      console.log("Local document updated successfully");
      return true;
    }
    
    // This will be handled by Convex when it's connected
    console.log("Remote document update not implemented yet");
    return null;
  };
  const deleteDoc = async (docId: string) => {
    console.log("deleteDoc called with:", docId);
    
    // Handle local document deletion
    if (String(docId).startsWith('local-')) {
      console.log("Deleting local document");
      const updatedDocs = localDocs.filter(d => d._id !== docId);
      setLocalDocs(updatedDocs);
      
      // Update localStorage
      localStorage.setItem('clinicalDocs', JSON.stringify(updatedDocs));
      
      console.log("Local document deleted successfully");
      return true;
    }
    
    // This will be handled by Convex when it's connected
    console.log("Remote document deletion not implemented yet");
    return null;
  };
  
  const isUserLoaded = true; // Mock for now
  
  // Form state for creating/editing documents
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
    priority: false,
    doctorId: "",
  });
  
  const [tagInput, setTagInput] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false);
  const [selectedFileForAI, setSelectedFileForAI] = useState<File | null>(null);
  const [pdfPreviewStates, setPdfPreviewStates] = useState<{ [key: string]: boolean }>({});

  // Debug form data changes
  useEffect(() => {
    console.log("Form data changed:", formData);
  }, [formData]);

  // Convex storage mutations - temporarily disabled
  // const generateUploadUrl = (useConvexMutation as any)("generateUploadUrl");



  const handleEditDocument = async () => {
    console.log("handleEditDocument called with formData:", formData);
    console.log("editingDoc:", editingDoc);
    
    if (!editingDoc || !formData.title || !formData.content || !formData.category) {
      console.log("Validation failed:", { 
        editingDoc: !!editingDoc, 
        title: !!formData.title, 
        content: !!formData.content, 
        category: !!formData.category,
        formData 
      });
      return;
    }
    
    console.log("Updating document:", editingDoc._id, formData);
    
    try {
      const result = await updateDoc(editingDoc._id, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        priority: formData.priority,
        doctorId: formData.doctorId || undefined,
      });
      
      if (result) {
        console.log("Document updated successfully");
      } else {
        console.log("Update not implemented for this document type");
        // For now, just close the modal even if update isn't implemented
      }
    } catch (error) {
      console.error("Update failed:", error);
      // Don't close the modal if the update failed
      return;
    }
    
    setIsEditModalOpen(false);
    setEditingDoc(null);
    resetForm();
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        const result = await deleteDoc(docId);
        if (result) {
          console.log("Document deleted successfully");
        } else {
          console.log("Delete not implemented for this document type");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        // Fallback: try to delete from local docs if it's a local document
        if (String(docId).startsWith('local-')) {
          setLocalDocs(prev => prev.filter(d => d._id !== docId));
          console.log("Document deleted from local storage as fallback");
        }
      }
    }
  };

  // Toggle document priority
  const togglePriority = async (docId: string) => {
    try {
      const doc = [...(clinicalDocs || []), ...localDocs].find(d => d._id === docId);
      if (!doc) return;

      const newPriority = !doc.priority;
      const result = await updateDoc(docId, { priority: newPriority });
      
      if (result) {
        console.log("Priority toggled successfully");
      } else {
        console.log("Priority toggle not implemented for this document type");
      }
    } catch (error) {
      console.error("Priority toggle failed:", error);
    }
  };

  // Enhanced upload handler for the new modal
  const handleEnhancedUpload = async (file: File, metadata: {
    title: string;
    category: string;
    description?: string;
    tags: string[];
    priority: boolean;
  }) => {
    setIsUploading(true);
    
    // For now, use local storage since Convex isn't connected
    try {
      const now = Date.now();
      const objectUrl = URL.createObjectURL(file);
      
      // Add to local documents immediately
      const newDoc = {
        _id: `local-${now}`,
        _creationTime: now,
        createdAt: now,
        userId: 'local',
        title: metadata.title,
        content: metadata.description || `Uploaded file: ${file.name}`,
        category: metadata.category,
        tags: [...metadata.tags],
        attachments: [objectUrl],
        fileType: file.type,
        fileName: file.name,
        updatedAt: now,
        doctorId: formData.doctorId || undefined,
        priority: metadata.priority,
      };
      
      setLocalDocs(prev => [newDoc, ...prev]);
      
      // Try to add to Convex if available (but don't fail if it's not)
      try {
        if (typeof addClinicalDoc === 'function') {
          await addClinicalDoc({
            title: metadata.title,
            content: metadata.description || file.name,
            category: metadata.category,
            tags: metadata.tags,
            priority: metadata.priority,
            attachments: [objectUrl],
            fileType: file.type,
            fileName: file.name,
          });
        }
      } catch (convexError) {
        console.log("Convex not available, using local storage:", convexError);
      }
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setIsUploadModalOpen(false);
      resetForm();
    }
  };

  // Legacy upload handler (keeping for compatibility)
  const handleUploadDocument = async () => {
    if (!formData.title || !formData.category || !uploadFile) return;
    setIsUploading(true);
    
    try {
      const now = Date.now();
      const objectUrl = URL.createObjectURL(uploadFile);
      
      // Add to local documents immediately
      const newDoc = {
        _id: `local-${now}`,
        _creationTime: now,
        createdAt: now,
        userId: 'local',
        title: formData.title,
        content: formData.content || `Uploaded file: ${uploadFile.name}`,
        category: formData.category,
        tags: [...formData.tags],
        attachments: [objectUrl],
        fileType: uploadFile.type,
        fileName: uploadFile.name,
        updatedAt: now,
        doctorId: formData.doctorId || undefined,
        priority: formData.priority,
      };
      
      setLocalDocs(prev => [newDoc, ...prev]);
      
      // Try to add to Convex if available (but don't fail if it's not)
      try {
        if (typeof addClinicalDoc === 'function') {
          await addClinicalDoc({
            title: formData.title,
            content: formData.content || uploadFile.name,
            category: formData.category,
            tags: formData.tags,
            attachments: [objectUrl],
            priority: formData.priority,
            fileType: uploadFile.type,
            fileName: uploadFile.name,
          });
        }
      } catch (convexError) {
        console.log("Convex not available, using local storage:", convexError);
      }
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      resetForm();
    }
  };

  const openEditModal = (doc: any) => {
    console.log("Opening edit modal for document:", doc);
    console.log("Document category:", doc.category);
    
    // Map the category to the correct internal value if needed
    let mappedCategory = doc.category;
    if (doc.category === "Medical Record") mappedCategory = "medical_record";
    if (doc.category === "Lab Report") mappedCategory = "lab_result";
    if (doc.category === "Prescription") mappedCategory = "prescription";
    
    console.log("Mapped category:", mappedCategory);
    
    setEditingDoc(doc);
    const formDataToSet = {
      title: doc.title,
      content: doc.content,
      category: mappedCategory,
      tags: doc.tags || [],
      priority: doc.priority,
      doctorId: doc.doctorId || "",
    };
    
    setFormData(formDataToSet);
    console.log("Form data set to:", formDataToSet);
    
    // Reset tag input when opening edit modal
    setTagInput("");
    
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      tags: [],
      priority: false,
      doctorId: "",
    });
    setTagInput("");
  };

  const openAIAnalysisModal = (file: File) => {
    setSelectedFileForAI(file);
    setIsAIAnalysisModalOpen(true);
  };

  const togglePdfPreview = (docId: string) => {
    setPdfPreviewStates(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getPriorityColor = (tags: string[]) => {
    // Keep custom tags neutral by default
    if (tags.includes("High") || tags.includes("Priority")) return "destructive";
    if (tags.includes("Medium")) return "default";
    return "secondary";
  };

  const getPrimaryTagText = (tags: string[]) => {
    // Show the first user tag if present; otherwise fallback to Normal
    return tags && tags.length > 0 ? tags[0] : "Normal";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const allDocs = [
    ...(clinicalDocs || []),
    ...localDocs,
  ];

  // console.log("All documents:", allDocs);
  // console.log("Local documents:", localDocs);

  // Sort documents: priority first, then by creation date
  const sortedDocs = allDocs.sort((a, b) => {
    // Priority documents first
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    // Then by creation date (newest first)
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const filteredDocs = sortedDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Map enhanced modal categories to display categories
  const getDisplayCategory = (category: string) => {
    switch (category) {
      case "lab_result": return "Lab Report";
      case "medical_record": return "Medical Record";
      case "prescription": return "Prescription";
      case "insurance": return "Insurance";
      case "id_document": return "ID Document";
      case "Consultation": return "Medical Record"; // Legacy category mapping
      case "Assessment": return "Prescription"; // Legacy category mapping
      default: return category; // Fallback for other categories
    }
  };

  const medicalRecordDocs = allDocs.filter(doc => 
    doc.category === "Medical Record" || doc.category === "medical_record" || doc.category === "Consultation"
  );
  const labDocs = allDocs.filter(doc => 
    doc.category === "Lab Report" || doc.category === "lab_result"
  );
  const prescriptionDocs = allDocs.filter(doc => 
    doc.category === "Prescription" || doc.category === "prescription" || doc.category === "Assessment"
  );

  // console.log("Lab docs:", labDocs);
  // console.log("Medical Record docs:", medicalRecordDocs);
  // console.log("Prescription docs:", prescriptionDocs);

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-accent rounded-xl shadow-medium">
              <FileText className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                Clinical Documentation
                <Badge className="bg-gradient-accent text-accent-foreground animate-pulse-soft">
                  New Feature
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Comprehensive clinical notes management with structured templates and secure sharing
              </p>
            </div>


          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search documents, doctors, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              className="sm:w-auto"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            {/* Enhanced Upload Modal */}
            <EnhancedClinicalDocsUploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              onUpload={handleEnhancedUpload}
              isUploading={isUploading}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="priority">⭐ Priority</TabsTrigger>
            <TabsTrigger value="medical-record">Medical Records</TabsTrigger>
            <TabsTrigger value="lab">Lab Reports</TabsTrigger>
            <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
            <TabsTrigger value="insurance" disabled className="opacity-50 cursor-not-allowed">Insurance 🔒</TabsTrigger>
            <TabsTrigger value="id-document" disabled className="opacity-50 cursor-not-allowed">ID Documents 🔒</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-accent/20 bg-gradient-to-br from-accent-soft to-background">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-accent">
                        {clinicalDocsStats?.totalDocuments || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Documents</p>
                    </div>
                    <FileText className="w-8 h-8 text-accent/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {clinicalDocsStats?.thisMonth || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                    <Calendar className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {Object.keys(clinicalDocsStats?.byCategory || {}).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Categories</p>
                    </div>
                    <User className="w-8 h-8 text-secondary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {clinicalDocsStats?.priorityItems || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Priority Items</p>
                    </div>
                    <Star className="w-8 h-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? `No documents match "${searchTerm}"` : "Create your first clinical document to get started."}
                  </p>

                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <Card key={doc._id} className={`hover:shadow-medium transition-all duration-300 ${
                    doc.priority ? 'border-2 border-yellow-300 bg-yellow-50/30' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                                                          <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                              {doc.priority && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(doc.createdAt)}
                              </span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {getDisplayCategory(doc.category)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                              <Badge 
                                variant={getPriorityColor(doc.tags)}
                              >
                                {getPrimaryTagText(doc.tags)}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => togglePriority(doc._id)}
                                className={doc.priority ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100" : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"}
                              >
                                {doc.priority ? (
                                  <Star className="w-4 h-4 fill-yellow-500" />
                                ) : (
                                  <Star className="w-4 h-4" />
                                )}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(doc)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc._id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Document Content */}
                          <div className="text-sm text-gray-600 mt-2">
                            {doc.content}
                          </div>
                          
                          {/* PDF Preview for PDF files */}
                          {doc.attachments && doc.attachments.length > 0 && (
                            <div className="mt-3">
                              {doc.attachments.map((attachment, index) => {
                                // Check if it's a PDF file
                                const isPDF = typeof attachment === 'string' && 
                                  (attachment.includes('.pdf') || attachment.includes('application/pdf') || 
                                   doc.fileType === 'application/pdf' || doc.fileName?.includes('.pdf'));
                                
                                if (isPDF) {
                                  return (
                                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">PDF Document</span>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => togglePdfPreview(`${doc._id}-${index}`)}
                                            className="text-xs px-2 py-1 h-7"
                                          >
                                            {pdfPreviewStates[`${doc._id}-${index}`] ? 'Hide Preview' : 'Show Preview'}
                                          </Button>
                                          <a 
                                            href={attachment} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                                          >
                                            Open PDF
                                          </a>
                                        </div>
                                      </div>
                                      {/* PDF Preview */}
                                      {pdfPreviewStates[`${doc._id}-${index}`] && (
                                        <div className="w-full h-64 bg-white border rounded overflow-hidden">
                                          <iframe
                                            src={attachment}
                                            className="w-full h-full"
                                            title="PDF Preview"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                } else {
                                  // For other file types, show a download link
                                  return (
                                    <div key={index} className="mt-2">
                                                                              <a 
                                          href={attachment} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                        >
                                          <FileText className="w-4 h-4" />
                                          Download Attachment
                                        </a>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          )}
                          
                          {/* Tags */}
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Removed separate tag chips at bottom as requested */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Priority Documents Tab */}
          <TabsContent value="priority" className="space-y-4">
            {filteredDocs.filter(doc => doc.priority).length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No priority documents</h3>
                <p className="text-muted-foreground mb-4">Mark documents as priority to see them here.</p>
              </div>
            ) : (
              filteredDocs.filter(doc => doc.priority).map((doc) => (
                <Card key={doc._id} className="hover:shadow-medium transition-all duration-300 border-2 border-yellow-300 bg-yellow-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(doc.createdAt)}
                              </span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {getDisplayCategory(doc.category)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge 
                              variant={getPriorityColor(doc.tags)}
                            >
                              {getPrimaryTagText(doc.tags)}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => togglePriority(doc._id)}
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                            >
                              <Star className="w-4 h-4 fill-yellow-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(doc)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Document Content */}
                        <div className="text-sm text-gray-600 mt-2">
                          {doc.content}
                        </div>
                        
                        {/* PDF Preview for PDF files */}
                        {doc.attachments && doc.attachments.length > 0 && (
                          <div className="mt-3">
                            {doc.attachments.map((attachment, index) => {
                              // Check if it's a PDF file
                              const isPDF = typeof attachment === 'string' && 
                                (attachment.includes('.pdf') || attachment.includes('application/pdf') || 
                                 doc.fileType === 'application/pdf' || doc.fileName?.includes('.pdf'));
                              
                              if (isPDF) {
                                return (
                                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">PDF Document</span>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => togglePdfPreview(`${doc._id}-${index}`)}
                                          className="text-xs px-2 py-1 h-7"
                                        >
                                          {pdfPreviewStates[`${doc._id}-${index}`] ? 'Hide Preview' : 'Show Preview'}
                                        </Button>
                                        <a 
                                          href={attachment} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                                        >
                                          Open PDF
                                        </a>
                                      </div>
                                    </div>
                                    {/* PDF Preview */}
                                    {pdfPreviewStates[`${doc._id}-${index}`] && (
                                      <div className="w-full h-64 bg-white border rounded overflow-hidden">
                                        <iframe
                                          src={attachment}
                                          className="w-full h-full"
                                          title="PDF Preview"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              } else {
                                // For other file types, show a download link
                                return (
                                  <div key={index} className="mt-2">
                                    <a 
                                      href={attachment} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                    >
                                      <FileText className="w-5 h-5" />
                                      Download Attachment
                                    </a>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        )}
                        
                        {/* Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="medical-record" className="space-y-4">
            {medicalRecordDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No medical record documents</h3>
                <p className="text-muted-foreground mb-4">Create your first medical record document to get started.</p>

              </div>
            ) : (
              medicalRecordDocs.map((doc) => (
                <Card key={doc._id} className={`hover:shadow-medium transition-all duration-300 ${
                  doc.priority ? 'border-2 border-yellow-300 bg-yellow-50/30' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                              {doc.priority && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(doc.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={getPriorityColor(doc.tags)}>
                              {getPrimaryTagText(doc.tags)}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => togglePriority(doc._id)}
                              className={doc.priority ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100" : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"}
                            >
                              {doc.priority ? (
                                <Star className="w-4 h-4 fill-yellow-500" />
                                ) : (
                                <Star className="w-4 h-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(doc)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Removed separate tag chips */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="lab" className="space-y-4">
            {labDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lab reports</h3>
                <p className="text-muted-foreground mb-4">Create your lab reports for easy access and tracking.</p>

              </div>
            ) : (
              labDocs.map((doc) => (
                <Card key={doc._id} className={`hover:shadow-medium transition-all duration-300 ${
                  doc.priority ? 'border-2 border-yellow-300 bg-yellow-50/30' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                              {doc.priority && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-4" />
                                {formatDate(doc.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={getPriorityColor(doc.tags)}>
                              {getPrimaryTagText(doc.tags)}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => togglePriority(doc._id)}
                              className={doc.priority ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100" : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"}
                            >
                              {doc.priority ? (
                                <Star className="w-4 h-4 fill-yellow-500" />
                                ) : (
                                <Star className="w-4 h-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(doc)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Removed separate tag chips */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="prescription" className="space-y-4">
            {prescriptionDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No prescription documents</h3>
                <p className="text-muted-foreground mb-4">Prescription documents will appear here once created.</p>

              </div>
            ) : (
              prescriptionDocs.map((doc) => (
                <Card key={doc._id} className={`hover:shadow-medium transition-all duration-300 ${
                  doc.priority ? 'border-2 border-yellow-300 bg-yellow-50/30' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                              {doc.priority && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(doc.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={getPriorityColor(doc.tags)}>
                              {getPrimaryTagText(doc.tags)}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => togglePriority(doc._id)}
                              className={doc.priority ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100" : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"}
                            >
                              {doc.priority ? (
                                <Star className="w-4 h-4 fill-yellow-500" />
                                ) : (
                                <Star className="w-4 h-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(doc)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Document Content */}
                        <div className="text-sm text-gray-600 mt-2">
                          {doc.content}
                        </div>
                        
                        {/* PDF Preview for PDF files */}
                        {doc.attachments && doc.attachments.length > 0 && (
                          <div className="mt-3">
                            {console.log('Document attachments:', doc.attachments, 'File type:', doc.fileType, 'File name:', doc.fileName)}
                            {doc.attachments.map((attachment, index) => {
                              // Check if it's a PDF file
                              const isPDF = typeof attachment === 'string' && 
                                (attachment.includes('.pdf') || attachment.includes('application/pdf') || 
                                 doc.fileType === 'application/pdf' || doc.fileName?.includes('.pdf'));
                              
                              if (isPDF) {
                                return (
                                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">PDF Document</span>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => togglePdfPreview(`${doc._id}-${index}`)}
                                          className="text-xs px-2 py-1 h-7"
                                        >
                                          {pdfPreviewStates[`${doc._id}-${index}`] ? 'Hide Preview' : 'Show Preview'}
                                        </Button>
                                        <a 
                                          href={attachment} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                                        >
                                          Open PDF
                                        </a>
                                      </div>
                                    </div>
                                    {/* PDF Preview */}
                                    {pdfPreviewStates[`${doc._id}-${index}`] && (
                                      <div className="w-full h-64 bg-white border rounded overflow-hidden">
                                        <iframe
                                          src={attachment}
                                          className="w-full h-full"
                                          title="PDF Preview"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              } else {
                                // For other file types, show a download link
                                return (
                                  <div key={index} className="mt-2">
                                    <a 
                                      href={attachment} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                    >
                                      <FileText className="w-4 h-4" />
                                      Download Attachment
                                    </a>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        )}
                        
                        {/* Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Removed separate tag chips */}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => togglePriority(doc._id)}
                          className={doc.priority ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100" : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"}
                        >
                          {doc.priority ? (
                            <Star className="w-4 h-4 fill-yellow-500" />
                            ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(doc)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai-analysis" className="space-y-4">
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered PDF Analysis</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Upload any PDF document and let our AI analyze it for you. Get instant summaries, 
                key points, and insights from your clinical documents.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFileForAI(file);
                        setIsAIAnalysisModalOpen(true);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="ai-pdf-upload"
                  />
                  <Button 
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                  >
                    <label htmlFor="ai-pdf-upload">
                      <Brain className="w-5 h-5 mr-2" />
                      Upload & Analyze PDF
                    </label>
                  </Button>
                </div>
                
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                  onClick={() => setActiveTab("all")}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  View All Documents
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Insurance Tab - Locked */}
          <TabsContent value="insurance" className="space-y-4">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                <span className="text-4xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-4">Insurance Documents</h3>
              <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
                This feature is coming soon! Insurance document management will be available in a future update.
              </p>
            </div>
          </TabsContent>

          {/* ID Documents Tab - Locked */}
          <TabsContent value="id-document" className="space-y-4">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                <span className="text-4xl">🆔</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-4">ID Documents</h3>
              <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
                This feature is coming soon! ID document management will be available in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Analysis Modal */}
      <Dialog open={isAIAnalysisModalOpen} onOpenChange={setIsAIAnalysisModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI PDF Analysis
            </DialogTitle>
          </DialogHeader>
          <AIPDFReader 
            file={selectedFileForAI}
            onAnalysisComplete={(result) => {
              console.log('AI Analysis completed:', result);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Document Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Clinical Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_record"> Medical Record</SelectItem>
                  <SelectItem value="lab_result"> Lab Report</SelectItem>
                  <SelectItem value="prescription"> Prescription</SelectItem>
                  <SelectItem value="insurance" disabled>Insurance 🔒</SelectItem>
                  <SelectItem value="id_document" disabled>ID Document 🔒</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter document content"
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X className="w-3 h-3 ml-1" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-priority"
                checked={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.checked }))}
              />
              <Label htmlFor="edit-priority">Priority document</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                console.log("Cancel button clicked");
                setIsEditModalOpen(false);
                setEditingDoc(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                console.log("Update button clicked");
                handleEditDocument();
              }}>
                Update Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicalDocs;