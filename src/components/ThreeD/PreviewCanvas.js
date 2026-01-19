"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

function Mannequin({ fabric }) {
    // In a real app, this would be a GLTF model loaded with useGLTF
    // and we would apply the fabric texture to specific materials.
    // For MVP, we use a simple mesh.

    const color = fabric?.color === "Multi" ? "orange" : (fabric?.color || "white");

    return (
        <group position={[0, -1, 0]}>
            {/* Torso */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
                <meshStandardMaterial color={color} roughness={0.3} metallic={0.1} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 2.8, 0]} castShadow>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="#d1d1d1" />
            </mesh>
        </group>
    );
}

export default function PreviewCanvas({ selectedFabric, selectedTemplate }) {
    return (
        <div style={{ width: "100%", height: "100%", minHeight: "400px", background: "#f0f0f0", borderRadius: "8px", overflow: "hidden" }}>
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
                <Suspense fallback={null}>
                    <Environment preset="studio" />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />

                    <Mannequin fabric={selectedFabric} />

                    <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
                    <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
                </Suspense>
            </Canvas>
        </div>
    );
}
