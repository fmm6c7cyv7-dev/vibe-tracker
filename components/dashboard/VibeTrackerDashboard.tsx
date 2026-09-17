'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Settings, Bell, X } from 'lucide-react';

// Generera dynamiska SVG-data-URL:er för respektive tjänsts logotyp
const LOGO_SVGS = {
  openai: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="rgba(16,185,129,0.15)"/>
      <path d="M50 20c-1.5 0-3 .3-4.3.9l-11 6.3c-2.4 1.4-4 3.9-4.3 6.6l-.3 12.8c0 1.5.4 3 1.2 4.3l6.5 11.2c1.4 2.4 3.9 4 6.6 4.3l12.8.3c1.5 0 3-.4 4.3-1.2l11.2-6.5c2.4-1.4 4-3.9 4.3-6.6l.3-12.8c0-1.5-.4-3-1.2-4.3L70.9 33.7c-1.4-2.4-3.9-4-6.6-4.3L51.5 29c-.5-.1-1-.1-1.5-.1z" stroke="#6ee7b7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M42 45l8-4.6 8 4.6v9.2l-8 4.6-8-4.6z" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.2)"/>
    </svg>
  `)}`,
  github: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="rgba(168,85,247,0.15)"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M50 22C34.5 22 22 34.5 22 50c0 12.4 8 23 19.2 26.7 1.4.3 1.9-.6 1.9-1.3v-5.2c-7.8 1.7-9.4-3.3-9.4-3.3-1.3-3.2-3.1-4.1-3.1-4.1-2.5-1.7.2-1.7.2-1.7 2.8.2 4.3 2.9 4.3 2.9 2.5 4.3 6.6 3 8.2 2.3.3-1.8 1-3 1.8-3.7-6.2-.7-12.8-3.1-12.8-13.8 0-3.1 1.1-5.6 2.9-7.5-.3-.7-1.3-3.6.3-7.4 0 0 2.4-.8 7.7 2.9a26.8 26.8 0 0114.1 0c5.4-3.6 7.7-2.9 7.7-2.9 1.6 3.8.6 6.7.3 7.4 1.8 1.9 2.9 4.4 2.9 7.5 0 10.8-6.6 13.1-12.8 13.8 1 1 1.9 2.7 1.9 5.5v8.1c0 .8.5 1.7 1.9 1.4C70 73 78 62.4 78 50c0-15.5-12.5-28-28-28z" fill="#ffffff"/>
    </svg>
  `)}`,
  gemini: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="rgba(56,189,248,0.15)"/>
      <path d="M50 18 C50 35.5 64.5 50 82 50 C64.5 50 50 64.5 50 82 C50 64.5 35.5 50 18 50 C35.5 50 50 35.5 50 18 Z" fill="url(#sparkleGlow)"/>
      <defs>
        <linearGradient id="sparkleGlow" x1="18" y1="18" x2="82" y2="82" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ffffff"/>
          <stop offset="0.5" stop-color="#38bdf8"/>
          <stop offset="1" stop-color="#f43f5e"/>
        </linearGradient>
      </defs>
    </svg>
  `)}`,
  vercel: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.1)"/>
      <polygon points="50,22 80,74 20,74" fill="#ffffff"/>
    </svg>
  `)}`,
  database: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="rgba(34,211,238,0.15)"/>
      <ellipse cx="50" cy="30" rx="26" ry="10" fill="#22d3ee"/>
      <path d="M24 30v14c0 5.5 11.6 10 26 10s26-4.5 26-10V30" stroke="#a5f3fc" stroke-width="4" fill="none"/>
      <path d="M24 44v14c0 5.5 11.6 10 26 10s26-4.5 26-10V44" stroke="#67e8f9" stroke-width="4" fill="none"/>
      <path d="M24 58v14c0 5.5 11.6 10 26 10s26-4.5 26-10V58" stroke="#22d3ee" stroke-width="4" fill="none"/>
    </svg>
  `)}`
};

export interface ServiceNode {
  id: string;
  name: string;
  provider: string;
  logoKey: keyof typeof LOGO_SVGS;
  status: 'LIVE' | 'Okänd' | 'Varning';
  statusDetail: string;
  color: string;
  glowColor: string;
  orbitRadiusX: number;
  orbitRadiusZ: number;
  tilt: [number, number, number];
  speed: number;
  size: number;
  budgetUsedPercent: number;
  burnRatePerHour: number;
  currentCredits: string;
  totalLimit: string;
  activeRequests: number;
  runwayDays: number;
}

const SERVICES: ServiceNode[] = [
  {
    id: 'github',
    name: 'GitHub Copilot',
    provider: 'GITHUB',
    logoKey: 'github',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#a855f7',
    glowColor: '#c084fc',
    orbitRadiusX: 4.6,
    orbitRadiusZ: 2.5,
    tilt: [-0.18, 0.35, -0.05],
    speed: 0.5,
    size: 0.6,
    budgetUsedPercent: 75,
    burnRatePerHour: 0.65,
    currentCredits: '$187.50',
    totalLimit: '$250.00',
    activeRequests: 4,
    runwayDays: 14
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    provider: 'OPENAI',
    logoKey: 'openai',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#10b981',
    glowColor: '#34d399',
    orbitRadiusX: 5.8,
    orbitRadiusZ: 3.1,
    tilt: [0.15, -0.2, 0.1],
    speed: 0.4,
    size: 0.58,
    budgetUsedPercent: 80,
    burnRatePerHour: 2.45,
    currentCredits: '$200.00',
    totalLimit: '$250.00',
    activeRequests: 48,
    runwayDays: 6
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'GOOGLE',
    logoKey: 'gemini',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#38bdf8',
    glowColor: '#f43f5e',
    orbitRadiusX: 6.9,
    orbitRadiusZ: 3.7,
    tilt: [-0.1, -0.3, 0.2],
    speed: 0.32,
    size: 0.62,
    budgetUsedPercent: 42,
    burnRatePerHour: 1.15,
    currentCredits: '$84.00',
    totalLimit: '$200.00',
    activeRequests: 112,
    runwayDays: 32
  },
  {
    id: 'vercel',
    name: 'Vercel Edge',
    provider: 'VERCEL',
    logoKey: 'vercel',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#f8fafc',
    glowColor: '#cbd5e1',
    orbitRadiusX: 8.0,
    orbitRadiusZ: 4.2,
    tilt: [0.25, 0.15, -0.15],
    speed: 0.24,
    size: 0.55,
    budgetUsedPercent: 22,
    burnRatePerHour: 0.30,
    currentCredits: '$22.00',
    totalLimit: '$100.00',
    activeRequests: 19,
    runwayDays: 58
  }
];

// Den flytande glas-kärnan med inre neonvåg
function GlassLiquidityCore() {
  const outerSphereRef = useRef<THREE.Mesh>(null!);
  const wavePointsRef = useRef<THREE.Line>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);

  const { wavePoints, basePoints } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 100;
    const radius = 1.35;
    for (let i = 0; i <= count; i++) {
      const theta = (i / count) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    return { wavePoints: pts, basePoints: pts.map(p => p.clone()) };
  }, []);

  const waveGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(wavePoints);
  }, [wavePoints]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y += delta * 0.2;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z += delta * 0.4;
      const scale = 1 + Math.sin(t * 2) * 0.04;
      haloRef.current.scale.set(scale, scale, scale);
    }

    // Animera den inre neonvågen (sinusvåg runt ekvatorn)
    if (wavePointsRef.current) {
      const pos = wavePointsRef.current.geometry.attributes.position;
      for (let i = 0; i < basePoints.length; i++) {
        const bp = basePoints[i];
        const y = Math.sin(i * 0.25 + t * 4) * 0.22 + Math.cos(i * 0.5 - t * 2) * 0.1;
        pos.setXYZ(i, bp.x, y, bp.z);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Inre glödande gradientkärna */}
      <mesh>
        <sphereGeometry args={[1.3, 48, 48]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Inre neonvåg */}
      {/* @ts-expect-error Three line JSX */}
      <line ref={wavePointsRef} geometry={waveGeom}>
        <lineBasicMaterial color="#f43f5e" linewidth={3} />
      </line>

      {/* Yttre lysande glasbubbla */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[1.65, 64, 64]} />
        <meshPhysicalMaterial
          color="#c4b5fd"
          transparent
          opacity={0.35}
          roughness={0.08}
          metalness={0.1}
          transmission={0.88}
          ior={1.4}
          thickness={1.5}
          specularIntensity={2}
        />
      </mesh>

      {/* Runtgående neonring kring kärnan */}
      <mesh ref={haloRef} rotation={[Math.PI / 3, 0.2, 0]}>
        <torusGeometry args={[1.75, 0.02, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Elliptisk omloppsbana med glödande ljusslinga
function GlowingOrbit({
  radiusX,
  radiusZ,
  color,
  active
}: {
  radiusX: number;
  radiusZ: number;
  color: string;
  active: boolean;
}) {
  const linePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radiusX, 0, Math.sin(theta) * radiusZ));
    }
    return points;
  }, [radiusX, radiusZ]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(linePoints);
  }, [linePoints]);

  return (
    // @ts-expect-error Three line JSX
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={active ? 0.65 : 0.2}
      />
    </line>
  );
}

// En enskild planet med glasbubbla och integrerad logotyp
function PlanetSphere({
  node,
  isSelected,
  onSelect
}: {
  node: ServiceNode;
  isSelected: boolean;
  onSelect: (node: ServiceNode) => void;
}) {
  const planetGroupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef<number>(Math.random() * Math.PI * 2);

  // Ladda SVG-texture för logotypen
  const texture = useMemo(() => {
    const img = new Image();
    img.src = LOGO_SVGS[node.logoKey];
    const tex = new THREE.Texture(img);
    img.onload = () => {
      tex.needsUpdate = true;
    };
    return tex;
  }, [node.logoKey]);

  useFrame((_, delta) => {
    angleRef.current += node.speed * delta * 0.45;
    const x = Math.cos(angleRef.current) * node.orbitRadiusX;
    const z = Math.sin(angleRef.current) * node.orbitRadiusZ;

    if (planetGroupRef.current) {
      planetGroupRef.current.position.set(x, 0, z);
      const targetScale = hovered || isSelected ? 1.25 : 1.0;
      planetGroupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <group rotation={node.tilt}>
      <GlowingOrbit
        radiusX={node.orbitRadiusX}
        radiusZ={node.orbitRadiusZ}
        color={node.glowColor}
        active={isSelected || hovered}
      />

      <group
        ref={planetGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
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
        {/* Glasbubblans yttre skal */}
        <mesh>
          <sphereGeometry args={[node.size, 48, 48]} />
          <meshPhysicalMaterial
            color={node.color}
            transparent
            opacity={0.4}
            roughness={0.08}
            metalness={0.15}
            transmission={0.85}
            ior={1.45}
            thickness={1.1}
            specularIntensity={2.5}
            emissive={node.glowColor}
            emissiveIntensity={hovered || isSelected ? 0.6 : 0.2}
          />
        </mesh>

        {/* Ljusring kring planeten */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[node.size * 1.05, node.size * 1.15, 32]} />
          <meshBasicMaterial
            color={node.glowColor}
            transparent
            opacity={hovered || isSelected ? 0.9 : 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Logotypen i centrum som en billboard (följer kameran) */}
        <mesh>
          <planeGeometry args={[node.size * 1.05, node.size * 1.05]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function VibeTrackerDashboard() {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(SERVICES[0]);

  return (
    <div className="relative w-full h-screen bg-[#07080d] overflow-hidden select-none font-sans text-white">
      {/* Subtilt bakgrundsraster (Grid) som i bild 2 & 3 */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Topp-navigering */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-5 bg-transparent">
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl tracking-tight text-white">VibeTracker</span>
        </div>

        <nav className="flex items-center gap-8 text-sm font-medium text-slate-300">
          <button className="text-white border-b-2 border-white pb-0.5">Overview</button>
          <button className="hover:text-white transition">Services</button>
          <button className="hover:text-white transition">Usage</button>
          <button className="hover:text-white transition">Budgets</button>
          <button className="hover:text-white transition">Support</button>
        </nav>

        <div className="flex items-center gap-5 text-sm">
          <button className="text-slate-400 hover:text-white transition">
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#13151f] flex items-center justify-center font-semibold text-xs text-white">
                RF
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Underliggande flikrad */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center gap-8 text-xs font-medium text-slate-400">
        <span className="text-slate-200">Overview</span>
        <span>Services</span>
        <span>Usage</span>
        <span>Budgets</span>
      </div>

      {/* 3D Canvas med kameravinkel och ljus */}
      <Canvas
        camera={{ position: [0, 6.5, 12.5], fov: 38 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#07080d']} />
        <Stars radius={70} depth={40} count={1800} factor={2.5} saturation={0} fade speed={0.8} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[15, 20, 10]} intensity={1.8} />
        <pointLight position={[-12, -8, -10]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[12, -8, 10]} intensity={0.6} color="#38bdf8" />

        <Float speed={1} rotationIntensity={0.06} floatIntensity={0.12}>
          <GlassLiquidityCore />
          {SERVICES.map((node) => (
            <PlanetSphere
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onSelect={setSelectedNode}
            />
          ))}
        </Float>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={0.8}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>

      {/* Flytande Popover: Credits Tracking & Burn-rate graf (som i bild 2 & 3) */}
      {selectedNode && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 w-80 rounded-2xl border border-white/15 bg-[#0e111a]/75 p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between border-b border-white/10 pb-2 mb-3">
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Credits Tracking
              </div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{selectedNode.name}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <div className="text-[10px] text-slate-400">API Calls</div>
              <div className="font-semibold text-white">1,200 / 5,000</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Credits Used</div>
              <div className="font-semibold text-cyan-400">{selectedNode.budgetUsedPercent}%</div>
            </div>
          </div>

          {/* Burn-rate kurva */}
          <div className="rounded-lg bg-white/[0.02] p-2 border border-white/5">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>BURN-RATE (senaste 24h)</span>
              <span className="text-emerald-400 font-mono">{selectedNode.burnRatePerHour.toFixed(2)}/h</span>
            </div>
            <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedNode.glowColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={selectedNode.glowColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,25 Q15,10 30,18 T60,8 T85,15 T100,5"
                fill="none"
                stroke={selectedNode.glowColor}
                strokeWidth="2"
              />
            </svg>
            <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
              <span>0:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </div>
        </div>
      )}

      {/* Vänster panel: USAGE TELEMETRY */}
      <div className="absolute bottom-8 left-10 z-20 w-64 rounded-xl border border-white/10 bg-[#0e111a]/75 p-4 backdrop-blur-xl shadow-2xl text-xs">
        <div className="text-[10px] font-semibold tracking-wider text-teal-400 uppercase mb-2">
          Usage Telemetry
        </div>
        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">API events</span>
            <span className="font-medium text-white font-mono">1200/5hs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">API cash used</span>
            <span className="font-medium text-white font-mono">2999 mts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">API cash event</span>
            <span className="font-medium text-white font-mono">200s ago</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Recent amount event</span>
            <span className="font-medium text-emerald-400 font-mono">31ms</span>
          </div>
        </div>
      </div>

      {/* Höger paneler: OpenAI Budget & GitHub Budget barer (som i bild 2 & 3) */}
      <div className="absolute bottom-8 right-12 z-20 flex flex-col gap-3 w-64">
        {/* OpenAI Kort */}
        <div className="rounded-xl border border-white/10 bg-[#0e111a]/75 p-3.5 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">OpenAI Budget</span>
            <span className="font-bold text-white text-sm">80%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 w-[80%]" />
          </div>
        </div>

        {/* GitHub Kort */}
        <div className="rounded-xl border border-white/10 bg-[#0e111a]/75 p-3.5 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">GitHub Budget</span>
            <span className="font-bold text-white text-sm">75%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 w-[75%]" />
          </div>
        </div>
      </div>

      {/* Kugghjul / Inställningar */}
      <button
        onClick={() => alert("Inställningar")}
        className="absolute bottom-5 right-4 z-20 text-slate-500 hover:text-white transition"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
