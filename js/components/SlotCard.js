import React from 'https://esm.sh/react@18.2.0';
import { Truck, Box, CheckCircle, AlertTriangle } from 'https://esm.sh/lucide-react@0.263.1';

const SlotCard = ({ data, onClick, index, type }) => {
    const statusNorm = (data.status || '').toLowerCase().replace('.', '').trim();
    const isOccupied = statusNorm !== 'vacía' && statusNorm !== '';

    let cardStyle = "bg-white dark:bg-stone-800 border-2 border-transparent dark:border-stone-700/50 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/30 text-stone-400 dark:text-stone-500 hover:shadow-lg dark:hover:shadow-black/40";
    let iconColor = "text-stone-300 dark:text-stone-600";
    let statusBadge = "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-600";

    if (statusNorm === 'cargada') {
        cardStyle = "bg-white dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 hover:shadow-lg hover:shadow-rose-200/50 dark:hover:shadow-rose-900/20";
        iconColor = "text-rose-400 dark:text-rose-500";
        statusBadge = "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-800/50";
    }
    if (statusNorm === 'frenteada') {
        cardStyle = "bg-white dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/20";
        iconColor = "text-amber-400 dark:text-amber-500";
        statusBadge = "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50";
    }
    if (statusNorm === 'enrampada') {
        cardStyle = "bg-white dark:bg-sky-900/10 border-2 border-sky-100 dark:border-sky-900/30 text-sky-700 dark:text-sky-400 hover:shadow-lg hover:shadow-sky-200/50 dark:hover:shadow-sky-900/20";
        iconColor = "text-sky-400 dark:text-sky-500";
        statusBadge = "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 border border-sky-100 dark:border-sky-800/50";
    }
    if (statusNorm === 'vacía' && (data.eco || data.line)) {
        cardStyle = "bg-white dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/20";
        iconColor = "text-emerald-400 dark:text-emerald-500";
        statusBadge = "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50";
    }

    const delayStyle = { animationDelay: `${(index % 10) * 50}ms` };
    let ecoText = 'Disponible';
    if (data.eco) ecoText = `ECO ${data.eco}`;
    else if (isOccupied) ecoText = 'Sin económico';

    return React.createElement('div', {
        style: delayStyle,
        onClick: () => onClick(index, type),
        className: `relative p-4 rounded-[1.5rem] transition-all duration-500 ease-out cursor-pointer active:scale-95 flex flex-col justify-between h-36 sm:h-44 group animate-slide-up hover-float ${cardStyle}`
    }, [
        React.createElement('div', { key: 'header', className: "flex justify-between items-start" }, [
            React.createElement('div', { key: 'info', className: "flex flex-col" }, [
                React.createElement('span', { key: 'num', className: "font-black text-2xl sm:text-3xl tracking-tighter opacity-90 transition-transform group-hover:scale-105 origin-left text-stone-700 dark:text-stone-200" }, type === 'docks' ? `${data.number}` : `P${data.number}`),
                React.createElement('span', { key: 'label', className: "text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-50 mt-0.5" }, type === 'docks' ? 'Andén' : 'Patio')
            ]),
            isOccupied
                ? React.createElement('div', { key: 'icon', className: `p-2 rounded-xl bg-stone-50 dark:bg-stone-900/50 shadow-inner ${iconColor} transition-transform group-hover:rotate-3 group-hover:scale-110 duration-300` }, React.createElement(Truck, { size: 18, strokeWidth: 1.5 }))
                : React.createElement('div', { key: 'icon', className: `p-2 rounded-xl bg-stone-50 dark:bg-stone-900/50 ${iconColor} transition-transform group-hover:scale-110 duration-300` }, React.createElement(Box, { size: 18, strokeWidth: 1.5 }))
        ]),
        React.createElement('div', { key: 'details', className: "space-y-1" }, [
            React.createElement('div', { key: 'eco', className: "text-sm sm:text-base font-bold truncate opacity-90 dark:opacity-100" }, ecoText),
            data.line && React.createElement('div', { key: 'line', className: "text-[10px] sm:text-xs font-bold uppercase truncate opacity-60 dark:opacity-70 flex items-center gap-1" }, [
                React.createElement('span', { className: "w-1 h-1 rounded-full bg-current opacity-40" }), data.line
            ]),
            React.createElement('div', { key: 'status', className: `text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-full w-fit tracking-wide transition-all duration-300 ${statusBadge} mt-1.5` }, (data.status || 'Sin Asignar').toUpperCase())
        ]),
        (statusNorm === 'cargada' || statusNorm === 'frenteada') && React.createElement('div', { key: 'alert', className: "absolute top-3 right-3 transition-all duration-300 group-hover:scale-125" },
            data.sealRight ? React.createElement(CheckCircle, { size: 16, className: "text-emerald-500 fill-emerald-50" }) : React.createElement(AlertTriangle, { size: 16, className: "text-rose-500 fill-rose-50" })
        )
    ]);
};

export default SlotCard;
