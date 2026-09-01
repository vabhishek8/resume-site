import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { NODES, EDGES } from "./networkData.js";

const AMBER = new THREE.Color("#f2a541");
const TEAL = new THREE.Color("#4fd8c4");
const GREY = new THREE.Color("#5a6478");

const NOISE_COUNT = 500;
const PARTICLES_PER_NODE = 3;
const PARTICLE_COUNT = NODES.length * PARTICLES_PER_NODE;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function NoiseField() {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(NOISE_COUNT * 3);
    for (let i = 0; i < NOISE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#3a4657" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function NetworkParticles({ progress }) {
  const pointsRef = useRef();
  const colorAttrRef = useRef();

  const { startPositions, targetPositions, colors } = useMemo(() => {
    const starts = new Float32Array(PARTICLE_COUNT * 3);
    const targets = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);

    let idx = 0;
    NODES.forEach((node) => {
      for (let j = 0; j < PARTICLES_PER_NODE; j++) {
        starts[idx * 3] = (Math.random() - 0.5) * 16;
        starts[idx * 3 + 1] = (Math.random() - 0.5) * 9;
        starts[idx * 3 + 2] = (Math.random() - 0.5) * 8 - 3;

        targets[idx * 3] = node.position[0] + (Math.random() - 0.5) * 0.12;
        targets[idx * 3 + 1] = node.position[1] + (Math.random() - 0.5) * 0.12;
        targets[idx * 3 + 2] = node.position[2];

        const c = node.color === "amber" ? AMBER : node.color === "teal" ? TEAL : GREY;
        cols[idx * 3] = c.r;
        cols[idx * 3 + 1] = c.g;
        cols[idx * 3 + 2] = c.b;
        idx++;
      }
    });

    return { startPositions: starts, targetPositions: targets, colors: cols };
  }, []);

  const displayPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const displayColors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  useFrame(() => {
    const t = easeOutCubic(progress.current);
    const geom = pointsRef.current?.geometry;
    if (!geom) return;

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      displayPositions[i] = startPositions[i] + (targetPositions[i] - startPositions[i]) * t;
    }
    // color: fade grey -> real color as it approaches
    const colorT = Math.min(1, progress.current * 1.4);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const gi = i * 3;
      displayColors[gi] = GREY.r + (colors[gi] - GREY.r) * colorT;
      displayColors[gi + 1] = GREY.g + (colors[gi + 1] - GREY.g) * colorT;
      displayColors[gi + 2] = GREY.b + (colors[gi + 2] - GREY.b) * colorT;
    }

    geom.attributes.position.array.set(displayPositions);
    geom.attributes.position.needsUpdate = true;
    geom.attributes.color.array.set(displayColors);
    geom.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[displayPositions, 3]} />
        <bufferAttribute ref={colorAttrRef} attach="attributes-color" args={[displayColors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} vertexColors transparent opacity={0.95} sizeAttenuation />
    </points>
  );
}

function EdgeLine({ points }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(points.flat());
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#7a8598" transparent opacity={0} />
    </line>
  );
}

function NetworkEdges({ progress }) {
  const groupRef = useRef();
  useFrame(() => {
    if (!groupRef.current) return;
    const t = progress.current;
    const opacity = t < 0.7 ? 0 : Math.min(1, (t - 0.7) / 0.3) * 0.55;
    groupRef.current.children.forEach((line) => {
      if (line.material) line.material.opacity = opacity;
    });
  });

  return (
    <group ref={groupRef}>
      {EDGES.map((pts, i) => (
        <EdgeLine key={i} points={pts} />
      ))}
    </group>
  );
}

function ParallaxRig({ children }) {
  const { viewport } = useThree();
  const group = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!group.current) return;
    mouse.current.x += (state.mouse.x - mouse.current.x) * 0.04;
    mouse.current.y += (state.mouse.y - mouse.current.y) * 0.04;
    group.current.rotation.y = mouse.current.x * 0.12;
    group.current.rotation.x = -mouse.current.y * 0.06;
  });

  return <group ref={group}>{children}</group>;
}

function Scene() {
  const progress = useRef(0);
  const start = useRef(null);

  useFrame((state) => {
    if (start.current === null) start.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - start.current;
    progress.current = Math.min(1, elapsed / 1.8);
  });

  return (
    <>
      <NoiseField />
      <ParallaxRig>
        <NetworkParticles progress={progress} />
        <NetworkEdges progress={progress} />
      </ParallaxRig>
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}
