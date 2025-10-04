import React from 'react';
import { ODS } from '../types';

interface ODSSelectorProps {
    selectedODS: ODS;
    onODSChange: (ods: ODS) => void;
}

export const ODSSelector: React.FC<ODSSelectorProps> = ({ selectedODS, onODSChange }) => {
    const odsOptions = Object.values(ODS);

    return (
        <div>
            <h3 className="text-2xl font-bold text-slate-200 mb-2 text-center font-heading tracking-wider">1. Escolha sua Missão (ODS)</h3>
            <select
                value={selectedODS}
                onChange={(e) => onODSChange(e.target.value as ODS)}
                className="w-full p-3 bg-black/20 border border-blue-500/30 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                }}
            >
                {odsOptions.map((ods) => (
                    <option key={ods} value={ods} disabled={ods === ODS.NONE} className="bg-slate-800 text-white">
                        {ods === ODS.NONE ? "Selecione uma ODS..." : ods}
                    </option>
                ))}
            </select>
        </div>
    );
};