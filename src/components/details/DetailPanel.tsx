import React from 'react';
import type { LocalBody, Ward, PollingStation } from '../../services/dataService';
import { ArrowLeft, MapPin, Vote, Users, Building2 } from 'lucide-react';
import { KeralaMap } from '../map/KeralaMap';

interface DetailPanelProps {
    localBody: LocalBody;
    onBack: () => void;
    wards: Ward[];
    pollingStations: PollingStation[];
    geoJsonData: any | null;
    localBodies: LocalBody[];
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ localBody, onBack, wards, pollingStations, geoJsonData, localBodies }) => {
    const lbWards = wards.filter(w => w.lb_code === localBody.lb_code);

    let totalPollingStations = 0;

    if (localBody.lb_type === 'District Panchayat') {
        // Aggregate polling stations for the entire district
        // User requested to ONLY include Grama Panchayats for District Panchayat count
        const districtGPs = localBodies.filter(lb =>
            lb.district_name === localBody.district_name && lb.lb_type === 'Grama Panchayat'
        );
        const districtGPCodes = new Set(districtGPs.map(lb => lb.lb_code));

        // Count polling stations belonging to these GPs
        totalPollingStations = pollingStations.filter(ps => districtGPCodes.has(ps.lb_code)).length;
    } else {
        // Base tiers and Block Panchayat
        // For Block Panchayat, we now have rows in polling_stations.csv with the Block Code
        const lbPollingStations = pollingStations.filter(ps => ps.lb_code === localBody.lb_code);
        totalPollingStations = lbPollingStations.length;
    }

    const totalVoters = lbWards.reduce((acc, curr) => acc + curr.total_voters, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 shadow-xl z-30 relative">
            <div className="p-6 border-b border-slate-200 bg-white flex items-center gap-4 shadow-sm">
                <button
                    onClick={onBack}
                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 truncate tracking-tight">{localBody.lb_name_english}</h2>
                    <p className="text-sm text-slate-500 truncate">Local Body Details</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Map Section */}
                <div className="h-64 w-full bg-slate-200 relative">
                    <KeralaMap geoJsonData={geoJsonData} />
                </div>

                <div className="p-6">
                    <div className="mb-8">
                        <span className="inline-flex items-center px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100 shadow-sm">
                            {localBody.lb_type} • {localBody.district_name}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <div className="p-3 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                                <div className="hidden md:block p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Vote size={24} />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Total Voters</p>
                                    <p className="text-lg md:text-2xl font-bold text-slate-900">{totalVoters.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                                <div className="hidden md:block p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Polling Stations</p>
                                    <p className="text-lg md:text-2xl font-bold text-slate-900">{totalPollingStations.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                                <div className="hidden md:block p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Total Wards</p>
                                    <p className="text-lg md:text-2xl font-bold text-slate-900">{localBody.total_wards}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-slate-400" />
                            Ward Breakdown
                        </h3>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Ward No</th>
                                            <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Name</th>
                                            <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 text-right">Voters</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {lbWards.map((ward) => (
                                            <tr key={ward.ward_code} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 text-slate-500 font-medium text-sm">{ward.ward_no}</td>
                                                <td className="py-3 px-4 text-slate-900 font-medium text-sm">{ward.ward_name_english}</td>
                                                <td className="py-3 px-4 text-slate-600 text-sm text-right font-mono">{ward.total_voters.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
