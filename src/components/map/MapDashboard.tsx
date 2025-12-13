import React, { useState } from 'react';
const DistrictMap = React.lazy(() => import('./DistrictMap').then(m => ({ default: m.DistrictMap })));
const StateMap = React.lazy(() => import('./StateMap').then(m => ({ default: m.StateMap })));
const LocalBodyTrendMap = React.lazy(() => import('./LocalBodyTrendMap').then(m => ({ default: m.LocalBodyTrendMap })));
import type { LocalBody } from '../../services/dataService';
import { useLocalBody, useTrendResults } from '../../services/data';

interface MapDashboardProps {
    // Add props as needed
}

export const MapDashboard: React.FC<MapDashboardProps> = () => {
    // Navigation State
    const [view, setView] = useState<'districts' | 'lbs' | 'map'>('districts');
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedLB, setSelectedLB] = useState<LocalBody | null>(null);

  const allLocalBodies = useLocalBody();
  const allTrends = useTrendResults();

    // Handlers
    // handleSelectDistrict and handleSelectLB replaced by StateMap logic and DistrictMap logic

    const handleBackToDistricts = () => {
        setSelectedDistrict(null);
        setView('districts');
    };

    const handleBackToLBs = () => {
        setSelectedLB(null);
        setView('lbs');
    };

    const handleSelectLBByCode = (lbCode: string) => {
        const lb = allLocalBodies?.data?.find(b => b.lb_code === lbCode);
        if (lb) {
            setSelectedLB(lb);
            setView('map');
        } else {
            console.warn(`Local Body with code ${lbCode} not found in metadata`);
        }
    };

    const handleStateMapSelection = (_lbCode: string, districtName: string, _type: string) => {
        setSelectedDistrict(districtName);
        setView('lbs');
        // Future enhancement: Deep link to specific LB via lbCode
    };

    if (allLocalBodies.isLoading || allTrends.isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <React.Suspense fallback={
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            }>
                {view === 'districts' && allTrends.data && (
                    <StateMap
                        trends={allTrends.data}
                        onSelectLB={handleStateMapSelection}
                    />
                )}

                {view === 'lbs' && selectedDistrict && allTrends.data && allLocalBodies?.data && (
                    <DistrictMap
                        districtName={selectedDistrict}
                        onSelectLB={handleSelectLBByCode}
                        onBack={handleBackToDistricts}
                        localBodies={allLocalBodies.data.filter(lb => lb.district_name === selectedDistrict)}
                        trends={allTrends.data}
                    />
                )}

                {view === 'map' && selectedLB && selectedDistrict && allTrends?.data && (
                    <LocalBodyTrendMap
                        lbName={selectedLB.lb_name_english}
                        lbCode={selectedLB.lb_code}
                        districtName={selectedDistrict}
                        totalWards={selectedLB.total_wards}
                        trendData={allTrends.data.find(t => t.LB_Code === selectedLB.lb_code)}
                        onBack={handleBackToLBs}
                    />
                )}
            </React.Suspense>
        </div>
    );
};
