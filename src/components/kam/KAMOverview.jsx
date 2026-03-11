import { useNavigate } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import { formatINR, formatNumber } from '../../data/kamMockData'

export default function KAMOverview() {
  const {
    targetData, allMerchants,
    tspComplianceMap, routingConflictsMap, totalConflicts,
    retentionRisks, nrOpportunities,
  } = useKAM()
  const navigate = useNavigate()

  return (
    <>
      {/* Page Header */}
      <div className="kam-page-header">
        <h2>Dashboard Overview</h2>
        <p>Monitor your enterprise merchant portfolio and revenue targets</p>
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

      {/* Retention Risk */}
      {retentionRisks.length > 0 && (
        <div className="kam-card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rzp-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="18" y1="8" x2="23" y2="13" />
                <line x1="23" y1="8" x2="18" y2="13" />
              </svg>
              Retention Risk
            </h3>
            <span className="kam-badge danger">{retentionRisks.length} at risk</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--rzp-text-secondary)', marginBottom: 12, fontFamily: 'var(--font-secondary)' }}>
            Merchants with significant YoY transaction volume decline — potential churn indicators
          </div>
          {retentionRisks.map((risk) => (
            <div
              key={risk.merchantId}
              className="kam-risk-row"
              onClick={() => navigate(`/kam/merchant/${risk.merchantId}`)}
            >
              <div className="kam-merchant-info">
                <span className="name">
                  {risk.merchantName}
                  {risk.srSensitive && (
                    <span className="kam-badge-sr" style={{ marginLeft: 6 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      SR
                    </span>
                  )}
                </span>
              </div>
              <div className="kam-risk-stats">
                <div className="stat-item">
                  <span className="stat-label">YoY Change</span>
                  <span className="stat-value negative">{risk.yoyChange}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Current</span>
                  <span className="stat-value">{formatNumber(risk.currentVolume)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Year</span>
                  <span className="stat-value">{formatNumber(risk.lastYearVolume)}</span>
                </div>
                <span className={`kam-badge ${risk.riskLevel === 'critical' ? 'danger' : risk.riskLevel === 'high' ? 'warning' : 'info'}`}>
                  {risk.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Net Revenue Opportunity */}
      {nrOpportunities.length > 0 && (
        <div className="kam-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rzp-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Net Revenue Opportunity
            </h3>
            <span className="kam-badge info">
              {formatINR(targetData.target - targetData.achieved)} remaining to {formatINR(targetData.target)} target
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--rzp-text-secondary)', marginBottom: 12, fontFamily: 'var(--font-secondary)' }}>
            Non-SR-sensitive merchants on success-rate routing — potential N/R uplift via cost routing
          </div>
          {nrOpportunities.map((opp) => (
            <div
              key={opp.merchantId}
              className="kam-risk-row"
              onClick={() => navigate(`/kam/merchant/${opp.merchantId}`)}
            >
              <div className="kam-merchant-info">
                <span className="name">{opp.merchantName}</span>
                <span className="mid">{opp.mid}</span>
              </div>
              <div className="kam-risk-stats">
                <div className="stat-item">
                  <span className="stat-label">Current N/R</span>
                  <span className="stat-value">{formatINR(opp.currentNR)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Potential N/R</span>
                  <span className="stat-value positive">{formatINR(opp.potentialNR)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Saving</span>
                  <span className="stat-value positive">+{formatINR(opp.potentialSaving)}</span>
                </div>
                <span className="kam-badge success" style={{ fontSize: 11, maxWidth: 180, whiteSpace: 'normal', textAlign: 'left', lineHeight: 1.3 }}>
                  {opp.suggestedAction}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
