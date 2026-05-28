import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const RelayPicker = ({ zip, country = 'FR', onSelect }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const widgetLoaded = useRef(false);

  useEffect(() => {
    // Éviter les rechargements multiples
    if (widgetLoaded.current) return;

    const loadScripts = async () => {
      try {
        // 1. Charger jQuery si pas présent
        if (!window.jQuery) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // 2. Charger le script Mondial Relay
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js";
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        initWidget();
      } catch (err) {
        console.error("Erreur lors du chargement de Mondial Relay:", err);
        setError("Impossible de charger le module de sélection de point relais.");
        setLoading(false);
      }
    };

    const initWidget = () => {
      const $ = window.jQuery;
      if (!$) return;

      $("#Zone_Widget").MR_ParcelShopPicker({
        Target: "#Target_Widget",
        Brand: "BDTEST  ", // Code enseigne de test
        Country: country,
        PostCode: zip,
        ColLivMod: "24R", // Mode de livraison standard point relais
        NbResults: "7",
        ShowResults: true,
        OnParcelShopSelected: (data) => {
          // Formatage des données pour le parent
          onSelect({
            id: data.ID,
            name: data.Nom,
            address: `${data.Adresse1}${data.Adresse2 ? ', ' + data.Adresse2 : ''}`,
            zip: data.CP,
            city: data.Ville,
            country: data.Pays
          });
        }
      });
      
      widgetLoaded.current = true;
      setLoading(false);

      // Forcer le recalcul de la taille de la carte après un court délai
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    };

    loadScripts();
  }, [zip, country, onSelect]);

  return (
    <div className="mt-4 bg-white rounded-2xl overflow-hidden border border-surface-border">
      <style>{`
        #Zone_Widget {
            display: block !important;
            width: 100% !important;
            min-height: 600px !important;
            background: #ffffff !important;
            clear: both;
        }
        #Zone_Widget input[type="text"], 
        #Zone_Widget .MR-search-input,
        #Zone_Widget input {
            color: #000000 !important;
            background-color: #ffffff !important;
            border: 1px solid #cccccc !important;
            padding: 4px 8px !important;
        }
      `}</style>

      {loading && (
        <div className="flex items-center justify-center p-8 text-text-light text-sm">
          <Loader2 className="animate-spin mr-2" size={18} /> Chargement de la carte...
        </div>
      )}
      
      {error && (
        <div className="p-4 text-primary text-sm bg-primary/5 border-b border-surface-border">
          {error}
        </div>
      )}

      {/* Conteneur pour le widget Mondial Relay */}
      <div id="Zone_Widget" className="min-h-[400px]"></div>
      
      {/* Champ caché requis par le widget pour stocker l'ID sélectionné (utilisé en interne par le plugin) */}
      <input type="hidden" id="Target_Widget" />
      
      <div className="p-3 bg-surface text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-2">
        <MapPin size={12} /> Sélectionnez un point relais sur la carte pour valider votre livraison
      </div>
    </div>
  );
};

export default RelayPicker;
