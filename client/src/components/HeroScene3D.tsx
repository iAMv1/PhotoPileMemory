import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

const MemoryCore = () => {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime();
            // Subtle heartbeat pulsing
            const scale = 1.2 + Math.sin(t * 1.5) * 0.05;
            ref.current.scale.set(scale, scale, scale);
            ref.current.rotation.y = t * 0.2;
        }
    });

    return (
        <Sphere ref={ref} args={[1, 64, 64]}>
            <MeshDistortMaterial
                color="#F59E0B" // Amber-500
                envMapIntensity={2}
                clearcoat={1}
                clearcoatRoughness={0.1}
                metalness={0.8}
                roughness={0.2}
                distort={0.3}
                speed={2}
            />
        </Sphere>
    );
};

const CelestialRing = ({ radius, speed, rotationAxis, color, opacity = 0.4 }: { radius: number; speed: number; rotationAxis: 'x' | 'y' | 'z'; color: string; opacity?: number }) => {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime();
            if (rotationAxis === 'x') ref.current.rotation.x = t * speed;
            if (rotationAxis === 'y') ref.current.rotation.y = t * speed;
            if (rotationAxis === 'z') ref.current.rotation.z = t * speed;
        }
    });

    return (
        <Torus ref={ref} args={[radius, 0.015, 16, 100]}>
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={opacity}
            />
        </Torus>
    );
};

const FloatingFragment = ({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) => {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime();
            ref.current.position.y = position[1] + Math.sin(t + position[0]) * 0.2;
            ref.current.rotation.x = t * 0.5;
        }
    });

    return (
        <Sphere ref={ref} args={[1, 16, 16]} position={position} scale={scale}>
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1}
                toneMapped={false}
            />
        </Sphere>
    );
};

const MouseRig = () => {
    useFrame((state) => {
        state.camera.position.lerp(
            new THREE.Vector3(state.mouse.x * 2, state.mouse.y * 2, 6),
            0.05
        );
        state.camera.lookAt(0, 0, 0);
    });
    return null;
};

export const HeroScene3D = () => {
    const fragments = useMemo(() => [
        { position: [-3, 1.5, -2] as [number, number, number], color: "#EC4899", scale: 0.08 }, // Pink-500
        { position: [3, -1, -3] as [number, number, number], color: "#8B5CF6", scale: 0.1 },  // Purple-500
        { position: [-2, -2, -1] as [number, number, number], color: "#F59E0B", scale: 0.06 }, // Amber-500
        { position: [2.5, 2, -2] as [number, number, number], color: "#F43F5E", scale: 0.07 }, // Rose-500
    ], []);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <MouseRig />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#F59E0B" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />

                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <MemoryCore />

                    {/* Celestial Rings */}
                    <CelestialRing radius={2.2} speed={0.2} rotationAxis="y" color="#F59E0B" />
                    <CelestialRing radius={2.5} speed={-0.15} rotationAxis="x" color="#EC4899" opacity={0.2} />
                    <CelestialRing radius={3} speed={0.1} rotationAxis="z" color="#8B5CF6" opacity={0.2} />

                    {/* Floating Fragments */}
                    {fragments.map((props, i) => (
                        <FloatingFragment key={i} {...props} />
                    ))}
                </Float>

                <Environment preset="city" />
                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

                {/* Subtle fog for depth */}
                <fog attach="fog" args={['#0a0a0f', 5, 15]} />
            </Canvas>
        </div>
    );
};
