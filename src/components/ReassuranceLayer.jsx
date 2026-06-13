import React from 'react';
import { ShieldCheck, Truck, Leaf } from 'lucide-react';

const ReassuranceLayer = ({ className = "" }) => {
  return (
    <div className={`flex flex-col gap-2.5 mt-4 ${className}`}>
      <div className="flex items-center gap-2.5 text-neutral-400">
        <div className="p-1 rounded-full bg-neutral-100/5 border border-white/5">
          <ShieldCheck size={14} className="text-neutral-500" />
        </div>
        <span className="text-[11px] tracking-premium font-medium">Paiement 100% Sécurisé</span>
      </div>
      <div className="flex items-center gap-2.5 text-neutral-400">
        <div className="p-1 rounded-full bg-neutral-100/5 border border-white/5">
          <Truck size={14} className="text-neutral-500" />
        </div>
        <span className="text-[11px] tracking-premium font-medium">Livraison Discrète & Rapide</span>
      </div>
      <div className="flex items-center gap-2.5 text-neutral-400">
        <div className="p-1 rounded-full bg-neutral-100/5 border border-white/5">
          <Leaf size={14} className="text-neutral-500" />
        </div>
        <span className="text-[11px] tracking-premium font-medium">Plantes Sélectionnées à la Main</span>
      </div>
    </div>
  );
};

export default ReassuranceLayer;
