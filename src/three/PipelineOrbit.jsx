import { Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

const STAGES = [
  { label: "Source Systems", sub: "", pos: [-4.2, 0.4, 0], color: "#4fd8c4" },
  { label: "SQL Server", sub: "", pos: [-2.6, 1.1, 0.4], color: "#f2a541" },
  { label: "Azure Data Factory", sub: "", pos: [-1, 0.2, -0.3], color: "#4fd8c4" },
  { label: "Data Lake Storage", sub: "", pos: [0.2, -1.4, 0.3], color: "#f2a541" },
  { label: "Databricks", sub: "", pos: [0.6, 1.3, -0.2], color: "#4fd8c4" },
  { label: "Synapse", sub: "", pos: [2.2, 0.3, 0.4], color: "#f2a541" },
  { label: "Power BI", sub: "CI/CD", pos: [3.8, 1, -0.3], color: "#4fd8c4" }
];

const EDGES = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [3, 5], [5, 6]];

function Node({ stage }) {
  return (
    <group position={stage.pos}>
      <mesh>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial color={stage.color} emissive={stage.color} emissiveIntensity={0.6} />
      </mesh>
      <Html distanceFactor={9} center style={{ pointerEvents: "none" }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          color: "#edf0f5",
          background: "rgba(10,14,20,0.72)",
          padding: "3px 8px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.12)",
          whiteSpace: "nowrap",
          transform: "translateY(22px)"
        }}>
          {stage.label}
        </div>
      </Html>
    </group>
  );
}

function EdgeLine({ from, to }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array([...from, ...to]), 3));
    return g;
  }, [from, to]);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#3a4657" transparent opacity={0.7} />
    </line>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 4]} intensity={40} color="#f2a541" />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#4fd8c4" />
      {EDGES.map(([a, b], i) => (
        <EdgeLine key={i} from={STAGES[a].pos} to={STAGES[b].pos} />
      ))}
      {STAGES.map((s, i) => <Node key={i} stage={s} />)}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

export default function PipelineOrbit() {
  return (
    <Canvas camera={{ position: [0, 0.6, 7], fov: 42 }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
