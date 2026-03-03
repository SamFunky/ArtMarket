"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import type { Group } from "three";

type ModelViewerProps = {
  src: string;
  scale?: number;
  baseRotation?: [number, number, number];
  modelPosition?: [number, number, number];
};

function SpinningModel({
  src,
  scale = 1,
  baseRotation = [0, 0, 0],
  modelPosition = [0, 0, 0],
}: ModelViewerProps) {
  const spinRef = useRef<Group>(null);
  const { scene } = useGLTF(src);

  useFrame((_, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={spinRef}>
      <group rotation={baseRotation}>
        <primitive object={scene} scale={scale} position={modelPosition} />
      </group>
    </group>
  );
}

useGLTF.preload("/models/old_roman_coin_ueinbaiva_low.glb");
useGLTF.preload("/models/oriental_vase.glb");

export default function ModelViewer({
  src,
  scale = 1,
  baseRotation = [0, 0, 0],
  modelPosition = [0, 0, 0],
}: ModelViewerProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <Environment preset="studio" />
        <SpinningModel
          src={src}
          scale={scale}
          baseRotation={baseRotation}
          modelPosition={modelPosition}
        />
      </Canvas>
    </div>
  );
}
