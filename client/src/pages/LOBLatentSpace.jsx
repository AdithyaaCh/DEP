import React, { useEffect, useState } from 'react';
import { LOBLatentTrajectory } from '../components/LOBLatentTrajectory';

const API = 'http://localhost:8000';

export function LOBLatentSpace() {
  const [latent, setLatent] = useState([]);
  const [indices, setIndices] = useState([]);
  const [variance, setVariance] = useState([]);
  const [scan, setScan] = useState(null);
  const [stride, setStride] = useState(15);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/lob/latent?stride=${stride}`).then((r) => r.json()),
      fetch(`${API}/api/lob/scan`).then((r) => r.json()),
    ]).then(([l, s]) => {
      setLatent(l.latent_scores);
      setIndices(l.snapshot_indices);
      setVariance(l.pca_variance_explained);
      setScan(s);
      setLoading(false);
    });
  }, [stride]);

  const cumVar = variance.reduce((a, b) => a + b, 0);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ margin: 0, fontSize: '2rem' }}>
            LOB Latent Trajectory
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
            3D PCA score path across all snapshots — red segments lie in detected regime bands
          </p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', gap: '0.6rem', padding: '0.6rem 0.8rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Stride</label>
            <input
              type="number"
              className="input-style"
              value={stride}
              min={1}
              max={100}
              onChange={(e) => setStride(Math.max(1, parseInt(e.target.value || '1', 10)))}
              style={{ width: 85, padding: '0.3rem 0.4rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </header>

      {loading && (
        <div className="glass-panel panel-container" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Fetching latent trajectory…
        </div>
      )}

      {!loading && (
        <>
          <LOBLatentTrajectory
            latent={latent}
            indices={indices}
            regimeBands={scan?.regime_bands || []}
            selected={selected}
            onSelect={setSelected}
            height={480}
          />

          <div className="glass-panel panel-container" style={{ marginTop: '1.5rem' }}>
            <h3 className="panel-title">PCA Variance Explained</h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${variance.length}, 1fr)`, gap: '0.5rem' }}>
              {variance.map((v, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.6rem 0.7rem',
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>PC{i + 1}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 600 }}>
                    {(v * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Cumulative: {(cumVar * 100).toFixed(1)}% of variance across {variance.length} components.
              Latent points shown: {indices.length.toLocaleString()}.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
