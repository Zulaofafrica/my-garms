"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useConfigurator } from "@/hooks/use-configurator";
import * as THREE from "three";
import { AccumulativeShadows, RandomizedLight } from "@react-three/drei";

export function TShirt(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { color, material } = useConfigurator();

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    const getRoughness = () => {
        switch (material) {
            case "cotton": return 0.8;
            case "silk": return 0.2;
            case "denim": return 0.9;
            default: return 0.5;
        }
    };

    const getMetalness = () => {
        switch (material) {
            case "silk": return 0.3;
            default: return 0;
        }
    };

    return (
        <group {...props}>
            <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
                {/* Placeholder functionality: A TorusKnot allows good visualization of materials */}
                <torusKnotGeometry args={[1, 0.35, 100, 16]} />
                <meshStandardMaterial
                    color={color}
                    roughness={getRoughness()}
                    metalness={getMetalness()}
                />
            </mesh>

            <AccumulativeShadows
                temporal
                frames={100}
                color={color}
                colorBlend={2}
                toneMapped={true}
                alphaTest={0.8}
                opacity={1}
                scale={12}
                position={[0, -2, 0]}
            >
                <RandomizedLight
                    amount={8}
                    radius={4}
                    ambient={0.5}
                    intensity={1}
                    position={[5, 5, -10]}
                    bias={0.001}
                />
            </AccumulativeShadows>
        </group>
    );
}
