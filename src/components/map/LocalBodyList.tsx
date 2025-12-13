import React, { useMemo, useState } from 'react';
import type { LocalBody, TrendResult } from '../../services/dataService';

interface LocalBodyListProps {
    districtName: string;
    localBodies: LocalBody[];
    trends: TrendResult[];
    onSelectLB: (lb: LocalBody) => void;
    onBack: () => void;
}

export const LocalBodyList: React.FC<LocalBodyListProps> = ({
    districtName,
    localBodies,
    trends,
    onSelectLB,
    onBack
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Grama Panchayat' | 'Block Panchayat' | 'Municipality' | 'Corporation' | 'District Panchayat'>('All');

    const filteredLBs = useMemo(() => {
        return localBodies.filter(lb => {
            const matchesSearch = lb.lb_name_english.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || lb.lb_type === filterType;
            return matchesSearch && matchesType;
        });
    }, [localBodies, searchTerm, filterType]);

    // Create a lookup for trends
    const trendLookup = useMemo(() => {
        const lookup = new Map<string, TrendResult>();
        trends.forEach(t => lookup.set(t.LB_Code, t));
        return lookup;
    }, [trends]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex flex-col gap-4 bg-white z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        ← Back
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">{districtName} Local Bodies</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search local bodies..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <option value="All">All Types</option>
                        <option value="Grama Panchayat">Grama Panchayat</option>
                        <option value="Block Panchayat">Block Panchayat</option>
                        <option value="Municipality">Municipality</option>
                        <option value="Corporation">Corporation</option>
                        <option value="District Panchayat">District Panchayat</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLBs.map(lb => {
                        const trend = trendLookup.get(lb.lb_code);
                        const leadingFront = trend?.Leading_Front || 'N/A';
                        const leadingColor =
                            leadingFront === 'LDF' ? 'text-red-600' :
                                leadingFront === 'UDF' ? 'text-indigo-600' :
                                    leadingFront === 'NDA' ? 'text-orange-600' : 'text-slate-500';

                        return (
                            <button
                                key={lb.lb_code}
                                onClick={() => onSelectLB(lb)}
                                className="text-left bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                            {lb.lb_name_english}
                                        </h3>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded mt-1 inline-block">
                                            {lb.lb_type}
                                        </span>
                                    </div>
                                    {trend && (
                                        <div className="text-right">
                                            <div className={`text-sm font-bold ${leadingColor}`}>
                                                {leadingFront} Lead
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {trend.Wards_Declared}/{lb.total_wards} Declared
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {filteredLBs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No local bodies found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};
