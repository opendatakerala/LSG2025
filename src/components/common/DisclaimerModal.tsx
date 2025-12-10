import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DisclaimerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <div className="p-2 bg-amber-50 rounded-xl">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Disclaimer</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="prose prose-sm text-slate-600">
                        <p className="leading-relaxed">
                            The accuracy or completeness of the data presented on this page cannot be guaranteed.
                            The information has been sourced from the SEC Kerala website.
                            If you notice any errors or discrepancies, please <a href="https://github.com/gnoeee/KeralaLSGElection/issues">let me know </a>so they can be reviewed.
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
