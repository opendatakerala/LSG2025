import { useEffect, useState } from 'react';
import { KPIGrid } from './components/dashboard/KPIGrid';
import { DistrictTable } from './components/dashboard/DistrictTable';
import { DetailPanel } from './components/details/DetailPanel';
import { DistrictDrillDown } from './components/dashboard/DistrictDrillDown';
import { fetchLocalBodies, fetchWards, fetchPollingStations, fetchGeoJSON, type LocalBody, type Ward, type PollingStation } from './services/dataService';
import { Search } from 'lucide-react';

import { DisclaimerModal } from './components/common/DisclaimerModal';

function App() {
  const [localBodies, setLocalBodies] = useState<LocalBody[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [pollingStations, setPollingStations] = useState<PollingStation[]>([]);
  const [counts, setCounts] = useState<{
    corporations: number;
    municipalities: number;
    gramaPanchayats: number;
    blockPanchayats: number;
    districtPanchayats: number;
    voters: number;
    pollingStations: number;
    totalWards: number;
  }>({
    corporations: 0,
    municipalities: 0,
    gramaPanchayats: 0,
    blockPanchayats: 0,
    districtPanchayats: 0,
    voters: 0,
    pollingStations: 0,
    totalWards: 0,
  });
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocalBody, setSelectedLocalBody] = useState<LocalBody | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapData, setMapData] = useState<any | null>(null);
  const [drillDownData, setDrillDownData] = useState<{ district: string; type: string } | null>(null);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [lbs, fetchedWards, stations] = await Promise.all([
          fetchLocalBodies(),
          fetchWards(),
          fetchPollingStations(),
        ]);

        setLocalBodies(lbs);
        setWards(fetchedWards);
        setPollingStations(stations);

        const lbTypeMap = new Map(lbs.map(lb => [lb.lb_code, lb.lb_type]));

        const validTypes = ['Municipal Corporation', 'Municipality', 'Grama Panchayat'];

        const validWards = fetchedWards.filter(w => {
          const type = lbTypeMap.get(w.lb_code);
          return type && validTypes.includes(type);
        });

        const validStations = stations.filter(ps => {
          const type = lbTypeMap.get(ps.lb_code);
          return type && validTypes.includes(type);
        });

        const newCounts = {
          corporations: lbs.filter(lb => lb.lb_type === 'Municipal Corporation').length,
          municipalities: lbs.filter(lb => lb.lb_type === 'Municipality').length,
          gramaPanchayats: lbs.filter(lb => lb.lb_type === 'Grama Panchayat').length,
          blockPanchayats: lbs.filter(lb => lb.lb_type === 'Block Panchayat').length,
          districtPanchayats: lbs.filter(lb => lb.lb_type === 'District Panchayat').length,
          voters: validWards.reduce((acc, curr) => acc + curr.total_voters, 0),
          pollingStations: validStations.length,
          totalWards: lbs.reduce((acc, curr) => acc + curr.total_wards, 0),
        };
        setCounts(newCounts);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectLocalBody = async (lb: LocalBody) => {
    setSelectedLocalBody(lb);
    setSearchTerm('');

    // Always fetch GeoJSON for the selected local body (used in DetailPanel)
    const fixDistrictName = (name: string) => {
      const titleCase = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      if (titleCase === 'Thiruvananthapuram') return 'Thiruvanathapuram';
      return titleCase;
    };

    const district = fixDistrictName(lb.district_name);
    const type = lb.lb_type;
    const name = lb.lb_name_english;

    const geoJson = await fetchGeoJSON(district, type, name);
    if (geoJson) {
      setMapData(geoJson);
    }
  };

  const handleClearSelection = async () => {
    // Determine if we should go back to a drill-down view instead of the home dashboard
    if (!drillDownData && selectedLocalBody) {
      let type = '';
      switch (selectedLocalBody.lb_type) {
        case 'Municipal Corporation': type = 'Corporations'; break;
        case 'Municipality': type = 'Municipalities'; break;
        case 'Grama Panchayat': type = 'Grama Panchayats'; break;
        case 'Block Panchayat': type = 'Block Panchayats'; break;
        case 'District Panchayat': type = 'District Panchayats'; break;
        default: type = 'Local Bodies';
      }
      setDrillDownData({ district: selectedLocalBody.district_name, type });
    }

    setSelectedLocalBody(null);
    setMapData(null);
  };

  const handleDrillDown = (district: string, type: string) => {
    setDrillDownData({ district, type });
  };

  const handleBackFromDrillDown = () => {
    setDrillDownData(null);
  };

  const handleGoHome = () => {
    setSelectedLocalBody(null);
    setDrillDownData(null);
    setMapData(null);
    setSelectedKPI(null);
    setSearchTerm('');
  };


  const handleStatewideDrillDown = (kpiId: string) => {
    let type = '';
    switch (kpiId) {
      case 'corporations': type = 'Corporations'; break;
      case 'municipalities': type = 'Municipalities'; break;
      case 'gramaPanchayats': type = 'Grama Panchayats'; break;
      case 'blockPanchayats': type = 'Block Panchayats'; break;
      case 'districtPanchayats': type = 'District Panchayats'; break;
      default: return; // Voters and Polling stations don't list bodies
    }
    setDrillDownData({ district: 'Kerala', type });
  };

  const filteredSearchLocalBodies = searchTerm
    ? localBodies.filter((lb) =>
      lb.lb_name_english.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10)
    : [];

  // Filter local bodies for drill down
  const drillDownLocalBodies = drillDownData
    ? localBodies.filter(lb => {
      // Map display type to actual type
      let typeFilter = '';
      switch (drillDownData.type) {
        case 'Corporations': typeFilter = 'Municipal Corporation'; break;
        case 'Municipalities': typeFilter = 'Municipality'; break;
        case 'Grama Panchayats': typeFilter = 'Grama Panchayat'; break;
        case 'Block Panchayats': typeFilter = 'Block Panchayat'; break;
        case 'District Panchayats': typeFilter = 'District Panchayat'; break;
        default: typeFilter = drillDownData.type;
      }

      // If district is 'Kerala', show all bodies of that type
      if (drillDownData.district === 'Kerala') {
        return lb.lb_type === typeFilter;
      }

      return lb.district_name === drillDownData.district && lb.lb_type === typeFilter;
    })
    : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleGoHome}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
              KL
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Kerala LSG Election Portal</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Election Data Dashboard 2025</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-xs hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-1.5 px-1">
                <p className="text-[10px] text-slate-400 font-medium">
                  Crafted with :) by <a href="https://gnoeee.github.io/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">JinOy</a>
                </p>
                <span className="text-[10px] text-slate-300">•</span>
                <button
                  onClick={() => setIsDisclaimerOpen(true)}
                  className="text-[10px] text-slate-400 hover:text-blue-600 font-medium transition-colors"
                >
                  Disclaimer
                </button>
              </div>

              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  {filteredSearchLocalBodies.length > 0 ? (
                    filteredSearchLocalBodies.map(lb => (
                      <div
                        key={lb.lb_code}
                        onClick={() => handleSelectLocalBody(lb)}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                      >
                        <p className="font-medium text-slate-800">{lb.lb_name_english}</p>
                        <p className="text-xs text-slate-500">{lb.lb_type} • {lb.district_name}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">No results found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden p-4 bg-white border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search Local Bodies..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
              {filteredSearchLocalBodies.map(lb => (
                <div
                  key={lb.lb_code}
                  onClick={() => handleSelectLocalBody(lb)}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                >
                  <p className="font-medium text-slate-800">{lb.lb_name_english}</p>
                  <p className="text-xs text-slate-500">{lb.lb_type} • {lb.district_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-1 mt-3">
          <p className="text-[10px] text-slate-400 font-medium">
            Crafted with :) by <a href="https://gnoeee.github.io" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">JinOy</a>
          </p>
          <button
            onClick={() => setIsDisclaimerOpen(true)}
            className="text-[10px] text-slate-400 hover:text-blue-600 font-medium transition-colors"
          >
            Disclaimer
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : selectedLocalBody ? (
          <div className="max-w-3xl mx-auto w-full">
            <DetailPanel
              localBody={selectedLocalBody}
              onBack={handleClearSelection}
              wards={wards}
              pollingStations={pollingStations}
              geoJsonData={mapData}
              localBodies={localBodies}
            />
          </div>
        ) : drillDownData ? (
          <DistrictDrillDown
            district={drillDownData.district}
            type={drillDownData.type}
            localBodies={drillDownLocalBodies}
            onBack={handleBackFromDrillDown}
            onSelectLocalBody={handleSelectLocalBody}
          />
        ) : (
          <>
            <KPIGrid
              counts={counts}
              selectedKPI={selectedKPI}
              onSelectKPI={setSelectedKPI}
              onDrillDown={handleStatewideDrillDown}
            />

            <div className="mt-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedKPI ? 'District Breakdown' : 'Overview by District'}
                </h2>
                {selectedKPI && (
                  <button
                    onClick={() => setSelectedKPI(null)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <DistrictTable
                localBodies={localBodies}
                wards={wards}
                pollingStations={pollingStations}
                selectedKPI={selectedKPI}
                onDrillDown={handleDrillDown}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
