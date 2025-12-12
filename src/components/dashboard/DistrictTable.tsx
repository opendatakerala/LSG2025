import React, { useMemo } from 'react';
import type { LocalBody, Ward, PollingStation } from '../../services/dataService';

interface DistrictTableProps {
    localBodies: LocalBody[];
    wards: Ward[];
    pollingStations: PollingStation[];
    selectedKPI: string | null;
    onDrillDown: (district: string, type: string) => void;
}

export const DistrictTable: React.FC<DistrictTableProps> = ({
    localBodies,
    wards,
    pollingStations,
    selectedKPI,
    onDrillDown,
}) => {
    const districts = useMemo(() => {
        const uniqueDistricts = Array.from(new Set(localBodies.map(lb => lb.district_name))).sort();
        return uniqueDistricts;
    }, [localBodies]);

    const kpiLabel = useMemo(() => {
        switch (selectedKPI) {
            case 'corporations': return 'Corporations';
            case 'municipalities': return 'Municipalities';
            case 'gramaPanchayats': return 'Grama Panchayats';
            case 'blockPanchayats': return 'Block Panchayats';
            case 'districtPanchayats': return 'District Panchayats';
            case 'voters': return 'Total Voters';
            case 'totalWards': return 'Total Wards';
            case 'pollingStations': return 'Polling Stations';
            default: return 'Local Bodies';
        }
    }, [selectedKPI]);

    const tableData = useMemo(() => {
        return districts.map(district => {
            // Filter entities for this district
            const districtLBs = localBodies.filter(lb => lb.district_name === district);

            let filteredLBs = districtLBs;
            let kpiCount = 0;

            if (selectedKPI && !['voters', 'pollingStations', 'totalWards'].includes(selectedKPI)) {
                let typeFilter = '';
                switch (selectedKPI) {
                    case 'corporations': typeFilter = 'Municipal Corporation'; break;
                    case 'municipalities': typeFilter = 'Municipality'; break;
                    case 'gramaPanchayats': typeFilter = 'Grama Panchayat'; break;
                    case 'blockPanchayats': typeFilter = 'Block Panchayat'; break;
                    case 'districtPanchayats': typeFilter = 'District Panchayat'; break;
                }
                filteredLBs = districtLBs.filter(lb => lb.lb_type === typeFilter);
                kpiCount = filteredLBs.length;
            } else if (selectedKPI === 'totalWards') {
                kpiCount = districtLBs.reduce((sum, lb) => sum + lb.total_wards, 0);
            } else {
                kpiCount = districtLBs.length;
            }

            // Calculate total wards for the filtered list (or district total if no specific filter)
            // If selectedKPI is 'totalWards', filteredLBs is effectively districtLBs, so this works too.
            const totalWards = filteredLBs.reduce((acc, curr) => acc + curr.total_wards, 0);

            // Calculate voters and stations based on selection
            let voters = 0;
            let stations = 0;

            if (selectedKPI && !['voters', 'pollingStations', 'totalWards'].includes(selectedKPI)) {
                // Specific Local Body Type Selected
                const targetLBCodes = new Set(filteredLBs.map(lb => lb.lb_code));

                // Voters: Sum wards for the selected LBs
                voters = wards
                    .filter(w => targetLBCodes.has(w.lb_code))
                    .reduce((acc, curr) => acc + curr.total_voters, 0);

                // Stations:
                if (selectedKPI === 'districtPanchayats') {
                    // For District Panchayat, sum stations of all Grama Panchayats in the district
                    const districtGPs = districtLBs.filter(lb => lb.lb_type === 'Grama Panchayat');
                    const districtGPCodes = new Set(districtGPs.map(lb => lb.lb_code));
                    stations = pollingStations.filter(ps => districtGPCodes.has(ps.lb_code)).length;
                } else {
                    // For others (Corp, Mun, GP, BP), count direct matches
                    // We verified BP and Mun have direct entries in polling_stations.csv
                    stations = pollingStations.filter(ps => targetLBCodes.has(ps.lb_code)).length;
                }

            } else {
                // Default / Overview: Show District Totals (Base Types Only)
                const baseTypes = ['Municipal Corporation', 'Municipality', 'Grama Panchayat'];
                const baseLBsInDistrict = districtLBs.filter(lb => baseTypes.includes(lb.lb_type));
                const baseLBCodes = new Set(baseLBsInDistrict.map(lb => lb.lb_code));

                voters = wards
                    .filter(w => baseLBCodes.has(w.lb_code))
                    .reduce((acc, curr) => acc + curr.total_voters, 0);

                stations = pollingStations
                    .filter(ps => baseLBCodes.has(ps.lb_code))
                    .length;
            }

            return {
                district,
                kpiCount,
                totalWards,
                voters,
                stations
            };
        }).filter(row => !selectedKPI || ['voters', 'pollingStations', 'totalWards'].includes(selectedKPI) || row.kpiCount > 0);
    }, [districts, localBodies, wards, pollingStations, selectedKPI]);

    return (
        <div className="space-y-4">
            {/* Mobile View (Cards) */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {tableData.map((row) => (
                    <div key={row.district} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 text-lg mb-3">{row.district}</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            <div className="col-span-2 flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-slate-500">{selectedKPI && !['voters', 'pollingStations'].includes(selectedKPI) ? kpiLabel : (selectedKPI === 'totalWards' ? 'Total Wards' : 'Local Bodies')}</span>
                                <span
                                    className={`font-semibold ${selectedKPI && !['voters', 'pollingStations', 'totalWards'].includes(selectedKPI) ? 'text-blue-600' : 'text-slate-700'}`}
                                    onClick={() => {
                                        if (selectedKPI && !['voters', 'pollingStations', 'totalWards'].includes(selectedKPI)) {
                                            onDrillDown(row.district, kpiLabel);
                                        }
                                    }}
                                >
                                    {row.kpiCount.toLocaleString()} {selectedKPI && !['voters', 'pollingStations', 'totalWards'].includes(selectedKPI) && <span className="text-xs ml-1">→</span>}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500 text-xs">Total Wards</span>
                                <span className="font-medium text-slate-700">{row.totalWards.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-slate-500 text-xs">Total Voters</span>
                                <span className="font-medium text-slate-700">{row.voters.toLocaleString()}</span>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-slate-500 text-xs">Polling Stations</span>
                                <span className="font-medium text-slate-700">{row.stations.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">District</th>
                                <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider text-right">
                                    {selectedKPI && !['voters', 'pollingStations'].includes(selectedKPI) ? kpiLabel : (selectedKPI === 'totalWards' ? 'Total Wards' : 'Local Bodies')}
                                </th>
                                <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider text-right">Total Wards</th>
                                <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider text-right">Total Voters</th>
                                <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider text-right">Polling Stations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tableData.map((row) => (
                                <tr key={row.district} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-slate-900">{row.district}</td>
                                    <td
                                        className={`py-4 px-6 text-right font-medium ${selectedKPI && !['voters', 'pollingStations', 'totalWards'].includes(selectedKPI) ? 'text-blue-600 cursor-pointer hover:underline' : 'text-slate-600'}`}
                                        onClick={() => {
                                            if (selectedKPI && !['voters', 'pollingStations', 'totalWards'].includes(selectedKPI)) {
                                                onDrillDown(row.district, kpiLabel);
                                            }
                                        }}
                                    >
                                        {row.kpiCount.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 text-right">
                                        {row.totalWards.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 text-right">
                                        {row.voters.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 text-right">
                                        {row.stations.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
