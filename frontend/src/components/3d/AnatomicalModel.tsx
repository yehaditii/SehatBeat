import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface BodyPart {
  name: string;
  position: [number, number, number];
  color: string;
  symptoms: string[];
}

const bodyParts: BodyPart[] = [
  { name: "Head", position: [0, 1.5, 0], color: "#3B82F6", symptoms: ["Headache", "Dizziness", "Vision issues"] },
  { name: "Chest", position: [0, 0.5, 0], color: "#10B981", symptoms: ["Chest pain", "Shortness of breath", "Heart palpitations"] },
  { name: "Abdomen", position: [0, -0.2, 0], color: "#F59E0B", symptoms: ["Stomach pain", "Nausea", "Digestive issues"] },
  { name: "Left Arm", position: [-0.8, 0.3, 0], color: "#8B5CF6", symptoms: ["Arm pain", "Numbness", "Weakness"] },
  { name: "Right Arm", position: [0.8, 0.3, 0], color: "#8B5CF6", symptoms: ["Arm pain", "Numbness", "Weakness"] },
  { name: "Left Leg", position: [-0.3, -1.2, 0], color: "#EF4444", symptoms: ["Leg pain", "Swelling", "Mobility issues"] },
  { name: "Right Leg", position: [0.3, -1.2, 0], color: "#EF4444", symptoms: ["Leg pain", "Swelling", "Mobility issues"] },
];

export const AnatomicalModel = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const meshRefs = useRef<{ [key: string]: THREE.Mesh }>({});

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create body parts
    bodyParts.forEach((part) => {
      let geometry: THREE.BufferGeometry;
      
      switch (part.name) {
        case "Head":
          geometry = new THREE.SphereGeometry(0.25, 32, 32);
          break;
        case "Chest":
          geometry = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 32);
          break;
        case "Abdomen":
          geometry = new THREE.CylinderGeometry(0.5, 0.4, 0.6, 32);
          break;
        case "Left Arm":
        case "Right Arm":
          geometry = new THREE.CylinderGeometry(0.1, 0.12, 1.2, 16);
          break;
        case "Left Leg":
        case "Right Leg":
          geometry = new THREE.CylinderGeometry(0.12, 0.15, 1.4, 16);
          break;
        default:
          geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      }

      const material = new THREE.MeshPhongMaterial({
        color: part.color,
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...part.position);
      mesh.userData = { name: part.name };
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      scene.add(mesh);
      meshRefs.current[part.name] = mesh;
    });

    // Mouse interaction setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object as THREE.Mesh;
        const partName = intersectedObject.userData.name;
        
        if (partName && partName !== hoveredPart) {
          setHoveredPart(partName);
          
          // Reset all materials
          Object.values(meshRefs.current).forEach(mesh => {
            if (mesh.material instanceof THREE.MeshPhongMaterial) {
              mesh.material.opacity = 0.8;
              mesh.scale.set(1, 1, 1);
            }
          });
          
          // Highlight hovered part
          if (intersectedObject.material instanceof THREE.MeshPhongMaterial) {
            intersectedObject.material.opacity = 1;
            intersectedObject.scale.set(1.1, 1.1, 1.1);
          }
        }
      } else {
        setHoveredPart(null);
        // Reset all materials
        Object.values(meshRefs.current).forEach(mesh => {
          if (mesh.material instanceof THREE.MeshPhongMaterial) {
            mesh.material.opacity = 0.8;
            mesh.scale.set(1, 1, 1);
          }
        });
      }
    };

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object as THREE.Mesh;
        const partName = intersectedObject.userData.name;
        const part = bodyParts.find(p => p.name === partName);
        if (part) {
          setSelectedPart(part);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Gentle rotation
      scene.rotation.y += 0.005;
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.dispose();
    };
  }, [hoveredPart]);

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-96 rounded-lg overflow-hidden shadow-medium" />
      
      {hoveredPart && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="animate-float">
            Hover: {hoveredPart}
          </Badge>
        </div>
      )}

      {selectedPart && (
        <Card className="absolute top-4 right-4 p-4 max-w-sm z-10 bg-background/95 backdrop-blur-sm shadow-strong">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{selectedPart.name}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPart(null)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Common symptoms:</p>
              <div className="flex flex-wrap gap-1">
                {selectedPart.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>
            <Button size="sm" className="w-full bg-gradient-primary text-primary-foreground">
              Check Symptoms
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};