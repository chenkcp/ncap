import React, { useState } from 'react';
import { Menu, Upload, Download, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

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

  const maxQuantity = Math.max(...lots.map(l => l.total));

  const getStatusColor = (status) => {
    const colors = {
      good: 'bg-green-500',
      suspend: 'bg-yellow-500',
      bad: 'bg-red-500',
      unknown: 'bg-black'
    };
    return colors[status] || colors.unknown;
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-4 py-2 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowMainMenu(!showMainMenu)}
                className="hover:bg-teal-700 p-2 rounded flex items-center gap-2"
              >
                <Menu size={24} />
                <span className="text-sm">Menu</span>
                <ChevronDown size={16} />
              </button>
              
              {/* Main Menu Dropdown */}
              {showMainMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded shadow-lg w-64 z-50 border border-gray-200">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center gap-2">
                      <Upload size={16} className="text-teal-600" />
                      <span>Upload</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center gap-2">
                      <Download size={16} className="text-teal-600" />
                      <span>Download</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button className="w-full text-left px-4 py-2 hover:bg-teal-50">
                      Lot Management
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-teal-50">
                      Context
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
                      <X size={16} />
                      <span>Exit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <span className="font-bold text-lg">Nextcap 2.0</span>
          </div>
          
          <div className="flex gap-2">
            {/* External Menu Button */}
            <button className="hover:bg-teal-700 px-3 py-1 rounded text-sm">
              External Menu
            </button>
            
            {/* Chart Menu Button */}
            <button className="hover:bg-teal-700 px-3 py-1 rounded text-sm">
              Chart Menu
            </button>
            
            {/* Site Menu Button */}
            <button className="hover:bg-teal-700 px-3 py-1 rounded text-sm">
              Site: CJA2
            </button>
            
            {/* Admin Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="bg-teal-700 hover:bg-teal-800 px-3 py-1 rounded flex items-center gap-2 text-sm"
              >
                <span>Admin</span>
                <ChevronDown size={16} />
              </button>
              
              {/* Admin Menu Dropdown */}
              {showAdminMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded shadow-lg w-56 z-50 border border-gray-200">
                  <div className="py-1">
                    <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 font-semibold text-sm">
                      Admin Actions
                    </div>
                    <button className="w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center gap-2">
                      <Upload size={16} className="text-teal-600" />
                      <span>Upload Data (Lot & Pen)</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center gap-2">
                      <Download size={16} className="text-green-600" />
                      <span>Download Configuration</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
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
        <div className="text-xs flex flex-wrap gap-x-4 gap-y-1 bg-teal-700 px-3 py-2 rounded">
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
      <div className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold">View Mode:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === 'quantity'}
                onChange={() => setViewMode('quantity')}
                className="w-4 h-4"
              />
              <span>Lot ID vs Part Quantity</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === 'failures'}
                onChange={() => setViewMode('failures')}
                className="w-4 h-4"
              />
              <span>Lot ID vs Failures</span>
            </label>
          </div>
          <button 
            onClick={() => setScrollPosition(100)}
            className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700 text-sm"
          >
            Show Latest
          </button>
        </div>
        
        {/* Scrollbar */}
        <div className="mt-3 flex items-center gap-2">
          <button className="p-1 hover:bg-gray-200 rounded">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 bg-gray-200 h-2 rounded-full relative">
            <div 
              className="absolute h-full bg-teal-600 rounded-full"
              style={{ width: '20%', left: `${scrollPosition - 20}%` }}
            />
          </div>
          <button className="p-1 hover:bg-gray-200 rounded">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="relative bg-white rounded shadow p-6">
          {/* Chart container with no Y-axis */}
          <div className="flex items-end justify-start h-80 gap-4 pb-12">
            {lots.slice(-12).map((lot, idx) => {
              const totalHeight = 100;
              const goodPercentage = (lot.good / lot.total) * 100;
              const badPercentage = (lot.bad / lot.total) * 100;
              const barHeight = (lot.total / maxQuantity) * 100;
              
              return (
                <div key={lot.id} className="flex flex-col items-center" style={{ width: '60px' }}>
                  {/* Total quantity above bar */}
                  <div className="text-sm font-bold mb-1 text-gray-700">{lot.total}</div>
                  
                  {/* Stacked Bar Chart */}
                  <div 
                    className="relative w-full cursor-pointer hover:opacity-90 transition flex flex-col-reverse"
                    style={{ height: `${barHeight * 2.5}px` }}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Good parts (green) - bottom stack */}
                    <div 
                      className="bg-green-500 w-full"
                      style={{ height: `${goodPercentage}%` }}
                    />
                    {/* Bad parts (red) - top stack */}
                    <div 
                      className="bg-red-500 w-full"
                      style={{ height: `${badPercentage}%` }}
                    />
                    
                    {/* Tooltip */}
                    {hoveredBar === idx && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                        <div><strong>Lot ID:</strong> {lot.id}</div>
                        <div><strong>Total Parts:</strong> {lot.total}</div>
                        <div><strong>Good:</strong> {lot.good} ({Math.round(goodPercentage)}%)</div>
                        <div><strong>Bad:</strong> {lot.bad} ({Math.round(badPercentage)}%)</div>
                        <div><strong>Status:</strong> {lot.status}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* X-axis label - Lot ID */}
                  <div 
                    className="text-xs mt-3 transform -rotate-45 origin-top-left whitespace-nowrap font-medium text-gray-600"
                    style={{ marginLeft: '8px' }}
                  >
                    {lot.id}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* X-axis line */}
          <div className="border-t-2 border-gray-300 mt-8"></div>
        </div>

        {/* Lot Icon Row */}
        <div className="flex justify-around mt-16 px-4">
          {lots.slice(-12).map((lot) => (
            <div key={lot.id} className="flex flex-col items-center cursor-pointer hover:scale-110 transition">
              <button 
                className={`w-6 h-6 rounded-full ${getStatusColor(lot.status)} shadow-md`}
                title={`Status: ${lot.status}`}
              />
              <span className="text-xs mt-1 capitalize">{lot.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border-t px-6 py-4 shadow-lg">
        <div className="max-w-2xl">
          <h3 className="font-semibold mb-3">Add Part</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={partInput}
              onChange={(e) => setPartInput(e.target.value)}
              placeholder="Scan or enter Part ID"
              className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 font-semibold">
              Good
            </button>
            <button className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700 font-semibold">
              Bad
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter Part ID using scanner or keyboard, then click Good or Bad
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductionScreen;
