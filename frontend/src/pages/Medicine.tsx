import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  Plus,
  Minus,
  Star,
  Truck,
  Shield,
  Clock
} from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  inStock: boolean;
  prescription: boolean;
  image: string;
}

const medicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    description: 'Pain reliever and fever reducer',
    price: 120,
    originalPrice: 150,
    category: 'Pain Relief',
    rating: 4.5,
    inStock: true,
    prescription: false,
    image: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Ibuprofen 400mg',
    description: 'Anti-inflammatory pain reliever',
    price: 180,
    category: 'Pain Relief',
    rating: 4.3,
    inStock: true,
    prescription: false,
    image: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Vitamin D3 1000 IU',
    description: 'Bone health and immunity support',
    price: 450,
    originalPrice: 500,
    category: 'Vitamins',
    rating: 4.7,
    inStock: true,
    prescription: false,
    image: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Omeprazole 20mg',
    description: 'Acid reflux and heartburn relief',
    price: 320,
    category: 'Digestive Health',
    rating: 4.4,
    inStock: false,
    prescription: true,
    image: '/placeholder.svg'
  }
];

const categories = ['All', 'Pain Relief', 'Vitamins', 'Digestive Health', 'Antibiotics', 'Heart Health'];

const Medicine = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicineId: string) => {
    setCart(prev => ({
      ...prev,
      [medicineId]: (prev[medicineId] || 0) + 1
    }));
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prev => ({
      ...prev,
      [medicineId]: Math.max(0, (prev[medicineId] || 0) - 1)
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [medicineId, quantity]) => {
      const medicine = medicines.find(m => m.id === medicineId);
      return total + (medicine ? medicine.price * quantity : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-medium">
              <ShoppingCart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Medicine Ordering</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Order medicines online with fast delivery and verified quality
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search medicines..."
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

        {/* Cart Summary */}
        {getTotalItems() > 0 && (
          <Card className="mb-8 border-primary/20 bg-primary-soft/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">
                    {getTotalItems()} items in cart
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-primary">
                    ₹{getTotalPrice()}
                  </span>
                  <Button className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong">
                    Checkout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medicine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedicines.map((medicine) => (
            <Card key={medicine.id} className="hover:shadow-medium transition-shadow duration-200">
              <CardHeader className="p-4 pb-2">
                <div className="aspect-square bg-muted rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">{medicine.name}</CardTitle>
                    {medicine.prescription && (
                      <Badge variant="secondary" className="text-xs">Rx</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{medicine.description}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{medicine.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">₹{medicine.price}</span>
                    {medicine.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{medicine.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="w-3 h-3" />
                    <span>Free delivery</span>
                    <Shield className="w-3 h-3 ml-2" />
                    <span>Verified</span>
                  </div>

                  {medicine.inStock ? (
                    <div className="flex items-center justify-between">
                      {cart[medicine.id] ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(medicine.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{cart[medicine.id]}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(medicine.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(medicine.id)}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Out of Stock</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No medicines found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicine;