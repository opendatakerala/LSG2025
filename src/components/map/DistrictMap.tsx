import React, { useEffect, useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import type { LocalBody, TrendResult } from '../../services/dataService';
import { feature } from 'topojson-client';

interface DistrictMapProps {
    districtName: string;
    onSelectLB: (lbCode: string) => void;
    onBack: () => void;
    localBodies: LocalBody[];
    trends: TrendResult[];
}

export const DistrictMap: React.FC<DistrictMapProps> = ({
    districtName,
    onSelectLB,
    onBack,
    localBodies,
    trends
}) => {
    const [activeTab, setActiveTab] = useState<'grama' | 'block' | 'district'>('grama');
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredLB, setHoveredLB] = useState<string | null>(null);

    useEffect(() => {
        const loadMap = async () => {
            setLoading(true);
            setError(null);
            setGeoJsonData(null); // Clear previous map
            try {
                const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
                const path = `${baseUrl}data/topojson/Kerala/district_maps/${districtName}_${activeTab}.json`;

                const response = await fetch(path);
                if (!response.ok) throw new Error(`${activeTab} map data not found`);

                let data = await response.json();

                // Convert TopoJSON if needed (District maps usually are TopoJSON)
                if (data.type === 'Topology') {
                    const objectName = Object.keys(data.objects)[0];
                    if (objectName) {
                        data = feature(data, data.objects[objectName]);
                    }
                }

                // Inject style properties based on trends
                const processedFeatures = data.features.map((feature: any) => {
                    const props = feature.properties;
                    const code = props.SEC_Kerala_code || props.LSG_code || props.LGD_Code;

                    const trend = trends.find(t => t.LB_Code === code);
                    let color = '#94a3b8'; // Default slate

                    if (trend) {
                        switch (trend.Leading_Front) {
                            case 'LDF': color = '#ef4444'; break;
                            case 'UDF': color = '#2768F5'; break;
                            case 'NDA': color = '#f97316'; break;
                            case 'Hung': color = '#64748b'; break;
                            case 'IND': color = '#94a3b8'; break;
                        }
                    }

                    return {
                        ...feature,
                        properties: {
                            ...props,
                            _fillColor: color
                        }
                    };
                });

                setGeoJsonData({ ...data, features: processedFeatures });
            } catch (err) {
                console.error(err);
                setError(`Failed to load ${activeTab} map for ${districtName}`);
            } finally {
                setLoading(false);
            }
        };
        loadMap();
    }, [districtName, activeTab, trends]);

    const handleFeatureClick = (feature: any) => {
        const props = feature.properties;
        const code = props.SEC_Kerala_code || props.LSG_code || props.LGD_Code;
        if (code) {
            onSelectLB(code);
        }
    };

    const handleFeatureHover = (feature: any) => {
        const props = feature.properties;
        const name = props['English Label'] || props.LSGI_NAME || props.LSGD || '';
        setHoveredLB(name);
    };

    // Calculate stats based on active tab
    const filteredLBs = localBodies.filter(lb => {
        const type = lb.lb_type.toLowerCase();
        if (activeTab === 'grama') return ['grama panchayat', 'municipality', 'municipal corporation'].includes(type);
        if (activeTab === 'block') return type === 'block panchayat';
        if (activeTab === 'district') return type === 'district panchayat';
        return false;
    });

    const totalLBs = filteredLBs.length;
    const totalWards = filteredLBs.reduce((sum, lb) => sum + lb.total_wards, 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100dvh-150px)]">
            <div className="p-4 border-b border-slate-200 bg-white z-10
                flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                    <span>←</span>
                    <span className="hidden sm:inline">Back to Districts</span>
                    </button>
                    <div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-800">
                        {districtName}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500">
                        District Overview
                    </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg self-start md:self-auto">
                    {(['district', 'block', 'grama'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                    ))}
                </div>
                </div>


            <div className="flex-1 flex flex-col md:flex-row">
                <div className="flex-1 relative bg-slate-50 min-h-[50vh] md:min-h-0">
                    {loading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4">
                            {error}
                        </div>
                    )}

                    <div className="h-full w-full">
                        <InteractiveMap
                            geoJsonData={geoJsonData}
                            onFeatureClick={handleFeatureClick}
                            onFeatureHover={handleFeatureHover}
                            onFeatureOut={() => setHoveredLB(null)}
                            interactive={true}
                            dragging={false}
                            zoomControl={false}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            touchZoom={false}
                            padding={[5, 5]}
                        />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full md:w-80 border-l border-slate-200 bg-white p-6 flex flex-col gap-6">
                    {/* Hover Info */}
                    <div className="min-h-[60px]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Current Selection</h3>
                        {hoveredLB ? (
                            <div className="text-lg font-bold text-blue-600">{hoveredLB}</div>
                        ) : (
                            <div className="text-sm text-slate-400 italic">Hover over map to view details</div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-sm text-slate-500 mb-1">Total {activeTab === 'district' ? 'District Panchayat' : activeTab === 'block' ? 'Block Panchayats' : 'Local Bodies'}</div>
                            <div className="text-3xl font-bold text-slate-800">{totalLBs}</div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-sm text-slate-500 mb-1">Total Wards</div>
                            <div className="text-3xl font-bold text-slate-800">{totalWards}</div>
                        </div>
                    </div>

                    <div className="mt-auto p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            Click on any {activeTab === 'district' ? 'area' : 'Local Body'} in the map to view detailed election trends and ward-level breakdown.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
