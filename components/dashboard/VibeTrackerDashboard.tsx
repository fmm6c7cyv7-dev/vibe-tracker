'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Settings, Bell, X } from 'lucide-react';

export interface ServiceNode {
  id: string;
  name: string;
  provider: string;
  status: 'LIVE' | 'Okänd' | 'Varning';
  statusDetail: string;
  color: string;
  glowColor: string;
  orbitRadiusX: number;
  orbitRadiusZ: number;
  waveAmplitudeY: number;
  tilt: [number, number, number];
  speed: number;
  size: number;
  budgetUsedPercent: number;
  burnRatePerHour: number;
  currentCredits: string;
  totalLimit: string;
}

const SERVICES: ServiceNode[] = [
  {
    id: 'github',
    name: 'GitHub Copilot',
    provider: 'GITHUB',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#a855f7',
    glowColor: '#c084fc',
    orbitRadiusX: 4.8,
    orbitRadiusZ: 2.7,
    waveAmplitudeY: 0.2,
    tilt: [-0.15, 0.35, -0.05],
    speed: 0.55,
    size: 0.65,
    budgetUsedPercent: 75,
    burnRatePerHour: 0.65,
    currentCredits: '$187.50',
    totalLimit: '$250.00'
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    provider: 'OPENAI',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#10b981',
    glowColor: '#34d399',
    orbitRadiusX: 6.3,
    orbitRadiusZ: 3.4,
    waveAmplitudeY: -0.25,
    tilt: [0.2, -0.22, 0.1],
    speed: 0.42,
    size: 0.62,
    budgetUsedPercent: 80,
    burnRatePerHour: 2.45,
    currentCredits: '$200.00',
    totalLimit: '$250.00'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'GOOGLE',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#38bdf8',
    glowColor: '#f43f5e',
    orbitRadiusX: 7.7,
    orbitRadiusZ: 4.2,
    waveAmplitudeY: 0.3,
    tilt: [-0.12, -0.3, 0.18],
    speed: 0.32,
    size: 0.66,
    budgetUsedPercent: 42,
    burnRatePerHour: 1.15,
    currentCredits: '$84.00',
    totalLimit: '$200.00'
  },
  {
    id: 'vercel',
    name: 'Vercel Edge',
    provider: 'VERCEL',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#f1f5f9',
    glowColor: '#94a3b8',
    orbitRadiusX: 9.1,
    orbitRadiusZ: 4.9,
    waveAmplitudeY: -0.18,
    tilt: [0.26, 0.15, -0.14],
    speed: 0.25,
    size: 0.58,
    budgetUsedPercent: 22,
    burnRatePerHour: 0.30,
    currentCredits: '$22.00',
    totalLimit: '$100.00'
  }
];

function BrandLogo({ id, color }: { id: string; color: string }) {
  if (id === 'github') {
    return (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  if (id === 'openai') {
    return (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2" />
        <path d="M16 10a4 4 0 0 0-4-4H8" />
        <path d="M12 22a4 4 0 0 0 4-4v-2" />
        <path d="M8 14a4 4 0 0 0 4 4h4" />
        <circle cx="12" cy="12" r="2" fill="white" />
      </svg>
    );
  }
  if (id === 'gemini') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="url(#gemGrad)">
        <defs>
          <linearGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
      <path d="M12 3L22 20H2L12 3Z" />
    </svg>
  );
}

// Den kristallklara glaskärnan med inre levande ljudvåg
function GlassLiquidityCore() {
  const outerSphereRef = useRef<THREE.Mesh>(null!);
  const wavePointsRef = useRef<THREE.Line>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);

  const { basePoints } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 120;
    const r = 1.35;
    for (let i = 0; i <= count; i++) {
      const theta = (i / count) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    }
    return { basePoints: pts };
  }, []);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(basePoints);
  }, [basePoints]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (outerSphereRef.current) outerSphereRef.current.rotation.y += delta * 0.15;
    if (haloRef.current) {
      haloRef.current.rotation.z += delta * 0.3;
      const s = 1 + Math.sin(t * 2.5) * 0.04;
      haloRef.current.scale.set(s, s, s);
    }
    if (wavePointsRef.current) {
      const pos = wavePointsRef.current.geometry.attributes.position;
      for (let i = 0; i < basePoints.length; i++) {
        const bp = basePoints[i];
        const wave = Math.sin(i * 0.35 + t * 4) * 0.35 + Math.cos(i * 0.6 - t * 2) * 0.15;
        pos.setXYZ(i, bp.x, wave, bp.z);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Inre glödande gradientkula */}
      <mesh>
        <sphereGeometry args={[1.32, 64, 64]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.1}
          transmission={0.6}
          thickness={0.8}
        />
      </mesh>

      {/* Den inre böljande neon-vågen */}
      {/* @ts-expect-error Three line JSX */}
      <line ref={wavePointsRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#fb7185" linewidth={4} />
      </line>

      {/* Yttre kristallklart glasskal */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[1.65, 64, 64]} />
        <meshPhysicalMaterial
          color="#e0e7ff"
          transparent
          opacity={0.3}
          roughness={0.05}
          metalness={0.1}
          transmission={0.92}
          ior={1.45}
          thickness={1.8}
          specularIntensity={3}
        />
      </mesh>

      {/* Ljusring */}
      <mesh ref={haloRef} rotation={[Math.PI / 3, 0.25, 0]}>
        <torusGeometry args={[1.78, 0.025, 16, 120]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function OrbitSystem({
  node,
  currentAngle,
  isSelected,
  hovered
}: {
  node: ServiceNode;
  currentAngle: number;
  isSelected: boolean;
  hovered: boolean;
}) {
  const segments = 160;

  const curvePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * node.orbitRadiusX;
      const z = Math.sin(theta) * node.orbitRadiusZ;
      const y = Math.sin(theta * 2) * node.waveAmplitudeY;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [node]);

  const baseGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(curvePoints);
  }, [curvePoints]);

  const tailGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const trailSegments = 40;
    const trailSpan = 1.1;
    for (let i = 0; i <= trailSegments; i++) {
      const theta = currentAngle - (i / trailSegments) * trailSpan;
      const x = Math.cos(theta) * node.orbitRadiusX;
      const z = Math.sin(theta) * node.orbitRadiusZ;
      const y = Math.sin(theta * 2) * node.waveAmplitudeY;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [currentAngle, node]);

  return (
    <>
      {/* Tunn omloppsbana */}
      {/* @ts-expect-error Three line */}
      <line geometry={baseGeometry}>
        <lineBasicMaterial
          color={node.glowColor}
          transparent
          opacity={isSelected || hovered ? 0.6 : 0.2}
        />
      </line>

      {/* Ljussvans bakom planeten */}
      {/* @ts-expect-error Three line */}
      <line geometry={tailGeometry}>
        <lineBasicMaterial
          color={node.glowColor}
          transparent
          opacity={isSelected || hovered ? 1 : 0.8}
        />
      </line>
    </>
  );
}

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
  const [currentAngle, setCurrentAngle] = useState(angleRef.current);

  useFrame((_, delta) => {
    angleRef.current += node.speed * delta * 0.45;
    setCurrentAngle(angleRef.current);

    const x = Math.cos(angleRef.current) * node.orbitRadiusX;
    const z = Math.sin(angleRef.current) * node.orbitRadiusZ;
    const y = Math.sin(angleRef.current * 2) * node.waveAmplitudeY;

    if (planetGroupRef.current) {
      planetGroupRef.current.position.set(x, y, z);
      const targetScale = hovered || isSelected ? 1.3 : 1.0;
      planetGroupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <group rotation={node.tilt}>
      <OrbitSystem
        node={node}
        currentAngle={currentAngle}
        isSelected={isSelected}
        hovered={hovered}
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
        {/* Inre lysande neonkärna */}
        <mesh>
          <sphereGeometry args={[node.size * 0.85, 32, 32]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.glowColor}
            emissiveIntensity={hovered || isSelected ? 1.6 : 1.1}
            roughness={0.2}
          />
        </mesh>

        {/* Yttre genomskinligt glaslager */}
        <mesh>
          <sphereGeometry args={[node.size, 48, 48]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.35}
            roughness={0.05}
            transmission={0.9}
            ior={1.4}
            thickness={1.2}
            specularIntensity={2.5}
          />
        </mesh>

        {/* Ljusring runt ekvatorn */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[node.size * 1.08, node.size * 1.25, 32]} />
          <meshBasicMaterial
            color={node.glowColor}
            transparent
            opacity={hovered || isSelected ? 0.95 : 0.55}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Vektorlogotyp som Html-komponent (alltid skarp & centrerad) */}
        <Html center transform distanceFactor={12} className="pointer-events-none select-none">
          <div 
            className="flex items-center justify-center p-2 rounded-full drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
            style={{
              filter: `drop-shadow(0 0 14px ${node.glowColor})`
            }}
          >
            <BrandLogo id={node.id} color={node.color} />
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function VibeTrackerDashboard() {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(SERVICES[0]);

  return (
    <div className="relative w-full h-screen bg-[#07080d] overflow-hidden select-none font-sans text-white">
      {/* Subtilt bakgrundsraster */}
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

      {/* Toppmeny */}
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

      {/* Underrubriker */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center gap-8 text-xs font-medium text-slate-400">
        <span className="text-slate-200">Overview</span>
        <span>Services</span>
        <span>Usage</span>
        <span>Budgets</span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 6.8, 12.8], fov: 38 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#07080d']} />
        <Stars radius={70} depth={40} count={1800} factor={2.5} saturation={0} fade speed={0.8} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[15, 20, 10]} intensity={2.0} />
        <pointLight position={[-12, -8, -10]} intensity={1.0} color="#8b5cf6" />
        <pointLight position={[12, -8, 10]} intensity={0.8} color="#38bdf8" />

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
            luminanceThreshold={0.25}
            luminanceSmoothing={0.9}
            intensity={0.9}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>

      {/* Popover: Credits Tracking */}
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

      {/* Höger paneler: OpenAI Budget & GitHub Budget barer */}
      <div className="absolute bottom-8 right-12 z-20 flex flex-col gap-3 w-64">
        <div className="rounded-xl border border-white/10 bg-[#0e111a]/75 p-3.5 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">OpenAI Budget</span>
            <span className="font-bold text-white text-sm">80%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 w-[80%]" />
          </div>
        </div>

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

      <button
        onClick={() => alert("Inställningar")}
        className="absolute bottom-5 right-4 z-20 text-slate-500 hover:text-white transition"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
