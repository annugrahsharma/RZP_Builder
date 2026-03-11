import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import {
  formatINR,
  formatNumber,
  computeMerchantRevenue,
  routingStrategies,
} from '../../data/kamMockData'

// ---------------------------------------------------------------------------
// Deterministic pseudo-random from a string (for methods & daily volumes)
// ---------------------------------------------------------------------------
function hashStr(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

const METHOD_MAP = {
  HDFC: 'CC',
  ICICI: 'UPI',
  AXIS: 'DC',
  RBL: 'NB',
  YES: 'UPI',
}

function pickMethod(terminalId) {
  const prefix = terminalId.split('_')[0]
  return METHOD_MAP[prefix] || 'UPI'
}

function pickDailyVolume(terminalId) {
  // 8L - 60L range
  const h = hashStr(terminalId + '_vol')
  return 800000 + (h % 5200000)
}

function formatLakhs(amount) {
  return '\u20B9' + (amount / 100000).toFixed(1) + 'L'
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const PercentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
)

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const LightningIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const DollarLargeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const RoutingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const ServerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function KAMMerchantDetail() {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const {
    getMerchantById,
    changeRouting,
    changeGateway,
    gateways,
    auditLog,
    addAuditEntry,
    showToast,
  } = useKAM()

  const merchant = getMerchantById(merchantId)

  // ---- Doppler state ----
  const [selectedModel, setSelectedModel] = useState(
    merchant?.routingStrategy || 'success_rate'
  )
  const [threshold, setThreshold] = useState(-4.5)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  // ---- Terminal management state ----
  const [terminalSearch, setTerminalSearch] = useState('')
  const [terminalStates, setTerminalStates] = useState({})
  const [confirmTerminal, setConfirmTerminal] = useState(null)

  // ---- Guard ----
  if (!merchant) {
    return (
      <div className="kam-empty-state" style={{ minHeight: 400 }}>
        <ServerIcon />
        <h4>Merchant not found</h4>
        <p>The merchant you are looking for does not exist or has been removed.</p>
        <Link to="/kam/merchants" className="kam-btn kam-btn-primary" style={{ marginTop: 16 }}>
          Back to Merchants
        </Link>
      </div>
    )
  }

  // ---- Computed values ----
  const revenue = computeMerchantRevenue(merchant)
  const projectedSavings = Math.abs(threshold) * 0.316
  const hasModelChanged = selectedModel !== merchant.routingStrategy
  const canSave = reason.trim().length > 0 && (hasModelChanged || selectedModel === 'cost_based')

  // Build terminal rows from gatewayMetrics
  const terminals = useMemo(() => {
    return merchant.gatewayMetrics.map((gm) => {
      const gw = gateways.find((g) => g.id === gm.gatewayId)
      const term = gw?.terminals.find((t) => t.id === gm.terminalId)
      const terminalId = term?.terminalId || gm.terminalId
      return {
        key: gm.terminalId,
        terminalId,
        provider: gw?.name || 'Unknown',
        providerShort: gw?.shortName || '??',
        method: pickMethod(terminalId),
        successRate: gm.successRate,
        costPerTxn: gm.costPerTxn,
        txnShare: gm.txnShare,
        dailyVolume: pickDailyVolume(terminalId),
        gatewayId: gm.gatewayId,
        internalTermId: gm.terminalId,
      }
    })
  }, [merchant.gatewayMetrics, gateways])

  // Filtered terminals
  const filteredTerminals = useMemo(() => {
    if (!terminalSearch) return terminals
    const q = terminalSearch.toLowerCase()
    return terminals.filter(
      (t) =>
        t.terminalId.toLowerCase().includes(q) ||
        t.provider.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q)
    )
  }, [terminals, terminalSearch])

  // Filtered audit log for this merchant
  const relevantLogs = useMemo(() => {
    return auditLog
      .filter((e) => e.merchantId === merchantId || !e.merchantId)
      .slice(0, 5)
  }, [auditLog, merchantId])

  // ---- Terminal toggle helpers ----
  const isTerminalActive = useCallback(
    (termKey) => {
      if (terminalStates[termKey] !== undefined) return terminalStates[termKey]
      return true // default active
    },
    [terminalStates]
  )

  const handleTerminalToggle = useCallback(
    (terminal) => {
      const currentlyActive = isTerminalActive(terminal.key)
      if (currentlyActive) {
        // About to disable -- show confirmation
        setConfirmTerminal(terminal)
      } else {
        // Re-enable directly
        setTerminalStates((prev) => ({ ...prev, [terminal.key]: true }))
        addAuditEntry(
          `Enabled terminal ${terminal.terminalId} for ${merchant.name}`,
          'Manual re-enable',
          merchantId
        )
        showToast(`Terminal ${terminal.terminalId} enabled`)
      }
    },
    [isTerminalActive, merchant.name, merchantId, addAuditEntry, showToast]
  )

  const confirmDisableTerminal = useCallback(() => {
    if (!confirmTerminal) return
    setTerminalStates((prev) => ({ ...prev, [confirmTerminal.key]: false }))
    addAuditEntry(
      `Disabled terminal ${confirmTerminal.terminalId} for ${merchant.name}`,
      `Processes ${formatLakhs(confirmTerminal.dailyVolume)} daily`,
      merchantId
    )
    showToast(`Terminal ${confirmTerminal.terminalId} disabled`, 'info')
    setConfirmTerminal(null)
  }, [confirmTerminal, merchant.name, merchantId, addAuditEntry, showToast])

  // ---- Save Doppler config ----
  const handleSaveConfig = useCallback(() => {
    if (!canSave) return
    setSaving(true)
    setTimeout(() => {
      changeRouting(merchantId, selectedModel, reason)
      if (selectedModel === 'cost_based') {
        addAuditEntry(
          `Set cost-delta threshold to ${threshold}% for ${merchant.name}`,
          reason,
          merchantId
        )
      }
      setReason('')
      setSaving(false)
      showToast(`Routing configuration saved for ${merchant.name}`)
    }, 400)
  }, [
    canSave,
    changeRouting,
    merchantId,
    selectedModel,
    reason,
    threshold,
    merchant.name,
    addAuditEntry,
    showToast,
  ])

  // ---- Status & category badge helpers ----
  const statusBadgeClass = merchant.status === 'active' ? 'success' : 'warning'
  const statusLabel = merchant.status === 'active' ? 'Active' : 'Inactive'

  return (
    <>
      {/* ── Back Link ────────────────────────────────────────────── */}
      <Link to="/kam/merchants" className="kam-detail-back">
        <ArrowLeftIcon />
        Back to Merchants
      </Link>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="kam-detail-header">
        <div>
          <div className="kam-detail-title">
            <h2>{merchant.name}</h2>
            <span className="mid">{merchant.mid}</span>
            <span className="kam-badge neutral">{merchant.category}</span>
            <span className={`kam-badge ${statusBadgeClass}`}>{statusLabel}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--rzp-text-secondary)', fontFamily: 'var(--font-secondary)' }}>
            {merchant.contactName} &middot; {merchant.contactEmail}
          </div>
        </div>
        <div className="kam-detail-actions">
          <button
            className="kam-btn kam-btn-secondary"
            onClick={() => {
              const el = document.getElementById('doppler-section')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <RoutingIcon />
            Change Routing
          </button>
          <button
            className="kam-btn kam-btn-secondary"
            onClick={() => {
              const el = document.getElementById('terminal-section')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <ServerIcon />
            Change Gateway
          </button>
        </div>
      </div>

      {/* ── Metric Cards (3x2) ───────────────────────────────────── */}
      <div className="kam-detail-metrics">
        <MetricCard
          icon={<CheckCircleIcon />}
          iconBg="var(--rzp-success-light)"
          iconColor="var(--rzp-success)"
          label="Success Rate"
          value={`${merchant.avgPaymentSuccessRate}%`}
          delta={merchant.avgPaymentSuccessRate >= 95 ? '+0.3%' : null}
          deltaType={merchant.avgPaymentSuccessRate >= 95 ? 'positive' : 'negative'}
        />
        <MetricCard
          icon={<BarChartIcon />}
          iconBg="var(--rzp-blue-light)"
          iconColor="var(--rzp-blue)"
          label="Monthly Transactions"
          value={formatNumber(merchant.monthlyTxnVolume)}
          delta="+2.1%"
          deltaType="positive"
        />
        <MetricCard
          icon={<CreditCardIcon />}
          iconBg="#FFF3E0"
          iconColor="#E65100"
          label="Monthly GMV"
          value={formatINR(merchant.monthlyGMV)}
          delta="+4.5%"
          deltaType="positive"
        />
        <MetricCard
          icon={<PercentIcon />}
          iconBg="var(--rzp-blue-light)"
          iconColor="var(--rzp-blue)"
          label="Forward Pricing"
          value={`${merchant.forwardPricing}%`}
        />
        <MetricCard
          icon={<DollarIcon />}
          iconBg="var(--rzp-danger-light)"
          iconColor="var(--rzp-danger)"
          label="Backward Cost"
          value={formatINR(revenue.backwardCost)}
        />
        <MetricCard
          icon={<TrendUpIcon />}
          iconBg="var(--rzp-success-light)"
          iconColor="var(--rzp-success)"
          label="Net Revenue"
          value={formatINR(revenue.netRevenue)}
          delta="+1.8%"
          deltaType="positive"
        />
      </div>

      {/* ── Doppler Routing Engine ───────────────────────────────── */}
      <div className="kam-detail-section" id="doppler-section">
        <div className="kam-detail-section-header">
          <h3>
            <LayersIcon style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
            Doppler Routing Engine
          </h3>
          <span className="kam-badge info">
            {merchant.routingStrategy === 'success_rate' ? 'SR Optimised' : 'Cost Optimised'}
          </span>
        </div>

        <div className="kam-doppler-card">
          {/* Model selection cards */}
          <div className="kam-doppler-models">
            <div
              className={`kam-doppler-model${selectedModel === 'success_rate' ? ' active' : ''}`}
              onClick={() => setSelectedModel('success_rate')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedModel('success_rate')}
            >
              <div className="model-icon">
                <LightningIcon />
              </div>
              <div className="model-name">SR Optimised</div>
              <div className="model-desc">
                Routes to gateways with the highest success rate. Maximises conversion.
              </div>
            </div>

            <div
              className={`kam-doppler-model${selectedModel === 'cost_based' ? ' active' : ''}`}
              onClick={() => setSelectedModel('cost_based')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedModel('cost_based')}
            >
              <div className="model-icon">
                <DollarLargeIcon />
              </div>
              <div className="model-name">Cost Optimised</div>
              <div className="model-desc">
                Routes to the cheapest gateway. Reduces backward cost per transaction.
              </div>
            </div>
          </div>

          {/* Cost-Delta Threshold Slider (only for cost_based) */}
          {selectedModel === 'cost_based' && (
            <div className="kam-slider-container">
              <div className="kam-slider-header">
                <span className="label">Cost-Delta Threshold</span>
                <span className="value">{threshold}%</span>
              </div>

              <div className="kam-slider">
                <input
                  type="range"
                  min={-10}
                  max={0}
                  step={0.5}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                />
              </div>

              <div className="kam-slider-labels">
                <span className="red">-10%</span>
                <span style={{ color: 'var(--rzp-text-muted)' }}>-5%</span>
                <span className="green">0%</span>
              </div>

              <div className="kam-slider-values">
                <div className="val-group">
                  <span className="val-label">Current Threshold</span>
                  <span className="val threshold">{threshold}%</span>
                </div>
                <div className="val-group">
                  <span className="val-label">Projected Savings</span>
                  <span className="val savings">{projectedSavings.toFixed(2)}%</span>
                </div>
              </div>

              {threshold < -7 && (
                <div className="kam-warning-box" style={{ marginTop: 12 }}>
                  <WarningIcon />
                  <span>
                    Lower thresholds may route transactions through cheaper but less reliable
                    terminals. Monitor success rates closely.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reason textarea */}
          <div className="kam-form-group" style={{ marginTop: 16 }}>
            <label>
              Reason for change <span className="required">*</span>
            </label>
            <textarea
              className="kam-reason-input"
              placeholder="Describe why you are changing the routing configuration..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Save button */}
          <button
            className="kam-btn kam-btn-primary kam-btn-lg"
            style={{ width: '100%', marginTop: 16 }}
            disabled={!canSave || saving}
            onClick={handleSaveConfig}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <SaveIcon />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Terminal Management ───────────────────────────────────── */}
      <div className="kam-detail-section" id="terminal-section">
        <div className="kam-card">
          <div className="kam-card-header">
            <span className="kam-card-title">
              <ServerIcon />
              Terminal Management
            </span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rzp-text-muted)', pointerEvents: 'none', display: 'flex' }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                className="kam-search-input"
                style={{ width: 220, paddingLeft: 32 }}
                placeholder="Search terminals..."
                value={terminalSearch}
                onChange={(e) => setTerminalSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="kam-terminal-table">
              <thead>
                <tr>
                  <th>Terminal ID</th>
                  <th>Provider</th>
                  <th>Method</th>
                  <th>Current SR</th>
                  <th>Daily Volume</th>
                  <th>Txn Share</th>
                  <th>Cost/Txn</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTerminals.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--rzp-text-muted)' }}>
                      No terminals match your search.
                    </td>
                  </tr>
                ) : (
                  filteredTerminals.map((t) => {
                    const active = isTerminalActive(t.key)
                    const srOptimal = t.successRate >= 93
                    return (
                      <tr key={t.key} style={{ opacity: active ? 1 : 0.5 }}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>
                            {t.terminalId}
                          </span>
                        </td>
                        <td>{t.provider}</td>
                        <td>
                          <span className={`kam-method-badge ${t.method.toLowerCase()}`}>
                            {t.method}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{t.successRate}%</span>
                          {' '}
                          <span className={`kam-badge ${srOptimal ? 'success' : 'warning'}`} style={{ fontSize: 10 }}>
                            {srOptimal ? 'Optimal' : 'Sub-optimal'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-secondary)' }}>
                          {formatLakhs(t.dailyVolume)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="kam-progress-bar" style={{ width: 60, height: 6 }}>
                              <div
                                className="kam-progress-fill"
                                style={{
                                  width: `${t.txnShare}%`,
                                  background: 'var(--rzp-blue)',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--rzp-text-secondary)' }}>
                              {t.txnShare}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>
                          {'\u20B9'}{t.costPerTxn.toFixed(2)}
                        </td>
                        <td>
                          <button
                            className={`kam-toggle${active ? ' active' : ''}`}
                            onClick={() => handleTerminalToggle(t)}
                            aria-label={`Toggle terminal ${t.terminalId}`}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Audit Log ────────────────────────────────────────────── */}
      <div className="kam-detail-section">
        <div className="kam-detail-section-header">
          <h3>
            <ClockIcon style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
            Audit Log
          </h3>
          <span className="kam-badge neutral">{relevantLogs.length} entries</span>
        </div>

        {relevantLogs.length === 0 ? (
          <div className="kam-empty-state" style={{ minHeight: 120 }}>
            <ClockIcon />
            <p>No audit entries yet for this merchant.</p>
          </div>
        ) : (
          <div className="kam-audit-timeline">
            {relevantLogs.map((entry) => (
              <div className="kam-audit-entry" key={entry.id}>
                <div className="audit-header">
                  <span className="audit-time">{entry.timestamp}</span>
                  <span className="audit-user">{entry.user}</span>
                </div>
                <div className="audit-action">{entry.action}</div>
                {entry.reason && (
                  <div className="audit-reason">{entry.reason}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Terminal Confirmation Modal ───────────────────────────── */}
      {confirmTerminal && (
        <div className="kam-modal-overlay" onClick={() => setConfirmTerminal(null)}>
          <div className="kam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kam-modal-header">
              <div>
                <h3>Disable Terminal</h3>
                <p>This action will remove the terminal from active routing.</p>
              </div>
              <button className="kam-modal-close" onClick={() => setConfirmTerminal(null)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-modal-body">
              <div className="kam-confirm-icon warning">
                <WarningIcon />
              </div>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-primary)', lineHeight: 1.6 }}>
                Are you sure you want to disable{' '}
                <strong>{confirmTerminal.terminalId}</strong>?
              </p>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.6, marginTop: 8 }}>
                This terminal currently processes{' '}
                <strong style={{ color: 'var(--rzp-warning)' }}>
                  {formatLakhs(confirmTerminal.dailyVolume)}
                </strong>{' '}
                in daily volume. Disabling it will redistribute traffic to the remaining active
                terminals.
              </p>
            </div>
            <div className="kam-modal-footer">
              <button className="kam-btn kam-btn-secondary" onClick={() => setConfirmTerminal(null)}>
                Cancel
              </button>
              <button className="kam-btn kam-btn-danger" onClick={confirmDisableTerminal}>
                Confirm Disable
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// MetricCard sub-component
// ---------------------------------------------------------------------------
function MetricCard({ icon, iconBg, iconColor, label, value, delta, deltaType }) {
  return (
    <div className="kam-metric-card">
      <div className="metric-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {delta && (
        <div className={`metric-delta ${deltaType}`}>
          {deltaType === 'positive' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          {delta}
        </div>
      )}
    </div>
  )
}
