import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import type { LocalBody } from '../../services/dataService';

interface DistrictDrillDownProps {
    district: string;
    type: string;
    localBodies: LocalBody[];
    onBack: () => void;
    onSelectLocalBody: (lb: LocalBody) => void;
}

export const DistrictDrillDown: React.FC<DistrictDrillDownProps> = ({
    district,
    type,
    localBodies,
    onBack,
    onSelectLocalBody,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLBs = localBodies.filter(lb =>
        lb.lb_name_english.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-700 shadow-sm border border-transparent hover:border-slate-200"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{district}</h2>
                        <p className="text-sm text-slate-500">{type} List</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-64 max-w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder={`Search ${type}...`}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLBs.map((lb) => (
                        <div
                            key={lb.lb_code}
                            onClick={() => onSelectLocalBody(lb)}
                            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
                        >
                            <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                {lb.lb_name_english}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                    {lb.district_name}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {lb.total_wards} Wards
                                </span>
                            </div>
                        </div>
                    ))}
                    {filteredLBs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No local bodies found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};