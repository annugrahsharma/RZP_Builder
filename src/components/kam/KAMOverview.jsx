import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import { formatINR, formatNumber, computeMerchantRevenue, isTerminalZeroCost } from '../../data/kamMockData'

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function KAMOverview() {
  const {
    stats, zeroCostShare, targetData, allMerchants, monthlyHistory, selectedMonth, setSelectedMonth,
    tspComplianceMap, ntfStats, routingConflictsMap, totalConflicts,
  } = useKAM()
  const navigate = useNavigate()
  const [hoveredMonth, setHoveredMonth] = useState(null)

  // Group monthly history by year for heatmap rendering
  const yearRows = useMemo(() => {
    if (!monthlyHistory || monthlyHistory.length === 0) return []
    const grouped = {}
    monthlyHistory.forEach((m) => {
      if (!grouped[m.year]) grouped[m.year] = []
      grouped[m.year].push(m)
    })
    return Object.keys(grouped)
      .sort()
      .map((year) => ({
        year: Number(year),
        months: grouped[year],
      }))
  }, [monthlyHistory])

  const handleCellClick = (entry) => {
    if (selectedMonth && selectedMonth.year === entry.year && selectedMonth.month === entry.month) {
      setSelectedMonth(null)
    } else {
      setSelectedMonth(entry)
    }
  }

  const merchantsNeedingAttention = useMemo(() => {
    return allMerchants
      .filter(m => m.routingStrategy === 'success_rate')
      .map(m => ({ ...m, revenue: computeMerchantRevenue(m) }))
      .sort((a, b) => b.revenue.backwardCost - a.revenue.backwardCost)
      .slice(0, 5)
  }, [allMerchants])

  const progressColor = targetData.percentage >= 80
    ? 'var(--rzp-success)'
    : targetData.percentage >= 60
      ? 'var(--rzp-warning)'
      : 'var(--rzp-danger)'

  const progressBadgeClass = targetData.percentage >= 80
    ? 'success'
    : targetData.percentage >= 60
      ? 'warning'
      : 'danger'

  return (
    <>
      {/* Page Header */}
      <div className="kam-page-header">
        <h2>Dashboard Overview</h2>
        <p>Monitor your enterprise merchant portfolio and revenue targets</p>
      </div>

      {/* Revenue Target Tracker */}
      <div className="kam-revenue-tracker">
        <div className="kam-revenue-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {' '}Revenue Target - {targetData.month}
          </h3>
          <span className={`kam-badge ${progressBadgeClass}`}>
            {targetData.percentage}% achieved
          </span>
        </div>

        <div className="kam-revenue-amounts">
          <div className="kam-revenue-amount">
            <span className="label">Achieved</span>
            <span className="value">{formatINR(targetData.achieved)}</span>
          </div>
          <div className="kam-revenue-amount">
            <span className="label">Target</span>
            <span className="value target">{formatINR(targetData.target)}</span>
          </div>
        </div>

        <div className="kam-revenue-progress">
          <div className="kam-progress-bar">
            <div
              className="kam-progress-fill"
              style={{
                width: `${Math.min(targetData.percentage, 100)}%`,
                background: `linear-gradient(90deg, ${progressColor}, ${progressColor})`,
              }}
            />
          </div>
          <div className="kam-revenue-progress-labels">
            <span>0%</span>
            <span>{targetData.percentage}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="kam-revenue-meta">
          <div className="kam-revenue-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>
              <strong>{targetData.daysElapsed}</strong> / {targetData.daysInMonth} days elapsed
            </span>
          </div>
          <div className="kam-revenue-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>
              Projected: <strong>{formatINR(targetData.projectedRevenue)}</strong>
            </span>
          </div>
          <div className="kam-revenue-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              <strong>{stats.merchantsOnCostRouting}</strong> / {stats.totalMerchants} on cost routing
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Performance Heatmap */}
      <div className="kam-heatmap-card">
        <div className="kam-heatmap-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Monthly Target Performance
          </h3>
          <div className="kam-heatmap-legend">
            <div className="kam-heatmap-legend-item">
              <div className="kam-heatmap-legend-dot green" />
              <span>Achieved (&ge;90%)</span>
            </div>
            <div className="kam-heatmap-legend-item">
              <div className="kam-heatmap-legend-dot yellow" />
              <span>Close (70-89%)</span>
            </div>
            <div className="kam-heatmap-legend-item">
              <div className="kam-heatmap-legend-dot red" />
              <span>Missed (&lt;70%)</span>
            </div>
          </div>
        </div>

        <div className="kam-heatmap-grid">
          {/* Month Labels */}
          <div className="kam-heatmap-month-labels">
            <div /> {/* spacer for year column */}
            {MONTH_LABELS.map((label) => (
              <div key={label} className="kam-heatmap-month-label">{label}</div>
            ))}
          </div>

          {/* Year Rows */}
          {yearRows.map(({ year, months }) => (
            <div key={year} className="kam-heatmap-row">
              <div className="kam-heatmap-year">{year}</div>
              {MONTH_LABELS.map((_, monthIdx) => {
                const entry = months.find((m) => m.month === monthIdx + 1)
                if (!entry) {
                  return <div key={monthIdx} className="kam-heatmap-cell empty" />
                }
                const isHovered = hoveredMonth && hoveredMonth.year === entry.year && hoveredMonth.month === entry.month
                const isSelected = selectedMonth && selectedMonth.year === entry.year && selectedMonth.month === entry.month
                return (
                  <div
                    key={monthIdx}
                    className={`kam-heatmap-cell ${entry.status}${entry.isCurrent ? ' current' : ''}${isSelected ? ' selected' : ''}`}
                    onMouseEnter={() => setHoveredMonth(entry)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    onClick={() => handleCellClick(entry)}
                  >
                    {isHovered && (
                      <div className="kam-heatmap-tooltip">
                        <div className="kam-heatmap-tooltip-month">{entry.monthFull}</div>
                        <div className="kam-heatmap-tooltip-detail">
                          {formatINR(entry.achieved)} / {formatINR(entry.target)}
                        </div>
                        <div className="kam-heatmap-tooltip-detail">
                          <span className="kam-heatmap-tooltip-pct">{entry.percentage}%</span> of target
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Selected Month Detail Strip */}
        {selectedMonth && (
          <div className="kam-heatmap-selected">
            <div className="kam-heatmap-selected-month">
              <div className={`kam-heatmap-selected-dot ${selectedMonth.status}`}
                   style={{ background: selectedMonth.status === 'green' ? '#1EA672' : selectedMonth.status === 'yellow' ? '#F5D623' : '#E74C3C' }} />
              {selectedMonth.monthFull}
              {selectedMonth.isCurrent && (
                <span className="kam-badge info" style={{ fontSize: '10px', padding: '2px 8px' }}>Current</span>
              )}
            </div>
            <div className="kam-heatmap-selected-stats">
              <div className="kam-heatmap-selected-stat">
                <span className="label">Achieved</span>
                <span className="value">{formatINR(selectedMonth.achieved)}</span>
              </div>
              <div className="kam-heatmap-selected-stat">
                <span className="label">Target</span>
                <span className="value">{formatINR(selectedMonth.target)}</span>
              </div>
              <div className="kam-heatmap-selected-stat">
                <span className="label">Achievement</span>
                <span className="value">{selectedMonth.percentage}%</span>
              </div>
            </div>
            <div className={`kam-heatmap-selected-badge ${selectedMonth.status}`}>
              {selectedMonth.status === 'green' ? 'Target Achieved' : selectedMonth.status === 'yellow' ? 'Close to Target' : 'Target Missed'}
            </div>
          </div>
        )}
      </div>

      {/* 6 Metric Cards */}
      <div className="kam-overview-grid">
        {/* 1. Avg Success Rate */}
        <div className="kam-metric-card">
          <div className="metric-icon" style={{ background: 'var(--rzp-success-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--rzp-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="metric-label">Avg Success Rate</div>
          <div className="metric-value">{stats.avgSuccessRate}%</div>
          <div className="metric-delta positive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            +1.2% vs last month
          </div>
        </div>

        {/* 2. Total Transactions */}
        <div className="kam-metric-card">
          <div className="metric-icon" style={{ background: 'var(--rzp-blue-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--rzp-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2" />
            </svg>
          </div>
          <div className="metric-label">Total Transactions</div>
          <div className="metric-value">
            {stats.totalTxnVolume >= 1000000
              ? (stats.totalTxnVolume / 1000000).toFixed(1) + 'M'
              : formatNumber(stats.totalTxnVolume)}
          </div>
          <div className="metric-delta positive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            +8.3% vs last month
          </div>
        </div>

        {/* 3. Total Net Revenue */}
        <div className="kam-metric-card">
          <div className="metric-icon" style={{ background: 'var(--rzp-success-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--rzp-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="metric-label">Total Net Revenue</div>
          <div className="metric-value">{formatINR(stats.totalNetRevenue)}</div>
          <div className="metric-delta positive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            +5.6% vs last month
          </div>
        </div>

        {/* 4. Avg Cost/Txn */}
        <div className="kam-metric-card">
          <div className="metric-icon" style={{ background: 'var(--rzp-warning-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--rzp-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="metric-label">Avg Cost / Txn</div>
          <div className="metric-value">
            {'\u20B9'}{stats.avgCostPerTxn.toFixed(2)}
          </div>
          <div className="metric-delta negative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            +0.12 vs last month
          </div>
        </div>

        {/* 5. Cost Routing */}
        <div className="kam-metric-card">
          <div className="metric-icon" style={{ background: 'var(--rzp-blue-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--rzp-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </div>
          <div className="metric-label">Cost Routing</div>
          <div className="metric-value">
            {stats.merchantsOnCostRouting}/{stats.totalMerchants}
          </div>
          <div className="metric-delta positive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            +2 this month
          </div>
        </div>

        {/* 6. 0-Cost Terminal Share */}
        <div className="kam-metric-card">
          <div className="metric-icon" style={{ background: 'rgba(30, 166, 114, 0.12)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1EA672" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="metric-label">0-Cost Terminal Share</div>
          <div className="metric-value">{zeroCostShare.toFixed(1)}%</div>
          <div className="metric-delta positive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            Txn volume on zero-cost terminals
          </div>
        </div>

        {/* 7. NTF Risk */}
        <div className="kam-metric-card">
          <div className="metric-icon" style={{ background: 'var(--rzp-danger-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--rzp-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="metric-label">NTF Risk</div>
          <div className="metric-value">{ntfStats.critical + ntfStats.high}</div>
          <div className="metric-delta negative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {ntfStats.critical} critical, {ntfStats.high} high risk
          </div>
        </div>
      </div>

      {/* TSP Deal Compliance */}
      {Object.keys(tspComplianceMap).length > 0 && (
        <div className="kam-card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              TSP Deal Compliance
            </h3>
            <span className="kam-badge neutral">{Object.keys(tspComplianceMap).length} active deals</span>
          </div>
          {Object.entries(tspComplianceMap).map(([merchantId, compliance]) => {
            const merchant = allMerchants.find((m) => m.id === merchantId)
            if (!merchant) return null
            const fillClass = compliance.status === 'off_track' ? 'violation' : compliance.status === 'at_risk' ? 'at-risk' : ''
            const fillPct = compliance.gmvCommitment > 0 ? Math.min((compliance.projectedAnnualGMV / compliance.gmvCommitment) * 100, 100) : 0
            return (
              <div
                key={merchantId}
                className="kam-tsp-compliance-row"
                onClick={() => navigate(`/kam/merchant/${merchantId}`)}
              >
                <div className="kam-merchant-info">
                  <span className="name">{merchant.name}</span>
                  <span className="mid">{merchant.mid}</span>
                </div>
                <div className="kam-tsp-gauge">
                  <div className="kam-tsp-gauge-bar">
                    <div
                      className={`kam-tsp-gauge-fill ${fillClass}`}
                      style={{ width: `${fillPct}%` }}
                    />
                    <div
                      className="kam-tsp-gauge-threshold"
                      style={{ left: '100%' }}
                    />
                  </div>
                  <span className="kam-tsp-gauge-label">
                    {formatINR(compliance.projectedAnnualGMV)} projected / {formatINR(compliance.gmvCommitment)} commitment via {compliance.lockedGatewayName}
                  </span>
                </div>
                <span className={`kam-badge ${compliance.status === 'on_track' ? 'success' : compliance.status === 'at_risk' ? 'warning' : 'danger'}`}>
                  {compliance.status === 'on_track' ? 'On Track' : compliance.status === 'at_risk' ? 'At Risk' : 'Off Track'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Routing Alerts */}
      {totalConflicts > 0 && (
        <div className="kam-card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rzp-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Routing Alerts
            </h3>
            <span className="kam-badge danger">{totalConflicts} issues</span>
          </div>
          {Object.entries(routingConflictsMap)
            .sort(([, a], [, b]) => {
              const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
              return sevOrder[a[0].severity] - sevOrder[b[0].severity]
            })
            .map(([merchantId, conflicts]) => {
              const merchant = allMerchants.find((m) => m.id === merchantId)
              if (!merchant) return null
              return (
                <div
                  key={merchantId}
                  className="kam-alert-row"
                  onClick={() => navigate(`/kam/merchant/${merchantId}`)}
                >
                  <div className="kam-alert-row-header">
                    <span className="name">{merchant.name}</span>
                    <span className={`kam-badge ${conflicts[0].severity === 'critical' ? 'danger' : conflicts[0].severity === 'high' ? 'warning' : 'info'}`}>
                      {conflicts[0].severity}
                    </span>
                  </div>
                  <div className="kam-alert-row-message">{conflicts[0].message}</div>
                  {conflicts.length > 1 && (
                    <div className="kam-alert-row-message" style={{ marginTop: 2, color: 'var(--rzp-text-muted)' }}>
                      +{conflicts.length - 1} more issue{conflicts.length - 1 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* Merchants Needing Attention */}
      <div className="kam-card">
        <div className="kam-card-header">
          <h3 className="kam-card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rzp-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Merchants Needing Attention
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--rzp-text-secondary)' }}>
            High-cost merchants on success-rate routing
          </span>
        </div>
        <table className="kam-attention-table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Deal</th>
              <th>Routing</th>
              <th>Success Rate</th>
              <th>Backward Cost</th>
              <th>Net Revenue</th>
              <th>Potential Saving</th>
            </tr>
          </thead>
          <tbody>
            {merchantsNeedingAttention.map(m => (
              <tr
                key={m.id}
                className="kam-attention-row"
                onClick={() => navigate(`/kam/merchant/${m.id}`)}
              >
                <td>
                  <div className="kam-merchant-info">
                    <span className="name">{m.name}</span>
                    <span className="mid">{m.mid}</span>
                  </div>
                </td>
                <td>
                  {m.dealType === 'tsp' && (
                    <span className="kam-badge deal-tsp">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      TSP
                    </span>
                  )}
                  {m.dealType === 'offer_linked' && (
                    <span className="kam-badge deal-offer">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 12 20 22 4 22 4 12" />
                        <rect x="2" y="7" width="20" height="5" />
                        <line x1="12" y1="22" x2="12" y2="7" />
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                      </svg>
                      Offer
                    </span>
                  )}
                </td>
                <td>
                  <span className="kam-badge warning">Success Rate</span>
                </td>
                <td>{m.avgPaymentSuccessRate}%</td>
                <td style={{ fontWeight: 600, color: 'var(--rzp-danger)' }}>
                  {formatINR(m.revenue.backwardCost)}
                </td>
                <td>{formatINR(m.revenue.netRevenue)}</td>
                <td>
                  {(m.dealType === 'tsp' || m.dealType === 'offer_linked') ? (
                    <span style={{ color: 'var(--rzp-text-muted)', fontSize: 12 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-1px', marginRight: 3 }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Locked
                    </span>
                  ) : (
                    <span style={{ color: 'var(--rzp-success)', fontWeight: 600 }}>
                      ~{formatINR(m.revenue.backwardCost * 0.25)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
