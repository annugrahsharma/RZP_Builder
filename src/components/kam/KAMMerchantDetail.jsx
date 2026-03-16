import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import {
  formatINR,
  formatNumber,
  computeMerchantRevenue,
  isTerminalZeroCost,
  computeTSPCompliance,
  computeCBROrder,
  getBackwardPricingBreakdown,
  generateMerchantTransactions,
  generateSRTimeSeries,
  generateRecommendations,
  generateSankeyData,
  RULE_CONDITIONS,
  RULE_OPERATOR_LABELS,
  PAYMENT_METHOD_GROUPS,
  groupRulesByMethod,
  evaluateRules,
  detectNTFGaps,
  simulateTransaction,
  traceNTFRuleChain,
  getTerminalDisplayId,
  getTerminalGatewayInfo,
  parseRuleIntent,
  gateways as gatewayData,
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

const ShieldAlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// ---------------------------------------------------------------------------
// SR Line Chart sub-component
// ---------------------------------------------------------------------------

const SR_COLORS = {
  overall: '#528FF0',
  CC: '#E65100',
  DC: '#1565C0',
  UPI: '#2E7D32',
  NB: '#7B1FA2',
}

const METHOD_DISPLAY = {
  CC: 'Credit',
  DC: 'Debit',
  UPI: 'UPI',
  NB: 'NB',
}

function SRLineChart({ srData }) {
  const [selectedSeries, setSelectedSeries] = useState(() => new Set(['overall']))
  const [expandedMethods, setExpandedMethods] = useState(() => new Set())
  const [hoverIdx, setHoverIdx] = useState(null)

  const { dates, overall, byMethod } = srData
  const methodKeys = Object.keys(byMethod)

  // Build all visible lines with their data & color
  const visibleLines = useMemo(() => {
    const lines = []
    if (selectedSeries.has('overall')) {
      lines.push({ key: 'overall', label: 'All Methods', color: SR_COLORS.overall, data: overall })
    }
    methodKeys.forEach((m) => {
      if (selectedSeries.has(m)) {
        lines.push({ key: m, label: METHOD_DISPLAY[m] || m, color: SR_COLORS[m] || '#888', data: byMethod[m].sr })
      }
      // Terminal lines
      const terminals = byMethod[m].terminals
      Object.keys(terminals).forEach((tId) => {
        const tKey = m + ':' + tId
        if (selectedSeries.has(tKey)) {
          lines.push({ key: tKey, label: tId, color: SR_COLORS[m] || '#888', data: terminals[tId], dashed: true })
        }
      })
    })
    return lines
  }, [selectedSeries, overall, byMethod, methodKeys])

  // Compute Y-axis bounds
  const { yMin, yMax, yTicks } = useMemo(() => {
    let lo = 100, hi = 0
    visibleLines.forEach((l) => l.data.forEach((v) => { if (v < lo) lo = v; if (v > hi) hi = v }))
    if (lo === 100 && hi === 0) { lo = 85; hi = 100 } // fallback
    const padding = 2
    const rMin = Math.floor((lo - padding) / 2) * 2
    const rMax = Math.ceil((hi + padding) / 2) * 2
    const ticks = []
    for (let t = rMin; t <= rMax; t += 2) ticks.push(t)
    if (ticks.length < 3) { ticks.unshift(ticks[0] - 2); ticks.push(ticks[ticks.length - 1] + 2) }
    return { yMin: ticks[0], yMax: ticks[ticks.length - 1], yTicks: ticks }
  }, [visibleLines])

  // Chart layout constants
  const chartPadLeft = 44
  const chartPadRight = 12
  const chartPadTop = 10
  const chartPadBottom = 28
  const chartH = 280

  const toggleSeries = useCallback((key) => {
    setSelectedSeries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleExpand = useCallback((method) => {
    setExpandedMethods((prev) => {
      const next = new Set(prev)
      if (next.has(method)) next.delete(method); else next.add(method)
      return next
    })
  }, [])

  // Convert data point to SVG coordinates
  const toX = useCallback((i, w) => chartPadLeft + (i / (dates.length - 1)) * (w - chartPadLeft - chartPadRight), [dates.length])
  const toY = useCallback((v) => chartPadTop + ((yMax - v) / (yMax - yMin)) * (chartH - chartPadTop - chartPadBottom), [yMin, yMax])

  // Build polyline points string
  const buildPoints = useCallback((data, w) => data.map((v, i) => `${toX(i, w)},${toY(v)}`).join(' '), [toX, toY])

  // Build area path (fill under line)
  const buildArea = useCallback((data, w) => {
    const bottom = chartH - chartPadBottom
    const pts = data.map((v, i) => `${toX(i, w)},${toY(v)}`)
    return `M${toX(0, w)},${bottom} L${pts.join(' L')} L${toX(data.length - 1, w)},${bottom} Z`
  }, [toX, toY])

  // SVG ref for measuring width
  const [svgWidth, setSvgWidth] = useState(600)
  const svgRef = useCallback((node) => {
    if (node) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) setSvgWidth(entry.contentRect.width)
      })
      ro.observe(node)
      setSvgWidth(node.getBoundingClientRect().width)
    }
  }, [])

  // Hover handling
  const handleMouseMove = useCallback((e) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const dataAreaStart = chartPadLeft
    const dataAreaEnd = svgWidth - chartPadRight
    if (mouseX < dataAreaStart || mouseX > dataAreaEnd) { setHoverIdx(null); return }
    const ratio = (mouseX - dataAreaStart) / (dataAreaEnd - dataAreaStart)
    const idx = Math.round(ratio * (dates.length - 1))
    setHoverIdx(Math.max(0, Math.min(dates.length - 1, idx)))
  }, [svgWidth, dates.length])

  const handleMouseLeave = useCallback(() => setHoverIdx(null), [])

  // Format date for display
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="kam-sr-chart-card">
      <div className="kam-sr-chart-card-header">
        <h3 className="kam-sr-chart-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Success Rate Trend
        </h3>
        <span className="kam-sr-chart-period">Last 30 days</span>
      </div>

      <div className="kam-sr-chart-body">
        {/* ── Sidebar ── */}
        <div className="kam-sr-chart-sidebar">
          {/* All Methods */}
          <label className="kam-sr-method-item overall">
            <input type="checkbox" checked={selectedSeries.has('overall')} onChange={() => toggleSeries('overall')} />
            <span className="kam-sr-color-dot" style={{ background: SR_COLORS.overall }} />
            <span className="kam-sr-method-label">All</span>
            <span className="kam-sr-method-value">{overall[overall.length - 1]}%</span>
          </label>

          {/* Per-method */}
          {methodKeys.map((m) => {
            const md = byMethod[m]
            const isExpanded = expandedMethods.has(m)
            const terminalKeys = Object.keys(md.terminals)
            return (
              <div key={m}>
                <div className="kam-sr-method-item">
                  <input type="checkbox" checked={selectedSeries.has(m)} onChange={() => toggleSeries(m)} />
                  <span className="kam-sr-color-dot" style={{ background: SR_COLORS[m] || '#888' }} />
                  <span className="kam-sr-method-label">{METHOD_DISPLAY[m] || m}</span>
                  <span className="kam-sr-method-value">{md.sr[md.sr.length - 1]}%</span>
                  {terminalKeys.length > 0 && (
                    <span className={`kam-sr-method-expand${isExpanded ? ' open' : ''}`} onClick={() => toggleExpand(m)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                    </span>
                  )}
                </div>
                <div className={`kam-sr-terminal-list ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  {terminalKeys.map((tId) => {
                    const tKey = m + ':' + tId
                    const tData = md.terminals[tId]
                    return (
                      <label key={tKey} className="kam-sr-terminal-item">
                        <input type="checkbox" checked={selectedSeries.has(tKey)} onChange={() => toggleSeries(tKey)} />
                        <span className="kam-sr-color-dot" style={{ background: SR_COLORS[m] || '#888', opacity: 0.6 }} />
                        <span className="kam-sr-method-label">{tId}</span>
                        <span className="kam-sr-method-value">{tData[tData.length - 1]}%</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Chart Area ── */}
        <div className="kam-sr-chart-area">
          <svg
            ref={svgRef}
            className="kam-sr-chart-svg"
            viewBox={`0 0 ${svgWidth} ${chartH}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  x1={chartPadLeft} y1={toY(t)} x2={svgWidth - chartPadRight} y2={toY(t)}
                  stroke="var(--rzp-border, #E8E8E8)" strokeDasharray="4 4" strokeWidth="1"
                />
                <text x={chartPadLeft - 6} y={toY(t) + 4} textAnchor="end" fontSize="11" fill="#888" fontFamily="inherit">
                  {t}%
                </text>
              </g>
            ))}

            {/* X-axis date labels (every 5th day) */}
            {dates.map((d, i) => (i % 5 === 0 || i === dates.length - 1) ? (
              <text key={d} x={toX(i, svgWidth)} y={chartH - 4} textAnchor="middle" fontSize="10" fill="#888" fontFamily="inherit">
                {formatDate(d)}
              </text>
            ) : null)}

            {/* Area fills */}
            {visibleLines.map((line) => (
              <path
                key={'area-' + line.key}
                d={buildArea(line.data, svgWidth)}
                fill={line.color}
                opacity={0.06}
              />
            ))}

            {/* Lines */}
            {visibleLines.map((line) => (
              <polyline
                key={'line-' + line.key}
                points={buildPoints(line.data, svgWidth)}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={line.dashed ? '6 3' : 'none'}
              />
            ))}

            {/* Hover crosshair */}
            {hoverIdx !== null && (
              <line
                x1={toX(hoverIdx, svgWidth)} y1={chartPadTop}
                x2={toX(hoverIdx, svgWidth)} y2={chartH - chartPadBottom}
                stroke="#aaa" strokeDasharray="3 3" strokeWidth="1"
              />
            )}

            {/* Hover dots */}
            {hoverIdx !== null && visibleLines.map((line) => (
              <circle
                key={'dot-' + line.key}
                cx={toX(hoverIdx, svgWidth)}
                cy={toY(line.data[hoverIdx])}
                r="4"
                fill="#fff"
                stroke={line.color}
                strokeWidth="2"
              />
            ))}
          </svg>

          {/* Tooltip */}
          {hoverIdx !== null && (
            <div
              className="kam-sr-chart-tooltip"
              style={{
                left: Math.min(toX(hoverIdx, svgWidth) + 12, svgWidth - 170),
                top: 20,
              }}
            >
              <div className="kam-sr-tooltip-date">{formatDate(dates[hoverIdx])}</div>
              {visibleLines.map((line) => (
                <div key={line.key} className="kam-sr-tooltip-row">
                  <span className="kam-sr-tooltip-dot" style={{ background: line.color }} />
                  <span className="kam-sr-tooltip-label">{line.label}</span>
                  <span className="kam-sr-tooltip-value">{line.data[hoverIdx]}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SR Threshold Slider sub-component (single-handle)
// ---------------------------------------------------------------------------
const SR_MIN = 70
const SR_MAX = 100

function SRThresholdSlider({ value, onChange }) {
  const pct = ((value - SR_MIN) / (SR_MAX - SR_MIN)) * 100

  const handleChange = useCallback((e) => {
    onChange(Number(e.target.value))
  }, [onChange])

  return (
    <div className="kam-sr-range-control">
      <div className="kam-sr-range-labels">
        <div className="kam-sr-range-label">
          <span className="label">SR Threshold</span>
          <span className="value low">{value}%</span>
        </div>
      </div>

      <div className="kam-sr-range-track-wrapper">
        {/* Background track */}
        <div className="kam-sr-range-track" />
        {/* Colored zones */}
        <div className="kam-sr-range-zone danger" style={{ left: 0, width: `${pct}%` }} />
        <div className="kam-sr-range-zone eligible" style={{ left: `${pct}%`, width: `${100 - pct}%` }} />
        {/* Single range input */}
        <input
          type="range"
          min={SR_MIN}
          max={SR_MAX}
          step={1}
          value={value}
          onChange={handleChange}
          className="kam-sr-range-input low"
        />
      </div>

      <div className="kam-sr-range-scale">
        <span>{SR_MIN}%</span>
        <span>80%</span>
        <span>90%</span>
        <span>{SR_MAX}%</span>
      </div>

      <div className="kam-sr-range-legend">
        <span className="kam-sr-range-legend-item danger">
          <span className="dot" /> Below {value}% — fallback
        </span>
        <span className="kam-sr-range-legend-item eligible">
          <span className="dot" /> Above {value}% — CBR eligible
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sankey Chart sub-component (pure SVG)
// ---------------------------------------------------------------------------
const SANKEY_CHART_H = 580
const SANKEY_NODE_W = 130
const SANKEY_NODE_GAP = 5
const SANKEY_PAD_TOP = 40
const SANKEY_PAD_BOTTOM = 10

function computeSankeyLayout(data, width) {
  const availH = SANKEY_CHART_H - SANKEY_PAD_TOP - SANKEY_PAD_BOTTOM
  const colXs = [60, width / 2 - SANKEY_NODE_W / 2, width - SANKEY_NODE_W - 60]

  // Group nodes by column
  const columns = [[], [], []]
  data.nodes.forEach((n) => columns[n.column].push({ ...n }))

  // Compute node positions for each column
  columns.forEach((col, ci) => {
    const total = col.reduce((s, n) => s + n.value, 0)
    const minH = 14
    const gapSize = col.length > 8 ? 3 : SANKEY_NODE_GAP
    const gaps = Math.max(0, col.length - 1) * gapSize
    const usable = availH - gaps

    // First pass: compute ideal heights
    const heights = col.map((n) => Math.max(minH, (n.value / total) * usable))
    // If total exceeds usable, scale down proportionally
    const hTotal = heights.reduce((s, h) => s + h, 0)
    if (hTotal > usable) {
      const scale = usable / hTotal
      heights.forEach((h, i) => { heights[i] = Math.max(minH * 0.7, h * scale) })
    }

    let y = SANKEY_PAD_TOP
    col.forEach((n, i) => {
      n.x = colXs[ci]
      n.y = y
      n.h = heights[i]
      y += heights[i] + gapSize
    })
  })

  // Flatten back to a map
  const nodeMap = {}
  columns.flat().forEach((n) => { nodeMap[n.id] = n })

  // Compute link paths with stacking
  // Track how much vertical space has been used on each side of each node
  const sourceOffsets = {}
  const targetOffsets = {}

  const layoutLinks = data.links.map((l) => {
    const src = nodeMap[l.source]
    const tgt = nodeMap[l.target]
    if (!src || !tgt) return null

    const srcTotal = data.links.filter((x) => x.source === l.source).reduce((s, x) => s + x.value, 0)
    const tgtTotal = data.links.filter((x) => x.target === l.target).reduce((s, x) => s + x.value, 0)

    const linkW_src = (l.value / srcTotal) * src.h
    const linkW_tgt = (l.value / tgtTotal) * tgt.h

    if (!sourceOffsets[l.source]) sourceOffsets[l.source] = 0
    if (!targetOffsets[l.target]) targetOffsets[l.target] = 0

    const sy = src.y + sourceOffsets[l.source] + linkW_src / 2
    const ty = tgt.y + targetOffsets[l.target] + linkW_tgt / 2

    sourceOffsets[l.source] += linkW_src
    targetOffsets[l.target] += linkW_tgt

    const sx = src.x + SANKEY_NODE_W
    const tx = tgt.x

    const midX = (sx + tx) / 2

    return {
      ...l,
      path: `M${sx},${sy - linkW_src / 2} C${midX},${sy - linkW_src / 2} ${midX},${ty - linkW_tgt / 2} ${tx},${ty - linkW_tgt / 2} L${tx},${ty + linkW_tgt / 2} C${midX},${ty + linkW_tgt / 2} ${midX},${sy + linkW_src / 2} ${sx},${sy + linkW_src / 2} Z`,
      color: src.color,
    }
  }).filter(Boolean)

  return { nodeMap, layoutLinks, columns }
}

function SankeyChart({ data }) {
  const [svgWidth, setSvgWidth] = useState(700)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const containerRef = useCallback((node) => {
    if (node) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) setSvgWidth(entry.contentRect.width)
      })
      ro.observe(node)
      setSvgWidth(node.getBoundingClientRect().width)
    }
  }, [])

  const layout = useMemo(() => computeSankeyLayout(data, svgWidth), [data, svgWidth])

  const connectedLinks = useMemo(() => {
    if (!hoveredNode) return new Set()
    const ids = new Set()
    data.links.forEach((l, i) => {
      if (l.source === hoveredNode || l.target === hoveredNode) ids.add(i)
    })
    return ids
  }, [hoveredNode, data.links])

  const formatVol = (v) => {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
    if (v >= 1000) return (v / 1000).toFixed(0) + 'K'
    return String(v)
  }

  const handleNodeEnter = useCallback((node, e) => {
    setHoveredNode(node.id)
    const rect = e.currentTarget.closest('svg').getBoundingClientRect()
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name: node.name,
      value: node.value,
      pct: ((node.value / data.totalTxn) * 100).toFixed(1),
      gateway: node.gatewayShort || null,
    })
  }, [data.totalTxn])

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null)
    setTooltip(null)
  }, [])

  const colHeaders = ['Payment Method', 'Network / Sub-type', 'Terminal']

  return (
    <div className="kam-sankey-container" ref={containerRef}>
      <svg
        className="kam-sankey-svg"
        viewBox={`0 0 ${svgWidth} ${SANKEY_CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Column headers */}
        {colHeaders.map((label, i) => {
          const x = i === 0 ? 60 + SANKEY_NODE_W / 2 : i === 1 ? svgWidth / 2 : svgWidth - 60 - SANKEY_NODE_W / 2
          return (
            <text key={i} className="kam-sankey-col-header" x={x} y={20} textAnchor="middle">
              {label}
            </text>
          )
        })}

        {/* Links */}
        {layout.layoutLinks.map((l, i) => (
          <path
            key={i}
            d={l.path}
            fill={l.color}
            className="kam-sankey-link"
            opacity={hoveredNode ? (connectedLinks.has(i) ? 0.5 : 0.06) : 0.25}
          />
        ))}

        {/* Nodes */}
        {layout.columns.flat().map((node) => {
          const isActive = !hoveredNode || hoveredNode === node.id ||
            data.links.some((l) => (l.source === node.id && l.target === hoveredNode) || (l.target === node.id && l.source === hoveredNode))
          const nodeOpacity = hoveredNode ? (isActive ? 1 : 0.3) : 1

          return (
            <g
              key={node.id}
              className="kam-sankey-node"
              opacity={nodeOpacity}
              onMouseEnter={(e) => handleNodeEnter(node, e)}
              onMouseLeave={handleNodeLeave}
            >
              <rect
                x={node.x}
                y={node.y}
                width={SANKEY_NODE_W}
                height={node.h}
                rx={4}
                fill={node.color}
              />
              {node.h >= 22 && (
                <text
                  x={node.x + SANKEY_NODE_W / 2}
                  y={node.y + node.h / 2 - (node.h >= 36 ? 5 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="kam-sankey-label"
                >
                  {node.name}
                </text>
              )}
              {node.h >= 36 && (
                <text
                  x={node.x + SANKEY_NODE_W / 2}
                  y={node.y + node.h / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="kam-sankey-value"
                >
                  {formatVol(node.value)} txns
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="kam-sankey-tooltip"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
          }}
        >
          <div className="kam-sankey-tooltip-name">{tooltip.name}</div>
          {tooltip.gateway && <div className="kam-sankey-tooltip-detail">Gateway: {tooltip.gateway}</div>}
          <div className="kam-sankey-tooltip-detail">{formatVol(tooltip.value)} transactions</div>
          <div className="kam-sankey-tooltip-detail">{tooltip.pct}% of total</div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function KAMMerchantDetail() {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const {
    getMerchantById,
    gateways,
    auditLog,
    addAuditEntry,
    showToast,
    toggleSRSensitive,
    updateSRThreshold,
    addRule,
    updateRule,
    deleteRule,
    toggleRuleEnabled,
    reorderRules,
  } = useKAM()

  const merchant = getMerchantById(merchantId)

  // ---- Terminal management state ----
  const [terminalSearch, setTerminalSearch] = useState('')
  const [terminalStates, setTerminalStates] = useState({})
  const [confirmTerminal, setConfirmTerminal] = useState(null)
  const [showDealWarning, setShowDealWarning] = useState(false)
  const [expandedTerminal, setExpandedTerminal] = useState(null)
  const [expandedRecs, setExpandedRecs] = useState(new Set())

  // ---- Tab & scroll-based navigation ----
  const TAB_ORDER = ['ai-recs', 'routing', 'terminals', 'metrics', 'sr-trend', 'transactions', 'ntfs', 'audit']
  const TAB_LABELS = { 'ai-recs': 'AI Recommendations', routing: 'Routing', terminals: 'Terminals', metrics: 'Metrics', 'sr-trend': 'SR Trend', transactions: 'Transactions', ntfs: 'NTFs', audit: 'Audit Log' }
  const [activeTab, setActiveTab] = useState('ai-recs')
  const sectionRefs = useRef({})
  const tabsBarRef = useRef(null)
  const isScrollingToSection = useRef(false)

  const scrollToSection = useCallback((tabId) => {
    const idx = TAB_ORDER.indexOf(tabId)
    const sections = document.querySelectorAll('.kam-tab-section')
    const el = sections[idx]
    if (!el) return
    isScrollingToSection.current = true
    setActiveTab(tabId)
    const tabsBar = tabsBarRef.current
    const tabsHeight = tabsBar ? tabsBar.offsetHeight + 8 : 50
    const top = el.getBoundingClientRect().top + window.scrollY - tabsHeight
    window.scrollTo({ top, behavior: 'smooth' })
    setTimeout(() => { isScrollingToSection.current = false }, 700)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingToSection.current) return
      const tabsBar = tabsBarRef.current
      const triggerLine = tabsBar ? tabsBar.getBoundingClientRect().bottom + 80 : 160
      // Query all section elements directly from DOM
      const sections = document.querySelectorAll('.kam-tab-section')
      // Walk backwards — last section whose top is above trigger line wins
      for (let i = TAB_ORDER.length - 1; i >= 0; i--) {
        const el = sections[i]
        if (!el) continue
        if (el.getBoundingClientRect().top <= triggerLine) {
          setActiveTab(TAB_ORDER[i])
          return
        }
      }
      setActiveTab(TAB_ORDER[0])
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [merchant])

  const [txnSearch, setTxnSearch] = useState('')
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [txnPage, setTxnPage] = useState(0)
  const [txnPageSize, setTxnPageSize] = useState(10)
  const [txnSort, setTxnSort] = useState({ field: 'timestamp', direction: 'desc' })
  const [txnMethodFilter, setTxnMethodFilter] = useState([])
  const [txnStatusFilter, setTxnStatusFilter] = useState([])
  const [txnGatewayFilter, setTxnGatewayFilter] = useState([])
  const [txnDateRange, setTxnDateRange] = useState('all')
  const [txnNTFFilter, setTxnNTFFilter] = useState(false)
  const [openTxnDropdown, setOpenTxnDropdown] = useState(null)

  // ---- Recommendation state ----
  const [approvedRecs, setApprovedRecs] = useState(new Set())
  const [dismissedRecs, setDismissedRecs] = useState(new Set())

  // ---- Rules tab state ----
  const [showRuleBuilder, setShowRuleBuilder] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simForm, setSimForm] = useState({ payment_method: 'CC', card_network: 'Visa', card_type: 'credit', issuer_bank: 'HDFC', amount: 5000 })
  const [simResult, setSimResult] = useState(null)
  // Rule builder form state
  const [ruleForm, setRuleForm] = useState({ name: '', type: 'conditional', conditions: [], conditionLogic: 'AND', terminals: [], splits: [], srThreshold: 90, minPaymentCount: 100 })

  // ---- Computed values (hooks must be unconditional — guard is below) ----
  const tspCompliance = useMemo(() => merchant ? computeTSPCompliance(merchant) : null, [merchant])
  const revenue = merchant ? computeMerchantRevenue(merchant) : { grossRevenue: 0, backwardCost: 0, netRevenue: 0 }

  // Doppler routing percentage — derived from routing strategy, rule count, and deal type
  const dopplerRoutePercent = useMemo(() => {
    if (!merchant) return 0
    // Base: SR-optimised merchants rely more on Doppler ML, cost-based use more manual rules
    let base = merchant.routingStrategy === 'success_rate' ? 88 : 62
    // srSensitive merchants (Doppler fully active) get a boost
    if (merchant.srSensitive) base += 6
    // Manual rules reduce Doppler share — each rule eats ~3%
    const manualRules = (merchant.routingRules?.selectRules || 0) + (merchant.routingRules?.rejectRules || 0)
    base -= manualRules * 3
    // TSP deals lock routing to specific gateways, reducing Doppler's control
    if (merchant.dealType === 'tsp') base -= 12
    // Offer-linked deals partially constrain routing
    if (merchant.dealType === 'offer-linked') base -= 8
    // Clamp between 30 and 99
    return Math.max(30, Math.min(99, base))
  }, [merchant])

  const [expandedNTFs, setExpandedNTFs] = useState(new Set())
  const [copiedNTF, setCopiedNTF] = useState(null)

  const cbrOrder = useMemo(() => {
    if (!merchant || merchant.srSensitive) return null
    return computeCBROrder(merchant)
  }, [merchant])

  // Build terminal rows from gatewayMetrics
  const terminals = useMemo(() => {
    if (!merchant) return []
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
  }, [merchant?.gatewayMetrics, gateways])

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

  // Group terminals by payment method
  const METHOD_ORDER = ['CC', 'DC', 'UPI', 'NB']
  const METHOD_LABELS = { CC: 'Credit Card', DC: 'Debit Card', UPI: 'UPI', NB: 'Net Banking' }
  const groupedTerminals = useMemo(() => {
    const groups = {}
    filteredTerminals.forEach((t) => {
      const method = t.method
      if (!groups[method]) groups[method] = []
      groups[method].push(t)
    })
    // Sort by METHOD_ORDER, then any extras
    return METHOD_ORDER.filter(m => groups[m]).map(m => ({ method: m, label: METHOD_LABELS[m], terminals: groups[m] }))
  }, [filteredTerminals])

  // Transaction data
  const transactions = useMemo(() => merchant ? generateMerchantTransactions(merchant) : [], [merchant])
  const srData = useMemo(() => merchant ? generateSRTimeSeries(merchant) : [], [merchant])
  const recommendations = useMemo(() => merchant ? generateRecommendations(merchant) : [], [merchant])
  const sankeyData = useMemo(() => merchant ? generateSankeyData(merchant) : { nodes: [], links: [] }, [merchant])

  const ntfTransactions = useMemo(() => {
    return transactions.filter(t => t.isNTF)
  }, [transactions])
  const ntfCount = ntfTransactions.length

  const filteredTxns = useMemo(() => {
    let result = transactions

    // Text search
    if (txnSearch) {
      const q = txnSearch.toLowerCase()
      result = result.filter(t =>
        t.txnId.toLowerCase().includes(q) ||
        t.paymentMethod.type.toLowerCase().includes(q) ||
        t.paymentMethod.short.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.routingDecision.selectedGatewayShort.toLowerCase().includes(q)
      )
    }

    // Method filter
    if (txnMethodFilter.length > 0) {
      result = result.filter(t => txnMethodFilter.includes(t.paymentMethod.short))
    }

    // Status filter
    if (txnStatusFilter.length > 0) {
      result = result.filter(t => txnStatusFilter.includes(t.status))
    }

    // Gateway filter
    if (txnGatewayFilter.length > 0) {
      result = result.filter(t => txnGatewayFilter.includes(t.routingDecision.selectedGatewayShort))
    }

    // NTF filter
    if (txnNTFFilter) {
      result = result.filter(t => t.isNTF)
    }

    // Date range filter
    if (txnDateRange !== 'all') {
      const now = new Date('2026-03-11T23:59:59')
      const hours = txnDateRange === '24h' ? 24 : txnDateRange === '7d' ? 168 : 720
      const cutoff = new Date(now.getTime() - hours * 3600000)
      result = result.filter(t => t.timestamp >= cutoff)
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal, bVal
      switch (txnSort.field) {
        case 'timestamp': aVal = a.timestamp; bVal = b.timestamp; break
        case 'amount': aVal = a.amount; bVal = b.amount; break
        case 'txnId': aVal = a.txnId; bVal = b.txnId; break
        case 'method': aVal = a.paymentMethod.short; bVal = b.paymentMethod.short; break
        case 'status': aVal = a.status; bVal = b.status; break
        case 'gateway': aVal = a.routingDecision.selectedGatewayShort; bVal = b.routingDecision.selectedGatewayShort; break
        default: return 0
      }
      if (aVal < bVal) return txnSort.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return txnSort.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [transactions, txnSearch, txnMethodFilter, txnStatusFilter, txnGatewayFilter, txnNTFFilter, txnDateRange, txnSort])

  const paginatedTxns = useMemo(() => {
    const start = txnPage * txnPageSize
    return filteredTxns.slice(start, start + txnPageSize)
  }, [filteredTxns, txnPage, txnPageSize])

  const totalTxnPages = Math.ceil(filteredTxns.length / txnPageSize)

  // Reset page when filters change
  useEffect(() => { setTxnPage(0) }, [txnSearch, txnMethodFilter, txnStatusFilter, txnGatewayFilter, txnNTFFilter, txnDateRange])

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    if (!openTxnDropdown) return
    const handleClick = (e) => {
      if (!e.target.closest('.kam-txn-filter-wrap')) setOpenTxnDropdown(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openTxnDropdown])

  const gatewayOptions = useMemo(() => {
    const set = new Set(transactions.map(t => t.routingDecision.selectedGatewayShort))
    return [...set].sort()
  }, [transactions])

  const toggleTxnSort = useCallback((field) => {
    setTxnSort(prev =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: field === 'timestamp' ? 'desc' : 'asc' }
    )
  }, [])

  const exportTxnCSV = useCallback(() => {
    const headers = ['Txn ID','Timestamp','Amount','Method','Status','Gateway']
    const rows = filteredTxns.map(t => [
      t.txnId,
      t.timestamp.toISOString(),
      t.amount.toFixed(2),
      t.paymentMethod.type,
      t.status,
      t.routingDecision.selectedGatewayShort
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${merchant.name.replace(/\s/g,'_')}_transactions.csv`
    a.click(); URL.revokeObjectURL(url)
  }, [filteredTxns, merchant])

  const toggleTxnFilter = useCallback((type, value) => {
    const setter = type === 'method' ? setTxnMethodFilter : type === 'status' ? setTxnStatusFilter : setTxnGatewayFilter
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }, [])

  const clearTxnFilters = useCallback(() => {
    setTxnMethodFilter([])
    setTxnStatusFilter([])
    setTxnGatewayFilter([])
    setTxnNTFFilter(false)
    setTxnDateRange('all')
    setTxnSearch('')
  }, [])

  const hasActiveTxnFilters = txnMethodFilter.length > 0 || txnStatusFilter.length > 0 || txnGatewayFilter.length > 0 || txnNTFFilter || txnDateRange !== 'all' || txnSearch !== ''

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
      if (!merchant) return
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
    [isTerminalActive, merchant, merchantId, addAuditEntry, showToast]
  )

  const confirmDisableTerminal = useCallback(() => {
    if (!confirmTerminal || !merchant) return
    setTerminalStates((prev) => ({ ...prev, [confirmTerminal.key]: false }))
    addAuditEntry(
      `Disabled terminal ${confirmTerminal.terminalId} for ${merchant.name}`,
      `Processes ${formatLakhs(confirmTerminal.dailyVolume)} daily`,
      merchantId
    )
    showToast(`Terminal ${confirmTerminal.terminalId} disabled`, 'info')
    setConfirmTerminal(null)
  }, [confirmTerminal, merchant, merchantId, addAuditEntry, showToast])

  // ---- Recommendation handlers ----
  const handleApproveRec = useCallback(
    (rec) => {
      setApprovedRecs((prev) => new Set([...prev, rec.id]))

      if (rec.action === 'enable_sr_sensitive') {
        toggleSRSensitive(merchantId)
      } else if (rec.action === 'procure_terminal') {
        addAuditEntry(
          `Raised instrument request: ${rec.meta?.gwName} terminal`,
          rec.description.length > 140 ? rec.description.substring(0, 140) + '…' : rec.description,
          merchantId
        )
        showToast(`Instrument request raised for ${rec.meta?.gwName} terminal`)
      } else {
        addAuditEntry(
          `Approved AI recommendation: ${rec.title}`,
          rec.description.length > 140 ? rec.description.substring(0, 140) + '…' : rec.description,
          merchantId
        )
        showToast(`Recommendation approved: ${rec.title}`)
      }
    },
    [merchantId, toggleSRSensitive, addAuditEntry, showToast]
  )

  const handleDismissRec = useCallback((recId) => {
    setDismissedRecs((prev) => new Set([...prev, recId]))
  }, [])

  const visibleRecs = useMemo(
    () => recommendations.filter((r) => !dismissedRecs.has(r.id)),
    [recommendations, dismissedRecs]
  )

  // ---- Guard (after all hooks to respect Rules of Hooks) ----
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
            {merchant.dealType === 'tsp' && (
              <span className="kam-badge deal-tsp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                TSP
              </span>
            )}
            {merchant.dealType === 'offer_linked' && (
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
            {merchant.srSensitive && (
              <span className="kam-badge-sr" style={{ padding: '2px 10px', fontSize: 11 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                SR Sensitive
              </span>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--rzp-text-secondary)', fontFamily: 'var(--font-secondary)' }}>
            {merchant.contactName} &middot; {merchant.contactEmail}
            {merchant.mcc && (
              <span style={{ marginLeft: 12, color: 'var(--rzp-text-muted)' }}>
                &middot; MCC {merchant.mcc} &middot; {merchant.mccLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs (sticky, scroll-based) ──────────────────────── */}
      <div className="kam-detail-tabs kam-detail-tabs-sticky" ref={tabsBarRef}>
        {TAB_ORDER.map(tab => (
          <button
            key={tab}
            className={`kam-detail-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => scrollToSection(tab)}
          >
            {tab === 'transactions' ? `Transactions (${filteredTxns.length})` : tab === 'ntfs' ? `NTFs (${ntfCount})` : TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 1: AI RECOMMENDATIONS                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current['ai-recs'] = el} className="kam-tab-section">
      {visibleRecs.length > 0 && (
        <div className="kam-card kam-recs-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              AI Recommendations
              <span className="kam-recs-ai-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                AI
              </span>
            </h3>
            <span className="kam-recs-pending-count">
              {visibleRecs.filter(r => !approvedRecs.has(r.id)).length} of {visibleRecs.length} actions pending
            </span>
          </div>

          <div className="kam-recs-list">
            {visibleRecs.map((rec) => {
              const isRecExpanded = expandedRecs.has(rec.id)
              return (
              <div
                key={rec.id}
                className={`kam-rec-card ${rec.type}${approvedRecs.has(rec.id) ? ' approved' : ''}`}
              >
                {/* Collapsed header — always visible, clickable */}
                <div
                  className="kam-rec-accordion-trigger"
                  onClick={() => setExpandedRecs(prev => {
                    const next = new Set(prev)
                    next.has(rec.id) ? next.delete(rec.id) : next.add(rec.id)
                    return next
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <span className={`kam-rec-badge ${rec.type}`}>
                      {rec.type === 'critical' ? 'Critical' : rec.type === 'warning' ? 'Warning' : rec.type === 'opportunity' ? 'Opportunity' : 'Info'}
                    </span>
                    <span className="kam-rec-title" style={{ margin: 0 }}>{rec.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {approvedRecs.has(rec.id) && (
                      <span className="kam-rec-approved-badge" style={{ fontSize: 11 }}>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {rec.action === 'procure_terminal' ? 'Request Raised' : 'Approved'}
                      </span>
                    )}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`kam-recs-chevron${isRecExpanded ? ' expanded' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Expandable detail content */}
                {isRecExpanded && (
                <div className="kam-rec-detail">
                  {/* Confidence */}
                  <div className="kam-rec-section-label">Confidence</div>
                  <div className="kam-rec-meta-row">
                    <div className="kam-rec-confidence">
                      <div className="kam-rec-confidence-bar">
                        <div
                          className={`kam-rec-confidence-fill${rec.confidence >= 85 ? ' high' : rec.confidence >= 70 ? ' medium' : ' low'}`}
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <span className="kam-rec-confidence-value">{rec.confidence}%</span>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="kam-rec-section-label">Evidence</div>
                  <div className="kam-rec-evidence">
                    <span className="kam-rec-signal">{rec.signal}</span>
                    <span className="kam-rec-desc">{rec.description}</span>
                    {rec.affectedArea && (
                      <span className="kam-rec-affected">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Affects: {rec.affectedArea}
                      </span>
                    )}
                  </div>

                  {/* Recommended Action */}
                  <div className="kam-rec-section-label">Recommended Action</div>
                  <div className="kam-rec-impact">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <strong>Impact: </strong>{rec.impact}
                  </div>

                  {/* Actions */}
                  {!approvedRecs.has(rec.id) && (
                  <div className="kam-rec-actions">
                    {rec.action === 'procure_terminal' ? (
                      <>
                        <button
                          className="kam-rec-approve-btn kam-rec-instrument-btn"
                          onClick={(e) => { e.stopPropagation(); handleApproveRec(rec) }}
                        >
                          Raise Instrument Request
                        </button>
                        <button
                          className="kam-rec-dismiss-btn kam-rec-status-btn"
                          onClick={(e) => { e.stopPropagation(); handleDismissRec(rec.id) }}
                        >
                          Check terminal status
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="kam-rec-approve-btn"
                          onClick={(e) => { e.stopPropagation(); handleApproveRec(rec) }}
                        >
                          Approve
                        </button>
                        <button
                          className="kam-rec-dismiss-btn"
                          onClick={(e) => { e.stopPropagation(); handleDismissRec(rec.id) }}
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                  )}
                </div>
                )}
              </div>
            )})}
          </div>

          {/* Footer: severity summary */}
          <div className="kam-recs-footer">
            {(() => {
              const critical = visibleRecs.filter(r => r.type === 'critical').length
              const warning = visibleRecs.filter(r => r.type === 'warning').length
              const opportunity = visibleRecs.filter(r => r.type === 'opportunity').length
              const info = visibleRecs.filter(r => r.type === 'info').length
              const parts = []
              if (critical > 0) parts.push(`${critical} critical`)
              if (warning > 0) parts.push(`${warning} warning`)
              if (opportunity > 0) parts.push(`${opportunity} opportunity`)
              if (info > 0) parts.push(`${info} info`)
              return parts.join(' · ')
            })()}
          </div>
        </div>
      )}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 2: ROUTING STRATEGY                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.routing = el} className="kam-tab-section">

      {/* ── Deal Constraint Banners ────────────────────────────────── */}
      {merchant.dealType === 'tsp' && merchant.dealDetails && (
        <div className="kam-deal-banner tsp">
          <div className="kam-deal-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="kam-deal-banner-content">
            <div className="kam-deal-banner-title">
              TSP Deal Active
              <span className="kam-badge deal-tsp" style={{ fontSize: 10, padding: '1px 6px' }}>Routing Locked</span>
            </div>
            <div className="kam-deal-banner-desc">{merchant.dealDetails.description}</div>
            {merchant.dealDetails.constraint && (
              <div className="kam-deal-banner-desc" style={{ fontWeight: 600, color: 'var(--rzp-text-primary)', marginBottom: 4 }}>
                Constraint: {merchant.dealDetails.constraint}
              </div>
            )}
            {tspCompliance && (
              <div style={{ margin: '8px 0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="kam-tsp-gauge" style={{ margin: 0, maxWidth: 320 }}>
                    <div className="kam-tsp-gauge-bar">
                      <div
                        className={`kam-tsp-gauge-fill ${tspCompliance.status === 'off_track' ? 'violation' : tspCompliance.status === 'at_risk' ? 'at-risk' : ''}`}
                        style={{ width: `${tspCompliance.gmvCommitment > 0 ? Math.min((tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100, 100) : 0}%` }}
                      />
                      <div className="kam-tsp-gauge-threshold" style={{ left: '100%' }} />
                    </div>
                    <span className="kam-tsp-gauge-label">{formatINR(tspCompliance.projectedAnnualGMV)} / {formatINR(tspCompliance.gmvCommitment)} commitment</span>
                  </div>
                  <span className={`kam-badge ${tspCompliance.status === 'on_track' ? 'success' : tspCompliance.status === 'at_risk' ? 'warning' : 'danger'}`}>
                    {tspCompliance.status === 'on_track' ? 'On Track' : tspCompliance.status === 'at_risk' ? 'At Risk' : 'Off Track'}
                  </span>
                </div>
                {tspCompliance.status === 'off_track' && (
                  <div style={{ fontSize: 12, color: 'var(--rzp-danger)', fontWeight: 600, marginTop: 6 }}>
                    At current routing ({tspCompliance.actualTrafficPct}% via {tspCompliance.lockedGatewayName}), projected annual GMV is {formatINR(tspCompliance.projectedAnnualGMV)} against {formatINR(tspCompliance.gmvCommitment)} commitment. Consider increasing {tspCompliance.lockedGatewayName} traffic share to ~{tspCompliance.suggestedTrafficPct}%.
                  </div>
                )}
                {tspCompliance.status === 'at_risk' && (
                  <div style={{ fontSize: 12, color: '#E65100', fontWeight: 600, marginTop: 6 }}>
                    At current routing ({tspCompliance.actualTrafficPct}% via {tspCompliance.lockedGatewayName}), projected annual GMV is {formatINR(tspCompliance.projectedAnnualGMV)} against {formatINR(tspCompliance.gmvCommitment)} commitment. Suggest routing ~{tspCompliance.suggestedTrafficPct}% via {tspCompliance.lockedGatewayName} to meet target.
                  </div>
                )}
              </div>
            )}
            <div className="kam-deal-banner-meta">
              {merchant.dealDetails.expiresAt && (
                <span>Expires: <strong>{merchant.dealDetails.expiresAt}</strong></span>
              )}
              {merchant.dealDetails.contact && (
                <span>Contact: <a href={`mailto:${merchant.dealDetails.contact}`}>{merchant.dealDetails.contact}</a></span>
              )}
            </div>
          </div>
        </div>
      )}

      {merchant.dealType === 'offer_linked' && merchant.dealDetails && (
        <div className="kam-deal-banner offer">
          <div className="kam-deal-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <div className="kam-deal-banner-content">
            <div className="kam-deal-banner-title">
              Offer-Linked Deal
              <span className="kam-badge deal-offer" style={{ fontSize: 10, padding: '1px 6px' }}>Active</span>
            </div>
            <div className="kam-deal-banner-desc">{merchant.dealDetails.description}</div>
            {merchant.dealDetails.constraint && (
              <div className="kam-deal-banner-desc" style={{ fontWeight: 600, color: 'var(--rzp-text-primary)', marginBottom: 4 }}>
                Constraint: {merchant.dealDetails.constraint}
              </div>
            )}
            <div className="kam-deal-banner-meta">
              {merchant.dealDetails.expiresAt && (
                <span>Expires: <strong>{merchant.dealDetails.expiresAt}</strong></span>
              )}
              {merchant.dealDetails.contact && (
                <span>Contact: <a href={`mailto:${merchant.dealDetails.contact}`}>{merchant.dealDetails.contact}</a></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── GMV Commitment Progress (TSP + non-SR-sensitive) ──── */}
      {!merchant.srSensitive && tspCompliance && (
        <div className="kam-cbr-gmv-card">
          <div className="kam-cbr-gmv-header">
            <div className="kam-cbr-gmv-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              GMV Commitment Progress
            </div>
            <span className={`kam-badge ${
              tspCompliance.status === 'on_track' ? 'success'
              : tspCompliance.status === 'at_risk' ? 'warning'
              : 'danger'
            }`}>
              {tspCompliance.status === 'on_track' ? 'On Track'
              : tspCompliance.status === 'at_risk' ? 'At Risk'
              : 'Off Track'}
            </span>
          </div>

          <div className="kam-cbr-gmv-details">
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Locked Gateway</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.lockedGatewayName}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Annual Commitment</span>
              <span className="kam-cbr-gmv-value">{formatINR(tspCompliance.gmvCommitment)}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Projected Annual GMV</span>
              <span className="kam-cbr-gmv-value">{formatINR(tspCompliance.projectedAnnualGMV)}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Current Traffic Share</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.actualTrafficPct}%</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Required Traffic Share</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.suggestedTrafficPct}%</span>
            </div>
          </div>

          <div className="kam-cbr-gmv-progress">
            <div className="kam-cbr-gmv-progress-label">
              <span>Progress</span>
              <span>{Math.min(100, Math.round((tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100))}%</span>
            </div>
            <div className="kam-cbr-gmv-progress-bar">
              <div
                className="kam-cbr-gmv-progress-fill"
                style={{
                  width: `${Math.min(100, (tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100)}%`,
                  background: tspCompliance.status === 'on_track' ? 'var(--rzp-success)'
                    : tspCompliance.status === 'at_risk' ? '#FF9800'
                    : '#E53E3E',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Routing Rules (RulesTabContent) ──────────────────────── */}
      <RulesTabContent
        merchant={merchant}
        gateways={gateways}
        tspCompliance={tspCompliance}
        addRule={addRule}
        updateRule={updateRule}
        deleteRule={deleteRule}
        toggleRuleEnabled={toggleRuleEnabled}
        reorderRules={reorderRules}
        showToast={showToast}
        addAuditEntry={addAuditEntry}
        showRuleBuilder={showRuleBuilder}
        setShowRuleBuilder={setShowRuleBuilder}
        editingRule={editingRule}
        setEditingRule={setEditingRule}
        showSimulator={showSimulator}
        setShowSimulator={setShowSimulator}
        simForm={simForm}
        setSimForm={setSimForm}
        simResult={simResult}
        setSimResult={setSimResult}
        ruleForm={ruleForm}
        setRuleForm={setRuleForm}
      />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 3: TERMINAL MANAGEMENT                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.terminals = el} className="kam-tab-section">
      <div className="kam-detail-section" id="terminal-section">
        <div className="kam-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <ServerIcon />
              Terminal Management
            </h3>
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
            {filteredTerminals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--rzp-text-muted)' }}>
                No terminals match your search.
              </div>
            ) : (
              groupedTerminals.map((group) => (
                <div key={group.method} className="kam-terminal-method-group">
                  <div className="kam-terminal-method-header">
                    <span className={`kam-method-badge ${group.method.toLowerCase()}`}>{group.method}</span>
                    <span className="kam-terminal-method-label">{group.label}</span>
                    <span className="kam-terminal-method-count">{group.terminals.length} terminal{group.terminals.length > 1 ? 's' : ''}</span>
                  </div>
                  <table className="kam-terminal-table">
                    <caption className="kam-sr-only">Terminal management data for {merchant.name} — {group.label}</caption>
                    <thead>
                      <tr>
                        <th>Terminal ID</th>
                        <th>Provider</th>
                        <th>Current SR</th>
                        <th>Daily Volume</th>
                        <th>Txn Share</th>
                        <th>Cost/Txn</th>
                        <th>Status</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.terminals.map((t) => {
                        const active = isTerminalActive(t.key)
                        const srOptimal = t.successRate >= 71
                        const isExpanded = expandedTerminal === t.key
                        const pricingData = getBackwardPricingBreakdown(t.internalTermId)
                        return (
                          <React.Fragment key={t.key}>
                            <tr style={{ opacity: active ? 1 : 0.5 }}>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>
                                  {t.terminalId}
                                </span>
                              </td>
                              <td>{t.provider}</td>
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
                                {isTerminalZeroCost(t.internalTermId) && (
                                  <span className="kam-zero-cost-tag">0-Cost</span>
                                )}
                              </td>
                              <td>
                                <button
                                  className={`kam-toggle${active ? ' active' : ''}`}
                                  onClick={() => handleTerminalToggle(t)}
                                  aria-label={`Toggle terminal ${t.terminalId}`}
                                />
                              </td>
                              <td>
                                {pricingData.length > 0 && (
                                  <button
                                    className="kam-btn kam-btn-ghost kam-btn-sm"
                                    onClick={() => setExpandedTerminal(isExpanded ? null : t.key)}
                                    style={{ padding: 4 }}
                                    aria-label="Toggle pricing details"
                                  >
                                    <svg
                                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                  style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && pricingData.length > 0 && (
                          <tr className="kam-pricing-expanded-row">
                            <td colSpan={8} style={{ padding: 0 }}>
                              <div className="kam-pricing-breakdown">
                                <div className="kam-pricing-breakdown-title">Backward Pricing Schedule</div>
                                <table className="kam-pricing-table">
                                  <thead>
                                    <tr>
                                      <th>Network</th>
                                      <th>Card Type</th>
                                      <th>Amount Range</th>
                                      <th>Cost/Txn</th>
                                      <th>International</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pricingData.map((tier, i) => (
                                      <tr key={i}>
                                        <td><span className="kam-network-badge">{tier.network}</span></td>
                                        <td>{tier.cardType}</td>
                                        <td>{tier.amountRange}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                          {tier.costPerTxn === 0
                                            ? <span className="kam-zero-cost-tag">0-Cost</span>
                                            : `\u20B9${tier.costPerTxn.toFixed(2)}`}
                                        </td>
                                        <td>{tier.isInternational ? 'Yes' : '\u2014'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 4: METRICS                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.metrics = el} className="kam-tab-section">
      <div className="kam-card">
        <div className="kam-card-header">
          <h3 className="kam-card-title">
            <BarChartIcon />
            Key Metrics
          </h3>
        </div>
        <div className="kam-detail-metrics">
          <MetricCard
            icon={<CheckCircleIcon />}
            iconBg="var(--rzp-success-light)"
            iconColor="var(--rzp-success)"
            label="Success Rate"
            value={`${merchant.avgPaymentSuccessRate}%`}
            delta={merchant.avgPaymentSuccessRate >= 72 ? '+0.3%' : null}
            deltaType={merchant.avgPaymentSuccessRate >= 72 ? 'positive' : 'negative'}
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
            icon={<RoutingIcon />}
            iconBg={dopplerRoutePercent >= 80 ? 'var(--rzp-blue-light)' : 'var(--rzp-warning-light)'}
            iconColor={dopplerRoutePercent >= 80 ? 'var(--rzp-blue)' : 'var(--rzp-warning)'}
            label="Doppler Routed"
            value={`${dopplerRoutePercent}%`}
            delta={dopplerRoutePercent >= 80 ? 'Healthy' : 'Below 80% threshold'}
            deltaType={dopplerRoutePercent >= 80 ? 'positive' : 'negative'}
          />
          <MetricCard
            icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
            iconBg={ntfCount > 0 ? 'var(--rzp-danger-light, #fff5f5)' : 'var(--rzp-success-light)'}
            iconColor={ntfCount > 0 ? 'var(--rzp-danger)' : 'var(--rzp-success)'}
            label="NTF Failures"
            value={ntfCount}
            delta={ntfCount > 0 ? `${((ntfCount / transactions.length) * 100).toFixed(1)}% of txns` : 'No NTFs'}
            deltaType={ntfCount > 0 ? 'negative' : 'positive'}
          />
        </div>
      </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 5: SR TREND                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current['sr-trend'] = el} className="kam-tab-section">
      <SRLineChart srData={srData} />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 6: TRANSACTIONS                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.transactions = el} className="kam-tab-section">
        <div className="kam-card">
          {/* Header */}
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Transactions
            </h3>
            <button className="kam-txn-export-btn" onClick={exportTxnCSV} title="Export filtered transactions as CSV">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          </div>

          {/* Toolbar: search + date presets */}
          <div className="kam-txn-toolbar">
            <div className="kam-txn-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by ID, method, status, or gateway..."
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
              />
              {txnSearch && (
                <button className="kam-txn-search-clear" onClick={() => setTxnSearch('')} title="Clear search">
                  <XIcon />
                </button>
              )}
            </div>
            <div className="kam-txn-date-presets">
              {[{ key: 'all', label: 'All' }, { key: '30d', label: '30d' }, { key: '7d', label: '7d' }, { key: '24h', label: '24h' }].map(d => (
                <button
                  key={d.key}
                  className={`kam-txn-date-btn${txnDateRange === d.key ? ' active' : ''}`}
                  onClick={() => setTxnDateRange(d.key)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter dropdowns */}
          <div className="kam-txn-filters">
            {/* Method filter */}
            <div className="kam-txn-filter-wrap">
              <button
                className={`kam-txn-filter-btn${txnMethodFilter.length > 0 ? ' active' : ''}`}
                onClick={() => setOpenTxnDropdown(openTxnDropdown === 'method' ? null : 'method')}
              >
                Method {txnMethodFilter.length > 0 && <span className="kam-txn-filter-count">{txnMethodFilter.length}</span>}
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openTxnDropdown === 'method' && (
                <div className="kam-txn-filter-dropdown">
                  {['CC', 'DC', 'UPI', 'NB'].map(m => (
                    <label key={m} className="kam-txn-filter-option">
                      <input type="checkbox" checked={txnMethodFilter.includes(m)} onChange={() => toggleTxnFilter('method', m)} />
                      <span className={`kam-method-badge ${m.toLowerCase()}`}>{m}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Status filter */}
            <div className="kam-txn-filter-wrap">
              <button
                className={`kam-txn-filter-btn${txnStatusFilter.length > 0 ? ' active' : ''}`}
                onClick={() => setOpenTxnDropdown(openTxnDropdown === 'status' ? null : 'status')}
              >
                Status {txnStatusFilter.length > 0 && <span className="kam-txn-filter-count">{txnStatusFilter.length}</span>}
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openTxnDropdown === 'status' && (
                <div className="kam-txn-filter-dropdown">
                  {['success', 'failed', 'refunded'].map(s => (
                    <label key={s} className="kam-txn-filter-option">
                      <input type="checkbox" checked={txnStatusFilter.includes(s)} onChange={() => toggleTxnFilter('status', s)} />
                      <span className={`kam-txn-status ${s}`}>{s}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Gateway filter */}
            <div className="kam-txn-filter-wrap">
              <button
                className={`kam-txn-filter-btn${txnGatewayFilter.length > 0 ? ' active' : ''}`}
                onClick={() => setOpenTxnDropdown(openTxnDropdown === 'gateway' ? null : 'gateway')}
              >
                Gateway {txnGatewayFilter.length > 0 && <span className="kam-txn-filter-count">{txnGatewayFilter.length}</span>}
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openTxnDropdown === 'gateway' && (
                <div className="kam-txn-filter-dropdown">
                  {gatewayOptions.map(g => (
                    <label key={g} className="kam-txn-filter-option">
                      <input type="checkbox" checked={txnGatewayFilter.includes(g)} onChange={() => toggleTxnFilter('gateway', g)} />
                      {g}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* NTF filter toggle */}
            <button
              className={`kam-txn-filter-btn${txnNTFFilter ? ' active' : ''}`}
              onClick={() => setTxnNTFFilter(prev => !prev)}
              style={txnNTFFilter ? { background: 'var(--rzp-danger)', color: '#fff', borderColor: 'var(--rzp-danger)' } : {}}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              NTF Only
            </button>

            {hasActiveTxnFilters && (
              <button className="kam-txn-clear-filters" onClick={clearTxnFilters}>
                <XIcon /> Clear all
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="kam-txn-table">
              <caption className="kam-sr-only">Transaction history for {merchant.name}</caption>
              <thead>
                <tr>
                  {[
                    { field: 'txnId', label: 'Txn ID' },
                    { field: 'timestamp', label: 'Timestamp' },
                    { field: 'amount', label: 'Amount' },
                    { field: 'method', label: 'Method' },
                    { field: 'status', label: 'Status' },
                    { field: 'gateway', label: 'Gateway' },
                  ].map(col => (
                    <th
                      key={col.field}
                      className="kam-txn-sortable"
                      onClick={() => toggleTxnSort(col.field)}
                    >
                      {col.label}
                      <span className="kam-txn-sort-icon">
                        {txnSort.field === col.field ? (
                          txnSort.direction === 'asc' ? (
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          )
                        ) : (
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"><polyline points="18 15 12 9 6 15"/></svg>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedTxns.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--rzp-text-muted)' }}>
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedTxns.map((txn) => (
                    <tr key={txn.txnId} onClick={() => setSelectedTxn(txn)}>
                      <td><span className="txn-id">{txn.txnId}</span></td>
                      <td>{txn.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {txn.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(txn.amount)}</td>
                      <td><span className="kam-badge neutral">{txn.paymentMethod.short}</span></td>
                      <td><span className={`kam-txn-status ${txn.status}`}>{txn.status}</span></td>
                      <td>{txn.routingDecision.selectedGatewayShort}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="kam-txn-pagination">
            <div className="kam-txn-pagination-info">
              Showing {filteredTxns.length === 0 ? 0 : txnPage * txnPageSize + 1}–{Math.min((txnPage + 1) * txnPageSize, filteredTxns.length)} of {filteredTxns.length}
            </div>
            <div className="kam-txn-pagination-controls">
              <button
                className="kam-txn-page-btn"
                disabled={txnPage === 0}
                onClick={() => setTxnPage(p => p - 1)}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              {Array.from({ length: totalTxnPages }, (_, i) => (
                <button
                  key={i}
                  className={`kam-txn-page-btn${txnPage === i ? ' active' : ''}`}
                  onClick={() => setTxnPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="kam-txn-page-btn"
                disabled={txnPage >= totalTxnPages - 1}
                onClick={() => setTxnPage(p => p + 1)}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div className="kam-txn-page-size-wrap">
              <select
                className="kam-txn-page-size"
                value={txnPageSize}
                onChange={(e) => { setTxnPageSize(Number(e.target.value)); setTxnPage(0) }}
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 7: AUDIT LOG                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.audit = el} className="kam-tab-section">
      <div className="kam-card">
        <div className="kam-card-header">
          <h3 className="kam-card-title">
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
      </div>

      {/* ── Transaction Routing Drawer ─────────────────────── */}
      {selectedTxn && (
        <>
          <div className="kam-drawer-overlay" onClick={() => setSelectedTxn(null)} />
          <div className="kam-drawer">
            <div className="kam-drawer-header">
              <h3>Routing Decision</h3>
              <button className="kam-drawer-close" onClick={() => setSelectedTxn(null)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-drawer-body">
              {/* Transaction Info */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Transaction Details</div>
                <div className="kam-drawer-info-grid">
                  <div className="kam-drawer-info-item">
                    <span className="label">Transaction ID</span>
                    <span className="value">{selectedTxn.txnId}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Amount</span>
                    <span className="value">{formatINR(selectedTxn.amount)}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Payment Method</span>
                    <span className="value">{selectedTxn.paymentMethod.type}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Status</span>
                    <span className="value"><span className={`kam-txn-status ${selectedTxn.status}`}>{selectedTxn.status}</span></span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Timestamp</span>
                    <span className="value">{selectedTxn.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} {selectedTxn.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                </div>
              </div>

              {/* Routing Decision */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Routing Decision</div>
                <div className={`kam-routing-explanation ${merchant.srSensitive ? 'sr-locked' : selectedTxn.routingDecision.wasDePrioritized ? 'deprioritized' : 'normal'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {merchant.srSensitive ? (
                      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
                    ) : selectedTxn.routingDecision.wasDePrioritized ? (
                      <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
                    ) : (
                      <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                    )}
                  </svg>
                  <div>{selectedTxn.routingDecision.reason}</div>
                </div>
              </div>

              {/* Routing Pipeline */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Routing Pipeline — All Evaluated Terminals</div>
                <div className="kam-pipeline-list">
                  {selectedTxn.routingDecision.allEvaluated.map((item, i) => (
                    <div
                      key={i}
                      className={`kam-pipeline-item ${item.status === 'selected' ? 'selected' : 'rejected'}`}
                    >
                      <div className="kam-pipeline-item-header">
                        <span className="kam-pipeline-item-terminal">
                          {item.terminalId} <span style={{ fontWeight: 400, color: 'var(--rzp-text-muted)', fontSize: 12 }}>({item.gatewayShort})</span>
                        </span>
                        <span className={`kam-pipeline-item-status ${item.status === 'selected' ? 'selected' : 'rejected'}`}>
                          {item.status === 'selected' ? 'Selected' : 'Rejected'}
                        </span>
                      </div>
                      <div className="kam-pipeline-item-metrics">
                        <span>SR: <strong>{item.successRate}%</strong></span>
                        <span>Cost: <strong>{'\u20B9'}{item.costPerTxn.toFixed(2)}</strong></span>
                      </div>
                      <div className="kam-pipeline-item-reason">{item.statusReason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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

      {/* ── Deal Warning Modal ─────────────────────────────────────── */}
      {showDealWarning && (
        <div className="kam-modal-overlay" onClick={() => setShowDealWarning(false)}>
          <div className="kam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="kam-modal-header">
              <div>
                <h3>Gateway Change Warning</h3>
                <p>{merchant.name}</p>
              </div>
              <button className="kam-modal-close" onClick={() => setShowDealWarning(false)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-modal-body">
              <div className="kam-warning-box" style={{ marginBottom: 16 }}>
                <WarningIcon />
                <span>
                  This merchant has an active <strong>{merchant.dealType === 'tsp' ? 'TSP deal' : 'offer-linked deal'}</strong>.
                  Changing the primary gateway may void negotiated rates or break offer routing constraints.
                </span>
              </div>
              {merchant.dealDetails?.constraint && (
                <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                  <strong>Current constraint:</strong> {merchant.dealDetails.constraint}
                </p>
              )}
              {merchant.dealDetails?.contact && (
                <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5 }}>
                  Please contact <a href={`mailto:${merchant.dealDetails.contact}`} style={{ color: 'var(--rzp-blue)' }}>{merchant.dealDetails.contact}</a> before making changes.
                </p>
              )}
            </div>
            <div className="kam-modal-footer">
              <button className="kam-btn kam-btn-secondary" onClick={() => setShowDealWarning(false)}>
                Cancel
              </button>
              <button
                className="kam-btn kam-btn-danger"
                onClick={() => {
                  setShowDealWarning(false)
                  const el = document.getElementById('terminal-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Proceed Anyway
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

// ---------------------------------------------------------------------------
// Rules Tab Content
// ---------------------------------------------------------------------------
function RulesTabContent({
  merchant, gateways, tspCompliance,
  addRule, updateRule, deleteRule, toggleRuleEnabled, reorderRules,
  showToast, addAuditEntry,
  showRuleBuilder, setShowRuleBuilder,
  editingRule, setEditingRule,
  showSimulator, setShowSimulator,
  simForm, setSimForm, simResult, setSimResult,
  ruleForm, setRuleForm,
}) {
  const rules = merchant.routingRulesV2 || []
  const ntfGaps = useMemo(() => detectNTFGaps(rules, merchant), [rules, merchant])

  // Primary routing decision: SR-optimized (Doppler) vs Cost-saving (manual rules)
  const [routingMode, setRoutingMode] = useState(merchant.routingStrategy === 'cost_based' ? 'cost' : null)
  // null = no decision yet (show decision UI), 'sr' = Doppler, 'cost' = manual rules

  // Sort rules by priority
  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => a.priority - b.priority)
  }, [rules])

  const nonDefaultRules = sortedRules.filter(r => !r.isDefault)
  const defaultRule = sortedRules.find(r => r.isDefault)

  // Grouped rules for method-based display
  const groupedRules = useMemo(() => groupRulesByMethod(rules), [rules])
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries(PAYMENT_METHOD_GROUPS.map(g => [g.key, false]))
  )
  const toggleGroup = useCallback((key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Build available terminals from merchant's gateway metrics
  const availableTerminals = useMemo(() => {
    return merchant.gatewayMetrics.map(gm => {
      const info = getTerminalGatewayInfo(gm.terminalId)
      return {
        terminalId: gm.terminalId,
        displayId: info?.displayId || gm.terminalId,
        gatewayShort: info?.gatewayShort || '??',
        successRate: gm.successRate,
        costPerTxn: gm.costPerTxn,
        supportedMethods: gm.supportedMethods || [],
      }
    })
  }, [merchant])

  // AI-assisted rule builder state
  const [builderMode, setBuilderMode] = useState('ai')
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState([])
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [isAiProcessing, setIsAiProcessing] = useState(false)

  // Wizard state (manual mode)
  const WIZARD_STEPS = [
    { key: 'method', label: 'Payment Method', shortLabel: 'Method' },
    { key: 'filters', label: 'Transaction Filters', shortLabel: 'Filters' },
    { key: 'objective', label: 'Objective', shortLabel: 'Objective' },
    { key: 'routing', label: 'Routing', shortLabel: 'Route' },
    { key: 'review', label: 'Review & Save', shortLabel: 'Review' },
  ]
  const [wizardStep, setWizardStep] = useState(0)
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]))
  const [wizardStepErrors, setWizardStepErrors] = useState({})

  // Guided state — drives the visual Step 0 + Step 1 UI, syncs to ruleForm.conditions
  const INITIAL_GUIDED = { paymentMethod: null, upiFlow: null, cardType: null, cardNetworks: [], issuerBank: null, objective: null }

  const OBJECTIVES = [
    { value: 'reduce_cost', label: 'Reduce Cost', icon: 'cost', desc: 'Route through the cheapest or zero-cost gateway terminals to minimize backward pricing.', suggestion: 'Conditional routing → terminals sorted by cost (lowest first), zero-cost highlighted.' },
    { value: 'meet_tsp', label: 'Meet TSP/GMV Target', icon: 'tsp', desc: 'Ensure minimum traffic percentage through committed bank terminals to fulfill volume commitments.', suggestion: 'Volume Split → committed terminal pre-selected with minimum traffic %.' },
    { value: 'enable_offers', label: 'Enable Bank Offers', icon: 'offer', desc: 'Route to specific terminals required for cashback, EMI, or promotional bank offers.', suggestion: 'Conditional routing → offer-eligible terminal as primary, with SR fallback.' },
  ]
  const [guidedState, setGuidedState] = useState(INITIAL_GUIDED)

  const syncGuidedToConditions = useCallback((gs) => {
    const conditions = []
    if (gs.paymentMethod === 'UPI') {
      conditions.push({ field: 'payment_method', operator: 'equals', value: 'UPI' })
      if (gs.upiFlow) conditions.push({ field: 'upi_flow', operator: 'equals', value: gs.upiFlow })
    } else if (gs.paymentMethod === 'cards') {
      if (gs.cardType === 'credit') conditions.push({ field: 'payment_method', operator: 'equals', value: 'CC' })
      else if (gs.cardType === 'debit') conditions.push({ field: 'payment_method', operator: 'equals', value: 'DC' })
      else conditions.push({ field: 'payment_method', operator: 'in', value: ['CC', 'DC'] })
      if (gs.cardNetworks.length === 1) conditions.push({ field: 'card_network', operator: 'equals', value: gs.cardNetworks[0] })
      else if (gs.cardNetworks.length > 1) conditions.push({ field: 'card_network', operator: 'in', value: [...gs.cardNetworks] })
      if (gs.issuerBank) conditions.push({ field: 'issuer_bank', operator: 'equals', value: gs.issuerBank })
    }
    return conditions
  }, [])

  const reverseMapConditionsToGuided = useCallback((conditions) => {
    const gs = { ...INITIAL_GUIDED }
    conditions.forEach(c => {
      switch (c.field) {
        case 'payment_method':
          if (c.value === 'UPI') gs.paymentMethod = 'UPI'
          else if (c.value === 'CC') { gs.paymentMethod = 'cards'; gs.cardType = 'credit' }
          else if (c.value === 'DC') { gs.paymentMethod = 'cards'; gs.cardType = 'debit' }
          else if (c.operator === 'in' && Array.isArray(c.value)) {
            if (c.value.includes('CC') || c.value.includes('DC')) gs.paymentMethod = 'cards'
          }
          break
        case 'upi_flow': gs.upiFlow = c.value; break
        case 'card_network':
          gs.paymentMethod = gs.paymentMethod || 'cards'
          if (c.operator === 'in' && Array.isArray(c.value)) gs.cardNetworks = [...c.value]
          else gs.cardNetworks.push(c.value)
          break
        case 'card_type': gs.paymentMethod = 'cards'; gs.cardType = c.value; break
        case 'issuer_bank': gs.paymentMethod = gs.paymentMethod || 'cards'; gs.issuerBank = c.value; break
      }
    })
    return gs
  }, [])

  const autoRuleName = useMemo(() => {
    const parts = []
    if (guidedState.paymentMethod === 'UPI') {
      parts.push('UPI')
      if (guidedState.upiFlow === 'one_time') parts.push('One-time')
      else if (guidedState.upiFlow === 'autopay') parts.push('Autopay')
    } else if (guidedState.paymentMethod === 'cards') {
      if (guidedState.cardType === 'credit') parts.push('Credit Card')
      else if (guidedState.cardType === 'debit') parts.push('Debit Card')
      else parts.push('Card')
      if (guidedState.cardNetworks.length > 0 && guidedState.cardNetworks.length <= 2) parts.push(guidedState.cardNetworks.join('+'))
      if (guidedState.issuerBank) parts.push(guidedState.issuerBank)
    }
    const condStr = parts.join(' ') || 'All Txns'
    // Add objective tag
    const objLabel = guidedState.objective ? { reduce_cost: 'Low-Cost', meet_tsp: 'TSP', enable_offers: 'Offer' }[guidedState.objective] : ''
    if (ruleForm.type === 'conditional') {
      const termNames = ruleForm.terminals.map(tid => { const t = availableTerminals.find(at => at.terminalId === tid); return t?.gatewayShort || tid })
      return `${condStr}${objLabel ? ` [${objLabel}]` : ''} → ${termNames.join(' → ') || '?'}`
    } else {
      const splitDescs = ruleForm.splits.map(s => { const t = availableTerminals.find(at => at.terminalId === s.terminalId); return `${t?.gatewayShort || s.terminalId} ${s.percentage}%` })
      return `${condStr}${objLabel ? ` [${objLabel}]` : ''}: ${splitDescs.join(' / ') || '?'}`
    }
  }, [guidedState, ruleForm.type, ruleForm.terminals, ruleForm.splits, availableTerminals])

  const validateStep = useCallback((step) => {
    const errors = []
    switch (step) {
      case 0:
        if (!guidedState.paymentMethod) errors.push('Select a payment method (UPI or Cards)')
        break
      case 1:
        // All filters are optional — no validation needed
        break
      case 2:
        if (!guidedState.objective) errors.push('Select a routing objective')
        break
      case 3:
        if (ruleForm.type === 'conditional' && ruleForm.terminals.length === 0) errors.push('Select at least one target terminal')
        if (ruleForm.type === 'volume_split') {
          if (ruleForm.splits.length === 0) errors.push('Add at least one terminal split')
          else {
            const total = ruleForm.splits.reduce((s, sp) => s + sp.percentage, 0)
            if (total !== 100) errors.push(`Split percentages must total 100% (currently ${total}%)`)
          }
        }
        break
      case 4:
        if (!ruleForm.name.trim()) errors.push('Rule name is required')
        break
    }
    return errors
  }, [ruleForm, guidedState])

  // ── Handlers ──

  const handleOpenBuilder = useCallback((rule = null, prefillConditions = null) => {
    if (rule) {
      setEditingRule(rule)
      setRuleForm({
        name: rule.name,
        type: rule.type,
        conditions: rule.conditions.map(c => ({ ...c })),
        conditionLogic: rule.conditionLogic,
        terminals: rule.action.type === 'route' ? [...rule.action.terminals] : [],
        splits: rule.action.type === 'split' ? rule.action.splits.map(s => ({ ...s })) : [],
        srThreshold: rule.action.srThreshold || 90,
        minPaymentCount: rule.action.minPaymentCount || 100,
      })
      const gs = reverseMapConditionsToGuided(rule.conditions)
      // Infer objective from existing rule type
      if (rule.type === 'volume_split') gs.objective = 'meet_tsp'
      else gs.objective = 'reduce_cost' // default for conditional
      setGuidedState(gs)
      setBuilderMode('manual')
      setWizardStep(0)
      setVisitedSteps(new Set([0, 1, 2, 3, 4])) // all steps clickable when editing
    } else {
      setEditingRule(null)
      // Pre-fill guided state from grouped rule empty slot click
      const gs = { ...INITIAL_GUIDED }
      const conditions = []
      if (prefillConditions) {
        if (prefillConditions.paymentMethod) {
          gs.paymentMethod = prefillConditions.paymentMethod
          conditions.push({ field: 'payment_method', operator: 'equals', value: prefillConditions.paymentMethod })
        }
        if (prefillConditions.subMethodField && prefillConditions.subMethodValue) {
          if (prefillConditions.subMethodField === 'card_network') {
            gs.cardNetworks = [prefillConditions.subMethodValue]
          } else if (prefillConditions.subMethodField === 'upi_flow') {
            gs.upiFlow = prefillConditions.subMethodValue
          }
          conditions.push({ field: prefillConditions.subMethodField, operator: 'equals', value: prefillConditions.subMethodValue })
        }
      }
      setRuleForm({ name: '', type: 'conditional', conditions, conditionLogic: 'AND', terminals: [], splits: [], srThreshold: 90, minPaymentCount: 100 })
      setGuidedState(gs)
      setBuilderMode('ai')
      setWizardStep(0)
      setVisitedSteps(new Set([0]))
    }
    // Reset AI + wizard state
    setAiInput('')
    setAiMessages([])
    setAiSuggestion(null)
    setIsAiProcessing(false)
    setWizardStepErrors({})
    setShowRuleBuilder(true)
  }, [setEditingRule, setRuleForm, setShowRuleBuilder])

  const handleSaveRule = useCallback(() => {
    if (!ruleForm.name.trim()) {
      showToast('Rule name is required', 'error')
      return
    }
    const actionTerminals = ruleForm.type === 'conditional' ? ruleForm.terminals : []
    const actionSplits = ruleForm.type === 'volume_split' ? ruleForm.splits : []

    if (ruleForm.type === 'conditional' && actionTerminals.length === 0) {
      showToast('Select at least one target terminal', 'error')
      return
    }
    if (ruleForm.type === 'volume_split') {
      if (actionSplits.length === 0) {
        showToast('Add at least one terminal split', 'error')
        return
      }
      const totalPct = actionSplits.reduce((s, sp) => s + sp.percentage, 0)
      if (totalPct !== 100) {
        showToast(`Split percentages must total 100% (currently ${totalPct}%)`, 'error')
        return
      }
    }

    const ruleObj = {
      id: editingRule ? editingRule.id : `rule-${merchant.id}-${Date.now()}`,
      name: ruleForm.name.trim(),
      type: ruleForm.type,
      enabled: editingRule ? editingRule.enabled : true,
      priority: editingRule ? editingRule.priority : 0,
      conditions: ruleForm.conditions,
      conditionLogic: ruleForm.conditionLogic,
      action: {
        type: ruleForm.type === 'volume_split' ? 'split' : 'route',
        terminals: actionTerminals,
        splits: actionSplits,
        srThreshold: ruleForm.type === 'conditional' ? (ruleForm.srThreshold || 0) : 0,
        minPaymentCount: ruleForm.type === 'conditional' ? (ruleForm.minPaymentCount || 0) : 0,
      },
      isDefault: false,
      createdAt: editingRule ? editingRule.createdAt : new Date().toISOString(),
      createdBy: editingRule ? editingRule.createdBy : 'anugrah.sharma@razorpay.com',
    }

    if (editingRule) {
      updateRule(merchant.id, editingRule.id, ruleObj)
    } else {
      addRule(merchant.id, ruleObj)
    }
    setShowRuleBuilder(false)
    setEditingRule(null)
  }, [ruleForm, editingRule, merchant.id, addRule, updateRule, showToast, setShowRuleBuilder, setEditingRule])

  const handleAiSubmit = useCallback(() => {
    const trimmed = aiInput.trim()
    if (!trimmed || isAiProcessing) return
    // Add user message
    setAiMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setAiInput('')
    setIsAiProcessing(true)

    // Simulate processing delay
    setTimeout(() => {
      const result = parseRuleIntent(trimmed, merchant)
      setAiSuggestion(result)
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        text: result.explanation,
        confidence: result.confidence,
        warnings: result.warnings,
      }])
      setIsAiProcessing(false)
    }, 600)
  }, [aiInput, isAiProcessing, merchant])

  const handleApplyAiSuggestion = useCallback(() => {
    if (!aiSuggestion?.suggestedRule) return
    const s = aiSuggestion.suggestedRule
    setRuleForm({
      name: s.name || '',
      type: s.type || 'conditional',
      conditions: s.conditions || [],
      conditionLogic: s.conditionLogic || 'AND',
      terminals: s.action?.terminals || [],
      splits: s.action?.splits || [],
      srThreshold: s.action?.srThreshold || 90,
      minPaymentCount: s.action?.minPaymentCount || 100,
    })
    setGuidedState(reverseMapConditionsToGuided(s.conditions || []))
  }, [aiSuggestion, reverseMapConditionsToGuided])

  const handleEditManually = useCallback(() => {
    handleApplyAiSuggestion()
    setBuilderMode('manual')
    setWizardStep(0)
    setVisitedSteps(new Set([0, 1, 2, 3, 4])) // all steps clickable from AI prefill
    setWizardStepErrors({})
  }, [handleApplyAiSuggestion])

  // Wizard navigation
  const handleWizardNext = useCallback(() => {
    const errors = validateStep(wizardStep)
    if (errors.length > 0) {
      setWizardStepErrors(prev => ({ ...prev, [wizardStep]: errors }))
      showToast(errors[0], 'error')
      return
    }
    setWizardStepErrors(prev => ({ ...prev, [wizardStep]: [] }))
    if (wizardStep === 4) {
      handleSaveRule()
      return
    }
    // Sync guided state to conditions when leaving Step 1 (Filters)
    if (wizardStep === 1) {
      const newConditions = syncGuidedToConditions(guidedState)
      setRuleForm(prev => ({ ...prev, conditions: newConditions, conditionLogic: 'AND' }))
    }
    // Pre-configure routing based on objective when leaving Step 2
    if (wizardStep === 2) {
      const obj = guidedState.objective
      if (obj === 'meet_tsp') {
        // Volume Split for TSP/GMV targets
        setRuleForm(prev => ({ ...prev, type: 'volume_split', terminals: [] }))
      } else {
        // Conditional for reduce_cost, enable_offers
        setRuleForm(prev => ({ ...prev, type: 'conditional', splits: [] }))
        // Sort available terminals by objective
        if (obj === 'reduce_cost') {
          const sorted = [...availableTerminals].sort((a, b) => a.costPerTxn - b.costPerTxn).map(t => t.terminalId)
          setRuleForm(prev => ({ ...prev, terminals: prev.terminals.length > 0 ? prev.terminals : sorted.slice(0, 2) }))
        } else if (obj === 'enable_offers') {
          // Pre-select first terminal (user should pick the offer-eligible one)
          setRuleForm(prev => ({ ...prev, terminals: prev.terminals.length > 0 ? prev.terminals : [] }))
        }
      }
    }
    const nextStep = wizardStep + 1
    setWizardStep(nextStep)
    setVisitedSteps(prev => new Set([...prev, nextStep]))
    // Auto-populate name when arriving at Review (step 4)
    if (nextStep === 4 && !ruleForm.name.trim()) {
      setRuleForm(prev => ({ ...prev, name: autoRuleName }))
    }
  }, [wizardStep, validateStep, handleSaveRule, autoRuleName, ruleForm.name, showToast, guidedState, syncGuidedToConditions, availableTerminals])

  const handleWizardBack = useCallback(() => {
    if (wizardStep > 0) setWizardStep(wizardStep - 1)
    else setShowRuleBuilder(false)
  }, [wizardStep, setShowRuleBuilder])

  const handleWizardJump = useCallback((targetStep) => {
    if (!(editingRule || visitedSteps.has(targetStep))) return
    if (targetStep > wizardStep) {
      const errors = validateStep(wizardStep)
      if (errors.length > 0) {
        setWizardStepErrors(prev => ({ ...prev, [wizardStep]: errors }))
        showToast(errors[0], 'error')
        return
      }
    }
    setWizardStep(targetStep)
    setVisitedSteps(prev => new Set([...prev, targetStep]))
    if (targetStep === 4 && !ruleForm.name.trim()) {
      setRuleForm(prev => ({ ...prev, name: autoRuleName }))
    }
  }, [wizardStep, editingRule, visitedSteps, validateStep, autoRuleName, ruleForm.name, showToast])

  const handleSaveFromAi = useCallback(() => {
    if (!aiSuggestion?.suggestedRule) return
    const s = aiSuggestion.suggestedRule
    // Populate ruleForm and then save
    const actionTerminals = s.action?.type === 'route' ? (s.action.terminals || []) : []
    const actionSplits = s.action?.type === 'split' ? (s.action.splits || []) : []

    if (!s.name?.trim()) {
      showToast('Rule name is missing from suggestion', 'error')
      return
    }
    if (s.type !== 'volume_split' && actionTerminals.length === 0) {
      showToast('No target terminals in suggestion — try editing manually', 'error')
      return
    }
    if (s.type === 'volume_split' && actionSplits.length === 0) {
      showToast('No split configuration in suggestion — try editing manually', 'error')
      return
    }

    const ruleObj = {
      id: `rule-${merchant.id}-${Date.now()}`,
      name: s.name.trim(),
      type: s.type,
      enabled: true,
      priority: 0,
      conditions: s.conditions || [],
      conditionLogic: s.conditionLogic || 'AND',
      action: {
        type: s.action?.type || 'route',
        terminals: actionTerminals,
        splits: actionSplits,
        srThreshold: s.action?.srThreshold || 0,
        minPaymentCount: s.action?.minPaymentCount || 0,
      },
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'anugrah.sharma@razorpay.com',
    }
    addRule(merchant.id, ruleObj)
    setShowRuleBuilder(false)
    setEditingRule(null)
  }, [aiSuggestion, merchant.id, addRule, showToast])

  const handleMoveRule = useCallback((ruleId, direction) => {
    const idx = nonDefaultRules.findIndex(r => r.id === ruleId)
    if (idx < 0) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === nonDefaultRules.length - 1) return
    const newOrder = [...nonDefaultRules]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]
    const orderedIds = [...newOrder.map(r => r.id), defaultRule?.id].filter(Boolean)
    reorderRules(merchant.id, orderedIds)
  }, [nonDefaultRules, defaultRule, merchant.id, reorderRules])

  const handleSimulate = useCallback(() => {
    const result = simulateTransaction(rules, simForm, merchant)
    setSimResult(result)
  }, [rules, simForm, merchant, setSimResult])

  const handleApplySuggestedSplit = useCallback(() => {
    if (!tspCompliance) return
    const lockedGwId = merchant.dealDetails?.lockedGatewayId
    const lockedTerminals = merchant.gatewayMetrics.filter(gm => gm.gatewayId === lockedGwId)
    const otherTerminals = merchant.gatewayMetrics.filter(gm => gm.gatewayId !== lockedGwId)
    if (lockedTerminals.length === 0) {
      showToast('No terminal found for the locked gateway', 'error')
      return
    }
    const suggestedPct = Math.min(100, Math.ceil(tspCompliance.suggestedTrafficPct))
    const remainingPct = 100 - suggestedPct
    const splits = [
      { terminalId: lockedTerminals[0].terminalId, percentage: suggestedPct },
    ]
    if (otherTerminals.length > 0 && remainingPct > 0) {
      const perOther = Math.floor(remainingPct / otherTerminals.length)
      let remainder = remainingPct - (perOther * otherTerminals.length)
      otherTerminals.forEach((t, i) => {
        splits.push({ terminalId: t.terminalId, percentage: perOther + (i === 0 ? remainder : 0) })
      })
    }
    const splitRule = {
      id: `rule-${merchant.id}-tsp-${Date.now()}`,
      name: `${tspCompliance.lockedGatewayName} Volume Commitment`,
      type: 'volume_split',
      enabled: true,
      priority: 0,
      conditions: [],
      conditionLogic: 'AND',
      action: { type: 'split', terminals: [], splits },
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'anugrah.sharma@razorpay.com',
    }
    addRule(merchant.id, splitRule)
  }, [merchant, tspCompliance, addRule, showToast])

  // Condition row helpers
  const addCondition = useCallback(() => {
    setRuleForm(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'payment_method', operator: 'equals', value: 'CC' }],
    }))
  }, [setRuleForm])

  const removeCondition = useCallback((idx) => {
    setRuleForm(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== idx),
    }))
  }, [setRuleForm])

  const updateCondition = useCallback((idx, updates) => {
    setRuleForm(prev => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => i === idx ? { ...c, ...updates } : c),
    }))
  }, [setRuleForm])

  // Terminal selection helpers
  const toggleTerminal = useCallback((terminalId) => {
    setRuleForm(prev => {
      const has = prev.terminals.includes(terminalId)
      return { ...prev, terminals: has ? prev.terminals.filter(t => t !== terminalId) : [...prev.terminals, terminalId] }
    })
  }, [setRuleForm])

  const addSplit = useCallback((terminalId) => {
    setRuleForm(prev => {
      if (prev.splits.some(s => s.terminalId === terminalId)) return prev
      return { ...prev, splits: [...prev.splits, { terminalId, percentage: 0 }] }
    })
  }, [setRuleForm])

  const removeSplit = useCallback((terminalId) => {
    setRuleForm(prev => ({
      ...prev,
      splits: prev.splits.filter(s => s.terminalId !== terminalId),
    }))
  }, [setRuleForm])

  const updateSplitPct = useCallback((terminalId, pct) => {
    setRuleForm(prev => ({
      ...prev,
      splits: prev.splits.map(s => s.terminalId === terminalId ? { ...s, percentage: Number(pct) || 0 } : s),
    }))
  }, [setRuleForm])

  // ── Offer rule helper ──
  const hasOfferRule = useMemo(() => {
    if (merchant.dealType !== 'offer_linked') return false
    const lockedGwId = merchant.dealDetails?.lockedGatewayId
    return rules.some(r =>
      r.enabled && !r.isDefault &&
      r.action.terminals?.some(tid => {
        const info = getTerminalGatewayInfo(tid)
        return info?.gatewayId === lockedGwId
      })
    )
  }, [merchant, rules])

  const handleCreateOfferRule = useCallback(() => {
    const lockedGwId = merchant.dealDetails?.lockedGatewayId
    const lockedTerminals = merchant.gatewayMetrics.filter(gm => gm.gatewayId === lockedGwId)
    if (lockedTerminals.length === 0) {
      showToast('Locked gateway terminal not available for this merchant', 'error')
      return
    }
    const gwName = gatewayData.find(g => g.id === lockedGwId)?.shortName || 'Gateway'
    const offerRule = {
      id: `rule-${merchant.id}-offer-${Date.now()}`,
      name: `CC → ${gwName} (Offer)`,
      type: 'conditional',
      enabled: true,
      priority: 0,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'CC' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: [lockedTerminals[0].terminalId], splits: [] },
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'anugrah.sharma@razorpay.com',
    }
    addRule(merchant.id, offerRule)
  }, [merchant, addRule, showToast])

  return (
    <>
      {/* ── Primary Routing Decision ────────────────── */}
      {routingMode !== 'cost' && (
        <div className="kam-routing-decision">
          <div className="kam-routing-decision-header">
            <h3>Routing Strategy</h3>
            <p>Choose how transactions should be routed for this merchant.</p>
          </div>
          <div className="kam-routing-decision-cards">
            <div
              className={`kam-routing-decision-card${routingMode === 'sr' ? ' selected' : ''}`}
              onClick={() => setRoutingMode('sr')}
            >
              <div className="kam-routing-decision-card-icon sr">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <div className="kam-routing-decision-card-content">
                <strong>Optimize for Success Rate</strong>
                <span>Doppler ML routes to the highest-SR terminal automatically. No manual rules needed.</span>
              </div>
              {routingMode === 'sr' && (
                <div className="kam-routing-decision-check">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>
            <div
              className={`kam-routing-decision-card${routingMode === 'cost' ? ' selected' : ''}`}
              onClick={() => setRoutingMode('cost')}
            >
              <div className="kam-routing-decision-card-icon cost">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="kam-routing-decision-card-content">
                <strong>Save Cost / Custom Rules</strong>
                <span>Override Doppler with manual rules — reduce cost, meet TSP targets, or enable bank offers.</span>
              </div>
            </div>
          </div>

          {/* SR-selected state */}
          {routingMode === 'sr' && (
            <div className="kam-routing-sr-state">
              <div className="kam-routing-sr-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <h4>Doppler is managing routing</h4>
              <p>Transactions are automatically routed to the terminal with the highest predicted success rate. The ML model adapts in real-time based on live SR data, downtime signals, and network conditions.</p>
              <div className="kam-routing-sr-stats">
                <div className="kam-routing-sr-stat">
                  <span className="kam-routing-sr-stat-value">{merchant.avgPaymentSuccessRate?.toFixed(1) || '—'}%</span>
                  <span className="kam-routing-sr-stat-label">Current SR</span>
                </div>
                <div className="kam-routing-sr-stat">
                  <span className="kam-routing-sr-stat-value">{merchant.gatewayMetrics?.length || 0}</span>
                  <span className="kam-routing-sr-stat-label">Active Terminals</span>
                </div>
                <div className="kam-routing-sr-stat">
                  <span className="kam-routing-sr-stat-value">Auto</span>
                  <span className="kam-routing-sr-stat-label">Failover</span>
                </div>
              </div>
              <button className="kam-btn kam-btn-secondary" style={{ marginTop: 16 }} onClick={() => setRoutingMode('cost')}>
                Switch to Custom Rules
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Rules Content (only when cost mode) ──── */}
      {routingMode === 'cost' && (
      <>

      {/* Cost-Saving Mode bar moved inside Routing Rules card below */}

      {/* ── NTF Guard Banner ─────────────────────────── */}
      {ntfGaps.hasGaps && (
        <div className="kam-rules-ntf-banner">
          <div className="kam-rules-ntf-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <strong>NTF Risk Detected</strong>
            <span className="kam-badge danger">{ntfGaps.gaps.length} gap{ntfGaps.gaps.length !== 1 ? 's' : ''}</span>
          </div>
          <p>The current rule set has coverage gaps that could cause payment failures:</p>
          <ul className="kam-rules-ntf-list">
            {ntfGaps.gaps.map((gap, i) => (
              <li key={i}>
                {gap.method && <span className="kam-badge neutral" style={{ marginRight: 6 }}>{gap.method}</span>}
                {gap.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── GMV Commitment Card (TSP only) ────────────── */}
      {merchant.dealType === 'tsp' && tspCompliance && (
        <div className="kam-rules-commitment-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              GMV Commitment — {tspCompliance.lockedGatewayName}
            </h3>
            <span className={`kam-badge ${tspCompliance.status === 'on_track' ? 'success' : tspCompliance.status === 'at_risk' ? 'warning' : 'danger'}`}>
              {tspCompliance.status === 'on_track' ? 'On Track' : tspCompliance.status === 'at_risk' ? 'At Risk' : 'Off Track'}
            </span>
          </div>
          <div className="kam-rules-commitment-body">
            <div className="kam-rules-commitment-metrics">
              <div className="kam-rules-commitment-metric">
                <span className="label">Annual Target</span>
                <span className="value">{formatINR(tspCompliance.gmvCommitment)}</span>
              </div>
              <div className="kam-rules-commitment-metric">
                <span className="label">Projected Annual</span>
                <span className="value">{formatINR(tspCompliance.projectedAnnualGMV)}</span>
              </div>
              <div className="kam-rules-commitment-metric">
                <span className="label">Current Traffic</span>
                <span className="value">{tspCompliance.actualTrafficPct}%</span>
              </div>
              <div className="kam-rules-commitment-metric">
                <span className="label">Suggested Traffic</span>
                <span className="value" style={{ color: 'var(--rzp-blue)' }}>{tspCompliance.suggestedTrafficPct}%</span>
              </div>
            </div>
            <div className="kam-rules-commitment-progress">
              <div className="kam-rules-progress-bar">
                <div
                  className={`kam-rules-progress-fill ${tspCompliance.status}`}
                  style={{ width: `${Math.min(100, (tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100)}%` }}
                />
              </div>
              <span className="kam-rules-progress-label">
                {((tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100).toFixed(0)}% of target
              </span>
            </div>
            {tspCompliance.status !== 'on_track' && (
              <button className="kam-btn kam-btn-primary" style={{ marginTop: 12, fontSize: 13 }} onClick={handleApplySuggestedSplit}>
                Apply Suggested Split ({tspCompliance.suggestedTrafficPct}% → {tspCompliance.lockedGatewayName})
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Offer Routing Card (offer-linked only) ─────── */}
      {merchant.dealType === 'offer_linked' && merchant.dealDetails && (
        <div className="kam-rules-offer-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              Offer Routing
            </h3>
            <span className={`kam-badge ${hasOfferRule ? 'success' : 'warning'}`}>
              {hasOfferRule ? 'Rule Active' : 'Rule Missing'}
            </span>
          </div>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
            {merchant.dealDetails.description}
          </p>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-primary)', marginBottom: 12 }}>
            <span><strong>Constraint:</strong> {merchant.dealDetails.constraint}</span>
            <span><strong>Expires:</strong> {merchant.dealDetails.expiresAt}</span>
          </div>
          {!hasOfferRule && (
            <button className="kam-btn kam-btn-primary" style={{ fontSize: 13 }} onClick={handleCreateOfferRule}>
              Create Offer Rule
            </button>
          )}
        </div>
      )}

      {/* ── Grouped Rule List ──────────────────────────── */}
      <div className="kam-detail-card">
        <div className="kam-card-header">
          <h3 className="kam-card-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Routing Rules
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="kam-badge deal-tsp" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Cost-Saving Mode
            </span>
            <button className="kam-btn kam-btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setRoutingMode('sr')}>
              Switch to SR-Optimized
            </button>
            <button className="kam-btn kam-btn-primary kam-rules-add-btn" onClick={() => handleOpenBuilder()}>
              + Add Rule
            </button>
          </div>
        </div>
        <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
          Rules grouped by payment method. Empty slots show where Doppler manages routing by default.
        </p>

        <div className="kam-rule-groups">
          {groupedRules.groups.map(({ groupDef, rules: groupRulesList, subMethodRules }) => {
            const isOpen = groupDef.alwaysExpanded || expandedGroups[groupDef.key]
            const ruleCount = groupRulesList.length

            // Icon SVGs for each group type
            const groupIcon = {
              layers: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
              smartphone: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
              'credit-card': <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
              globe: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
              grid: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
            }[groupDef.icon]

            // Render a single rule card (extracted for reuse)
            const renderRuleCard = (rule) => {
              const globalIdx = nonDefaultRules.indexOf(rule)
              return (
                <div key={rule.id} className={`kam-rule-card ${rule.type === 'volume_split' ? 'volume-split' : 'conditional'}${!rule.enabled ? ' disabled' : ''}`}>
                  <div className="kam-rule-card-header">
                    <div className="kam-rule-left">
                      <span className="kam-rule-priority">#{globalIdx + 1}</span>
                      <span className="kam-rule-name">{rule.name}</span>
                      <span className={`kam-badge ${rule.type === 'volume_split' ? 'deal-tsp' : 'info'}`} style={{ fontSize: 11 }}>
                        {rule.type === 'volume_split' ? 'Volume Split' : 'Conditional'}
                      </span>
                    </div>
                    <div className="kam-rule-actions">
                      <button className="kam-rule-move-btn" title="Move up" disabled={globalIdx === 0} onClick={() => handleMoveRule(rule.id, 'up')}>↑</button>
                      <button className="kam-rule-move-btn" title="Move down" disabled={globalIdx === nonDefaultRules.length - 1} onClick={() => handleMoveRule(rule.id, 'down')}>↓</button>
                      <label className="kam-rule-toggle">
                        <input type="checkbox" checked={rule.enabled} onChange={() => toggleRuleEnabled(merchant.id, rule.id)} />
                        <span className="kam-rule-toggle-slider" />
                      </label>
                      <button className="kam-rule-edit-btn" title="Edit" onClick={() => handleOpenBuilder(rule)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button className="kam-rule-delete-btn" title="Delete" onClick={() => deleteRule(merchant.id, rule.id)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                  {rule.conditions.length > 0 && (
                    <div className="kam-rule-conditions">
                      <span className="kam-rule-if">IF</span>
                      {rule.conditions.map((c, ci) => (
                        <React.Fragment key={ci}>
                          {ci > 0 && <span className="kam-rule-logic">{rule.conditionLogic}</span>}
                          <span className="kam-rule-condition-chip">
                            {RULE_CONDITIONS[c.field]?.label || c.field} {RULE_OPERATOR_LABELS[c.operator] || c.operator} {
                              Array.isArray(c.value) ? `${c.value[0]}–${c.value[1]}` : c.value
                            }
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  <div className="kam-rule-action">
                    {rule.action.type === 'route' ? (
                      <>
                        <span className="kam-rule-then">THEN Route to:</span>
                        {rule.action.terminals.map((tid, i) => {
                          const info = getTerminalGatewayInfo(tid)
                          return (
                            <React.Fragment key={tid}>
                              {i > 0 && <span className="kam-rule-arrow">→</span>}
                              <span className="kam-rule-terminal-chip">{info?.displayId || tid} <span className="muted">({info?.gatewayShort || '??'})</span></span>
                            </React.Fragment>
                          )
                        })}
                      </>
                    ) : (
                      <>
                        <span className="kam-rule-then">THEN Split:</span>
                        {rule.action.splits.map((s, i) => {
                          const info = getTerminalGatewayInfo(s.terminalId)
                          return (
                            <React.Fragment key={s.terminalId}>
                              {i > 0 && <span className="kam-rule-split-dot">·</span>}
                              <span className="kam-rule-terminal-chip">{info?.displayId || s.terminalId} ({s.percentage}%)</span>
                            </React.Fragment>
                          )
                        })}
                      </>
                    )}
                  </div>
                  {rule.action.type === 'route' && rule.action.srThreshold > 0 && rule.action.terminals.length > 1 && (
                    <div className="kam-rule-threshold-indicator">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      Fallback if SR &lt; {rule.action.srThreshold}% (min {rule.action.minPaymentCount || 0} payments)
                    </div>
                  )}
                  <div className="kam-rule-meta">
                    Created {new Date(rule.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} by {rule.createdBy.split('@')[0]}
                  </div>
                </div>
              )
            }

            return (
              <div key={groupDef.key} className={`kam-rule-group${isOpen ? ' open' : ''}`}>
                {/* Group Header */}
                <div
                  className="kam-rule-group-header"
                  onClick={groupDef.alwaysExpanded ? undefined : () => toggleGroup(groupDef.key)}
                  style={groupDef.alwaysExpanded ? { cursor: 'default' } : undefined}
                >
                  <div className="kam-rule-group-left">
                    {!groupDef.alwaysExpanded && (
                      <span className="kam-rule-group-chevron">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    )}
                    <span className="kam-rule-group-icon">{groupIcon}</span>
                    <span className="kam-rule-group-label">{groupDef.label}</span>
                    <span className={`kam-badge ${ruleCount > 0 ? 'info' : 'neutral'}`} style={{ fontSize: 11 }}>
                      {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
                    </span>
                  </div>
                </div>

                {/* Group Body */}
                {isOpen && (
                  <div className="kam-rule-group-body">
                    {/* Groups with sub-methods (UPI, CC, DC) */}
                    {groupDef.subMethods.length > 0 ? (
                      <>
                        {/* Rules that match the group but not a specific sub-method */}
                        {groupRulesList.filter(r => {
                          const subCond = r.conditions.find(c => c.field === groupDef.subMethodField)
                          return !subCond
                        }).map(rule => renderRuleCard(rule))}

                        {/* Sub-method sections */}
                        {groupDef.subMethods.map(sm => {
                          const smRules = subMethodRules.get(sm.value) || []
                          return (
                            <div key={sm.value} className="kam-rule-submethod">
                              <div className="kam-rule-submethod-header">
                                <span className="kam-rule-submethod-label">{sm.label}</span>
                                {smRules.length > 0 && (
                                  <span className="kam-badge info" style={{ fontSize: 10 }}>{smRules.length}</span>
                                )}
                              </div>
                              {smRules.length > 0 ? (
                                smRules.map(rule => renderRuleCard(rule))
                              ) : (
                                <div className="kam-rule-submethod-empty">
                                  <span className="kam-rule-empty-sr">
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                    SR-Optimized (default)
                                  </span>
                                  <button
                                    className="kam-rule-submethod-add"
                                    onClick={() => handleOpenBuilder(null, {
                                      paymentMethod: groupDef.methodValues?.[0],
                                      subMethodField: groupDef.subMethodField,
                                      subMethodValue: sm.value,
                                    })}
                                  >
                                    + Add rule
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </>
                    ) : (
                      /* Groups without sub-methods (NB, All Transactions, All Methods) */
                      <>
                        {groupRulesList.length > 0 ? (
                          groupRulesList.map(rule => renderRuleCard(rule))
                        ) : (
                          <div className="kam-rule-submethod-empty">
                            <span className="kam-rule-empty-sr">
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                    SR-Optimized (default)
                                  </span>
                            <button
                              className="kam-rule-submethod-add"
                              onClick={() => handleOpenBuilder(null, groupDef.methodValues?.[0] ? {
                                paymentMethod: groupDef.methodValues[0],
                                subMethodField: null,
                                subMethodValue: null,
                              } : null)}
                            >
                              + Add rule
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}

        </div>
      </div>

      {/* ── Rule Builder Full-Page Overlay ───────────────────────── */}
      {showRuleBuilder && (
        <div className="kam-rule-builder-overlay">
          {/* Header */}
          <div className="kam-rule-builder-overlay-header">
            <button className="kam-rule-builder-back-btn" onClick={() => setShowRuleBuilder(false)}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              Back to Rules
            </button>
            <h2 className="kam-rule-builder-overlay-title">{editingRule ? 'Edit Rule' : 'Create New Rule'}</h2>
            <span className="kam-rule-builder-overlay-merchant">{merchant.name}</span>
          </div>

          {/* Mode Toggle (only for new rules) */}
          {!editingRule && (
            <div className="kam-rule-builder-mode-toggle">
              <button className={`kam-rule-builder-mode-btn${builderMode === 'ai' ? ' active' : ''}`} onClick={() => setBuilderMode('ai')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 1-1.5 1.5H16v4a4 4 0 0 1-8 0v-4H7.5A1.5 1.5 0 0 1 6 10.5V9a2 2 0 0 1 2-2V6a4 4 0 0 1 4-4z"/><circle cx="10" cy="12" r="1"/><circle cx="14" cy="12" r="1"/></svg>
                AI-Assisted
              </button>
              <button className={`kam-rule-builder-mode-btn${builderMode === 'manual' ? ' active' : ''}`} onClick={() => setBuilderMode('manual')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Manual
              </button>
            </div>
          )}

          {/* Body */}
          <div className="kam-rule-builder-overlay-body">

            {/* ═══ AI-Assisted Mode ═══ */}
            {builderMode === 'ai' && !editingRule && (
              <div className="kam-rule-builder-ai-layout">
                {/* Left Pane: Conversation */}
                <div className="kam-rule-builder-ai-conversation">
                  <div className="kam-rule-ai-messages">
                    {aiMessages.length === 0 && (
                      <div className="kam-rule-ai-empty">
                        <div className="kam-rule-ai-empty-icon">
                          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--rzp-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 1-1.5 1.5H16v4a4 4 0 0 1-8 0v-4H7.5A1.5 1.5 0 0 1 6 10.5V9a2 2 0 0 1 2-2V6a4 4 0 0 1 4-4z"/><circle cx="10" cy="12" r="1"/><circle cx="14" cy="12" r="1"/></svg>
                        </div>
                        <h4>Describe your routing rule</h4>
                        <p>Tell me what you want to achieve and I'll suggest a rule configuration.</p>
                        <div className="kam-rule-ai-examples">
                          <span onClick={() => setAiInput('Route Visa credit cards above ₹5,000 to HDFC terminal')}>"Route Visa CC above ₹5,000 to HDFC"</span>
                          <span onClick={() => setAiInput('Split 70% traffic to HDFC and 30% to ICICI')}>"Split 70% to HDFC, 30% to ICICI"</span>
                          <span onClick={() => setAiInput('Route UPI payments to Axis terminal')}>"Route UPI to Axis terminal"</span>
                        </div>
                      </div>
                    )}
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`kam-rule-ai-message ${msg.role}`}>
                        <div className="kam-rule-ai-message-bubble">
                          {msg.text}
                          {msg.role === 'assistant' && msg.confidence !== undefined && (
                            <div className={`kam-rule-ai-confidence ${msg.confidence >= 0.6 ? 'high' : msg.confidence >= 0.3 ? 'medium' : 'low'}`}>
                              {msg.confidence >= 0.6 ? 'High confidence' : msg.confidence >= 0.3 ? 'Medium confidence' : 'Low confidence'}
                            </div>
                          )}
                          {msg.warnings && msg.warnings.length > 0 && (
                            <div className="kam-rule-ai-warnings">
                              {msg.warnings.map((w, wi) => <div key={wi} className="kam-rule-ai-warning-item">⚠ {w}</div>)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isAiProcessing && (
                      <div className="kam-rule-ai-message assistant">
                        <div className="kam-rule-ai-message-bubble kam-rule-ai-typing">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="kam-rule-ai-input-row">
                    <input
                      type="text"
                      className="kam-rule-ai-input"
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAiSubmit()}
                      placeholder="Describe the routing rule you want to create..."
                      disabled={isAiProcessing}
                    />
                    <button className="kam-btn kam-btn-primary kam-rule-ai-submit" onClick={handleAiSubmit} disabled={!aiInput.trim() || isAiProcessing}>
                      Suggest
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </button>
                  </div>
                </div>

                {/* Right Pane: Rule Preview */}
                <div className="kam-rule-builder-ai-preview">
                  <h4 className="kam-rule-ai-preview-title">Rule Preview</h4>
                  {!aiSuggestion?.suggestedRule ? (
                    <div className="kam-rule-ai-preview-empty">
                      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--rzp-border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                      <p>Your rule preview will appear here after you describe what you want.</p>
                    </div>
                  ) : (
                    <div className="kam-rule-ai-preview-card">
                      <div className="kam-rule-ai-preview-row">
                        <span className="kam-rule-ai-preview-label">Name</span>
                        <span className="kam-rule-ai-preview-value">{aiSuggestion.suggestedRule.name}</span>
                      </div>
                      <div className="kam-rule-ai-preview-row">
                        <span className="kam-rule-ai-preview-label">Type</span>
                        <span className={`kam-badge ${aiSuggestion.suggestedRule.type === 'conditional' ? 'info' : 'warning'}`}>
                          {aiSuggestion.suggestedRule.type === 'conditional' ? 'Conditional' : 'Volume Split'}
                        </span>
                      </div>
                      {aiSuggestion.suggestedRule.conditions.length > 0 && (
                        <div className="kam-rule-ai-preview-row kam-rule-ai-preview-conditions">
                          <span className="kam-rule-ai-preview-label">Conditions</span>
                          <div className="kam-rule-ai-preview-cond-list">
                            {aiSuggestion.suggestedRule.conditions.map((c, ci) => (
                              <div key={ci} className="kam-rule-ai-preview-cond-item">
                                <span className="kam-rule-ai-cond-field">{RULE_CONDITIONS[c.field]?.label || c.field}</span>
                                <span className="kam-rule-ai-cond-op">{RULE_OPERATOR_LABELS[c.operator] || c.operator}</span>
                                <span className="kam-rule-ai-cond-val">{c.operator === 'between' ? `${c.value} - ${c.valueTo}` : String(c.value)}</span>
                                {ci < aiSuggestion.suggestedRule.conditions.length - 1 && (
                                  <span className="kam-rule-ai-cond-logic">{aiSuggestion.suggestedRule.conditionLogic || 'AND'}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="kam-rule-ai-preview-row">
                        <span className="kam-rule-ai-preview-label">Action</span>
                        <div className="kam-rule-ai-preview-action">
                          {aiSuggestion.suggestedRule.action?.type === 'route' ? (
                            <div className="kam-rule-ai-preview-terminals">
                              {(aiSuggestion.suggestedRule.action.terminals || []).map((tid, i) => (
                                <span key={tid} className="kam-rule-ai-terminal-chip">
                                  {i > 0 && <span className="kam-rule-ai-arrow">→</span>}
                                  {getTerminalDisplayId(tid)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="kam-rule-ai-preview-splits">
                              {(aiSuggestion.suggestedRule.action?.splits || []).map(s => (
                                <span key={s.terminalId} className="kam-rule-ai-split-chip">
                                  {getTerminalDisplayId(s.terminalId)} ({s.percentage}%)
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {aiSuggestion.suggestedRule.action?.srThreshold > 0 && (
                        <div className="kam-rule-ai-preview-row">
                          <span className="kam-rule-ai-preview-label">SR Fallback</span>
                          <span className="kam-rule-ai-preview-value">
                            Below {aiSuggestion.suggestedRule.action.srThreshold}% (min {aiSuggestion.suggestedRule.action.minPaymentCount} payments)
                          </span>
                        </div>
                      )}
                      <div className="kam-rule-ai-preview-actions">
                        <button className="kam-btn kam-btn-secondary" onClick={handleEditManually}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit Manually
                        </button>
                        <button className="kam-btn kam-btn-primary" onClick={handleSaveFromAi} disabled={aiSuggestion.confidence < 0.3}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Save Rule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ Manual Mode — Wizard ═══ */}
            {(builderMode === 'manual' || editingRule) && (
              <div className="kam-rule-builder-manual-layout">

                {/* ── Wizard Stepper ── */}
                <div className="kam-wizard-stepper">
                  {WIZARD_STEPS.map((step, i) => {
                    const isActive = wizardStep === i
                    const isCompleted = visitedSteps.has(i) && i < wizardStep
                    const isClickable = editingRule || visitedSteps.has(i)
                    return (
                      <React.Fragment key={step.key}>
                        {i > 0 && <div className={`kam-wizard-step-connector${i <= wizardStep ? ' active' : ''}`} />}
                        <div
                          className={`kam-wizard-step-indicator${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}${isClickable ? ' clickable' : ''}`}
                          onClick={() => isClickable && handleWizardJump(i)}
                        >
                          <div className="kam-wizard-step-dot">
                            {isCompleted ? (
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            ) : (
                              <span>{i + 1}</span>
                            )}
                          </div>
                          <span className="kam-wizard-step-label">{step.shortLabel}</span>
                        </div>
                      </React.Fragment>
                    )
                  })}
                </div>

                {/* ── Wizard Content ── */}
                <div className="kam-wizard-content">

                  {/* ── Step 0: Payment Method ── */}
                  {wizardStep === 0 && (
                    <div className="kam-wizard-step-panel">
                      <h3 className="kam-wizard-step-title">Select Payment Method</h3>
                      <p className="kam-wizard-step-desc">Choose the payment method this routing rule applies to.</p>
                      <div className="kam-guided-method-cards">
                        <div
                          className={`kam-guided-method-card${guidedState.paymentMethod === 'UPI' ? ' selected' : ''}`}
                          onClick={() => setGuidedState(prev => ({ ...INITIAL_GUIDED, paymentMethod: 'UPI' }))}
                        >
                          <div className="kam-guided-method-icon">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="5" width="20" height="14" rx="3"/>
                              <path d="M7 15l3-6 3 6M10 13H8"/>
                              <circle cx="17" cy="12" r="2"/>
                            </svg>
                          </div>
                          <strong>UPI</strong>
                          <span>Unified Payments Interface — one-time and autopay transactions via UPI apps</span>
                        </div>
                        <div
                          className={`kam-guided-method-card${guidedState.paymentMethod === 'cards' ? ' selected' : ''}`}
                          onClick={() => setGuidedState(prev => ({ ...INITIAL_GUIDED, paymentMethod: 'cards' }))}
                        >
                          <div className="kam-guided-method-icon">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="4" width="22" height="16" rx="3"/>
                              <line x1="1" y1="10" x2="23" y2="10"/>
                              <line x1="5" y1="15" x2="11" y2="15"/>
                            </svg>
                          </div>
                          <strong>Cards</strong>
                          <span>Credit and debit card transactions — Visa, Mastercard, RuPay, Amex, Diners</span>
                        </div>
                      </div>
                      {wizardStepErrors[0] && wizardStepErrors[0].length > 0 && (
                        <div className="kam-wizard-step-errors">
                          {wizardStepErrors[0].map((err, i) => <div key={i} className="kam-wizard-step-error">{err}</div>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Step 1: Transaction Filters (Adaptive) ── */}
                  {wizardStep === 1 && (
                    <div className="kam-wizard-step-panel">
                      <h3 className="kam-wizard-step-title">
                        {guidedState.paymentMethod === 'UPI' ? 'Refine UPI Transactions' : 'Refine Card Transactions'}
                      </h3>
                      <p className="kam-wizard-step-desc">
                        Narrow down which transactions this rule targets. All filters are optional — skip to match all {guidedState.paymentMethod === 'UPI' ? 'UPI' : 'card'} transactions.
                      </p>

                      <div className="kam-guided-filter-section">

                        {/* ── UPI Path ── */}
                        {guidedState.paymentMethod === 'UPI' && (
                          <div className="kam-guided-filter-group">
                            <div className="kam-guided-filter-label">UPI Type</div>
                            <div className="kam-guided-filter-hint">Select a specific UPI flow, or leave on "Any" to match all.</div>
                            <div className="kam-guided-chip-group">
                              {[{ value: null, label: 'Any' }, { value: 'one_time', label: 'One-time' }, { value: 'autopay', label: 'Autopay' }].map(opt => (
                                <button
                                  key={opt.label}
                                  className={`kam-guided-chip${guidedState.upiFlow === opt.value ? ' selected' : ''}`}
                                  onClick={() => setGuidedState(prev => ({ ...prev, upiFlow: opt.value }))}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── Cards Path ── */}
                        {guidedState.paymentMethod === 'cards' && (
                          <>
                            {/* Card Type */}
                            <div className="kam-guided-filter-group">
                              <div className="kam-guided-filter-label">Card Type</div>
                              <div className="kam-guided-filter-hint">Credit, debit, or any card type.</div>
                              <div className="kam-guided-chip-group">
                                {[{ value: null, label: 'Any' }, { value: 'credit', label: 'Credit Card' }, { value: 'debit', label: 'Debit Card' }].map(opt => (
                                  <button
                                    key={opt.label}
                                    className={`kam-guided-chip${guidedState.cardType === opt.value ? ' selected' : ''}`}
                                    onClick={() => setGuidedState(prev => ({ ...prev, cardType: opt.value }))}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Card Network */}
                            <div className="kam-guided-filter-group">
                              <div className="kam-guided-filter-label">Card Network</div>
                              <div className="kam-guided-filter-hint">Select one or more networks. Leave empty to match all networks.</div>
                              <div className="kam-guided-chip-group">
                                {['Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners'].map(nw => (
                                  <button
                                    key={nw}
                                    className={`kam-guided-chip${guidedState.cardNetworks.includes(nw) ? ' selected' : ''}`}
                                    onClick={() => setGuidedState(prev => ({
                                      ...prev,
                                      cardNetworks: prev.cardNetworks.includes(nw)
                                        ? prev.cardNetworks.filter(n => n !== nw)
                                        : [...prev.cardNetworks, nw],
                                    }))}
                                  >
                                    {nw}
                                  </button>
                                ))}
                              </div>
                              {guidedState.cardNetworks.length > 0 && (
                                <div className="kam-guided-filter-selection-summary">
                                  Selected: {guidedState.cardNetworks.join(', ')}
                                  <button className="kam-guided-clear-btn" onClick={() => setGuidedState(prev => ({ ...prev, cardNetworks: [] }))}>Clear</button>
                                </div>
                              )}
                            </div>

                            {/* Issuer Bank */}
                            <div className="kam-guided-filter-group">
                              <div className="kam-guided-filter-label">Issuer Bank</div>
                              <div className="kam-guided-filter-hint">Filter by issuing bank, or leave on "Any" for all issuers.</div>
                              <div className="kam-guided-chip-group">
                                {[{ value: null, label: 'Any' }, { value: 'HDFC', label: 'HDFC' }, { value: 'ICICI', label: 'ICICI' }, { value: 'SBI', label: 'SBI' }, { value: 'Axis', label: 'Axis' }, { value: 'Kotak', label: 'Kotak' }].map(opt => (
                                  <button
                                    key={opt.label}
                                    className={`kam-guided-chip${guidedState.issuerBank === opt.value ? ' selected' : ''}`}
                                    onClick={() => setGuidedState(prev => ({ ...prev, issuerBank: opt.value }))}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                      </div>

                      {wizardStepErrors[1] && wizardStepErrors[1].length > 0 && (
                        <div className="kam-wizard-step-errors">
                          {wizardStepErrors[1].map((err, i) => <div key={i} className="kam-wizard-step-error">{err}</div>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Step 2: Objective ── */}
                  {wizardStep === 2 && (
                    <div className="kam-wizard-step-panel">
                      <h3 className="kam-wizard-step-title">What's Your Routing Objective?</h3>
                      <p className="kam-wizard-step-desc">Select the goal for this routing rule. This determines the recommended strategy in the next step.</p>
                      <div className="kam-guided-objective-cards">
                        {OBJECTIVES.map(obj => (
                          <div
                            key={obj.value}
                            className={`kam-guided-objective-card${guidedState.objective === obj.value ? ' selected' : ''}`}
                            onClick={() => setGuidedState(prev => ({ ...prev, objective: obj.value }))}
                          >
                            <div className="kam-guided-objective-icon">
                              {obj.icon === 'sr' && (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                              )}
                              {obj.icon === 'cost' && (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                              )}
                              {obj.icon === 'tsp' && (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                              )}
                              {obj.icon === 'offer' && (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                              )}
                            </div>
                            <div className="kam-guided-objective-content">
                              <strong>{obj.label}</strong>
                              <span>{obj.desc}</span>
                            </div>
                            {guidedState.objective === obj.value && (
                              <div className="kam-guided-objective-check">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {guidedState.objective && (
                        <div className="kam-guided-objective-suggestion">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                          {OBJECTIVES.find(o => o.value === guidedState.objective)?.suggestion}
                        </div>
                      )}
                      {wizardStepErrors[2] && wizardStepErrors[2].length > 0 && (
                        <div className="kam-wizard-step-errors">
                          {wizardStepErrors[2].map((err, i) => <div key={i} className="kam-wizard-step-error">{err}</div>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Step 3: Routing ── */}
                  {wizardStep === 3 && (
                    <div className="kam-wizard-step-panel">
                      <h3 className="kam-wizard-step-title">
                        {ruleForm.type === 'conditional' ? 'Select Terminal Priority' : 'Configure Traffic Split'}
                      </h3>
                      <p className="kam-wizard-step-desc">
                        {ruleForm.type === 'conditional'
                          ? 'Terminals are pre-sorted based on your objective. Reorder or change as needed.'
                          : 'Set traffic percentages for each terminal to meet your GMV commitment.'}
                      </p>

                      {/* Show routing strategy badge (derived from objective) */}
                      <div className="kam-guided-filter-group" style={{ marginBottom: 20 }}>
                        <div className="kam-guided-filter-label">
                          Strategy:
                          <span className={`kam-badge ${ruleForm.type === 'conditional' ? 'info' : 'warning'}`} style={{ marginLeft: 8 }}>
                            {ruleForm.type === 'conditional' ? 'Conditional Priority' : 'Volume Split'}
                          </span>
                        </div>
                      </div>

                      {/* SR Threshold Fallback (conditional only) */}
                      {ruleForm.type === 'conditional' && (
                        <div className="kam-rule-builder-field" style={{ marginBottom: 20 }}>
                          <label>SR Threshold Fallback</label>
                          <div className="kam-rule-builder-threshold">
                            <p className="kam-rule-builder-threshold-desc">
                              If a terminal's SR drops below the threshold (with enough payment data), traffic automatically falls to the next terminal in the stack.
                            </p>
                            <div className="kam-rule-builder-threshold-inputs">
                              <div className="kam-rule-builder-threshold-field">
                                <label>Min SR</label>
                                <div className="kam-rule-builder-threshold-input-wrap">
                                  <input type="number" min="0" max="100" value={ruleForm.srThreshold} onChange={e => setRuleForm(p => ({ ...p, srThreshold: Number(e.target.value) || 0 }))} />
                                  <span className="kam-rule-builder-threshold-unit">%</span>
                                </div>
                              </div>
                              <div className="kam-rule-builder-threshold-field">
                                <label>Min Payments</label>
                                <div className="kam-rule-builder-threshold-input-wrap">
                                  <input type="number" min="0" value={ruleForm.minPaymentCount} onChange={e => setRuleForm(p => ({ ...p, minPaymentCount: Number(e.target.value) || 0 }))} />
                                  <span className="kam-rule-builder-threshold-unit">txns</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Terminal Selection */}
                      <div className="kam-rule-builder-field">
                        <label>{ruleForm.type === 'conditional' ? 'Terminal Priority Order' : 'Split Percentages'}</label>
                        {ruleForm.type === 'conditional' ? (
                          <div className="kam-rule-builder-terminals">
                            {ruleForm.terminals.length > 0 && (
                              <div className="kam-rule-builder-ranked-list">
                                {ruleForm.terminals.map((tid, idx) => {
                                  const t = availableTerminals.find(at => at.terminalId === tid)
                                  return (
                                    <div key={tid} className="kam-rule-ranked-item">
                                      <span className="kam-rule-ranked-pos">{idx + 1}</span>
                                      <span className="kam-rule-terminal-id">{t?.displayId || tid}</span>
                                      <span className="kam-rule-terminal-gw">{t?.gatewayShort || '??'}</span>
                                      <span className="kam-rule-terminal-sr">SR {t?.successRate || '?'}%</span>
                                      <span className="kam-rule-terminal-cost">₹{t?.costPerTxn?.toFixed(2) || '?'}</span>
                                      <div className="kam-rule-ranked-controls">
                                        <button className="kam-rule-move-btn" disabled={idx === 0}
                                          onClick={() => setRuleForm(prev => { const arr = [...prev.terminals]; [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; return { ...prev, terminals: arr } })}
                                          title="Move up">↑</button>
                                        <button className="kam-rule-move-btn" disabled={idx === ruleForm.terminals.length - 1}
                                          onClick={() => setRuleForm(prev => { const arr = [...prev.terminals]; [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; return { ...prev, terminals: arr } })}
                                          title="Move down">↓</button>
                                        <button className="kam-rule-builder-remove-btn" onClick={() => toggleTerminal(tid)} title="Remove">×</button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            {availableTerminals.filter(t => !ruleForm.terminals.includes(t.terminalId)).length > 0 && (
                              <div className="kam-rule-builder-add-terminals">
                                {availableTerminals.filter(t => !ruleForm.terminals.includes(t.terminalId)).map(t => (
                                  <button key={t.terminalId} className="kam-rule-add-terminal-btn" onClick={() => toggleTerminal(t.terminalId)}>
                                    + {t.displayId} <span className="muted">({t.gatewayShort})</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {ruleForm.terminals.length === 0 && (
                              <p className="kam-rule-builder-hint">Click a terminal below to add it to the route. First terminal is highest priority.</p>
                            )}
                          </div>
                        ) : (
                          <div className="kam-rule-builder-splits">
                            {ruleForm.splits.map(s => {
                              const t = availableTerminals.find(at => at.terminalId === s.terminalId)
                              return (
                                <div key={s.terminalId} className="kam-rule-split-row">
                                  <span className="kam-rule-terminal-id">{t?.displayId || s.terminalId}</span>
                                  <span className="kam-rule-terminal-gw">{t?.gatewayShort || '??'}</span>
                                  <input type="number" min="0" max="100" value={s.percentage} onChange={e => updateSplitPct(s.terminalId, e.target.value)} className="kam-rule-split-input" />
                                  <span>%</span>
                                  <button className="kam-rule-builder-remove-btn" onClick={() => removeSplit(s.terminalId)}>×</button>
                                </div>
                              )
                            })}
                            <div className="kam-rule-split-total">
                              Total: {ruleForm.splits.reduce((s, sp) => s + sp.percentage, 0)}%
                              {ruleForm.splits.reduce((s, sp) => s + sp.percentage, 0) !== 100 && (
                                <span style={{ color: 'var(--rzp-danger)', marginLeft: 8 }}>Must equal 100%</span>
                              )}
                            </div>
                            <div className="kam-rule-builder-add-split">
                              {availableTerminals.filter(t => !ruleForm.splits.some(s => s.terminalId === t.terminalId)).map(t => (
                                <button key={t.terminalId} className="kam-btn kam-btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => addSplit(t.terminalId)}>
                                  + {t.displayId}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step validation errors */}
                      {wizardStepErrors[3] && wizardStepErrors[3].length > 0 && (
                        <div className="kam-wizard-step-errors">
                          {wizardStepErrors[3].map((err, i) => <div key={i} className="kam-wizard-step-error">{err}</div>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Step 4: Review & Save ── */}
                  {wizardStep === 4 && (
                    <div className="kam-wizard-step-panel">
                      <h3 className="kam-wizard-step-title">Review & Save</h3>
                      <p className="kam-wizard-step-desc">Review your rule configuration. Click any section to jump back and edit.</p>

                      {/* Rule Name */}
                      <div className="kam-rule-builder-field" style={{ marginBottom: 20 }}>
                        <label>Rule Name</label>
                        <input type="text" value={ruleForm.name} onChange={e => setRuleForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. UPI One-time [SR-Opt] → HDFC" />
                      </div>

                      {/* Summary Card */}
                      <div className="kam-wizard-review-card">
                        {/* Payment Method */}
                        <div className="kam-wizard-review-row" onClick={() => handleWizardJump(0)} style={{ cursor: 'pointer' }}>
                          <span className="kam-wizard-review-label">Payment Method</span>
                          <span className="kam-wizard-review-value">
                            <span className="kam-badge info">{guidedState.paymentMethod === 'UPI' ? 'UPI' : 'Cards'}</span>
                          </span>
                          <span className="kam-wizard-review-edit">Edit</span>
                        </div>

                        {/* Transaction Filters */}
                        <div className="kam-wizard-review-row" onClick={() => handleWizardJump(1)} style={{ cursor: 'pointer' }}>
                          <span className="kam-wizard-review-label">Filters</span>
                          <span className="kam-wizard-review-value">
                            {(() => {
                              const chips = []
                              if (guidedState.paymentMethod === 'UPI' && guidedState.upiFlow) {
                                chips.push(guidedState.upiFlow === 'one_time' ? 'One-time' : 'Autopay')
                              }
                              if (guidedState.paymentMethod === 'cards') {
                                if (guidedState.cardType) chips.push(guidedState.cardType === 'credit' ? 'Credit' : 'Debit')
                                if (guidedState.cardNetworks.length > 0) chips.push(guidedState.cardNetworks.join(', '))
                                if (guidedState.issuerBank) chips.push(guidedState.issuerBank)
                              }
                              return chips.length === 0 ? (
                                <span style={{ color: 'var(--rzp-text-muted)' }}>No filters (all {guidedState.paymentMethod === 'UPI' ? 'UPI' : 'card'} transactions)</span>
                              ) : (
                                <div className="kam-wizard-review-chips">
                                  {chips.map((c, i) => <span key={i} className="kam-wizard-review-chip">{c}</span>)}
                                </div>
                              )
                            })()}
                          </span>
                          <span className="kam-wizard-review-edit">Edit</span>
                        </div>

                        {/* Objective */}
                        <div className="kam-wizard-review-row" onClick={() => handleWizardJump(2)} style={{ cursor: 'pointer' }}>
                          <span className="kam-wizard-review-label">Objective</span>
                          <span className="kam-wizard-review-value">
                            <span className="kam-badge neutral">
                              {OBJECTIVES.find(o => o.value === guidedState.objective)?.label || '—'}
                            </span>
                          </span>
                          <span className="kam-wizard-review-edit">Edit</span>
                        </div>

                        {/* Routing */}
                        <div className="kam-wizard-review-row" onClick={() => handleWizardJump(3)} style={{ cursor: 'pointer' }}>
                          <span className="kam-wizard-review-label">
                            {ruleForm.type === 'conditional' ? 'Terminal Route' : 'Traffic Split'}
                          </span>
                          <span className="kam-wizard-review-value">
                            {ruleForm.type === 'conditional' ? (
                              ruleForm.terminals.length === 0 ? (
                                <span style={{ color: 'var(--rzp-danger)' }}>No terminals selected</span>
                              ) : (
                                <div className="kam-wizard-review-terminals">
                                  {ruleForm.terminals.map((tid, i) => {
                                    const t = availableTerminals.find(at => at.terminalId === tid)
                                    return (
                                      <React.Fragment key={tid}>
                                        {i > 0 && <span className="kam-wizard-review-arrow">→</span>}
                                        <span className="kam-wizard-review-chip">{t?.displayId || tid} ({t?.gatewayShort || '??'})</span>
                                      </React.Fragment>
                                    )
                                  })}
                                </div>
                              )
                            ) : (
                              ruleForm.splits.length === 0 ? (
                                <span style={{ color: 'var(--rzp-danger)' }}>No splits configured</span>
                              ) : (
                                <div className="kam-wizard-review-terminals">
                                  {ruleForm.splits.map(s => {
                                    const t = availableTerminals.find(at => at.terminalId === s.terminalId)
                                    return (
                                      <span key={s.terminalId} className="kam-wizard-review-chip">{t?.displayId || s.terminalId} ({t?.gatewayShort || '??'}) — {s.percentage}%</span>
                                    )
                                  })}
                                </div>
                              )
                            )}
                          </span>
                          <span className="kam-wizard-review-edit">Edit</span>
                        </div>

                        {/* SR Threshold (conditional only) */}
                        {ruleForm.type === 'conditional' && ruleForm.srThreshold > 0 && (
                          <div className="kam-wizard-review-row" onClick={() => handleWizardJump(3)} style={{ cursor: 'pointer' }}>
                            <span className="kam-wizard-review-label">SR Fallback</span>
                            <span className="kam-wizard-review-value">
                              Below {ruleForm.srThreshold}% (min {ruleForm.minPaymentCount} payments)
                            </span>
                            <span className="kam-wizard-review-edit">Edit</span>
                          </div>
                        )}
                      </div>

                      {/* Step validation errors */}
                      {wizardStepErrors[4] && wizardStepErrors[4].length > 0 && (
                        <div className="kam-wizard-step-errors">
                          {wizardStepErrors[4].map((err, i) => <div key={i} className="kam-wizard-step-error">{err}</div>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Wizard Footer ── */}
                <div className="kam-wizard-footer">
                  <button className="kam-btn kam-btn-secondary" onClick={handleWizardBack}>
                    {wizardStep === 0 ? 'Cancel' : (
                      <>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back
                      </>
                    )}
                  </button>
                  <span className="kam-wizard-footer-step">Step {wizardStep + 1} of {WIZARD_STEPS.length}</span>
                  <button className="kam-btn kam-btn-primary" onClick={handleWizardNext}>
                    {wizardStep === 4 ? (editingRule ? 'Update Rule' : 'Save Rule') : (
                      <>
                        Next
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* end routingMode === 'cost' wrapper */}
      </>
      )}
    </>
  )
}
