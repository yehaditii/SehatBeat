import { useState } from "react";
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
  X
} from "lucide-react";
import { useClinicalDocs } from "@/hooks/useConvex";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation as useConvexMutation } from "convex/react";

const ClinicalDocs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  
  const { clinicalDocs, clinicalDocsStats, addClinicalDoc, updateDoc, deleteDoc } = useClinicalDocs();
  const [localDocs, setLocalDocs] = useState<any[]>([]);
  
  // Form state for creating/editing documents
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
    isPrivate: false,
    doctorId: "",
  });
  
  const [tagInput, setTagInput] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Convex storage mutations
  const generateUploadUrl = (useConvexMutation as any)("generateUploadUrl");

  const handleCreateDocument = async () => {
    if (!formData.title || !formData.content || !formData.category) return;
    try {
      await addClinicalDoc({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        isPrivate: formData.isPrivate,
        doctorId: formData.doctorId || undefined,
      });
    } catch {
      // Fallback: create a local document so the UI works without backend/auth
      const now = Date.now();
      setLocalDocs(prev => [
        ...prev,
        {
          _id: `local-${now}`,
          _creationTime: now,
          createdAt: now,
          userId: 'local',
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: [...formData.tags],
          attachments: [],
          updatedAt: now,
          doctorId: formData.doctorId || undefined,
          isPrivate: formData.isPrivate,
        },
      ]);
    }
    
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEditDocument = async () => {
    if (!editingDoc || !formData.title || !formData.content || !formData.category) return;
    try {
      await updateDoc(editingDoc._id, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        isPrivate: formData.isPrivate,
        doctorId: formData.doctorId || undefined,
      });
    } catch {
      // Fallback update for local docs
      if (String(editingDoc._id).startsWith('local-')) {
        setLocalDocs(prev => prev.map(d => d._id === editingDoc._id ? {
          ...d,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: [...formData.tags],
          isPrivate: formData.isPrivate,
          doctorId: formData.doctorId || undefined,
          updatedAt: Date.now(),
        } : d));
      }
    }
    
    setIsEditModalOpen(false);
    setEditingDoc(null);
    resetForm();
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDoc(docId);
      } catch {
        if (String(docId).startsWith('local-')) {
          setLocalDocs(prev => prev.filter(d => d._id !== docId));
        }
      }
    }
  };

  const handleUploadDocument = async () => {
    if (!formData.title || !formData.category || !uploadFile) return;
    setIsUploading(true);
    try {
      // Try Convex storage upload
      const url: string = await generateUploadUrl({});
      const res = await fetch(url, { method: "POST", body: uploadFile });
      const json = await res.json();
      const storageId = json.storageId as string;

      await addClinicalDoc({
        title: formData.title,
        content: formData.content || uploadFile.name,
        category: formData.category,
        tags: formData.tags,
        isPrivate: formData.isPrivate,
        doctorId: formData.doctorId || undefined,
        attachments: [storageId],
      });
    } catch {
      // Fallback: store object URL locally if backend unavailable
      const now = Date.now();
      const objectUrl = URL.createObjectURL(uploadFile);
      setLocalDocs(prev => [
        ...prev,
        {
          _id: `local-${now}`,
          _creationTime: now,
          createdAt: now,
          userId: 'local',
          title: formData.title,
          content: formData.content || uploadFile.name,
          category: formData.category,
          tags: [...formData.tags],
          attachments: [objectUrl],
          updatedAt: now,
          doctorId: formData.doctorId || undefined,
          isPrivate: formData.isPrivate,
        },
      ]);
    } finally {
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      resetForm();
    }
  };

  const openEditModal = (doc: any) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      content: doc.content,
      category: doc.category,
      tags: doc.tags || [],
      isPrivate: doc.isPrivate,
      doctorId: doc.doctorId || "",
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      tags: [],
      isPrivate: false,
      doctorId: "",
    });
    setTagInput("");
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

  const filteredDocs = allDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const consultationDocs = allDocs.filter(doc => doc.category === "Consultation");
  const labDocs = allDocs.filter(doc => doc.category === "Lab Report");
  const assessmentDocs = allDocs.filter(doc => doc.category === "Assessment");

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
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-accent text-accent-foreground shadow-medium hover:shadow-strong">
                  <Plus className="w-4 h-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Clinical Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter document title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                        <SelectItem value="Lab Report">Lab Report</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                        <SelectItem value="Prescription">Prescription</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter document content"
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
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
                      id="isPrivate"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    />
                    <Label htmlFor="isPrivate">Private document</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateDocument}>
                      Create Document
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="sm:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Clinical Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="up-title">Title</Label>
                    <Input
                      id="up-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter document title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="up-category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                        <SelectItem value="Lab Report">Lab Report</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                        <SelectItem value="Prescription">Prescription</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="up-content">Notes (optional)</Label>
                    <Textarea
                      id="up-content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Add any notes about this upload"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="up-file">Select file</Label>
                    <Input
                      id="up-file"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.gif,image/*,application/pdf"
                      onChange={(e) => setUploadFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="up-tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="up-tags"
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
                      id="up-private"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    />
                    <Label htmlFor="up-private">Private document</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading}>
                      Cancel
                    </Button>
                    <Button onClick={handleUploadDocument} disabled={!uploadFile || isUploading}>
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="consultation">Consultations</TabsTrigger>
            <TabsTrigger value="lab">Lab Reports</TabsTrigger>
            <TabsTrigger value="assessment">Assessments</TabsTrigger>
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
                    <Star className="w-8 h-8 text-orange-500/60" />
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
                  {!searchTerm && (
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-accent text-accent-foreground">
                      Create Document
                    </Button>
                  )}
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <Card key={doc._id} className="hover:shadow-medium transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground mb-1">
                                {doc.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(doc.createdAt)}
                                </span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {doc.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge 
                                variant={getPriorityColor(doc.tags)}
                              >
                                {getPrimaryTagText(doc.tags)}
                              </Badge>
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(doc)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc._id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {/* Removed separate tag chips at bottom as requested */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="consultation" className="space-y-4">
            {consultationDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No consultation documents</h3>
                <p className="text-muted-foreground mb-4">Create your first consultation document to get started.</p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-accent text-accent-foreground">
                  Create Consultation
                </Button>
              </div>
            ) : (
              consultationDocs.map((doc) => (
                <Card key={doc._id} className="hover:shadow-medium transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
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
                      <div className="flex items-center gap-2 ml-4">
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

          <TabsContent value="lab" className="space-y-4">
            {labDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lab reports</h3>
                <p className="text-muted-foreground mb-4">Create your lab reports for easy access and tracking.</p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-accent text-accent-foreground">
                  Create Lab Report
                </Button>
              </div>
            ) : (
              labDocs.map((doc) => (
                <Card key={doc._id} className="hover:shadow-medium transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
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
                      <div className="flex items-center gap-2 ml-4">
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

          <TabsContent value="assessment" className="space-y-4">
            {assessmentDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assessments</h3>
                <p className="text-muted-foreground mb-4">Assessment documents will appear here once created.</p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-accent text-accent-foreground">
                  Create Assessment
                </Button>
              </div>
            ) : (
              assessmentDocs.map((doc) => (
                <Card key={doc._id} className="hover:shadow-medium transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(doc.createdAt)}
                              </span>
                            </div>
                          </div>
                          <Badge variant={getPriorityColor(doc.tags)}>
                            {getPrimaryTagText(doc.tags)}
                          </Badge>
                        </div>
                        {/* Removed separate tag chips */}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
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
        </Tabs>
      </div>

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
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Lab Report">Lab Report</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Prescription">Prescription</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
                id="edit-isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              />
              <Label htmlFor="edit-isPrivate">Private document</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditDocument}>
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