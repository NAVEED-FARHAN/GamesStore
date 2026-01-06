import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import './LightPillar.css';

interface LightPillarProps {
  topColor?: string;
  bottomColor?: string;
  intensity?: number;
  rotationSpeed?: number;
  interactive?: boolean;
  className?: string;
  glowAmount?: number;
  pillarWidth?: number;
  pillarHeight?: number;
  noiseIntensity?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
  pillarRotation?: number;
}

const LightPillar: React.FC<LightPillarProps> = ({
  topColor = '#5227FF',
  bottomColor = '#FF9FFC',
  intensity = 1.0,
  rotationSpeed = 3,
  interactive = false,
  className = '',
  glowAmount = 0.005,
  pillarWidth = 20.0,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  mixBlendMode = 'screen',
  pillarRotation = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const timeRef = useRef<number>(0);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  // Parse color helper
  const parseColor = (hex: string): THREE.Vector3 => {
    const color = new THREE.Color(hex);
    return new THREE.Vector3(color.r, color.g, color.b);
  };

  // Keep track of target and current values for interpolation
  const targets = useRef({
    topColor: parseColor(topColor),
    bottomColor: parseColor(bottomColor),
    intensity: intensity,
    rotationSpeed: rotationSpeed,
    glowAmount: glowAmount,
    pillarWidth: pillarWidth,
    pillarHeight: pillarHeight,
    noiseIntensity: noiseIntensity,
    pillarRotation: pillarRotation
  });

  const currentValues = useRef({
    topColor: parseColor(topColor),
    bottomColor: parseColor(bottomColor),
    intensity: intensity,
    rotationSpeed: rotationSpeed,
    glowAmount: glowAmount,
    pillarWidth: pillarWidth,
    pillarHeight: pillarHeight,
    noiseIntensity: noiseIntensity,
    pillarRotation: pillarRotation
  });

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLSupported(false);
      console.warn('WebGL is not supported in this browser');
    }
  }, []);

  // Initialize Scene & Renderer (Run Once)
  useEffect(() => {
    if (!containerRef.current || !webGLSupported) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        precision: 'lowp',
        stencil: false,
        depth: false
      });
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      setWebGLSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Shader materials... (same as before)
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform float uIntensity;
      uniform bool uInteractive;
      uniform float uGlowAmount;
      uniform float uPillarWidth;
      uniform float uPillarHeight;
      uniform float uNoiseIntensity;
      uniform float uPillarRotation;
      varying vec2 vUv;

      const float PI = 3.141592653589793;
      const float EPSILON = 0.001;
      const float E = 2.71828182845904523536;
      const float HALF = 0.5;

      mat2 rot(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }

      float noise(vec2 coord) {
        float G = E;
        vec2 r = (G * sin(G * coord));
        return fract(r.x * r.y * (1.0 + coord.x));
      }

      vec3 applyWaveDeformation(vec3 pos, float timeOffset) {
        float frequency = 1.0;
        float amplitude = 1.0;
        vec3 deformed = pos;
        
        for(float i = 0.0; i < 4.0; i++) {
          deformed.xz *= rot(0.4);
          float phase = timeOffset * i * 2.0;
          vec3 oscillation = cos(deformed.zxy * frequency - phase);
          deformed += oscillation * amplitude;
          frequency *= 2.0;
          amplitude *= HALF;
        }
        return deformed;
      }

      float blendMin(float a, float b, float k) {
        float scaledK = k * 4.0;
        float h = max(scaledK - abs(a - b), 0.0);
        return min(a, b) - h * h * 0.25 / scaledK;
      }

      float blendMax(float a, float b, float k) {
        return -blendMin(-a, -b, k);
      }

      void main() {
        vec2 fragCoord = vUv * uResolution;
        vec2 uv = (fragCoord * 2.0 - uResolution) / uResolution.y;
        
        float rotAngle = uPillarRotation * PI / 180.0;
        uv *= rot(rotAngle);

        vec3 origin = vec3(0.0, 0.0, -10.0);
        vec3 direction = normalize(vec3(uv, 1.0));

        float maxDepth = 50.0;
        float depth = 0.1;

        mat2 rotX = rot(uTime * 0.3);
        if(uInteractive && length(uMouse) > 0.0) {
          rotX = rot(uMouse.x * PI * 2.0);
        }

        vec3 color = vec3(0.0);
        
        for(float i = 0.0; i < 100.0; i++) {
          vec3 pos = origin + direction * depth;
          pos.xz *= rotX;

          vec3 deformed = pos;
          deformed.y *= uPillarHeight;
          deformed = applyWaveDeformation(deformed + vec3(0.0, uTime, 0.0), uTime);
          
          vec2 cosinePair = cos(deformed.xz);
          float fieldDistance = length(cosinePair) - 0.2;
          
          float radialBound = length(pos.xz) - uPillarWidth;
          fieldDistance = blendMax(radialBound, fieldDistance, 1.0);
          fieldDistance = abs(fieldDistance) * 0.15 + 0.01;

          vec3 gradient = mix(uBottomColor, uTopColor, smoothstep(15.0, -15.0, pos.y));
          color += gradient * pow(1.0 / fieldDistance, 1.0);

          if(fieldDistance < EPSILON || depth > maxDepth) break;
          depth += fieldDistance;
        }

        float widthNormalization = uPillarWidth / 3.0;
        color = tanh(color * uGlowAmount / widthNormalization);
        
        float rnd = noise(gl_FragCoord.xy);
        color -= rnd / 15.0 * uNoiseIntensity;
        
        gl_FragColor = vec4(color * uIntensity, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: mouseRef.current },
        uTopColor: { value: currentValues.current.topColor },
        uBottomColor: { value: currentValues.current.bottomColor },
        uIntensity: { value: currentValues.current.intensity },
        uInteractive: { value: interactive },
        uGlowAmount: { value: currentValues.current.glowAmount },
        uPillarWidth: { value: currentValues.current.pillarWidth },
        uPillarHeight: { value: currentValues.current.pillarHeight },
        uNoiseIntensity: { value: currentValues.current.noiseIntensity },
        uPillarRotation: { value: currentValues.current.pillarRotation }
      },
      transparent: true,
      depthWrite: false,
      depthTest: false
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    geometryRef.current = geometry;
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let resizeTimeout: number | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (!rendererRef.current || !materialRef.current || !containerRef.current) return;
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        rendererRef.current.setSize(newWidth, newHeight);
        materialRef.current.uniforms.uResolution.value.set(newWidth, newHeight);
      }, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      if (materialRef.current) materialRef.current.dispose();
      if (geometryRef.current) geometryRef.current.dispose();
    };
  }, [webGLSupported]);

  // Update targets when props change
  useEffect(() => {
    targets.current = {
      topColor: parseColor(topColor),
      bottomColor: parseColor(bottomColor),
      intensity: intensity,
      rotationSpeed: rotationSpeed,
      glowAmount: glowAmount,
      pillarWidth: pillarWidth,
      pillarHeight: pillarHeight,
      noiseIntensity: noiseIntensity,
      pillarRotation: pillarRotation
    };
  }, [
    topColor, bottomColor, intensity, rotationSpeed,
    glowAmount, pillarWidth, pillarHeight, noiseIntensity, pillarRotation
  ]);

  // Animation Loop with Interpolation
  useEffect(() => {
    if (!webGLSupported) return;

    let lastTime = performance.now();
    const frameTime = 1000 / 60; // 60fps limit

    // Linear interpolation helper
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const lerpColor = (start: THREE.Vector3, end: THREE.Vector3, factor: number) => {
      return new THREE.Vector3(
        lerp(start.x, end.x, factor),
        lerp(start.y, end.y, factor),
        lerp(start.z, end.z, factor)
      );
    };

    const animate = (currentTime: number) => {
      if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = currentTime - lastTime;

      // Only render if enough time has passed (frame limiting)
      if (deltaTime >= frameTime) {

        // INTERPOLATION LOGIC
        // Adjust the factor (0.05) to control smoothness/speed of morph
        // 0.025 settles in approx 2.5 seconds at 60fps
        const factor = 0.025;

        const curr = currentValues.current;
        const tgt = targets.current;

        curr.intensity = lerp(curr.intensity, tgt.intensity, factor);
        curr.pillarWidth = lerp(curr.pillarWidth, tgt.pillarWidth, factor);
        curr.pillarHeight = lerp(curr.pillarHeight, tgt.pillarHeight, factor);
        curr.pillarRotation = lerp(curr.pillarRotation, tgt.pillarRotation, factor);
        curr.glowAmount = lerp(curr.glowAmount, tgt.glowAmount, factor);
        curr.noiseIntensity = lerp(curr.noiseIntensity, tgt.noiseIntensity, factor);

        // Colors
        curr.topColor = lerpColor(curr.topColor, tgt.topColor, factor);
        curr.bottomColor = lerpColor(curr.bottomColor, tgt.bottomColor, factor);

        // Rotation Speed (interpolated for smooth accel/decel)
        curr.rotationSpeed = lerp(curr.rotationSpeed, tgt.rotationSpeed, factor);

        // Update Uniforms
        const uniforms = materialRef.current.uniforms;
        uniforms.uIntensity.value = curr.intensity;
        uniforms.uPillarWidth.value = curr.pillarWidth;
        uniforms.uPillarHeight.value = curr.pillarHeight;
        uniforms.uPillarRotation.value = curr.pillarRotation;
        uniforms.uGlowAmount.value = curr.glowAmount;
        uniforms.uNoiseIntensity.value = curr.noiseIntensity;
        uniforms.uTopColor.value.copy(curr.topColor);
        uniforms.uBottomColor.value.copy(curr.bottomColor);

        // Time update using interpolated rotation speed
        timeRef.current += 0.01 * curr.rotationSpeed;
        uniforms.uTime.value = timeRef.current;

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        lastTime = currentTime - (deltaTime % frameTime);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [webGLSupported]);

  if (!webGLSupported) {
    return (
      <div className={`light-pillar-fallback ${className}`} style={{ mixBlendMode }}>
        WebGL not supported
      </div>
    );
  }

  return <div ref={containerRef} className={`light-pillar-container ${className}`} style={{ mixBlendMode }} />;
};

export default LightPillar;
