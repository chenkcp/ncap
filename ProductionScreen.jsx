import React, { useState } from 'react';
import { Menu, Upload, Download, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import './ProductionScreen.css';

const ProductionScreen = () => {
  const [viewMode, setViewMode] = useState('quantity');
  const [scrollPosition, setScrollPosition] = useState(100);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [partInput, setPartInput] = useState('');
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  // Sample lot data with random good/bad parts
  const lots = [
    { id: '25ZE123450', good: 145, bad: 12, total: 157, status: 'good', birthdate: '2025-12-01' },
    { id: '25ZE123451', good: 89, bad: 23, total: 112, status: 'suspend', birthdate: '2025-12-02' },
    { id: '25ZE123452', good: 203, bad: 5, total: 208, status: 'good', birthdate: '2025-12-03' },
    { id: '25ZE123453', good: 67, bad: 48, total: 115, status: 'bad', birthdate: '2025-12-04' },
    { id: '25ZE123454', good: 178, bad: 8, total: 186, status: 'good', birthdate: '2025-12-05' },
    { id: '25ZE123455', good: 134, bad: 31, total: 165, status: 'suspend', birthdate: '2025-12-06' },
    { id: '25ZE123456', good: 196, bad: 4, total: 200, status: 'good', birthdate: '2025-12-07' },
    { id: '25ZE123457', good: 52, bad: 67, total: 119, status: 'bad', birthdate: '2025-12-08' },
    { id: '25ZE123458', good: 241, bad: 9, total: 250, status: 'good', birthdate: '2025-12-09' },
    { id: '25ZE123459', good: 112, bad: 18, total: 130, status: 'suspend', birthdate: '2025-12-10' },
    { id: '25ZE123460', good: 187, bad: 13, total: 200, status: 'good', birthdate: '2025-12-11' },
    { id: '25ZE123461', good: 98, bad: 42, total: 140, status: 'bad', birthdate: '2025-12-12' },
  ];

  const maxQuantity = Math.max(...lots.map((l) => l.total));

  const getStatusClass = (status) => {
    const classes = {
      good: 'status-dot status-dot--good',
      suspend: 'status-dot status-dot--suspend',
      bad: 'status-dot status-dot--bad',
      unknown: 'status-dot status-dot--unknown',
    };
    return classes[status] || classes.unknown;
  };

  return (
    <div className="production-screen">
      {/* Header Bar */}
      <div className="header">
        <div className="header__top">
          <div className="header__left">
            <div className="menu">
              <button
                onClick={() => setShowMainMenu(!showMainMenu)}
                className="menu__trigger"
              >
                <Menu size={24} />
                <span className="menu__label">Menu</span>
                <ChevronDown size={16} />
              </button>

              {/* Main Menu Dropdown */}
              {showMainMenu && (
                <div className="dropdown dropdown--main">
                  <div className="dropdown__content">
                    <button className="dropdown__item">
                      <Upload size={16} className="dropdown__icon" />
                      <span>Upload</span>
                    </button>
                    <button className="dropdown__item">
                      <Download size={16} className="dropdown__icon" />
                      <span>Download</span>
                    </button>
                    <div className="dropdown__divider" />
                    <button className="dropdown__item">Lot Management</button>
                    <button className="dropdown__item">Context</button>
                    <div className="dropdown__divider" />
                    <button className="dropdown__item dropdown__item--danger">
                      <X size={16} />
                      <span>Exit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <span className="brand">Nextcap 2.0</span>
          </div>

          <div className="header__actions">
            {/* External Menu Button */}
            <button className="ghost-button">External Menu</button>

            {/* Chart Menu Button */}
            <button className="ghost-button">Chart Menu</button>

            {/* Site Menu Button */}
            <button className="ghost-button">Site: CJA2</button>

            {/* Admin Dropdown */}
            <div className="menu">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="menu__trigger menu__trigger--primary"
              >
                <span>Admin</span>
                <ChevronDown size={16} />
              </button>

              {/* Admin Menu Dropdown */}
              {showAdminMenu && (
                <div className="dropdown dropdown--admin">
                  <div className="dropdown__content">
                    <div className="dropdown__header">Admin Actions</div>
                    <button className="dropdown__item">
                      <Upload size={16} className="dropdown__icon dropdown__icon--primary" />
                      <span>Upload Data (Lot & Pen)</span>
                    </button>
                    <button className="dropdown__item">
                      <Download size={16} className="dropdown__icon dropdown__icon--success" />
                      <span>Download Configuration</span>
                    </button>
                    <div className="dropdown__divider" />
                    <button className="dropdown__item dropdown__item--danger">
                      <X size={16} />
                      <span>Exit Application</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div className="status-bar">
          <span><strong>Machine:</strong> M3-Z3CPM-NXTCAP</span>
          <span><strong>Line Type:</strong> GEO</span>
          <span><strong>Line #:</strong> 1</span>
          <span><strong>Station:</strong> Z3-CPM</span>
          <span><strong>Product:</strong> HESTIA (WET)</span>
          <span><strong>Active Lot:</strong> 25ZE123456</span>
          <span><strong>Last Sync:</strong> 2025-12-17 14:30:22</span>
          <span><strong>Site:</strong> CJA2</span>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="controls">
        <div className="controls__row">
          <div className="controls__radio-group">
            <span className="controls__label">View Mode:</span>
            <label className="radio">
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === 'quantity'}
                onChange={() => setViewMode('quantity')}
              />
              <span>Lot ID vs Part Quantity</span>
            </label>
            <label className="radio">
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === 'failures'}
                onChange={() => setViewMode('failures')}
              />
              <span>Lot ID vs Failures</span>
            </label>
          </div>
          <button
            onClick={() => setScrollPosition(100)}
            className="primary-button"
          >
            Show Latest
          </button>
        </div>

        {/* Scrollbar */}
        <div className="scrollbar">
          <button className="icon-button">
            <ChevronLeft size={20} />
          </button>
          <div className="scrollbar__track">
            <div
              className="scrollbar__thumb"
              style={{ width: '20%', left: `${scrollPosition - 20}%` }}
            />
          </div>
          <button className="icon-button">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="content">
        <div className="chart-card">
          {/* Chart container with no Y-axis */}
          <div className="bar-chart">
            {lots.slice(-12).map((lot, idx) => {
              const goodPercentage = (lot.good / lot.total) * 100;
              const badPercentage = (lot.bad / lot.total) * 100;
              const barHeight = (lot.total / maxQuantity) * 100;

              return (
                <div key={lot.id} className="bar-chart__item" style={{ width: '60px' }}>
                  {/* Total quantity above bar */}
                  <div className="bar-chart__total">{lot.total}</div>

                  {/* Stacked Bar Chart */}
                  <div
                    className="bar-chart__stack"
                    style={{ height: `${barHeight * 2.5}px` }}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Good parts (green) - bottom stack */}
                    <div
                      className="bar-chart__segment bar-chart__segment--good"
                      style={{ height: `${goodPercentage}%` }}
                    />
                    {/* Bad parts (red) - top stack */}
                    <div
                      className="bar-chart__segment bar-chart__segment--bad"
                      style={{ height: `${badPercentage}%` }}
                    />

                    {/* Tooltip */}
                    {hoveredBar === idx && (
                      <div className="tooltip">
                        <div><strong>Lot ID:</strong> {lot.id}</div>
                        <div><strong>Total Parts:</strong> {lot.total}</div>
                        <div><strong>Good:</strong> {lot.good} ({Math.round(goodPercentage)}%)</div>
                        <div><strong>Bad:</strong> {lot.bad} ({Math.round(badPercentage)}%)</div>
                        <div><strong>Status:</strong> {lot.status}</div>
                      </div>
                    )}
                  </div>

                  {/* X-axis label - Lot ID */}
                  <div className="bar-chart__label">
                    {lot.id}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis line */}
          <div className="chart-card__axis" />
        </div>

        {/* Lot Icon Row */}
        <div className="status-row">
          {lots.slice(-12).map((lot) => (
            <div key={lot.id} className="status-row__item">
              <button
                className={getStatusClass(lot.status)}
                title={`Status: ${lot.status}`}
              />
              <span className="status-row__label">{lot.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-panel__inner">
          <h3 className="control-panel__title">Add Part</h3>
          <div className="control-panel__inputs">
            <input
              type="text"
              value={partInput}
              onChange={(e) => setPartInput(e.target.value)}
              placeholder="Scan or enter Part ID"
              className="text-input"
            />
            <button className="success-button">
              Good
            </button>
            <button className="danger-button">
              Bad
            </button>
          </div>
          <p className="control-panel__hint">
            Enter Part ID using scanner or keyboard, then click Good or Bad
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductionScreen;
