import React, { useEffect, useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import type { TrendResult } from '../../services/dataService';

interface LocalBodyTrendMapProps {
    lbName: string;
    lbCode: string;
    districtName: string;
    totalWards: number;
    trendData?: TrendResult;
    onBack: () => void;
}

export const LocalBodyTrendMap: React.FC<LocalBodyTrendMapProps> = ({
    lbName,
    lbCode,
    districtName,
    totalWards,
    trendData,
    onBack
}) => {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedWard, setSelectedWard] = useState<string | null>(null);
    const [mobileTab, setMobileTab] = useState<'overview' | 'wards'>('overview');
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(true);

    useEffect(() => {
        const loadMap = async () => {
            setLoading(true);
            setError(null);

            try {
                const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

                // Direct fetch using SEC Code
                const path = `${baseUrl}data/geojson/Kerala/districts/${districtName}/${lbCode}.json`;

                const response = await fetch(path);
                if (!response.ok) throw new Error(`Map data not found for ${lbCode}`);

                const data = await response.json();

                // Process features to inject colors based on Ward Winner
                if (data.features && trendData) {
                    const processedFeatures = data.features.map((feature: any) => {
                        const props = feature.properties;
                        // Assuming ward number is in properties, e.g. "Ward_No" or match by name?
                        // Usually GeoJSON from SEC has Ward_No or we can infer it.
                        // Let's assume standard "Ward_No" from previous context or "ward_no"
                        // Or "Ward No"
                        const wardNo = String(props.Ward_No || props.ward_no || props['Ward No'] || props.WARD_NO || props.Ward);

                        const info = trendData.wardInfo?.[wardNo];

                        let color = '#e2e8f0'; // Default slate-200 for no data

                        if (info) {
                            const winner = info.winner;
                            // Fallback to leading if available, else top candidate
                            const topCandidate = info.candidates?.[0];
                            const isImplicitLead = !winner && !info.leading && topCandidate && topCandidate.votes > 0;
                            const leader = info.leading || (isImplicitLead ? topCandidate : undefined);

                            if (winner) {
                                switch (winner.group) {
                                    case 'LDF': color = '#ef4444'; break;
                                    case 'UDF': color = '#2768F5'; break; //dark blue instead of green
                                    case 'NDA': color = '#f97316'; break;
                                    default: color = '#64748b'; break; // Others
                                }
                            } else if (leader) {
                                // Lighter colors for leading
                                switch (leader.group) {
                                    case 'LDF': color = '#fca5a5'; break; // red-300
                                    case 'UDF': color = '#2768F5'; break; // dark-blue
                                    case 'NDA': color = '#fdba74'; break; // orange-300
                                    default: color = '#cbd5e1'; break; // slate-300
                                }
                            }
                        }

                        return {
                            ...feature,
                            properties: {
                                ...props,
                                _fillColor: color,
                                // ensure wardNo is string for matching
                                _wardNo: wardNo
                            }
                        };
                    });
                    setGeoJsonData({ ...data, features: processedFeatures });
                } else {
                    setGeoJsonData(data);
                }

            } catch (err: any) {
                console.error(err);
                setError(`Could not load map for ${lbName}`);
            } finally {
                setLoading(false);
            }
        };

        loadMap();
    }, [lbName, lbCode, districtName, trendData]);

    // Helper to get ward color - CURRENTLY UNUSED but kept for reference
    // const getGroupColor = (group: string) => {
    //     switch (group) {
    //         case 'LDF': return 'bg-red-500 text-white border-red-600';
    //         case 'UDF': return 'bg-green-500 text-white border-green-600';
    //         case 'NDA': return 'bg-orange-500 text-white border-orange-600';
    //         default: return 'bg-slate-400 text-white border-slate-500';
    //     }
    // };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100dvh-80px)] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        ← Back
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{lbName}</h2>
                        <p className="text-sm text-slate-500">{districtName}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* 1. Map Section */}
                <div className={`relative bg-slate-50 lg:h-full lg:flex-1 ${isMobilePanelOpen ? 'h-[40dvh]' : 'h-full'} border-b lg:border-b-0 border-slate-200`}>
                    {loading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center">
                            {error}
                        </div>
                    )}
                    <div className="h-full w-full">
                        <InteractiveMap
                            geoJsonData={geoJsonData}
                            interactive={true}
                            dragging={false}
                            zoomControl={false}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            touchZoom={false}
                            padding={[10, 10]}
                        />
                    </div>
                </div>

                {/* Mobile Toggle Bar */}
                <div className="lg:hidden bg-white border-b border-slate-200 shrink-0 flex items-center justify-between px-4 py-2 z-20 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {isMobilePanelOpen ? (mobileTab === 'overview' ? 'Election Overview' : 'Ward List') : 'Show Details'}
                    </div>
                    <button
                        onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
                        className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={isMobilePanelOpen ? "Collapse panel" : "Expand panel"}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 transition-transform duration-300 ${isMobilePanelOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Tab Switcher (Only visible when panel is open) */}
                <div className={`lg:hidden flex border-b border-slate-200 bg-white shrink-0 z-20 transition-all duration-300 ${isMobilePanelOpen ? 'opacity-100' : 'hidden opacity-0 h-0'}`}>
                    <button
                        onClick={() => setMobileTab('overview')}
                        className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${mobileTab === 'overview' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setMobileTab('wards')}
                        className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${mobileTab === 'wards' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500'}`}
                    >
                        Wards ({totalWards})
                    </button>
                </div>

                {/* 2. Info Panel - Summary or Details */}
                <div className={`lg:w-80 border-l border-slate-200 bg-white flex flex-col h-full overflow-hidden transition-all duration-300 ${isMobilePanelOpen ? 'flex-1' : 'hidden'} ${mobileTab === 'overview' ? 'lg:flex' : 'lg:flex lg:w-80 hidden'}`}>
                    <div className="p-4 border-b border-slate-100 font-bold text-slate-700 flex justify-between items-center bg-slate-50 shrink-0">
                        <span>{selectedWard ? 'Ward Details' : 'Election Overview'}</span>
                        {selectedWard && (
                            <button
                                onClick={() => setSelectedWard(null)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Close
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {trendData ? (
                            <>
                                {selectedWard ? (
                                    /* WARD DETAIL VIEW */
                                    <div className="animate-fadeIn">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                                            Ward {selectedWard}
                                            <span className="block text-sm font-normal text-slate-500 mt-1">
                                                {trendData.wardInfo?.[selectedWard]?.wardName}
                                            </span>
                                        </h3>

                                        <div className="space-y-3 mt-4">
                                            {trendData.wardInfo?.[selectedWard]?.candidates.map((cand, idx) => {
                                                const isWinner = cand.status?.toLowerCase() === 'won';
                                                const rowClass = isWinner ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-100';

                                                // Calculate percent
                                                const candidates = trendData.wardInfo[selectedWard!].candidates;
                                                const maxVotes = Math.max(...candidates.map(c => c.votes));
                                                const percent = maxVotes > 0 ? (cand.votes / maxVotes) * 100 : 0;

                                                return (
                                                    <div key={idx} className={`p-3 rounded-lg border shadow-sm ${rowClass}`}>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-medium text-slate-800 text-sm">{cand.name}</div>
                                                            {isWinner && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">WIN</span>}
                                                        </div>
                                                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                            <span>{cand.party}</span>
                                                            <span className="font-mono font-bold">{cand.votes}</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${cand.group === 'LDF' ? 'bg-red-500' : cand.group === 'UDF' ? 'bg-indigo-500' : cand.group === 'NDA' ? 'bg-orange-500' : 'bg-slate-400'}`}
                                                                style={{ width: `${percent}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {(!trendData.wardInfo?.[selectedWard] || trendData.wardInfo[selectedWard]?.candidates.length === 0) && (
                                                <div className="text-slate-500 italic text-sm">No candidate data.</div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* SUMMARY VIEW */
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Counted</div>
                                                <div className="text-xl font-bold text-slate-800">
                                                    {trendData.Wards_Declared}/{totalWards}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Candidates</div>
                                                <div className="text-xl font-bold text-slate-800">{trendData.Candidate_Count}</div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Leading Front</div>
                                            <div className="text-3xl font-black text-blue-900">{trendData.Leading_Front}</div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-700 mb-3 text-sm">Seat Breakdown</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'LDF', count: trendData.LDF_Seats, color: 'bg-red-500' },
                                                    { label: 'UDF', count: trendData.UDF_Seats, color: 'bg-indigo-500' },
                                                    { label: 'NDA', count: trendData.NDA_Seats, color: 'bg-orange-500' },
                                                    { label: 'Others', count: trendData.IND_Seats, color: 'bg-slate-400' }
                                                ].map((item) => (
                                                    <div key={item.label} className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-md">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                                                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                                        </div>
                                                        <span className="font-bold text-slate-900">{item.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">No Data</div>
                        )}
                    </div>
                </div>

                {/* 3. Ward List Panel - Dedicated Column */}
                <div className={`lg:w-72 border-l border-slate-200 bg-slate-50 flex flex-col h-full overflow-hidden transition-all duration-300 ${isMobilePanelOpen ? 'flex-1' : 'hidden'} ${mobileTab === 'wards' ? 'lg:flex' : 'lg:flex lg:w-72 hidden'}`}>
                    <div className="p-4 border-b border-slate-200 bg-white font-bold text-slate-700 shrink-0">
                        Ward Breakdown
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {trendData ? (
                            Array.from({ length: totalWards }, (_, i) => i + 1).map(wardNum => {
                                const wStr = String(wardNum);
                                const info = trendData.wardInfo?.[wStr];
                                const winner = info?.winner;
                                // Fallback to leading if available, else top candidate
                                const topCandidate = info?.candidates?.[0];
                                const isImplicitLead = !winner && !info?.leading && topCandidate && topCandidate.votes > 0;
                                const leader = info?.leading || (isImplicitLead ? topCandidate : undefined);

                                const isSelected = selectedWard === wStr;

                                // Color logic
                                let statusBorder = 'border-l-4 border-l-slate-300';
                                if (winner) {
                                    statusBorder = winner.group === 'LDF' ? 'border-l-4 border-l-red-500' :
                                        winner.group === 'UDF' ? 'border-l-4 border-l-indigo-500' :
                                            winner.group === 'NDA' ? 'border-l-4 border-l-orange-500' :
                                                'border-l-4 border-l-slate-500';
                                } else if (leader) {
                                    // Use leader's group for border color
                                    statusBorder = leader.group === 'LDF' ? 'border-l-4 border-l-red-400' :
                                        leader.group === 'UDF' ? 'border-l-4 border-l-indigo-400' :
                                            leader.group === 'NDA' ? 'border-l-4 border-l-orange-400' :
                                                'border-l-4 border-l-blue-400';
                                }

                                return (
                                    <button
                                        key={wardNum}
                                        onClick={() => {
                                            setSelectedWard(wStr);
                                            // On mobile, switch to overview (details) w hen clicked
                                            if (window.innerWidth < 1024) setMobileTab('overview');
                                        }}
                                        className={`w-full text-left bg-white p-2.5 rounded shadow-sm border border-slate-200 transition-all hover:shadow-md 
                                            ${statusBorder}
                                            ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Ward {wardNum}</div>
                                            {winner && <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">Won</span>}
                                            {leader && !winner && <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded">Lead</span>}
                                        </div>

                                        <div className="font-medium text-slate-800 text-sm truncate" title={info?.wardName}>
                                            {info?.wardName || 'Unknown Ward'}
                                        </div>

                                        {(winner || leader) ? (
                                            <div className="mt-1.5 flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-700 truncate max-w-[100px]">
                                                    {winner?.name || leader?.name}
                                                </span>
                                                <span className={`font-bold ml-2 ${(winner?.group || leader?.group) === 'LDF' ? 'text-red-600' :
                                                    (winner?.group || leader?.group) === 'UDF' ? 'text-indigo-600' :
                                                        (winner?.group || leader?.group) === 'NDA' ? 'text-orange-600' : 'text-slate-600'
                                                    }`}>
                                                    {(winner?.group || leader?.group)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="mt-1 text-xs text-slate-400 italic">No Result</div>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-slate-400 text-sm">Loading wards...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
