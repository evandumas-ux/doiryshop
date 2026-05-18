import React, { useState, useEffect } from 'react';
import { getPacklinkDropoffs } from '../services/api';
import { MapPin, Loader2 } from 'lucide-react';

const RelayPicker = ({ serviceId, zip, country, onSelect }) => {
  const [dropoffs, setDropoffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!serviceId || !zip) return;
    
    const fetchDropoffs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPacklinkDropoffs(serviceId, zip, country);
        setDropoffs(data || []);
      } catch (err) {
        setError("Impossible de charger les points relais.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDropoffs();
  }, [serviceId, zip, country]);

  const handleSelect = (dropoff) => {
    setSelectedId(dropoff.id);
    onSelect(dropoff);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-text-light text-sm">
        <Loader2 className="animate-spin mr-2" size={18} /> Recherche des points relais...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-primary text-sm">{error}</div>;
  }

  if (dropoffs.length === 0) {
    return <div className="p-4 text-text-light text-sm">Aucun point relais trouvé pour ce code postal.</div>;
  }

  return (
    <div className="mt-3 max-h-64 overflow-y-auto border border-surface-border rounded-xl bg-background divide-y divide-surface-border">
      {dropoffs.map((d) => (
        <div 
          key={d.id} 
          onClick={() => handleSelect(d)}
          className={`p-3 cursor-pointer hover:bg-surface flex items-start gap-3 transition-colors ${selectedId === d.id ? 'bg-primary/5' : ''}`}
        >
          <div className={`mt-0.5 ${selectedId === d.id ? 'text-primary' : 'text-text-muted'}`}>
            <MapPin size={18} />
          </div>
          <div className="flex-1 text-sm">
            <div className="font-semibold text-text">{d.name}</div>
            <div className="text-text-light">{d.address}</div>
            <div className="text-text-muted text-xs mt-1">{d.zip} {d.city}</div>
          </div>
          {selectedId === d.id && (
            <div className="text-primary text-xs font-bold uppercase tracking-wide">Sélectionné</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RelayPicker;
