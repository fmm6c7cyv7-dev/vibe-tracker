'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { 
  Activity, 
  ShieldAlert, 
  Zap, 
  X, 
  TrendingUp, 
  Flame, 
  Clock,
  Sparkles
} from 'lucide-react';

export interface ServiceNodeData {
  id: string;
  name: string;
  category: string;
  color: string;
  glowColor: string;
  orbitRadius: number;
  orbitSpeed: number;
  budgetUsedPercent: number;
  burnRatePerHour: number;
  currentCredits: string;
  totalLimit: string;
  activeRequests: number;
  runwayDays: number;
  history: number[];
}

const INITIAL_SERVICES: ServiceNodeData[] = [
  {
    id: 'openai',
    name: 'OpenAI API',
    category: 'LLM Inference',
    color: '#10a37f',
    glowColor: '#34d399',
    orbitRadius: 2.8,
    orbitSpeed: 0.9,
    budgetUsedPercent: 82,
    burnRatePerHour: 2.45,
    currentCredits: '$205.00',
    totalLimit: '$250.00',
    activeRequests: 48,
    runwayDays: 6,
    history: [12, 18, 25, 30, 45, 60, 52, 70, 85, 92, 82]
  },
  {
    id: 'github',
    name: 'GitHub Actions',
    category: 'CI/CD Compute',
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    orbitRadius: 4.1,
    orbitSpeed: 0.35,
    budgetUsedPercent: 75,
    burnRatePerHour: 0.65,
    currentCredits: '$187.50',
    totalLimit: '$250.00',
    activeRequests: 4,
    runwayDays: 14,
    history: [40, 42, 45, 50, 48, 55, 65, 70, 72, 75, 75]
  },
  {
    id: 'gemini',
    name: 'Gemini 1.5 Flash',
    category: 'Multimodal Stream',
    color: '#38bdf8',
    glowColor: '#f43f5e',
    orbitRadius: 5.5,
    orbitSpeed: 1.3,
    budgetUsedPercent: 38,
    burnRatePerHour: 1.15,
    currentCredits: '$76.00',
    totalLimit: '$200.00',
    activeRequests: 112,
    runwayDays: 32,
    history: [10, 15, 20, 18, 22, 28, 30, 32, 35, 36, 38]
  },
  {
    id: 'vercel',
    name: 'Vercel Edge',
    category: 'Serverless Compute',
    color: '#f8fafc',
    glowColor: '#94a3b8',
    orbitRadius: 6.9,
    orbitSpeed: 0.25,
    budgetUsedPercent: 22,
    burnRatePerHour: 0.30,
    currentCredits: '$22.00',
    totalLimit: '$100.00',
    activeRequests: 19,
    runwayDays: 58,
    history: [15, 16, 17, 18, 19, 19, 20, 21, 21, 22, 22]
  }
];

function LiquidityCore() {
  const outerMeshRef = useRef<THREE.Mesh>(null!);
  const innerMeshRef = useRef<THREE.Mesh>(null!);
  const waveMeshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    outerMeshRef.current.rotation.y += delta * 0.15;
    outerMeshRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;

    innerMeshRef.current.rotation.y -= delta * 0.3;
    innerMeshRef.current.rotation.z += delta * 0.2;

    const pulse = 1 + Math.sin(t * 3) * 0.05;
    innerMeshRef.current.scale.set(pulse, pulse, pulse);

    waveMeshRef.current.rotation.z += delta * 0.5;
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={innerMeshRef}>
        <icosahedronGeometry args={[0.9, 2]} />
        <meshStandardMaterial 
          color="#06b6d4" 
          emissive="#3b82f6" 
          emissiveIntensity={2} 
          wireframe 
        />
      </mesh>

      <mesh ref={waveMeshRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.05, 0.02, 16, 100]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>

      <mesh ref={outerMeshRef}>
        <sphereGeometry args={[1.35, 64, 64]} />
        <meshPhysicalMaterial
          color="#c084fc"
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          ior={1.45}
          thickness={1.2}
          specularIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

interface OrbitingPlanetProps {
  data: ServiceNodeData;
  onSelect: (data: ServiceNodeData) => void;
  isSelected: boolean;
}

function OrbitingPlanet({ data, onSelect, isSelected }: OrbitingPlanetProps) {
  const orbitGroupRef = useRef<THREE.Group>(null!);
  const planetRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef<number>(Math.random() * Math.PI * 2);

  const planetScale = useMemo(() => {
    const base = 0.28;
    const extra = (data.budgetUsedPercent / 100) * 0.22;
    return base + extra;
  }, [data.budgetUsedPercent]);

  useFrame((_, delta) => {
    angleRef.current += data.orbitSpeed * delta * 0.4;
    const x = Math.cos(angleRef.current) * data.orbitRadius;
    const z = Math.sin(angleRef.current) * data.orbitRadius;

    if (planetRef.current) {
      planetRef.current.position.set(x, 0, z);
      planetRef.current.rotation.y += delta * 1.5;

      const currentHoverScale = hovered || isSelected ? planetScale * 1.35 : planetScale;
      planetRef.current.scale.lerp(
        new THREE.Vector3(currentHoverScale, currentHoverScale, currentHoverScale),
        0.1
      );
    }
  });

  return (
    <group ref={orbitGroupRef} rotation={[Math.PI / 3.2, 0.2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[data.orbitRadius, 0.012, 16, 120]} />
        <meshBasicMaterial 
          color={isSelected ? '#ffffff' : data.color} 
          transparent 
          opacity={isSelected ? 0.7 : 0.25} 
        />
      </mesh>

      <mesh
        ref={planetRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={data.color}
          emissive={data.glowColor}
          emissiveIntensity={hovered || isSelected ? 2.5 : 1.2}
          roughness={0.15}
          metalness={0.2}
          transmission={0.65}
          thickness={0.8}
        />
      </mesh>
    </group>
  );
}

interface ServiceModalProps {
  data: ServiceNodeData | null;
  onClose: () => void;
}

function ServiceModal({ data, onClose }: ServiceModalProps) {
  if (!data) return null;

  return (
    <div className="absolute top-20 right-8 z-30 w-96 rounded-2xl border border-white/10 bg-slate-950/75 p-6 backdrop-blur-2xl shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full shadow-[0_0_12px]"
            style={{ backgroundColor: data.color, boxShadow: `0 0 16px ${data.glowColor}` }} 
          />
          <div>
            <h3 className="font-semibold text-lg tracking-wide">{data.name}</h3>
            <p className="text-xs text-slate-400">{data.category}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 my-5">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Burn-Rate</span>
          </div>
          <div className="text-xl font-bold tracking-tight">${data.burnRatePerHour.toFixed(2)}<span className="text-xs font-normal text-slate-400">/h</span></div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Runway Kvar</span>
          </div>
          <div className="text-xl font-bold tracking-tight">{data.runwayDays} <span className="text-xs font-normal text-slate-400">dagar</span></div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">Förbrukning ({data.currentCredits} / {data.totalLimit})</span>
          <span className={`font-semibold ${data.budgetUsedPercent > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {data.budgetUsedPercent}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${data.budgetUsedPercent}%`,
              backgroundColor: data.budgetUsedPercent > 80 ? '#f43f5e' : data.color 
            }} 
          />
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-300" />
            <span>Burn-Rate Trend (senaste 24h)</span>
          </div>
          <span className="text-emerald-400 font-mono">Live</span>
        </div>
        <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 40">
          <polyline
            fill="none"
            stroke={data.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.history
              .map((val, idx) => `${(idx / (data.history.length - 1)) * 100},${40 - (val / 100) * 35}`)
              .join(' ')}
          />
        </svg>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => alert(`Kill-switch aktiverad för ${data.name}.`)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
        >
          <ShieldAlert className="w-4 h-4" />
          Kill Switch
        </button>
        <button 
          onClick={() => alert(`Fyller på krediter för ${data.name}`)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          Fyll på krediter
        </button>
      </div>
    </div>
  );
}

export default function VibeTrackerDashboard() {
  const [services] = useState<ServiceNodeData[]>(INITIAL_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceNodeData | null>(INITIAL_SERVICES[0]);

  const totalBurn = useMemo(() => {
    return services.reduce((acc, s) => acc + s.burnRatePerHour, 0).toFixed(2);
  }, [services]);

  const activeReqs = useMemo(() => {
    return services.reduce((acc, s) => acc + s.activeRequests, 0);
  }, [services]);

  return (
    <div className="relative w-full h-screen bg-[#08090c] overflow-hidden select-none font-sans">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-white text-lg">VibeTracker</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono">v1.0 Live</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">System Flow:</span>
            <span className="font-semibold text-white">Nominal</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Total Burn:</span>
            <span className="font-semibold text-white">${totalBurn}/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Aktiv Load:</span>
            <span className="font-semibold text-white">{activeReqs} req/s</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("NÖDSTOPP: Alla gateways frysta.")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs font-medium hover:bg-rose-500/20 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Nödstopp
          </button>
        </div>
      </header>

      <Canvas
        camera={{ position: [0, 7, 10], fov: 45 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#ec4899" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <LiquidityCore />
          {services.map((service) => (
            <OrbitingPlanet
              key={service.id}
              data={service}
              onSelect={setSelectedService}
              isSelected={selectedService?.id === service.id}
            />
          ))}
        </Float>

        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            intensity={1.2} 
          />
        </EffectComposer>

        <OrbitControls 
          enablePan={false}
          minDistance={5}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>

      <ServiceModal 
        data={selectedService} 
        onClose={() => setSelectedService(null)} 
      />

      <footer className="absolute bottom-6 left-8 right-8 z-20 flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400 font-mono">TIDSAXEL:</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 hover:bg-white/10 transition">24h Bakåt</button>
            <button className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">Realtid</button>
            <button className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 hover:bg-white/10 transition">+14d Prognos</button>
          </div>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          Klicka på en planet för telemetri eller rotera solsystemet med musen.
        </div>
      </footer>
    </div>
  );
}
