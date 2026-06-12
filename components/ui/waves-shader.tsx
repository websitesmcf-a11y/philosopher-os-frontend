'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface WavesShaderProps {
  className?: string;
  /** Wire color of the wave mesh. Defaults to the gold accent. */
  color?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Wave height. */
  amplitude?: number;
  /** Overall opacity of the wave lines. */
  opacity?: number;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  varying float vElevation;

  void main() {
    vec3 pos = position;
    float elevation =
      sin(pos.x * 0.35 + uTime) * sin(pos.y * 0.30 + uTime * 0.8) * uAmplitude
      + sin(pos.x * 0.12 - uTime * 0.6) * uAmplitude * 0.5;
    pos.z += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vElevation;

  void main() {
    float strength = 0.45 + vElevation * 0.6;
    gl_FragColor = vec4(uColor, uOpacity * clamp(strength, 0.1, 1.0));
  }
`;

/**
 * Animated three.js wave-grid background. Renders as a subtle etched
 * wireframe in the accent color — ambient, non-interactive, GPU-cheap.
 */
export function WavesShader({
  className,
  color = '#D4AF37',
  speed = 0.5,
  amplitude = 0.9,
  opacity = 0.35,
}: WavesShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.set(0, 7, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(34, 34, 88, 88);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2.15;
    scene.add(mesh);

    let frame = 0;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      material.uniforms.uTime.value = clock.getElapsedTime() * speed;
      renderer.render(scene, camera);
    };

    const animate = () => {
      frame = requestAnimationFrame(animate);
      renderFrame();
    };

    if (prefersReduced) {
      renderFrame(); // single static frame
    } else {
      animate();
    }

    const onResize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (prefersReduced) renderFrame();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [color, speed, amplitude, opacity]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    />
  );
}

export default WavesShader;
