"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { TShirt } from "./t-shirt";

export function Scene() {
    return (
        <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-gradient-to-b from-[#f0f4ff] to-[#e0e7ff] dark:from-[#0f172a] dark:to-[#1e293b]">
            <Canvas
                shadows
                camera={{ position: [0, 1, 4], fov: 45 }} // Raised camera slightly
                className="w-full h-full"
            >
                {/* Soft Studio Lighting */}
                <ambientLight intensity={0.8} />
                <spotLight
                    intensity={0.6}
                    angle={0.25}
                    penumbra={1}
                    position={[5, 5, 5]}
                    castShadow
                    shadow-bias={-0.0001}
                />
                <spotLight
                    intensity={0.4}
                    angle={0.25}
                    penumbra={1}
                    position={[-5, 5, 5]}
                    castShadow
                />

                <group position={[0, -0.8, 0]}>
                    <TShirt position={[0, 0.2, 0]} /> {/* Lift model slightly above pedestal */}

                    {/* Pedestal */}
                    <mesh receiveShadow position={[0, -0.2, 0]}>
                        <cylinderGeometry args={[1.5, 1.5, 0.4, 64]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>

                    {/* Soft Shadow on Pedestal */}
                    <ContactShadows
                        resolution={1024}
                        scale={10}
                        blur={2}
                        opacity={0.5}
                        far={10}
                        color="#000000"
                    />
                </group>

                <OrbitControls
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                    enableZoom={true}
                    enablePan={false}
                    maxDistance={8}
                    minDistance={3}
                />
            </Canvas>
        </div>
    );
}
