import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Stethoscope,
  MapPin,
  Star,
  Clock,
  Phone,
  Calendar,
  Search,
  Filter,
  Heart,
  Brain,
  Eye,
  Bone,
  Users,
  Award
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  rating: number;
  location: string;
  distance: string;
  availability: string;
  consultationFee: number;
  image: string;
  languages: string[];
  verified: boolean;
}

const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialization: 'Cardiologist',
    qualification: 'MD, DM Cardiology',
    experience: 15,
    rating: 4.8,
    location: 'Apollo Hospital, Delhi',
    distance: '2.3 km',
    availability: 'Available Today',
    consultationFee: 1500,
    image: '/placeholder.svg',
    languages: ['Hindi', 'English'],
    verified: true
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    specialization: 'Neurologist',
    qualification: 'MBBS, MD Neurology',
    experience: 12,
    rating: 4.6,
    location: 'Max Hospital, Gurgaon',
    distance: '5.1 km',
    availability: 'Tomorrow 10 AM',
    consultationFee: 1200,
    image: '/placeholder.svg',
    languages: ['Hindi', 'English', 'Punjabi'],
    verified: true
  },
  {
    id: '3',
    name: 'Dr. Anita Gupta',
    specialization: 'Ophthalmologist',
    qualification: 'MBBS, MS Ophthalmology',
    experience: 8,
    rating: 4.7,
    location: 'Fortis Hospital, Noida',
    distance: '3.7 km',
    availability: 'Available Today',
    consultationFee: 800,
    image: '/placeholder.svg',
    languages: ['Hindi', 'English'],
    verified: true
  },
  {
    id: '4',
    name: 'Dr. Vikram Singh',
    specialization: 'Orthopedist',
    qualification: 'MBBS, MS Orthopedics',
    experience: 20,
    rating: 4.9,
    location: 'AIIMS, Delhi',
    distance: '4.2 km',
    availability: 'Next Week',
    consultationFee: 1000,
    image: '/placeholder.svg',
    languages: ['Hindi', 'English'],
    verified: true
  }
];

const specializations = [
  'All',
  'Cardiologist',
  'Neurologist',
  'Ophthalmologist',
  'Orthopedist',
  'Dermatologist',
  'Gynecologist',
  'Pediatrician'
];

const getSpecializationIcon = (specialization: string) => {
  switch (specialization.toLowerCase()) {
    case 'cardiologist': return Heart;
    case 'neurologist': return Brain;
    case 'ophthalmologist': return Eye;
    case 'orthopedist': return Bone;
    default: return Stethoscope;
  }
};

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'fee'>('rating');

  const filteredDoctors = doctors
    .filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = selectedSpecialization === "All" || 
                                   doctor.specialization === selectedSpecialization;
      return matchesSearch && matchesSpecialization;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'distance': return parseFloat(a.distance) - parseFloat(b.distance);
        case 'fee': return a.consultationFee - b.consultationFee;
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-medium">
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Doctor Directory</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find and book appointments with verified doctors near you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search doctors or specializations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {specializations.map((spec) => (
              <Button
                key={spec}
                variant={selectedSpecialization === spec ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialization(spec)}
                className={selectedSpecialization === spec ? "bg-primary text-primary-foreground" : ""}
              >
                {spec}
              </Button>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="rating">Sort by Rating</option>
              <option value="distance">Sort by Distance</option>
              <option value="fee">Sort by Fee</option>
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => {
            const IconComponent = getSpecializationIcon(doctor.specialization);
            
            return (
              <Card key={doctor.id} className="hover:shadow-medium transition-shadow duration-200">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg leading-tight">{doctor.name}</CardTitle>
                          <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
                          <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
                        </div>
                        {doctor.verified && (
                          <Badge className="bg-primary text-primary-foreground">
                            <Award className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {/* Rating and Experience */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span className="text-muted-foreground">({doctor.experience} yrs exp)</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">1000+ patients</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{doctor.location}</p>
                        <p className="text-xs">{doctor.distance} away</p>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1">
                      {doctor.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>

                    {/* Availability and Fee */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">{doctor.availability}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">₹{doctor.consultationFee}</p>
                        <p className="text-xs text-muted-foreground">Consultation</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button size="sm" className="flex-1 bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No doctors found</p>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;