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
  Star
} from "lucide-react";

const mockDocuments = [
  {
    id: 1,
    title: "Cardiology Consultation Notes",
    date: "2024-01-15",
    doctor: "Dr. Sarah Johnson",
    type: "Consultation",
    priority: "High",
    tags: ["Cardiology", "Follow-up"]
  },
  {
    id: 2,
    title: "Lab Results - Complete Blood Count",
    date: "2024-01-14",
    doctor: "Dr. Michael Chen",
    type: "Lab Report",
    priority: "Normal",
    tags: ["Lab Results", "Blood Work"]
  },
  {
    id: 3,
    title: "Physical Therapy Assessment",
    date: "2024-01-12",
    doctor: "Dr. Lisa Rodriguez",
    type: "Assessment",
    priority: "Medium",
    tags: ["Physical Therapy", "Rehabilitation"]
  },
];

const ClinicalDocs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredDocs = mockDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <Button className="bg-gradient-accent text-accent-foreground shadow-medium hover:shadow-strong">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
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
            <Button variant="outline" className="sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
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
                      <p className="text-2xl font-bold text-accent">24</p>
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
                      <p className="text-2xl font-bold text-foreground">12</p>
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
                      <p className="text-2xl font-bold text-foreground">8</p>
                      <p className="text-sm text-muted-foreground">Doctors</p>
                    </div>
                    <User className="w-8 h-8 text-secondary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">3</p>
                      <p className="text-sm text-muted-foreground">Priority Items</p>
                    </div>
                    <Star className="w-8 h-8 text-orange-500/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocs.map((doc) => (
                <Card key={doc.id} className="hover:shadow-medium transition-all duration-300">
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
                                <User className="w-3 h-3" />
                                {doc.doctor}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {doc.date}
                              </span>
                            </div>
                          </div>
                          <Badge 
                            variant={doc.priority === "High" ? "destructive" : 
                                   doc.priority === "Medium" ? "default" : "secondary"}
                            className="ml-4"
                          >
                            {doc.priority}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {doc.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="consultation">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No consultation documents</h3>
              <p className="text-muted-foreground mb-4">Upload your first consultation document to get started.</p>
              <Button className="bg-gradient-accent text-accent-foreground">
                Upload Consultation
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="lab">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lab reports</h3>
              <p className="text-muted-foreground mb-4">Upload your lab reports for easy access and tracking.</p>
              <Button className="bg-gradient-accent text-accent-foreground">
                Upload Lab Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="assessment">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assessments</h3>
              <p className="text-muted-foreground mb-4">Assessment documents will appear here once uploaded.</p>
              <Button className="bg-gradient-accent text-accent-foreground">
                Upload Assessment
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClinicalDocs;