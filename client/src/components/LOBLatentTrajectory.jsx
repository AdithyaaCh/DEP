import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Text } from '@react-three/drei';

/**
 * 3D trajectory of the first three latent coordinates (PC1, PC2, PC3).
 * Color is animated along the path by snapshot index.
 */
export function LOBLatentTrajectory({ latent, indices, selected, onSelect, regimeBands = [], height = 440 }) {
  const { points, colors, scale } = useMemo(() => {
    if (!latent || latent.length === 0) {
      return { points: [], colors: [], scale: 1 };
    }
    const p = latent.map((row) => [row[0] ?? 0, row[1] ?? 0, row[2] ?? 0]);
    const max = Math.max(...p.flat().map(Math.abs), 1e-6);
    const s = 10 / max;
    const scaled = p.map((q) => [q[0] * s, q[1] * s, q[2] * s]);

    const n = scaled.length;
    const col = new Array(n);
    const bandMask = new Uint8Array(n);
    if (regimeBands.length && indices?.length) {
      for (let i = 0; i < n; i++) {
        const idx = indices[i];
        for (const b of regimeBands) {
          if (idx >= b.start && idx <= b.end) {
            bandMask[i] = 1;
            break;
          }
        }
      }
    }
    for (let i = 0; i < n; i++) {
      if (bandMask[i]) col[i] = '#f87171';
      else {
        const t = n > 1 ? i / (n - 1) : 0;
        // cool→warm gradient
        const r = Math.round(60 + 180 * t);
        const g = Math.round(120 + 80 * (1 - t));
        const bl = Math.round(220 - 180 * t);
        col[i] = `rgb(${r},${g},${bl})`;
      }
    }
    return { points: scaled, colors: col, scale: s };
  }, [latent, indices, regimeBands]);

  const selectedPos = useMemo(() => {
    if (selected == null || !indices || !latent) return null;
    const k = indices.indexOf(selected);
    if (k < 0) return null;
    return [latent[k][0] * scale, (latent[k][1] || 0) * scale, (latent[k][2] || 0) * scale];
  }, [selected, indices, latent, scale]);

  return (
    <div
      className="glass-panel"
      style={{ height, position: 'relative', overflow: 'hidden', borderRadius: 'var(--border-radius-lg)' }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Latent Trajectory (PC1, PC2, PC3)</strong>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
          {points.length} points · red segments = regime-shift windows
        </div>
      </div>

      <Canvas camera={{ position: [22, 18, 22], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 20]} intensity={1.0} />
        <pointLight position={[-20, -20, -20]} intensity={0.5} />

        <Line points={[[-15, 0, 0], [15, 0, 0]]} color="rgba(255,255,255,0.15)" lineWidth={1} />
        <Line points={[[0, -15, 0], [0, 15, 0]]} color="rgba(255,255,255,0.15)" lineWidth={1} />
        <Line points={[[0, 0, -15], [0, 0, 15]]} color="rgba(255,255,255,0.15)" lineWidth={1} />
        <Text position={[16, 0, 0]} fontSize={0.8} color="rgba(255,255,255,0.5)">PC1</Text>
        <Text position={[0, 16, 0]} fontSize={0.8} color="rgba(255,255,255,0.5)">PC2</Text>
        <Text position={[0, 0, 16]} fontSize={0.8} color="rgba(255,255,255,0.5)">PC3</Text>

        {points.length > 1 && (
          <Line points={points} vertexColors={colors.map(hexToRgb)} lineWidth={1.5} />
        )}

        {selectedPos && (
          <mesh position={selectedPos}>
            <sphereGeometry args={[0.45, 20, 20]} />
            <meshStandardMaterial color="#ffffff" emissive="#60a5fa" emissiveIntensity={0.6} />
          </mesh>
        )}

        <OrbitControls enableZoom enablePan />
      </Canvas>
    </div>
  );
}

function hexToRgb(col) {
  const m = col.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return [1, 1, 1];
  return [+m[1] / 255, +m[2] / 255, +m[3] / 255];
}
