import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Heart, X, AlertTriangle, Info, Stethoscope, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import AIChatbot from './AIChatbot';

interface BodyPart {
  id: string;
  name: string;
  symptoms: string[];
  color: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  relatedTests: string[];
  specialists: string[];
  introText: string;
}

interface SymptomModalProps {
  bodyPart: BodyPart | null;
  onClose: () => void;
  onCheckSymptoms: () => void;
}

const SymptomModal: React.FC<SymptomModalProps> = ({ bodyPart, onClose, onCheckSymptoms }: { bodyPart: BodyPart | null; onClose: () => void; onCheckSymptoms: () => void }) => {
  if (!bodyPart) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const handleCheckSymptoms = () => {
    onCheckSymptoms();
  };

  const handleFindDoctor = () => {
    // TODO: Implement doctor finder functionality
    console.log('Find doctor for:', bodyPart.name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-500" />
            {bodyPart.name}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Severity Indicator */}
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getSeverityColor(bodyPart.severity)}`}>
            {getSeverityIcon(bodyPart.severity)}
            <span className="text-sm font-medium capitalize">
              Severity: {bodyPart.severity}
            </span>
          </div>

          {/* Introductory Text */}
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {bodyPart.introText}
            </p>
          </div>

          {/* Common Symptoms */}
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">
              Common symptoms:
            </h4>
            <div className="flex flex-wrap gap-2">
              {bodyPart.symptoms.map((symptom, index) => (
                <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-gray-200">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          {/* Immediate Recommendations */}
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">
              Immediate recommendations:
            </h4>
            <ul className="space-y-2">
              {bodyPart.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Related Tests */}
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">
              Related tests:
            </h4>
            <div className="flex flex-wrap gap-2">
              {bodyPart.relatedTests.map((test, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 cursor-pointer hover:bg-green-100">
                  {test}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recommended Specialists */}
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">
              Recommended specialists:
            </h4>
            <div className="flex flex-wrap gap-2">
              {bodyPart.specialists.map((specialist, index) => (
                <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-gray-200">
                  {specialist}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleCheckSymptoms}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Check Symptoms
            </Button>
            <Button 
              onClick={handleFindDoctor}
              variant="outline"
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Find Doctor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InteractiveBodyMap3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const bodyParts: BodyPart[] = useMemo(() => [
    {
      id: 'head',
      name: 'Head',
      symptoms: ['Headache', 'Dizziness', 'Migraine'],
      color: '#4285F4', // Blue
      position: [0, 6.5, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      description: 'The head contains the brain, eyes, ears, nose, and mouth. It is responsible for thought, sight, hearing, smell, taste, and speech.',
      severity: 'high',
      recommendations: ['Consult a neurologist', 'Rest in a dark room'],
      relatedTests: ['MRI Brain', 'CT Scan Head'],
      specialists: ['Neurologist', 'Ophthalmologist'],
      introText: 'Head symptoms can indicate neurological, vascular, or sensory issues requiring prompt medical evaluation.'
    },
    {
      id: 'chest',
      name: 'Chest',
      symptoms: ['Chest pain', 'Shortness of breath', 'Cough'],
      color: '#0F9D58', // Green
      position: [0, 3.5, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      description: 'The chest houses vital organs like the heart and lungs. It is protected by the rib cage and plays a crucial role in respiration and circulation.',
      severity: 'high',
      recommendations: ['Seek immediate medical attention', 'Avoid strenuous activity'],
      relatedTests: ['ECG', 'Chest X-ray'],
      specialists: ['Cardiologist', 'Pulmonologist'],
      introText: 'Chest symptoms can indicate heart, lung, or digestive issues requiring immediate attention.'
    },
    {
      id: 'abdomen',
      name: 'Abdomen',
      symptoms: ['Abdominal pain', 'Nausea', 'Diarrhea'],
      color: '#F4B400', // Amber/Brown
      position: [0, 0.5, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      description: 'The abdomen contains digestive organs such as the stomach, intestines, liver, and kidneys. It is a common site for various digestive issues.',
      severity: 'medium',
      recommendations: ['Hydrate well', 'Eat bland foods'],
      relatedTests: ['Abdominal Ultrasound', 'Colonoscopy'],
      specialists: ['Gastroenterologist', 'Urologist'],
      introText: 'Abdominal symptoms can indicate digestive, reproductive, or systemic conditions that may require medical evaluation.'
    },
    {
      id: 'left-arm',
      name: 'Left Arm',
      symptoms: ['Arm pain', 'Numbness', 'Weakness'],
      color: '#8B008B', // Purple
      position: [-1.5, 3.5, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      description: 'The left arm is an upper limb used for movement and manipulation. It consists of the humerus, radius, and ulna bones.',
      severity: 'low',
      recommendations: ['Rest and ice', 'Physical therapy'],
      relatedTests: ['X-ray Arm', 'Nerve Conduction Study'],
      specialists: ['Orthopedist', 'Physiotherapist'],
      introText: 'Arm symptoms can indicate musculoskeletal, neurological, or circulatory issues that may require medical attention.'
    },
    {
      id: 'right-arm',
      name: 'Right Arm',
      symptoms: ['Arm pain', 'Numbness', 'Weakness'],
      color: '#8B008B', // Purple
      position: [1.5, 3.5, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      description: 'The right arm is an upper limb used for movement and manipulation. It consists of the humerus, radius, and ulna bones.',
      severity: 'low',
      recommendations: ['Rest and ice', 'Physical therapy'],
      relatedTests: ['X-ray Arm', 'Nerve Conduction Study'],
      specialists: ['Orthopedist', 'Physiotherapist'],
      introText: 'Arm symptoms can indicate musculoskeletal, neurological, or circulatory issues that may require medical attention.'
    },
    {
      id: 'left-leg',
      name: 'Left Leg',
      symptoms: ['Leg pain', 'Swelling', 'Cramps'],
      color: '#DB4437', // Red
      position: [-0.5, -3.5, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      description: 'The left leg is a lower limb used for locomotion and support. It consists of the femur, tibia, and fibula bones.',
      severity: 'low',
      recommendations: ['Elevate leg', 'Gentle massage'],
      relatedTests: ['X-ray Leg', 'Doppler Ultrasound'],
      specialists: ['Orthopedist', 'Vascular Specialist'],
      introText: 'Leg symptoms can indicate musculoskeletal, neurological, or circulatory issues that may require medical evaluation.'
    },
    {
      id: 'right-leg',
      name: 'Right Leg',
      symptoms: ['Leg pain', 'Swelling', 'Cramps'],
      color: '#DB4437', // Red
      position: [0.5, -3.5, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      description: 'The right leg is a lower limb used for locomotion and support. It consists of the femur, tibia, and fibula bones.',
      severity: 'low',
      recommendations: ['Elevate leg', 'Gentle massage'],
      relatedTests: ['X-ray Leg', 'Doppler Ultrasound'],
      specialists: ['Orthopedist', 'Vascular Specialist'],
      introText: 'Leg symptoms can indicate musculoskeletal, neurological, or circulatory issues that may require medical evaluation.'
    }
  ], []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Revert to simpler lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.enablePan = true;
    controls.enableZoom = true;

    // Create body parts
    const bodyPartMeshes: { [key: string]: THREE.Mesh } = {};
    const bodyPartMaterials: { [key: string]: THREE.MeshStandardMaterial } = {};

    bodyParts.forEach((part) => {
      let geometry: THREE.BufferGeometry;
      
      switch (part.id) {
        case 'head':
          geometry = new THREE.SphereGeometry(1, 32, 32); // Simple sphere
          break;
        case 'chest':
          geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 16); // Wider cylinder for upper torso
          break;
        case 'abdomen':
          geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 16); // Cylinder for lower torso
          break;
        case 'left-arm':
        case 'right-arm':
          geometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 16); // Simple cylinder for arms
          break;
        case 'left-leg':
        case 'right-leg':
          geometry = new THREE.CylinderGeometry(0.6, 0.6, 4, 16); // Simple cylinder for legs
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1); // Fallback
      }

      // Revert to simple, solid color materials as per the image
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color), // Use the color defined in bodyParts
        transparent: true,
        opacity: 1.0, // Fully opaque
        roughness: 0.5, // Default roughness
        metalness: 0.0, // No metalness
        envMapIntensity: 0 // No environment reflection
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...part.position);
      mesh.scale.set(...part.scale);
      mesh.rotation.set(...part.rotation);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Store references
      mesh.userData = { bodyPartId: part.id };
      bodyPartMeshes[part.id] = mesh;
      bodyPartMaterials[part.id] = material;

      scene.add(mesh);
    });

    // Removed connection lines for simplified model

    // Add ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf1f5f9, 
      transparent: true, 
      opacity: 0.3 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -8;
    ground.receiveShadow = true;
    scene.add(ground);

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse event handlers
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(bodyPartMeshes));

      // Reset all materials
      Object.values(bodyPartMaterials).forEach(material => {
        material.opacity = 0.8;
        material.emissive.setHex(0x000000);
      });

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object as THREE.Mesh;
        const bodyPartId = intersectedMesh.userData.bodyPartId;
        const material = bodyPartMaterials[bodyPartId];
        
        material.opacity = 1.0;
        material.emissive.setHex(0x333333);
        setHoveredPart(bodyPartId);
        
        // Change cursor
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredPart(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(bodyPartMeshes));

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object as THREE.Mesh;
        const bodyPartId = intersectedMesh.userData.bodyPartId;
        const bodyPart = bodyParts.find(part => part.id === bodyPartId);
        if (bodyPart) {
          setSelectedBodyPart(bodyPart);
        }
      }
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    setIsLoading(false);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onMouseClick);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      Object.values(bodyPartMaterials).forEach(material => material.dispose());
      Object.values(bodyPartMeshes).forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
      });
    };
  }, [bodyParts]);

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-red-500" />
            3D Interactive Body Map
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Click on body parts to explore symptoms and get health insights
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading 3D Model...</p>
                </div>
              </div>
            )}
            
            <div 
              ref={mountRef} 
              className="w-full h-80 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50"
            />
            
            <div className="mt-3 text-center text-xs text-muted-foreground">
              <p className="mb-1">
                <strong>Controls:</strong> Left click to rotate • Scroll to zoom • Right click to pan
              </p>
              <p>
                <strong>Tip:</strong> Hover over body parts to highlight them, click to see detailed information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SymptomModal 
        bodyPart={selectedBodyPart} 
        onClose={() => setSelectedBodyPart(null)}
        onCheckSymptoms={() => setIsAIChatOpen(true)}
      />

      {/* AI Chatbot */}
      <AIChatbot
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        initialBodyPart={selectedBodyPart?.name}
        initialSymptoms={selectedBodyPart?.symptoms}
      />
    </div>
  );
};

export default InteractiveBodyMap3D;
