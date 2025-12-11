import React from 'react';
import { cn } from '../../lib/utils';
import { Building2, Users, List } from 'lucide-react';

interface KPIProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    onViewList?: (e: React.MouseEvent) => void;
    color?: string;
    hasList?: boolean;
}

const KPICard: React.FC<KPIProps> = ({ label, value, icon, active, onClick, onViewList, color = "bg-blue-500", hasList }) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 cursor-pointer group",
                active
                    ? "border-blue-500 bg-white shadow-md ring-1 ring-blue-500"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
            )}
        >
            <div className={cn(
                "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110",
                color.replace('bg-', 'bg-') // Ensure we use the same color family
            )} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-3">
                    <div className={cn("p-2.5 rounded-xl text-white shadow-sm", color)}>
                        {icon}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasList && (
                            <button
                                onClick={onViewList}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="View All List"
                            >
                                <List size={16} />
                            </button>
                        )}
                        {active && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                    </div>
                </div>

                <div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight block">
                        {value.toLocaleString()}
                    </span>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{label}</p>
                </div>
            </div>
        </div>
    );
};

interface KPIGridProps {
    counts: {
        corporations: number;
        municipalities: number;
        gramaPanchayats: number;
        blockPanchayats: number;
        districtPanchayats: number;
        voters: number;
        pollingStations: number;
        totalWards: number;
    };
    selectedKPI: string | null;
    onSelectKPI: (kpi: string | null) => void;
    onDrillDown: (kpiId: string) => void;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ counts, selectedKPI, onSelectKPI, onDrillDown }) => {
    const kpis = [
        { id: 'corporations', label: 'Corporations', value: counts.corporations, icon: <Building2 size={20} />, color: 'bg-indigo-500', hasList: true },
        { id: 'municipalities', label: 'Municipalities', value: counts.municipalities, icon: <Building2 size={20} />, color: 'bg-purple-500', hasList: true },
        { id: 'gramaPanchayats', label: 'Grama Panchayats', value: counts.gramaPanchayats, icon: <Building2 size={20} />, color: 'bg-green-500', hasList: true },
        { id: 'blockPanchayats', label: 'Block Panchayats', value: counts.blockPanchayats, icon: <Building2 size={20} />, color: 'bg-teal-500', hasList: true },
        { id: 'districtPanchayats', label: 'District Panchayats', value: counts.districtPanchayats, icon: <Building2 size={20} />, color: 'bg-orange-500', hasList: true },
        { id: 'voters', label: 'Total Voters', value: counts.voters, icon: <Users size={20} />, color: 'bg-rose-500', hasList: false },
        { id: 'totalWards', label: 'Total Wards', value: counts.totalWards, icon: <Building2 size={20} />, color: 'bg-blue-500', hasList: false },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {kpis.map((kpi) => (
                <KPICard
                    key={kpi.id}
                    label={kpi.label}
                    value={kpi.value}
                    icon={kpi.icon}
                    color={kpi.color}
                    active={selectedKPI === kpi.id}
                    hasList={kpi.hasList}
                    onClick={() => onSelectKPI(selectedKPI === kpi.id ? null : kpi.id)}
                    onViewList={(e) => {
                        e.stopPropagation();
                        if (onDrillDown) onDrillDown(kpi.id);
                    }}
                />
            ))}
        </div>
    );
};
