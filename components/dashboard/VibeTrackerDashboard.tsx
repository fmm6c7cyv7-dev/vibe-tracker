'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Settings, Bell } from 'lucide-react';

export interface ServiceNode {
  id: string;
  name: string;
  provider: string;
  color: string;
  glowColor: string;
  gradientTop: string;
  gradientBottom: string;
  orbitRadiusX: number;
  orbitRadiusZ: number;
  tilt: [number, number, number];
  speed: number;
  size: number;
}

const SERVICES: ServiceNode[] = [
  {
    id: 'openai',
    name: 'OpenAI API',
    provider: 'OPENAI',
    color: '#10b981',
    glowColor: '#34d399',
    gradientTop: '#a7f3d0',
    gradientBottom: '#059669',
    orbitRadiusX: 4.6,
    orbitRadiusZ: 2.4,
    tilt: [0.18, -0.25, 0.12],
    speed: 0.45,
    size: 0.65
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'GOOGLE',
    color: '#38bdf8',
    glowColor: '#f43f5e',
    gradientTop: '#60a5fa',
    gradientBottom: '#ec4899',
    orbitRadiusX: 6.2,
    orbitRadiusZ: 3.2,
    tilt: [-0.14, -0.32, 0.2],
    speed: 0.35,
    size: 0.72
  },
  {
    id: 'vercel',
    name: 'Vercel Edge',
    provider: 'VERCEL',
    color: '#f8fafc',
    glowColor: '#94a3b8',
    gradientTop: '#ffffff',
    gradientBottom: '#64748b',
    orbitRadiusX: 7.6,
    orbitRadiusZ: 4.0,
    tilt: [0.24, 0.18, -0.15],
    speed: 0.28,
    size: 0.62
  },
  {
    id: 'github',
    name: 'GitHub Copilot',
    provider: 'GITHUB',
    color: '#a855f7',
    glowColor: '#c084fc',
    gradientTop: '#e9d5ff',
    gradientBottom: '#7e22ce',
    orbitRadiusX: 5.3,
    orbitRadiusZ: 2.8,
    tilt: [-0.18, 0.38, -0.06],
    speed: 0.52,
    size: 0.68
  }
];

function BrandLogo({ id }: { id: string }) {
  if (id === 'github') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  if (id === 'openai') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
      </svg>
    );
  }
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
      <path d="M12 3L22 20H2L12 3Z" />
    </svg>
  );
}

// Skapar en lysande glasbubbel-textur med spegelglans
function createGlassBubbleTexture(colorTop: string, colorBottom: string, glowColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cx = 256;
  const cy = 256;
  const r = 240;

  // 1. Mjuk yttre färgaura
  const aura = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
  aura.addColorStop(0, 'rgba(0,0,0,0)');
  aura.addColorStop(0.8, glowColor + '33');
  aura.addColorStop(1, glowColor + 'aa');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // 2. Inre gradientkropp (cyan/magenta eller varumärkets färg)
  const bodyGrad = ctx.createLinearGradient(cx - r * 0.5, cy - r * 0.6, cx + r * 0.5, cy + r * 0.6);
  bodyGrad.addColorStop(0, colorTop + 'cc');
  bodyGrad.addColorStop(0.5, colorBottom + 'bb');
  bodyGrad.addColorStop(1, colorBottom + 'ee');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
  ctx.fill();

  // 3. Topp-reflex (såpbubblans glänsande båge)
  const sheen = ctx.createLinearGradient(cx, cy - r * 0.85, cx, cy - r * 0.2);
  sheen.addColorStop(0, 'rgba(255,255,255,0.95)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.4)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.52, r * 0.58, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Undre subtil kantreflex
  const bottomRim = ctx.createRadialGradient(cx, cy + r * 0.6, 10, cx, cy + r * 0.6, r * 0.4);
  bottomRim.addColorStop(0, 'rgba(255,255,255,0.6)');
  bottomRim.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bottomRim;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// Den stora centrala glasbubblan
function FacitCoreBubble() {
  const [waveOffset, setWaveOffset] = useState(0);

  const texture = useMemo(() => {
    return createGlassBubbleTexture('#38bdf8', '#c084fc', '#818cf8');
  }, []);

  useFrame((state) => {
    setWaveOffset(state.clock.getElapsedTime() * 3.2);
  });

  const waveD = useMemo(() => {
    let d = "M 15 100 ";
    for (let x = 15; x <= 185; x += 4) {
      const y = 100 + Math.sin(x * 0.085 + waveOffset) * 26 + Math.cos(x * 0.15 - waveOffset * 0.8) * 8;
      d += `L ${x} ${y} `;
    }
    return d;
  }, [waveOffset]);

  return (
    <group position={[0, 0, 0]}>
      {/* Självlysande glasbubbla med facit-gradient */}
      <mesh>
        <planeGeometry args={[4.5, 4.5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bakomliggande mjuk neon-aura */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial
          color="#818cf8"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Krispig vit vågform centrerad i bubblan */}
      <Html center transform distanceFactor={9} className="pointer-events-none select-none">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full relative z-10" viewBox="0 0 200 200">
            <path
              d={waveD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 12px rgba(255,255,255,0.95))"
            />
          </svg>
        </div>
      </Html>
    </group>
  );
}

// Fina elliptiska omloppsbanor
function FacitOrbitRing({
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
  const lineGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radiusX, 0, Math.sin(theta) * radiusZ));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radiusX, radiusZ]);

  return (
    // @ts-expect-error Three line
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={active ? 0.8 : 0.35}
      />
    </line>
  );
}

function PlanetBubbleNode({
  node,
  isSelected,
  onSelect
}: {
  node: ServiceNode;
  isSelected: boolean;
  onSelect: (node: ServiceNode) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef<number>(Math.random() * Math.PI * 2);

  const texture = useMemo(() => {
    return createGlassBubbleTexture(node.gradientTop, node.gradientBottom, node.glowColor);
  }, [node]);

  useFrame((_, delta) => {
    angleRef.current += node.speed * delta * 0.4;
    const x = Math.cos(angleRef.current) * node.orbitRadiusX;
    const z = Math.sin(angleRef.current) * node.orbitRadiusZ;

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);
      const scale = hovered || isSelected ? 1.25 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group rotation={node.tilt}>
      <FacitOrbitRing
        radiusX={node.orbitRadiusX}
        radiusZ={node.orbitRadiusZ}
        color={node.glowColor}
        active={isSelected || hovered}
      />

      <group
        ref={groupRef}
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
        {/* Självlysande glasbubbla */}
        <mesh>
          <planeGeometry args={[node.size * 2.4, node.size * 2.4]} />
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ljus-aura bakom bubblan */}
        <mesh position={[0, 0, -0.05]}>
          <circleGeometry args={[node.size * 1.3, 32]} />
          <meshBasicMaterial
            color={node.glowColor}
            transparent
            opacity={hovered || isSelected ? 0.5 : 0.25}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Brand Logo centrerad inuti bubblan */}
        <Html center transform distanceFactor={10} className="pointer-events-none select-none">
          <div 
            className="flex items-center justify-center p-2 rounded-full"
            style={{
              filter: `drop-shadow(0 0 14px rgba(255,255,255,0.9))`
            }}
          >
            <BrandLogo id={node.id} />
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function VibeTrackerDashboard() {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(SERVICES[0]);

  return (
    <div className="relative w-full h-screen bg-[#090b10] overflow-hidden select-none font-sans text-white">
      {/* Bakgrundsglöd i centrum */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(129,140,248,0.22) 0%, rgba(56,189,248,0.12) 40%, transparent 70%)'
        }}
      />

      {/* Header */}
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

      {/* Flikar */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center gap-8 text-xs font-medium text-slate-400">
        <span className="text-slate-200">Overview</span>
        <span>Services</span>
        <span>Usage</span>
        <span>Budgets</span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 4.6, 11], fov: 38 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#090b10']} />

        <ambientLight intensity={1.0} />

        <Float speed={1.2} rotationIntensity={0.03} floatIntensity={0.08}>
          <FacitCoreBubble />
          {SERVICES.map((node) => (
            <PlanetBubbleNode
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onSelect={setSelectedNode}
            />
          ))}
        </Float>

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>

      {/* Text under kärnan (som i facit) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-10 text-center">
        <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-400 font-semibold mb-1">
          Credits Tracking
        </div>
        <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
          VibeTracker
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400 font-medium mt-0.5">
          Usage & Finance Dashboard
        </div>
      </div>

      {/* Telemetri nere till vänster */}
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
            <span className="text-slate-400">Recent status</span>
            <span className="font-medium text-emerald-400 font-mono">LIVE API</span>
          </div>
        </div>
      </div>

      {/* Budget nere till höger */}
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
