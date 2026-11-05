import React, { useEffect, useState } from 'react';
import { Moon, Sparkles, Filter, Shield } from 'lucide-react';
import { SpaceLegacyAPI } from '../services/api';
import EquipmentCard from '../components/equipment/EquipmentCard';

export default function MoonExplorerPage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await SpaceLegacyAPI.getEquipment('moon');
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
      <div className="relative glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300 mb-4">
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Earth's Attic & Ancient Archive</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            The Lunar Museum
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Without wind, water, or active tectonics, every descent stage, laser retroreflector, and footpad left on the
            Moon remains preserved in pristine condition for millions of years.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <span>Cataloged Lunar Artifacts</span>
            <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
              {equipmentList.length} Items
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading lunar explorers...</div>
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
