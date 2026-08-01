import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Volume2, Shield } from 'lucide-react';

interface EarHotspotsProps {
  earSelection: string;
  setEarSelection: (sel: string) => void;
  selectedHotspots: string[];
  setSelectedHotspots: React.Dispatch<React.SetStateAction<string[]>>;
}

const HOTSPOT_DETAILS: Record<string, { label: string; desc: string; pos: [number, number, number] }> = {
  helix: { label: "Helix / Outer Rim", desc: "Peripheral high frequency buzzing, often reported in somatic tinnitus.", pos: [-0.6, 1.1, 0.15] },
  canal: { label: "External Auditory Canal", desc: "Perceived ringing within the canal, common in noise exposure or wax accumulation.", pos: [-0.3, 0.0, 0.4] },
  eardrum: { label: "Tympanic Membrane (Eardrum)", desc: "Internal deep ringing, often linked to middle-ear pressure or mechanical fatigue.", pos: [0.15, -0.1, 0.05] },
  mastoid: { label: "Mastoid Area (Behind Ear)", desc: "Deep bone conduction hum, common in vascular or tensor tympani contractions.", pos: [0.7, 0.1, -0.3] },
  lobe: { label: "Lobule (Earlobe)", desc: "Lower peripheral buzz, sometimes influenced by neck or jaw posture (somatic).", pos: [0.2, -1.2, 0.1] }
};

export const EarHotspots: React.FC<EarHotspotsProps> = ({
  earSelection,
  setEarSelection,
  selectedHotspots,
  setSelectedHotspots
}) => {
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  
  // Track inputs in refs so the animation loop doesn't have closures on stale state
  const selectedHotspotsRef = useRef<string[]>([]);
  selectedHotspotsRef.current = selectedHotspots;

  const toggleHotspot = (id: string) => {
    if (selectedHotspots.includes(id)) {
      setSelectedHotspots(selectedHotspots.filter(h => h !== id));
    } else {
      setSelectedHotspots([...selectedHotspots, id]);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Dimensions
    const width = 280;
    const height = 340;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // transparent background for modern look

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.0;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Group to hold the ear parts for rotation
    const earGroup = new THREE.Group();
    scene.add(earGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(0, 4, 5);
    scene.add(dirLight);

    // 1. Procedural 3D Ear Outline Line (Helix Rim)
    const outerPoints = [
      new THREE.Vector3(-0.2, 1.5, 0.0),
      new THREE.Vector3(-0.7, 1.2, 0.15),
      new THREE.Vector3(-1.0, 0.6, 0.25),
      new THREE.Vector3(-1.1, -0.1, 0.25),
      new THREE.Vector3(-0.9, -0.8, 0.15),
      new THREE.Vector3(-0.5, -1.3, 0.05),
      new THREE.Vector3(0.1, -1.5, -0.1),
      new THREE.Vector3(0.5, -1.4, -0.2),
      new THREE.Vector3(0.8, -0.9, -0.3),
      new THREE.Vector3(0.9, -0.2, -0.3),
      new THREE.Vector3(0.9, 0.4, -0.2),
      new THREE.Vector3(0.7, 1.0, -0.1),
      new THREE.Vector3(0.3, 1.4, 0.0),
      new THREE.Vector3(-0.2, 1.5, 0.0)
    ];
    const outerCurve = new THREE.CatmullRomCurve3(outerPoints);
    const outerPointsArray = outerCurve.getPoints(50);
    const outerLineGeometry = new THREE.BufferGeometry().setFromPoints(outerPointsArray);
    const outerLineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x6366f1, // Indigo
      transparent: true,
      opacity: 0.8
    });
    const outerLine = new THREE.Line(outerLineGeometry, outerLineMaterial);
    earGroup.add(outerLine);

    // 2. Inner Antihelix Folds Line
    const innerPoints = [
      new THREE.Vector3(-0.15, 0.9, 0.05),
      new THREE.Vector3(-0.45, 0.7, 0.15),
      new THREE.Vector3(-0.65, 0.3, 0.2),
      new THREE.Vector3(-0.65, -0.2, 0.1),
      new THREE.Vector3(-0.45, -0.6, 0.05),
      new THREE.Vector3(0.0, -0.8, -0.1),
      new THREE.Vector3(0.3, -0.7, -0.1),
      new THREE.Vector3(0.4, -0.3, 0.0)
    ];
    const innerCurve = new THREE.CatmullRomCurve3(innerPoints);
    const innerPointsArray = innerCurve.getPoints(50);
    const innerLineGeometry = new THREE.BufferGeometry().setFromPoints(innerPointsArray);
    const innerLineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x818cf8, // Indigo Light
      transparent: true,
      opacity: 0.6
    });
    const innerLine = new THREE.Line(innerLineGeometry, innerLineMaterial);
    earGroup.add(innerLine);

    // 3. Grid Rings for medical aesthetic
    const ringGeom = new THREE.RingGeometry(1.3, 1.32, 64);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x475569, // Slate
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.1 
    });
    const gridRing = new THREE.Mesh(ringGeom, ringMat);
    gridRing.rotation.x = Math.PI / 2.3;
    gridRing.position.y = -0.2;
    earGroup.add(gridRing);

    // 4. Hotspot Interactive Spheres
    const sphereGeom = new THREE.SphereGeometry(0.12, 32, 32);
    const glowGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const spheres: THREE.Mesh[] = [];
    const glows: THREE.Mesh[] = [];

    Object.entries(HOTSPOT_DETAILS).forEach(([key, details]) => {
      // Core sphere
      const mat = new THREE.MeshPhongMaterial({
        color: 0x94a3b8,
        emissive: 0x0f172a,
        shininess: 40,
        transparent: true,
        opacity: 0.85
      });
      const sphere = new THREE.Mesh(sphereGeom, mat);
      sphere.position.set(...details.pos);
      sphere.name = key;
      earGroup.add(sphere);
      spheres.push(sphere);

      // Glow halo shell
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.set(...details.pos);
      glow.name = `${key}_glow`;
      earGroup.add(glow);
      glows.push(glow);
    });

    // Interaction Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredKey: string | null = null;

    // Mouse handlers on canvas
    const handleCanvasMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(spheres);

      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        if (hoveredKey !== obj.name) {
          hoveredKey = obj.name;
          setActiveHover(obj.name);
          document.body.style.cursor = 'pointer';
        }
      } else {
        if (hoveredKey !== null) {
          hoveredKey = null;
          setActiveHover(null);
          document.body.style.cursor = 'default';
        }
      }
    };

    const handleCanvasClick = () => {
      if (hoveredKey) {
        toggleHotspot(hoveredKey);
      }
    };

    // Add events
    renderer.domElement.addEventListener('mousemove', handleCanvasMouseMove);
    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Mouse Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMoveDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };
      
      earGroup.rotation.y += deltaMove.x * 0.007;
      earGroup.rotation.x += deltaMove.y * 0.007;
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMoveDrag);
    window.addEventListener('mouseup', handleMouseUp);

    // Render Animation Loop
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle auto-rotation if not dragging
      if (!isDragging) {
        earGroup.rotation.y = Math.sin(elapsed * 0.2) * 0.15;
      }

      // Update sphere colors and glowing shells dynamically based on selected status
      spheres.forEach(s => {
        const mat = s.material as THREE.MeshPhongMaterial;
        const isSelected = selectedHotspotsRef.current.includes(s.name);
        const isHovered = hoveredKey === s.name;

        if (isSelected) {
          mat.color.setHex(0x10b981); // Emerald green for selected
          mat.emissive.setHex(0x064e3b);
        } else if (isHovered) {
          mat.color.setHex(0x818cf8); // light indigo for hovered
          mat.emissive.setHex(0x312e81);
        } else {
          mat.color.setHex(0x6366f1); // standard indigo
          mat.emissive.setHex(0x0f172a);
        }
      });

      // Update glow shells pulsing sizes & opacity
      glows.forEach(g => {
        const key = g.name.replace('_glow', '');
        const isSelected = selectedHotspotsRef.current.includes(key);
        const isHovered = hoveredKey === key;
        const mat = g.material as THREE.MeshBasicMaterial;

        if (isSelected) {
          mat.opacity = 0.25 + Math.sin(elapsed * 6) * 0.15; // pulse outline
          mat.color.setHex(0x10b981);
          g.scale.setScalar(1.0 + Math.sin(elapsed * 4) * 0.08);
        } else if (isHovered) {
          mat.opacity = 0.3;
          mat.color.setHex(0x818cf8);
          g.scale.setScalar(1.1);
        } else {
          mat.opacity = 0.0;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(frameId);
      
      // Events
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', handleCanvasMouseMove);
        renderer.domElement.removeEventListener('click', handleCanvasClick);
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      }
      window.removeEventListener('mousemove', handleMouseMoveDrag);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';

      // Memory
      renderer.dispose();
      outerLineGeometry.dispose();
      outerLineMaterial.dispose();
      innerLineGeometry.dispose();
      innerLineMaterial.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      sphereGeom.dispose();
      glowGeom.dispose();

      spheres.forEach(s => {
        if (s.material instanceof THREE.Material) s.material.dispose();
      });
      glows.forEach(g => {
        if (g.material instanceof THREE.Material) g.material.dispose();
      });

      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [selectedHotspots]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-sans">
      <div className="bg-white/85 dark:bg-slate-900/85 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-850 dark:text-slate-100 mb-2">Step 1: Tinnitus Location Map</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-normal">
          Select which ears are affected, then rotate and interact with the 3D WebGL ear model to pin-point anatomical hotspots.
        </p>

        {/* Ear Selector Buttons */}
        <div className="flex gap-2.5 mb-5">
          {['left', 'right', 'both'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEarSelection(type)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                earSelection === type
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'bg-slate-50 text-slate-655 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700'
              }`}
            >
              {type} Ear
            </button>
          ))}
        </div>

        {/* Contextual Hotspot Box */}
        <div className="min-h-[140px] bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          {activeHover || (selectedHotspots.length > 0 ? selectedHotspots[selectedHotspots.length - 1] : null) ? (
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2 uppercase">
                <Volume2 className="w-3.5 h-3.5" />
                {HOTSPOT_DETAILS[activeHover || selectedHotspots[selectedHotspots.length - 1]]?.label}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                {HOTSPOT_DETAILS[activeHover || selectedHotspots[selectedHotspots.length - 1]]?.desc}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Shield className="w-8 h-8 text-slate-450 dark:text-slate-600 mb-2 animate-pulse" />
              <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">
                Hover or click hotspots on the 3D ear model to view clinical anatomical details. Drag to rotate model.
              </p>
            </div>
          )}
        </div>

        {/* Selected List */}
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedHotspots.map(h => (
            <span
              key={h}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-350 border border-emerald-100 dark:border-emerald-900/50"
            >
              {HOTSPOT_DETAILS[h]?.label.split(' (')[0]}
              <button
                type="button"
                onClick={() => toggleHotspot(h)}
                className="hover:text-emerald-900 font-bold ml-1 text-sm focus:outline-none cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas container */}
      <div className="flex flex-col justify-center items-center p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-800 relative select-none min-h-[360px]">
        {/* Floating Rotation guide */}
        <div className="absolute top-4 left-4 bg-white/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[10px] font-bold px-2 py-1 rounded text-slate-450 dark:text-slate-500">
          WebGL 3D Mode • Click & Drag to Rotate
        </div>

        <div ref={mountRef} className="w-[280px] h-[340px] drop-shadow-xl" />
      </div>
    </div>
  );
};
export default EarHotspots;
