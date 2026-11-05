import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, Filter, Shield } from 'lucide-react';
import { SpaceLegacyAPI } from '../services/api';
import EquipmentCard from '../components/equipment/EquipmentCard';

export default function MarsExplorerPage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await SpaceLegacyAPI.getEquipment('mars');
        setEquipmentList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="relative glass-panel p-8 sm:p-12 rounded-3xl border border-orange-950/60 overflow-hidden bg-gradient-to-r from-orange-950/30 to-space-900">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-500/40 text-xs text-orange-400 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>The Red Planet's Silent Sentinels</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            The Martian Museum
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            From the rocky boulder fields of Chryse Planitia to the floodplains of Ares Vallis and the hematite plains
            of Meridiani, explore the heroic landers and rovers resting on the Martian desert.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <span>Cataloged Martian Artifacts</span>
            <span className="text-xs font-mono font-medium text-orange-400 bg-orange-950 px-2 py-0.5 rounded-full border border-orange-800">
              {equipmentList.length} Items
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading Martian explorers...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentList.map((eq) => (
              <EquipmentCard key={eq.equipment_id} equipment={eq} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
