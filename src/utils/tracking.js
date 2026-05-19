/**
 * Envoie un événement structuré au dataLayer de GTM (Google Tag Manager)
 * 
 * @param {string} eventName - Nom de l'événement (ex: 'arret_tabac_cta_click')
 * @param {Object} payload - Données supplémentaires liées à l'événement
 */
export const trackEvent = (eventName, payload = {}) => {
  // Initialisation sécurisée du dataLayer
  window.dataLayer = window.dataLayer || [];
  
  const eventData = {
    event: eventName,
    ...payload,
    timestamp: new Date().toISOString()
  };

  // Push dans le dataLayer
  window.dataLayer.push(eventData);

  // Log en environnement de développement pour faciliter le debug
  if (import.meta.env.DEV) {
    console.log(`[Tracking Event] ${eventName}`, eventData);
  }
};
