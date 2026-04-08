import React from 'react';
import type { TrendResult } from '../../services/dataService';
import { X, Trophy } from 'lucide-react';

interface WardDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    wardNo: string | null;
    trendData?: TrendResult;
}

export const WardDetailModal: React.FC<WardDetailModalProps> = ({
    isOpen,
    onClose,
    wardNo,
    trendData,
}) => {
    if (!isOpen || !wardNo || !trendData) return null;

    const info = trendData.wardInfo?.[wardNo];
    if (!info) return null;

    // Determine winner/status
    const winner = info.winner;
    const topCandidate = info.candidates?.[0];
    const secondCandidate = info.candidates?.[1];
    const isUncontested = info.candidates?.length === 1;
    const isHung =
        !isUncontested &&
        topCandidate &&
        secondCandidate &&
        topCandidate.votes > 0 &&
        topCandidate.votes === secondCandidate.votes;

    // Implicit lead logic
    const isImplicitLead =
        !winner &&
        !info.leading &&
        topCandidate &&
        (topCandidate.votes > 0 || isUncontested);
    const leader = info.leading || (isImplicitLead ? topCandidate : undefined);

    return (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6'>
            {/* Backdrop */}
            <div
                className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity'
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className='relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85dvh] animate-in fade-in zoom-in-95 duration-200'>
                {/* Header */}
                {/* Header */}
                <div className='px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0 sticky top-0'>
                    <div className='flex-1 min-w-0 pr-4'>
                        <h3 className='text-xl font-bold text-slate-900 truncate'>
                            Ward {wardNo}
                        </h3>
                        <p className='text-sm text-slate-500 font-medium truncate'>
                            {info.wardName}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className='p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0'
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className='p-4 sm:p-6 overflow-y-auto custom-scrollbar'>
                    {/* Status Banner */}
                    <div className='mb-6'>
                        {isHung ? (
                            <div className='bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center gap-3'>
                                <div className='p-2 bg-purple-100 text-purple-600 rounded-lg'>
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <div className='font-bold text-purple-700'>
                                        TIED / HUNG ELECTION
                                    </div>
                                    <div className='text-xs text-purple-600 mt-0.5'>
                                        Equal votes for top candidates
                                    </div>
                                </div>
                            </div>
                        ) : isUncontested && winner ? (
                            <div className='bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center gap-3'>
                                <div className='p-2 bg-purple-100 text-purple-600 rounded-lg'>
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <div className='font-bold text-purple-700'>
                                        ELECTED UNOPPOSED
                                    </div>
                                    <div className='text-xs text-purple-600 mt-0.5'>
                                        Winner: {winner.name} ({winner.group})
                                    </div>
                                </div>
                            </div>
                        ) : winner ? (
                            <div
                                className={`
                                border rounded-xl p-4 flex items-center gap-3
                                ${
                                    winner.group === 'LDF'
                                        ? 'bg-red-50 border-red-100'
                                        : winner.group === 'UDF'
                                          ? 'bg-indigo-50 border-indigo-100'
                                          : winner.group === 'NDA'
                                            ? 'bg-orange-50 border-orange-100'
                                            : 'bg-slate-50 border-slate-100'
                                }
                            `}
                            >
                                <div
                                    className={`
                                    p-2 rounded-lg
                                    ${
                                        winner.group === 'LDF'
                                            ? 'bg-red-100 text-red-600'
                                            : winner.group === 'UDF'
                                              ? 'bg-indigo-100 text-indigo-600'
                                              : winner.group === 'NDA'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-slate-200 text-slate-600'
                                    }
                                `}
                                >
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <div
                                        className={`font-bold ${
                                            winner.group === 'LDF'
                                                ? 'text-red-700'
                                                : winner.group === 'UDF'
                                                  ? 'text-indigo-700'
                                                  : winner.group === 'NDA'
                                                    ? 'text-orange-700'
                                                    : 'text-slate-700'
                                        }`}
                                    >
                                        WINNER: {winner.name} ({winner.group})
                                    </div>
                                    <div className='text-xs opacity-80 mt-0.5'>
                                        {secondCandidate
                                            ? `Won by margin of ${(winner.votes - secondCandidate.votes).toLocaleString()} votes`
                                            : `Won with ${winner.votes.toLocaleString()} votes`}
                                    </div>
                                </div>
                            </div>
                        ) : leader ? (
                            <div className='bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3'>
                                <div className='p-2 bg-blue-100 text-blue-600 rounded-lg'>
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <div className='font-bold text-blue-700'>
                                        LEADING: {leader.name} ({leader.group})
                                    </div>
                                    <div className='text-xs text-blue-600 mt-0.5'>
                                        Currently leading with{' '}
                                        {leader.votes.toLocaleString()} votes
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-slate-500 font-medium'>
                                No result available
                            </div>
                        )}
                    </div>

                    {/* Candidates List */}
                    {/* Candidates List */}
                    <div className='space-y-3'>
                        <h4 className='text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3'>
                            Candidates
                        </h4>

                        {(() => {
                            const totalWardVotes = info.candidates.reduce(
                                (sum, c) => sum + (c.votes ?? 0),
                                0,
                            );
                            const maxVotes = Math.max(
                                ...info.candidates.map((c) => c.votes ?? 0),
                            );

                            return info.candidates.map((cand, idx) => {
                                const isWinner =
                                    cand.status?.toLowerCase() === 'won';

                                const barPercent = isUncontested
                                    ? 100
                                    : maxVotes > 0
                                      ? (cand.votes / maxVotes) * 100
                                      : 0;

                                const voteSharePercent =
                                    totalWardVotes > 0
                                        ? (
                                              (cand.votes / totalWardVotes) *
                                              100
                                          ).toFixed(1)
                                        : '0.0';

                                const margin =
                                    isWinner && info.candidates.length > 1
                                        ? cand.votes -
                                          (info.candidates.find(
                                              (c) => !isWinner || c !== cand,
                                          )?.votes ?? 0)
                                        : null;

                                // Recompute runner-up properly
                                const sortedByVotes = [...info.candidates].sort(
                                    (a, b) => (b.votes ?? 0) - (a.votes ?? 0),
                                );
                                const winMargin =
                                    isWinner && sortedByVotes.length > 1
                                        ? cand.votes - sortedByVotes[1].votes
                                        : null;

                                return (
                                    <div
                                        key={idx}
                                        className={`relative overflow-hidden rounded-xl border ${
                                            isWinner
                                                ? 'border-yellow-200 bg-yellow-50/50'
                                                : 'border-slate-100 bg-white'
                                        }`}
                                    >
                                        {/* Bar Background */}
                                        <div
                                            className={`absolute inset-y-0 left-0 opacity-[0.07] ${
                                                cand.group === 'LDF'
                                                    ? 'bg-red-500'
                                                    : cand.group === 'UDF'
                                                      ? 'bg-indigo-500'
                                                      : cand.group === 'NDA'
                                                        ? 'bg-orange-500'
                                                        : 'bg-slate-400'
                                            }`}
                                            style={{ width: `${barPercent}%` }}
                                        />

                                        <div className='relative p-3'>
                                            {/* Name + Winner badge */}
                                            <div className='flex justify-between items-start mb-1.5'>
                                                <div className='font-bold text-slate-800 text-sm'>
                                                    {cand.name}
                                                </div>
                                                {isWinner && (
                                                    <span className='text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded ml-2 shrink-0'>
                                                        WINNER
                                                    </span>
                                                )}
                                            </div>

                                            {/* Party + Votes + % */}
                                            <div className='flex justify-between items-center text-xs'>
                                                <span
                                                    className={`font-semibold ${
                                                        cand.group === 'LDF'
                                                            ? 'text-red-600'
                                                            : cand.group ===
                                                                'UDF'
                                                              ? 'text-indigo-600'
                                                              : cand.group ===
                                                                  'NDA'
                                                                ? 'text-orange-600'
                                                                : 'text-slate-600'
                                                    }`}
                                                >
                                                    {cand.party}
                                                    <span className='ml-1.5 text-slate-400 font-normal'>
                                                        {cand.group}
                                                    </span>
                                                </span>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-slate-400 font-medium'>
                                                        {voteSharePercent}%
                                                    </span>
                                                    <span className='font-mono font-bold text-slate-900 bg-white/70 px-1.5 py-0.5 rounded border border-slate-100'>
                                                        {cand.votes.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Win margin — only on winner row */}
                                            {isWinner && winMargin !== null && (
                                                <div className='mt-1.5 text-[11px] text-slate-400'>
                                                    Won by{' '}
                                                    <span className='font-semibold text-emerald-600'>
                                                        +
                                                        {winMargin.toLocaleString()}
                                                    </span>{' '}
                                                    votes
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            });
                        })()}

                        {(!info.candidates || info.candidates.length === 0) && (
                            <div className='text-center py-8 text-slate-400 italic text-sm'>
                                No candidate data available for this ward.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
