"use client";

import type React from "react";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type ImageItem = string | { src: string; alt?: string };

interface FadeSettings {
  fadeIn: { start: number; end: number };
  fadeOut: { start: number; end: number };
}

interface BlurSettings {
  blurIn: { start: number; end: number };
  blurOut: { start: number; end: number };
  maxBlur: number;
}

interface InfiniteGalleryProps {
  images: ImageItem[];
  speed?: number;
  zSpacing?: number;
  visibleCount?: number;
  falloff?: { near: number; far: number };
  fadeSettings?: FadeSettings;
  blurSettings?: BlurSettings;
  className?: string;
  style?: React.CSSProperties;
  /** When false, wheel also scrolls the page (embedded sections). */
  captureScroll?: boolean;
  /** Base plane height in world units. */
  planeScale?: number;
}

interface PlaneData {
  index: number;
  z: number;
  imageIndex: number;
  x: number;
  y: number;
}

const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;

const createClothMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normal;
        vec3 pos = position;
        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;
        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;
          float secondaryWave = sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
          flagWave += secondaryWave;
        }
        pos.z -= (curve + clothEffect + flagWave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vec4 color = texture2D(map, vUv);
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }
        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });

function ImagePlane({
  texture,
  position,
  scale,
  material,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
  scale: [number, number, number];
  material: THREE.ShaderMaterial;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (material && texture) {
      material.uniforms.map.value = texture;
    }
  }, [material, texture]);

  useEffect(() => {
    if (material?.uniforms) {
      material.uniforms.isHovered.value = isHovered ? 1.0 : 0.0;
    }
  }, [material, isHovered]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      material={material}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
    </mesh>
  );
}

/** 21st.dev advance logic — when visibleCount divides image count, step by 1. */
function imageAdvanceStep(visibleCount: number, totalImages: number) {
  if (totalImages <= 0) return 0;
  const mod = visibleCount % totalImages;
  return mod === 0 ? 1 : mod;
}

function GalleryScene({
  images,
  speed = 1,
  visibleCount = 8,
  captureScroll = false,
  planeScale = 3.2,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.15 },
    fadeOut: { start: 0.85, end: 0.95 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.9, end: 1.0 },
    maxBlur: 3.0,
  },
}: Omit<InfiniteGalleryProps, "className" | "style">) {
  const { gl } = useThree();
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const autoPlayRef = useRef(true);
  const lastInteraction = useRef(Date.now());

  const normalizedImages = useMemo(
    () =>
      images.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img
      ),
    [images]
  );

  const textures = useTexture(normalizedImages.map((img) => img.src));

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount]
  );

  const spatialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const spread = 0.35;

    for (let i = 0; i < visibleCount; i++) {
      const horizontalAngle = (i * 2.618) % (Math.PI * 2);
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;
      const x =
        (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) /
        3;
      const y =
        (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4;
      positions.push({ x: x * spread, y: y * spread });
    }

    return positions;
  }, [visibleCount]);

  const totalImages = normalizedImages.length;
  const depthRange = DEFAULT_DEPTH_RANGE;

  const planesData = useRef<PlaneData[]>(
    Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: visibleCount > 0 ? ((depthRange / visibleCount) * i) % depthRange : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }))
  );

  useEffect(() => {
    planesData.current = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z:
        visibleCount > 0
          ? ((depthRange / Math.max(visibleCount, 1)) * i) % depthRange
          : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }));
  }, [depthRange, spatialPositions, totalImages, visibleCount]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (captureScroll) {
        event.preventDefault();
      }
      setScrollVelocity((prev) => prev + event.deltaY * 0.01 * speed);
      autoPlayRef.current = false;
      lastInteraction.current = Date.now();
    },
    [captureScroll, speed]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        setScrollVelocity((prev) => prev - 2 * speed);
        autoPlayRef.current = false;
        lastInteraction.current = Date.now();
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        setScrollVelocity((prev) => prev + 2 * speed);
        autoPlayRef.current = false;
        lastInteraction.current = Date.now();
      }
    },
    [speed]
  );

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("wheel", handleWheel, { passive: !captureScroll });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gl.domElement, captureScroll, handleWheel, handleKeyDown]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (Date.now() - lastInteraction.current > 3000) {
        autoPlayRef.current = true;
      }
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useFrame((state, delta) => {
    if (autoPlayRef.current) {
      setScrollVelocity((prev) => prev + 0.22 * delta);
    }
    setScrollVelocity((prev) => prev * 0.97);

    const time = state.clock.getElapsedTime();
    materials.forEach((material) => {
      if (material?.uniforms) {
        material.uniforms.time.value = time;
        material.uniforms.scrollForce.value = scrollVelocity;
      }
    });

    const imageAdvance = imageAdvanceStep(visibleCount, totalImages);
    const totalRange = depthRange;
    const halfRange = totalRange / 2;

    planesData.current.forEach((plane, i) => {
      let newZ = plane.z + scrollVelocity * delta * 10;
      let wrapsForward = 0;
      let wrapsBackward = 0;

      if (newZ >= totalRange) {
        wrapsForward = Math.floor(newZ / totalRange);
        newZ -= totalRange * wrapsForward;
      } else if (newZ < 0) {
        wrapsBackward = Math.ceil(-newZ / totalRange);
        newZ += totalRange * wrapsBackward;
      }

      if (wrapsForward > 0 && imageAdvance > 0 && totalImages > 0) {
        plane.imageIndex =
          (plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
      }
      if (wrapsBackward > 0 && imageAdvance > 0 && totalImages > 0) {
        const step = plane.imageIndex - wrapsBackward * imageAdvance;
        plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
      }

      plane.z = ((newZ % totalRange) + totalRange) % totalRange;
      plane.x = spatialPositions[i]?.x ?? 0;
      plane.y = spatialPositions[i]?.y ?? 0;

      const normalizedPosition = plane.z / totalRange;
      let opacity = 1;

      if (
        normalizedPosition >= fadeSettings.fadeIn.start &&
        normalizedPosition <= fadeSettings.fadeIn.end
      ) {
        const fadeInProgress =
          (normalizedPosition - fadeSettings.fadeIn.start) /
          (fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
        opacity = fadeInProgress;
      } else if (normalizedPosition < fadeSettings.fadeIn.start) {
        opacity = 0;
      } else if (
        normalizedPosition >= fadeSettings.fadeOut.start &&
        normalizedPosition <= fadeSettings.fadeOut.end
      ) {
        const fadeOutProgress =
          (normalizedPosition - fadeSettings.fadeOut.start) /
          (fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
        opacity = 1 - fadeOutProgress;
      } else if (normalizedPosition > fadeSettings.fadeOut.end) {
        opacity = 0;
      }

      opacity = Math.max(0, Math.min(1, opacity));

      let blur = 0;
      if (
        normalizedPosition >= blurSettings.blurIn.start &&
        normalizedPosition <= blurSettings.blurIn.end
      ) {
        const blurInProgress =
          (normalizedPosition - blurSettings.blurIn.start) /
          (blurSettings.blurIn.end - blurSettings.blurIn.start);
        blur = blurSettings.maxBlur * (1 - blurInProgress);
      } else if (normalizedPosition < blurSettings.blurIn.start) {
        blur = blurSettings.maxBlur;
      } else if (
        normalizedPosition >= blurSettings.blurOut.start &&
        normalizedPosition <= blurSettings.blurOut.end
      ) {
        const blurOutProgress =
          (normalizedPosition - blurSettings.blurOut.start) /
          (blurSettings.blurOut.end - blurSettings.blurOut.start);
        blur = blurSettings.maxBlur * blurOutProgress;
      } else if (normalizedPosition > blurSettings.blurOut.end) {
        blur = blurSettings.maxBlur;
      }

      blur = Math.max(0, Math.min(blurSettings.maxBlur, blur));

      const material = materials[i];
      if (material?.uniforms) {
        material.uniforms.opacity.value = opacity;
        material.uniforms.blurAmount.value = blur;
      }
    });
  });

  if (normalizedImages.length === 0) return null;

  const halfRange = depthRange / 2;

  return (
    <>
      {planesData.current.map((plane) => {
        const texture = textures[plane.imageIndex];
        const material = materials[plane.index];
        if (!texture || !material) return null;

        const worldZ = plane.z - halfRange;
        const image = texture.image as HTMLImageElement | undefined;
        const aspect =
          image?.width && image?.height ? image.width / image.height : 1;
        const scale: [number, number, number] =
          aspect > 1
            ? [planeScale * aspect, planeScale, 1]
            : [planeScale, planeScale / aspect, 1];

        return (
          <ImagePlane
            key={`${plane.index}-${plane.imageIndex}`}
            texture={texture}
            position={[plane.x, plane.y, worldZ]}
            scale={scale}
            material={material}
          />
        );
      })}
    </>
  );
}

export function StaticGalleryGrid({ images }: { images: ImageItem[] }) {
  const normalizedImages = useMemo(
    () =>
      images.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img
      ),
    [images]
  );

  return (
    <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-3">
      {normalizedImages.map((img, i) => (
        <div
          key={img.src}
          className="overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt ?? ""}
            className="aspect-[4/3] w-full object-cover"
            loading={i < 3 ? "eager" : "lazy"}
          />
        </div>
      ))}
    </div>
  );
}

function FallbackGallery({ images }: { images: ImageItem[] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[var(--color-bg-parchment)] p-[var(--space-4)]">
      <p className="mb-[var(--space-4)] font-body text-[var(--text-small)] text-[var(--color-text-tertiary)]">
        WebGL unavailable — static gallery
      </p>
      <StaticGalleryGrid images={images} />
    </div>
  );
}

export default function InfiniteGallery({
  images,
  className = "h-96 w-full",
  style,
  speed = 1,
  visibleCount,
  captureScroll = false,
  planeScale = 3.2,
  fadeSettings = {
    fadeIn: { start: 0.04, end: 0.18 },
    fadeOut: { start: 0.52, end: 0.62 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.52, end: 0.62 },
    maxBlur: 6.0,
  },
}: InfiniteGalleryProps) {
  const [webglSupported, setWebglSupported] = useState(true);
  const resolvedVisibleCount =
    visibleCount ?? Math.max(6, Math.min(images.length, 8));

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className={className} style={style}>
        <FallbackGallery images={images} />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        className="!h-full !w-full"
        dpr={[1, 2]}
      >
        <GalleryScene
          images={images}
          speed={speed}
          visibleCount={resolvedVisibleCount}
          captureScroll={captureScroll}
          planeScale={planeScale}
          fadeSettings={fadeSettings}
          blurSettings={blurSettings}
        />
      </Canvas>
    </div>
  );
}
