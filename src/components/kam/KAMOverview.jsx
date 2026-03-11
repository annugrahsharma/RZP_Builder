import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import { formatINR, formatNumber, computeMerchantRevenue } from '../../data/kamMockData'

export default function KAMOverview() {
  const { stats, targetData, allMerchants } = useKAM()
  const navigate = useNavigate()

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

        {/* 6. Backward Cost */}
        <div className="kam-metric-card">
          <div className="metric-icon" style={{ background: 'var(--rzp-danger-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--rzp-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="metric-label">Backward Cost</div>
          <div className="metric-value">{formatINR(stats.totalBackwardCost)}</div>
          <div className="metric-delta negative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            +3.1% vs last month
          </div>
        </div>
      </div>

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
                  <span className="kam-badge warning">Success Rate</span>
                </td>
                <td>{m.avgPaymentSuccessRate}%</td>
                <td style={{ fontWeight: 600, color: 'var(--rzp-danger)' }}>
                  {formatINR(m.revenue.backwardCost)}
                </td>
                <td>{formatINR(m.revenue.netRevenue)}</td>
                <td style={{ color: 'var(--rzp-success)', fontWeight: 600 }}>
                  ~{formatINR(m.revenue.backwardCost * 0.25)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
