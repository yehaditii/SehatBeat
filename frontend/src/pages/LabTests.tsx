import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TestTube, 
  Upload,
  Calendar,
  Clock,
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";

interface LabTest {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  preparation: string;
  category: string;
}

interface TestResult {
  id: string;
  testName: string;
  date: string;
  status: 'completed' | 'pending' | 'in-progress';
  results?: string;
}

const availableTests: LabTest[] = [
  {
    id: '1',
    name: 'Complete Blood Count (CBC)',
    description: 'Comprehensive blood analysis including RBC, WBC, platelets',
    price: 500,
    duration: '2 hours',
    preparation: 'No fasting required',
    category: 'Blood Tests'
  },
  {
    id: '2',
    name: 'Lipid Profile',
    description: 'Cholesterol, triglycerides, HDL, LDL analysis',
    price: 800,
    duration: '4 hours',
    preparation: '12 hours fasting required',
    category: 'Blood Tests'
  },
  {
    id: '3',
    name: 'HbA1c (Diabetes)',
    description: 'Average blood sugar levels over 2-3 months',
    price: 600,
    duration: '3 hours',
    preparation: 'No fasting required',
    category: 'Diabetes'
  },
  {
    id: '4',
    name: 'Thyroid Function Test',
    description: 'TSH, T3, T4 levels assessment',
    price: 900,
    duration: '4 hours',
    preparation: 'No special preparation',
    category: 'Hormones'
  }
];

const testResults: TestResult[] = [
  {
    id: '1',
    testName: 'Complete Blood Count',
    date: '2024-01-10',
    status: 'completed',
    results: 'All parameters within normal range'
  },
  {
    id: '2',
    testName: 'Lipid Profile',
    date: '2024-01-15',
    status: 'in-progress'
  },
  {
    id: '3',
    testName: 'Vitamin D',
    date: '2024-01-18',
    status: 'pending'
  }
];

const categories = ['All', 'Blood Tests', 'Diabetes', 'Hormones', 'Vitamins', 'Cardiac'];

const LabTests = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'schedule' | 'results' | 'upload'>('browse');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const filteredTests = availableTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleTestSelection = (testId: string) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-secondary" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-accent" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'in-progress': return 'bg-secondary text-secondary-foreground';
      case 'pending': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-medium">
              <TestTube className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Lab Tests</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schedule lab tests, upload reports, and track your health metrics
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'browse', label: 'Browse Tests', icon: Search },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'results', label: 'My Results', icon: FileText },
            { id: 'upload', label: 'Upload Report', icon: Upload }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${activeTab === tab.id ? "bg-primary text-primary-foreground" : ""}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Browse Tests Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search lab tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Tests Summary */}
            {selectedTests.length > 0 && (
              <Card className="border-primary/20 bg-primary-soft/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary">
                      {selectedTests.length} tests selected
                    </span>
                    <Button className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong">
                      Schedule Selected Tests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <Card key={test.id} className={`cursor-pointer transition-all duration-200 hover:shadow-medium ${
                  selectedTests.includes(test.id) ? 'ring-2 ring-primary bg-primary-soft/30' : ''
                }`} onClick={() => toggleTestSelection(test.id)}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">{test.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">{test.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">₹{test.price}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{test.duration}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <strong>Preparation:</strong> {test.preparation}
                      </div>

                      <Button
                        size="sm"
                        className={`w-full ${
                          selectedTests.includes(test.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                      >
                        {selectedTests.includes(test.id) ? 'Selected' : 'Select Test'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Lab Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Time</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                    <option>Morning (8:00-12:00)</option>
                    <option>Afternoon (12:00-16:00)</option>
                    <option>Evening (16:00-20:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Collection Address</label>
                  <Input placeholder="Enter your address for home collection" />
                </div>
                <Button className="w-full bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong">
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {testResults.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold text-foreground">{result.testName}</h3>
                        <p className="text-sm text-muted-foreground">Date: {result.date}</p>
                        {result.results && (
                          <p className="text-sm text-foreground mt-1">{result.results}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(result.status)} variant="secondary">
                        {result.status.replace('-', ' ')}
                      </Badge>
                      {result.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Upload Test Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Test Name</label>
                  <Input placeholder="Enter test name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Test Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Report</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Drag & drop your report or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">Supported formats: PDF, JPG, PNG</p>
                    <Button variant="outline" className="mt-4">
                      Choose File
                    </Button>
                  </div>
                </div>
                <Button className="w-full bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong">
                  Upload Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTests;