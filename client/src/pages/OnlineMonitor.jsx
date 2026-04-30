import React, { useState, useEffect } from 'react'
import { LiveMarketChart } from '../components/LiveMarketChart'
import { FDAStats } from '../components/FDAStats'
import { HilbertManifold } from '../components/HilbertManifold'
import { RegimeTimeline } from '../components/RegimeTimeline'
import { FunctionalCurve } from '../components/FunctionalCurve'
import { apiUrl } from '../lib/runtimeConfig'

export function OnlineMonitor() {
  const [currentDay, setCurrentDay] = useState(302);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [windowDetail, setWindowDetail] = useState(null);
  const [loadingWindow, setLoadingWindow] = useState(false);

  const fetchWindowDetails = (startDay) => {
    setLoadingWindow(true);
    fetch(apiUrl(`/api/regime/window/${startDay}`))
      .then(res => res.json())
      .then(json => {
        setWindowDetail(json);
        setLoadingWindow(false);
      })
      .catch(err => {
        console.error("Window detail fetch failed:", err);
        setLoadingWindow(false);
      });
  };

  useEffect(() => {
    if (selectedWindow !== null) {
      fetchWindowDetails(selectedWindow);
    }
  }, [selectedWindow]);

  const handleWindowSelect = (startDay) => {
    setSelectedWindow(startDay);
    setCurrentDay(startDay);
  };

  const startAnalysis = () => {
    setSelectedWindow(currentDay);
  };

  const manifoldRefScores = windowDetail?.ref_scores || [];
  const manifoldTestScores = windowDetail?.test_scores || [];
  const isRegimeShift = windowDetail ? (windowDetail.f_p_value < 0.01) : false;
  const fStat = windowDetail?.f_stat || 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ margin: 0, fontSize: '2rem' }}>Online Regime Monitor</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
            Persistent Regime Shift Detection via Functional Population Distance
          </p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.6rem 0.8rem', borderRadius: 'var(--border-radius-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Test Day</label>
            <input type="number" className="input-style" style={{ width: '65px', padding: '0.3rem 0.4rem', fontSize: '0.85rem' }}
              value={currentDay} onChange={(e) => setCurrentDay(parseInt(e.target.value) || 302)} min={55} max={1253} />
          </div>
          <button onClick={startAnalysis} disabled={loadingWindow}
            style={{ height: 'max-content', alignSelf: 'flex-end', padding: '0.5rem 1rem', fontWeight: 'bold', fontSize: '0.8rem' }}>
            {loadingWindow ? '⏳ Matrix Calc...' : '▶ Drill Window'}
          </button>
        </div>
      </header>

      <RegimeTimeline onWindowSelect={handleWindowSelect} selectedWindow={selectedWindow} />

      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(550px, 2fr) minmax(340px, 1fr)', gap: '1.5rem', marginTop: '1.5rem', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <LiveMarketChart windowDetail={windowDetail} isAcademicMode={false} />
          <FunctionalCurve day={windowDetail?.window_end ?? null} />
          <HilbertManifold refScores={manifoldRefScores} testScores={manifoldTestScores} isRegimeShift={isRegimeShift} fStat={fStat} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FDAStats windowDetail={windowDetail} isAcademicMode={false} />
        </div>
      </main>
    </div>
  )
}
