import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function ImitationRobot({ poseId }) {
  const leftShoulderGroup = useRef();
  const leftElbowGroup = useRef();
  
  const rightShoulderGroup = useRef();
  const rightElbowGroup = useRef();

  const headGroup = useRef();
  
  // Define target rotations based on pose
  // Angles format: [x, y, z] for Euler angles
  const getTargetRotations = () => {
    switch(poseId) {
      case "left_up":
        return {
          ls: [0, 0, Math.PI - 0.2], le: [0, 0, 0],
          rs: [0, 0, 0.2], re: [0, 0, 0]
        };
      case "right_up":
        return {
          ls: [0, 0, -0.2], le: [0, 0, 0],
          rs: [0, 0, -Math.PI + 0.2], re: [0, 0, 0]
        };
      case "both_up":
        return {
          ls: [0, 0, Math.PI - 0.4], le: [0, 0, 0],
          rs: [0, 0, -Math.PI + 0.4], re: [0, 0, 0]
        };
      case "t_pose":
        return {
          ls: [0, 0, Math.PI / 2], le: [0, 0, 0],
          rs: [0, 0, -Math.PI / 2], re: [0, 0, 0]
        };
      case "namaste":
        return {
          ls: [Math.PI/2.5, 0.5, Math.PI/4], le: [Math.PI/1.5, 0, 0],
          rs: [Math.PI/2.5, -0.5, -Math.PI/4], re: [Math.PI/1.5, 0, 0]
        };
      case "low_a":
        return {
          ls: [0, 0, -0.6], le: [0, 0, 0],
          rs: [0, 0, 0.6], re: [0, 0, 0]
        };
      case "salute":
        return {
          ls: [0, 0, -0.2], le: [0, 0, 0],
          rs: [0, Math.PI/4, -Math.PI/1.2], re: [-Math.PI/1.5, 0, 0]
        };
      default:
        // Idle / Arms down
        return {
          ls: [0, 0, -0.1], le: [0, 0, 0],
          rs: [0, 0, 0.1], re: [0, 0, 0]
        };
    }
  };

  useFrame((state, delta) => {
    // Idle head nodding
    if (headGroup.current) {
       headGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
       headGroup.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }

    const t = getTargetRotations();
    
    // Smooth interpolation function
    const smoothDamp = (current, target, dt) => {
      return THREE.MathUtils.damp(current, target, 4, dt);
    };

    if (leftShoulderGroup.current) {
      leftShoulderGroup.current.rotation.x = smoothDamp(leftShoulderGroup.current.rotation.x, t.ls[0], delta);
      leftShoulderGroup.current.rotation.y = smoothDamp(leftShoulderGroup.current.rotation.y, t.ls[1], delta);
      leftShoulderGroup.current.rotation.z = smoothDamp(leftShoulderGroup.current.rotation.z, t.ls[2], delta);
    }
    if (leftElbowGroup.current) {
      leftElbowGroup.current.rotation.x = smoothDamp(leftElbowGroup.current.rotation.x, t.le[0], delta);
      leftElbowGroup.current.rotation.y = smoothDamp(leftElbowGroup.current.rotation.y, t.le[1], delta);
      leftElbowGroup.current.rotation.z = smoothDamp(leftElbowGroup.current.rotation.z, t.le[2], delta);
    }

    if (rightShoulderGroup.current) {
       rightShoulderGroup.current.rotation.x = smoothDamp(rightShoulderGroup.current.rotation.x, t.rs[0], delta);
       rightShoulderGroup.current.rotation.y = smoothDamp(rightShoulderGroup.current.rotation.y, t.rs[1], delta);
       rightShoulderGroup.current.rotation.z = smoothDamp(rightShoulderGroup.current.rotation.z, t.rs[2], delta);
    }
    if (rightElbowGroup.current) {
       rightElbowGroup.current.rotation.x = smoothDamp(rightElbowGroup.current.rotation.x, t.re[0], delta);
       rightElbowGroup.current.rotation.y = smoothDamp(rightElbowGroup.current.rotation.y, t.re[1], delta);
       rightElbowGroup.current.rotation.z = smoothDamp(rightElbowGroup.current.rotation.z, t.re[2], delta);
    }
  });

  const bodyMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#00BFFF',
    roughness: 0.2,
    metalness: 0.6,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2
  }), []);

  const jointMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#333333',
    roughness: 0.8,
    metalness: 0.9,
  }), []);

  const faceMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111111',
    emissive: '#005577',
    emissiveIntensity: 0.5,
  }), []);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} position={[0, -2, 0]}>
      <group>
        {/* Torso */}
        <mesh position={[0, 3, 0]} castShadow receiveShadow material={bodyMaterial}>
           <boxGeometry args={[2.5, 3.5, 1.2]} />
        </mesh>
        
        {/* Head */}
        <group ref={headGroup} position={[0, 5, 0]}>
          <mesh castShadow receiveShadow material={bodyMaterial} position={[0, 0.8, 0]}>
             <boxGeometry args={[1.5, 1.5, 1.5]} />
          </mesh>
          {/* Eyes (Visor) */}
          <mesh position={[0, 1, 0.76]} material={faceMaterial}>
             <boxGeometry args={[1.2, 0.4, 0.1]} />
          </mesh>
        </group>

        {/* --- LEFT ARM --- */}
        <group position={[-1.5, 4.3, 0]} ref={leftShoulderGroup}>
          <mesh material={jointMaterial}>
             <sphereGeometry args={[0.5, 32, 32]} />
          </mesh>
          <mesh position={[0, -1.2, 0]} castShadow receiveShadow material={bodyMaterial}>
             <cylinderGeometry args={[0.4, 0.3, 2.4, 32]} />
          </mesh>
          {/* Left Elbow */}
          <group position={[0, -2.4, 0]} ref={leftElbowGroup}>
             <mesh material={jointMaterial}>
               <sphereGeometry args={[0.4, 32, 32]} />
             </mesh>
             <mesh position={[0, -1.1, 0]} castShadow receiveShadow material={bodyMaterial}>
               <cylinderGeometry args={[0.3, 0.25, 2.2, 32]} />
             </mesh>
             {/* Left Hand */}
             <mesh position={[0, -2.4, 0]} castShadow receiveShadow material={jointMaterial}>
               <sphereGeometry args={[0.35, 32, 32]} />
             </mesh>
          </group>
        </group>


        {/* --- RIGHT ARM --- */}
        <group position={[1.5, 4.3, 0]} ref={rightShoulderGroup}>
          <mesh material={jointMaterial}>
             <sphereGeometry args={[0.5, 32, 32]} />
          </mesh>
          <mesh position={[0, -1.2, 0]} castShadow receiveShadow material={bodyMaterial}>
             <cylinderGeometry args={[0.4, 0.3, 2.4, 32]} />
          </mesh>
          {/* Right Elbow */}
          <group position={[0, -2.4, 0]} ref={rightElbowGroup}>
             <mesh material={jointMaterial}>
               <sphereGeometry args={[0.4, 32, 32]} />
             </mesh>
             <mesh position={[0, -1.1, 0]} castShadow receiveShadow material={bodyMaterial}>
               <cylinderGeometry args={[0.3, 0.25, 2.2, 32]} />
             </mesh>
             {/* Right Hand */}
             <mesh position={[0, -2.4, 0]} castShadow receiveShadow material={jointMaterial}>
               <sphereGeometry args={[0.35, 32, 32]} />
             </mesh>
          </group>
        </group>

        {/* Lower Body (Static) */}
        <mesh position={[0, 0.5, 0]} material={jointMaterial}>
           <sphereGeometry args={[0.8, 32, 32]} />
        </mesh>
        
        {/* Left Leg */}
        <mesh position={[0.8, -1.5, 0]} castShadow receiveShadow material={bodyMaterial}>
           <cylinderGeometry args={[0.4, 0.3, 3, 32]} />
        </mesh>
        
        {/* Right Leg */}
        <mesh position={[-0.8, -1.5, 0]} castShadow receiveShadow material={bodyMaterial}>
           <cylinderGeometry args={[0.4, 0.3, 3, 32]} />
        </mesh>

      </group>
    </Float>
  );
}
