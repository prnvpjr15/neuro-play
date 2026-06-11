import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const POSE_ROTATIONS = {
  left_up: {
    spine: [0, -0.06, 0.04],
    neck: [0.02, -0.18, 0],
    leftShoulder: [0.08, 0.04, 2.72],
    leftElbow: [0.02, 0, -0.12],
    leftWrist: [0, 0, 0.12],
    rightShoulder: [0, -0.05, 0.42],
    rightElbow: [0.08, 0, -0.08],
    rightWrist: [0, 0, -0.08],
  },
  right_up: {
    spine: [0, 0.06, -0.04],
    neck: [0.02, 0.18, 0],
    leftShoulder: [0, 0.05, -0.42],
    leftElbow: [0.08, 0, 0.08],
    leftWrist: [0, 0, 0.08],
    rightShoulder: [0.08, -0.04, -2.72],
    rightElbow: [0.02, 0, 0.12],
    rightWrist: [0, 0, -0.12],
  },
  both_up: {
    spine: [-0.04, 0, 0],
    neck: [-0.14, 0, 0],
    leftShoulder: [0.1, 0.02, 2.55],
    leftElbow: [0, 0, -0.08],
    leftWrist: [0, 0, 0.12],
    rightShoulder: [0.1, -0.02, -2.55],
    rightElbow: [0, 0, 0.08],
    rightWrist: [0, 0, -0.12],
  },
  t_pose: {
    spine: [0, 0, 0],
    neck: [0, 0, 0],
    leftShoulder: [0, 0, Math.PI / 2],
    leftElbow: [0, 0, -0.02],
    leftWrist: [0, 0, 0.08],
    rightShoulder: [0, 0, -Math.PI / 2],
    rightElbow: [0, 0, 0.02],
    rightWrist: [0, 0, -0.08],
  },
  hands_head: {
    spine: [0.03, 0, 0],
    neck: [0.14, 0, 0],
    leftShoulder: [0.9, 0.36, 2.08],
    leftElbow: [2.12, 0.15, -0.18],
    leftWrist: [-0.4, 0.1, 0.2],
    rightShoulder: [0.9, -0.36, -2.08],
    rightElbow: [2.12, -0.15, 0.18],
    rightWrist: [-0.4, -0.1, -0.2],
  },
  namaste: {
    spine: [0.08, 0, 0],
    neck: [0.12, 0, 0],
    leftShoulder: [1.0, 0.58, 0.72],
    leftElbow: [1.75, 0.05, -0.28],
    leftWrist: [0.15, 0.28, 0.55],
    rightShoulder: [1.0, -0.58, -0.72],
    rightElbow: [1.75, -0.05, 0.28],
    rightWrist: [0.15, -0.28, -0.55],
  },
  low_a: {
    spine: [0, 0, 0],
    neck: [0, 0, 0],
    leftShoulder: [0.02, 0, -0.78],
    leftElbow: [0.08, 0, 0.05],
    leftWrist: [0, 0, 0],
    rightShoulder: [0.02, 0, 0.78],
    rightElbow: [0.08, 0, -0.05],
    rightWrist: [0, 0, 0],
  },
  salute: {
    spine: [0, -0.04, 0.02],
    neck: [0, -0.24, 0],
    leftShoulder: [0, 0, -0.25],
    leftElbow: [0.06, 0, 0.04],
    leftWrist: [0, 0, 0],
    rightShoulder: [0.25, 0.5, -2.0],
    rightElbow: [-1.65, -0.1, 0.2],
    rightWrist: [0.15, 0.4, -0.45],
  },
  idle: {
    spine: [0, 0, 0],
    neck: [0, 0, 0],
    leftShoulder: [0, 0, -0.22],
    leftElbow: [0.08, 0, 0.05],
    leftWrist: [0, 0, 0],
    rightShoulder: [0, 0, 0.22],
    rightElbow: [0.08, 0, -0.05],
    rightWrist: [0, 0, 0],
  },
};

function smoothRotation(ref, target, delta, speed = 7) {
  if (!ref.current) return;
  ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, target[0], speed, delta);
  ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, target[1], speed, delta);
  ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, target[2], speed, delta);
}

function LimbSegment({ length, radius, material, position, taper = 0.82 }) {
  return (
    <mesh position={position} scale={[taper, 1, taper]} material={material} castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, 10, 24]} />
    </mesh>
  );
}

function Arm({ side, refs, skinMaterial, shirtMaterial }) {
  const mirror = side === 'left' ? 1 : -1;

  return (
    <group position={[mirror * 0.76, 2.08, 0]} ref={refs.shoulder}>
      <mesh material={shirtMaterial} castShadow>
        <sphereGeometry args={[0.24, 24, 24]} />
      </mesh>
      <LimbSegment length={0.72} radius={0.17} material={shirtMaterial} position={[0, -0.45, 0]} />
      <group position={[0, -0.9, 0]} ref={refs.elbow}>
        <mesh material={skinMaterial} castShadow>
          <sphereGeometry args={[0.15, 20, 20]} />
        </mesh>
        <LimbSegment length={0.68} radius={0.135} material={skinMaterial} position={[0, -0.42, 0]} taper={0.7} />
        <group position={[0, -0.84, 0]} ref={refs.wrist}>
          <mesh material={skinMaterial} castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
          </mesh>
          <mesh position={[0, -0.16, 0.02]} scale={[0.16, 0.22, 0.08]} material={skinMaterial} castShadow>
            <sphereGeometry args={[1, 18, 18]} />
          </mesh>
          {[ -0.075, -0.025, 0.025, 0.075 ].map((x) => (
            <mesh key={x} position={[x, -0.34, 0.035]} material={skinMaterial} castShadow>
              <capsuleGeometry args={[0.018, 0.16, 6, 8]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

function Leg({ side, skinMaterial, pantsMaterial, shoeMaterial }) {
  const mirror = side === 'left' ? 1 : -1;

  return (
    <group position={[mirror * 0.32, 0.72, 0]}>
      <LimbSegment length={0.95} radius={0.21} material={pantsMaterial} position={[0, -0.38, 0]} taper={0.78} />
      <mesh position={[0, -0.9, 0]} material={pantsMaterial} castShadow>
        <sphereGeometry args={[0.16, 18, 18]} />
      </mesh>
      <LimbSegment length={0.86} radius={0.16} material={skinMaterial} position={[0, -1.28, 0]} taper={0.66} />
      <mesh position={[0, -1.82, 0.13]} scale={[0.22, 0.1, 0.42]} material={shoeMaterial} castShadow receiveShadow>
        <sphereGeometry args={[1, 20, 20]} />
      </mesh>
    </group>
  );
}

function RealisticFace({ materials }) {
  return (
    <group>
      <mesh position={[0, 0.59, 0.015]} scale={[0.36, 0.5, 0.32]} material={materials.skin} castShadow receiveShadow>
        <sphereGeometry args={[1, 56, 56]} />
      </mesh>
      <mesh position={[0, 0.28, 0.03]} scale={[0.27, 0.2, 0.27]} material={materials.skin} castShadow>
        <sphereGeometry args={[1, 36, 36]} />
      </mesh>
      <mesh position={[0, 0.43, 0.315]} rotation={[0.2, 0, 0]} scale={[0.085, 0.18, 0.075]} material={materials.skin} castShadow>
        <coneGeometry args={[1, 1.25, 28]} />
      </mesh>
      <mesh position={[0, 0.54, 0.31]} rotation={[Math.PI / 2, 0, 0]} scale={[0.04, 0.055, 0.11]} material={materials.skinShadow} castShadow>
        <capsuleGeometry args={[1, 0.35, 8, 16]} />
      </mesh>
      <mesh position={[0, 0.34, 0.34]} scale={[0.095, 0.06, 0.075]} material={materials.skin} castShadow>
        <sphereGeometry args={[1, 24, 24]} />
      </mesh>
      {[-0.045, 0.045].map((x) => (
        <mesh key={x} position={[x, 0.31, 0.395]} scale={[0.018, 0.01, 0.012]} material={materials.skinShadow}>
          <sphereGeometry args={[1, 12, 12]} />
        </mesh>
      ))}

      {[-0.13, 0.13].map((x) => (
        <group key={x} position={[x, 0.64, 0.295]}>
          <mesh scale={[0.07, 0.033, 0.014]} material={materials.white}>
            <sphereGeometry args={[1, 24, 16]} />
          </mesh>
          <mesh position={[0, -0.002, 0.012]} scale={[0.026, 0.026, 0.01]} material={materials.iris}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
          <mesh position={[0, -0.002, 0.021]} scale={[0.012, 0.012, 0.006]} material={materials.eye}>
            <sphereGeometry args={[1, 12, 8]} />
          </mesh>
          <mesh position={[0, 0.033, 0.004]} rotation={[0, 0, x > 0 ? -0.08 : 0.08]} scale={[0.082, 0.012, 0.012]} material={materials.skinShadow}>
            <sphereGeometry args={[1, 14, 8]} />
          </mesh>
          <mesh position={[0, -0.033, 0.004]} scale={[0.074, 0.009, 0.01]} material={materials.skinShadow}>
            <sphereGeometry args={[1, 12, 8]} />
          </mesh>
          <mesh position={[0, 0.105, 0.012]} rotation={[0, 0, x > 0 ? -0.18 : 0.18]} scale={[0.09, 0.014, 0.014]} material={materials.brow}>
            <capsuleGeometry args={[1, 0.35, 6, 12]} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.17, 0.335]} scale={[0.115, 0.022, 0.015]} material={materials.lip}>
        <sphereGeometry args={[1, 24, 10]} />
      </mesh>
      <mesh position={[0, 0.135, 0.338]} scale={[0.095, 0.018, 0.012]} material={materials.lipDark}>
        <sphereGeometry args={[1, 20, 10]} />
      </mesh>
      <mesh position={[0, 0.22, 0.31]} scale={[0.2, 0.05, 0.025]} material={materials.skinShadow}>
        <sphereGeometry args={[1, 24, 10]} />
      </mesh>

      <mesh position={[0, 0.93, -0.02]} scale={[0.38, 0.24, 0.33]} material={materials.hair} castShadow>
        <sphereGeometry args={[1, 42, 24, 0, Math.PI * 2, 0, Math.PI / 1.55]} />
      </mesh>
      <mesh position={[0, 0.78, 0.21]} rotation={[0.1, 0, 0]} scale={[0.34, 0.085, 0.08]} material={materials.hair} castShadow>
        <sphereGeometry args={[1, 28, 14]} />
      </mesh>
      {[-0.36, 0.36].map((x) => (
        <group key={x} position={[x, 0.53, 0.02]}>
          <mesh scale={[0.075, 0.14, 0.045]} material={materials.skin} castShadow>
            <sphereGeometry args={[1, 20, 20]} />
          </mesh>
          <mesh position={[x > 0 ? 0.018 : -0.018, -0.01, 0.018]} scale={[0.038, 0.078, 0.014]} material={materials.skinShadow}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function ImitationHuman({ poseId }) {
  const bodyRef = useRef();
  const spineRef = useRef();
  const neckRef = useRef();
  const leftShoulderRef = useRef();
  const leftElbowRef = useRef();
  const leftWristRef = useRef();
  const rightShoulderRef = useRef();
  const rightElbowRef = useRef();
  const rightWristRef = useRef();

  const materials = useMemo(() => ({
    skin: new THREE.MeshStandardMaterial({ color: '#d8a37a', roughness: 0.62, metalness: 0.02 }),
    shirt: new THREE.MeshStandardMaterial({ color: '#3f7f9f', roughness: 0.72, metalness: 0.03 }),
    pants: new THREE.MeshStandardMaterial({ color: '#263345', roughness: 0.78, metalness: 0.02 }),
    shoe: new THREE.MeshStandardMaterial({ color: '#1f2328', roughness: 0.55, metalness: 0.08 }),
    hair: new THREE.MeshStandardMaterial({ color: '#27201c', roughness: 0.74 }),
    eye: new THREE.MeshStandardMaterial({ color: '#151515', roughness: 0.35 }),
    iris: new THREE.MeshStandardMaterial({ color: '#3b4a3f', roughness: 0.32 }),
    white: new THREE.MeshStandardMaterial({ color: '#f8f4ef', roughness: 0.45 }),
    lip: new THREE.MeshStandardMaterial({ color: '#a7615e', roughness: 0.58 }),
    lipDark: new THREE.MeshStandardMaterial({ color: '#6f3c3c', roughness: 0.62 }),
    brow: new THREE.MeshStandardMaterial({ color: '#201915', roughness: 0.7 }),
    skinShadow: new THREE.MeshStandardMaterial({ color: '#b8795f', roughness: 0.68 }),
  }), []);

  useFrame((state, delta) => {
    const target = POSE_ROTATIONS[poseId] || POSE_ROTATIONS.idle;
    const dt = Math.min(delta, 0.1);
    const breath = Math.sin(state.clock.elapsedTime * 1.6) * 0.012;

    smoothRotation(spineRef, target.spine, dt);
    smoothRotation(neckRef, target.neck, dt);
    smoothRotation(leftShoulderRef, target.leftShoulder, dt);
    smoothRotation(leftElbowRef, target.leftElbow, dt);
    smoothRotation(leftWristRef, target.leftWrist, dt);
    smoothRotation(rightShoulderRef, target.rightShoulder, dt);
    smoothRotation(rightElbowRef, target.rightElbow, dt);
    smoothRotation(rightWristRef, target.rightWrist, dt);

    if (bodyRef.current) {
      bodyRef.current.position.y = -1.45 + breath;
      bodyRef.current.rotation.y = THREE.MathUtils.damp(
        bodyRef.current.rotation.y,
        Math.sin(state.clock.elapsedTime * 0.35) * 0.04,
        3,
        dt
      );
    }
  });

  return (
    <group ref={bodyRef} position={[0, -1.45, 0]} scale={1.08}>
      <group ref={spineRef} position={[0, 1.1, 0]}>
        <mesh position={[0, 0.15, 0]} scale={[0.62, 0.82, 0.34]} material={materials.shirt} castShadow receiveShadow>
          <sphereGeometry args={[1, 36, 36]} />
        </mesh>
        <mesh position={[0, 0.94, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.22, 0.9, 0.22]} material={materials.shirt} castShadow>
          <capsuleGeometry args={[1, 0.4, 16, 28]} />
        </mesh>
        <mesh position={[0, -0.58, 0]} scale={[0.55, 0.32, 0.34]} material={materials.pants} castShadow receiveShadow>
          <sphereGeometry args={[1, 28, 28]} />
        </mesh>

        <group ref={neckRef} position={[0, 1.06, 0]}>
          <mesh position={[0, 0.16, 0]} material={materials.skin} castShadow>
            <cylinderGeometry args={[0.16, 0.19, 0.34, 24]} />
          </mesh>
          <RealisticFace materials={materials} />
        </group>

        <Arm
          side="left"
          refs={{ shoulder: leftShoulderRef, elbow: leftElbowRef, wrist: leftWristRef }}
          skinMaterial={materials.skin}
          shirtMaterial={materials.shirt}
        />
        <Arm
          side="right"
          refs={{ shoulder: rightShoulderRef, elbow: rightElbowRef, wrist: rightWristRef }}
          skinMaterial={materials.skin}
          shirtMaterial={materials.shirt}
        />
      </group>

      <Leg side="left" skinMaterial={materials.skin} pantsMaterial={materials.pants} shoeMaterial={materials.shoe} />
      <Leg side="right" skinMaterial={materials.skin} pantsMaterial={materials.pants} shoeMaterial={materials.shoe} />

      <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.8, 48]} />
        <meshStandardMaterial color="#18212b" roughness={0.9} />
      </mesh>
    </group>
  );
}
