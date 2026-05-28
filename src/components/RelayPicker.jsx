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
            max-width: 100% !important;
            min-height: 600px !important;
            margin-top: 20px;
            margin-bottom: 20px;
            background: #ffffff !important;
            clear: both;
        }

        /* --- Global Widget Layout Fixes --- */
        #Zone_Widget .MR-ParcelShopPicker,
        #Zone_Widget .MR-Widget {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            float: none !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
        }

        /* --- Text Visibility Fix --- */
        #Zone_Widget .MR-List,
        #Zone_Widget .MR-List *,
        #Zone_Widget [class*="adresse"],
        #Zone_Widget [class*="ville"],
        #Zone_Widget .MR-parcelshop * {
            color: #222222 !important;
        }

        /* --- Search Bar Fixes (Overlap & Spacing) --- */
        #Zone_Widget .MR-search-container {
            margin-bottom: 15px !important;
            padding: 10px !important;
            background: #f8f8f8 !important;
            border-radius: 12px !important;
            display: block !important;
            text-align: center !important;
        }

        #Zone_Widget input[type="text"], 
        #Zone_Widget .MR-search-input,
        #Zone_Widget input {
            color: #000000 !important;
            background-color: #ffffff !important;
            border: 1px solid #ddd !important;
            padding: 8px 12px !important;
            border-radius: 8px !important;
            margin: 5px !important;
            width: auto !important;
            min-width: 150px !important;
            display: inline-block !important;
        }

        #Zone_Widget input:focus {
            border-color: #7a9e7e !important;
            outline: none !important;
        }

        #Zone_Widget button, 
        #Zone_Widget .MR-button,
        #Zone_Widget [type="button"] {
            margin: 5px !important;
            padding: 8px 16px !important;
            display: inline-block !important;
            vertical-align: middle !important;
            background: #5C141F !important;
            color: #ffffff !important;
            border: none !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
        }

        #Zone_Widget button:hover {
            background: #721924 !important;
            transform: translateY(-1px) !important;
        }

        /* --- List & Map split layout (Desktop) --- */
        @media (min-width: 768px) {
            #Zone_Widget .MR-results-container {
                display: flex !important;
                flex-direction: row !important;
                width: 100% !important;
                min-height: 500px !important;
                border: 1px solid #eee !important;
                border-radius: 16px !important;
                overflow: hidden !important;
            }
            
            #Zone_Widget .MR-list-container {
                width: 35% !important;
                max-height: 500px !important;
                overflow-y: auto !important;
                border-right: 1px solid #eee !important;
                background: #fff !important;
            }

            #Zone_Widget .MR-map-container {
                width: 65% !important;
                min-height: 500px !important;
            }
        }

        /* --- Individual Result Styling --- */
        #Zone_Widget .MR-parcelshop {
            padding: 12px !important;
            border-bottom: 1px solid #f0f0f0 !important;
            cursor: pointer !important;
        }

        #Zone_Widget .MR-parcelshop:hover {
            background-color: #f9fbf9 !important;
        }

        #Zone_Widget .MR-parcelshop.selected {
            background-color: #f0f5f0 !important;
            border-left: 4px solid #7a9e7e !important;
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
