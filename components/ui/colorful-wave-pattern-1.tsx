'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ElectricWavesBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch { return; }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;
    const fragmentShader = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float pattern(vec2 uv) {
        float intensity = 0.0;
        float waveCount = 5.0;
        float amplitude = 0.1;
        float frequency = 2.0;
        float brightness = 0.005;
        for (float i = 0.0; i < 5.0; i++) {
          uv.x += sin(u_time * (1.0 + i) + uv.y * frequency) * amplitude;
          intensity += brightness / abs(uv.x);
        }
        return intensity;
      }

      vec3 scene(vec2 uv) {
        vec3 color = vec3(0.0);
        vec2 ruv = vec2(uv.y, uv.x);
        float colorSep = 0.1;
        for (float i = 0.0; i < 5.0; i++) {
          int channel = int(mod(i, 3.0));
          vec2 cuv = ruv + vec2(0.0, i * colorSep);
          float rand = 0.5 + 0.5 * sin(i * 1.73);
          color[channel] += pattern(cuv) * rand;
        }
        return color;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        vec3 col = scene(uv);
        // Tint towards blue/cyan for Eternal
        col = mix(col, col * vec3(0.4, 0.8, 1.0), 0.5);
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const uniforms = {
      u_time:       { value: 0 },
      u_resolution: { value: new THREE.Vector2() },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);
    };
    window.addEventListener('resize', onResize);
    onResize();

    renderer.setAnimationLoop(() => {
      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.setAnimationLoop(null);
      const canvas = renderer.domElement;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};

export default ElectricWavesBackground;
