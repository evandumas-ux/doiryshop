// Configuration Logto pour l'application React SPA
// Remplace `endpoint` et `appId` par les valeurs de ton dashboard Logto.
export const logtoConfig = {
  endpoint: 'https://zucpaw.logto.app',
  appId: 'ggx0ud5lijhyces47vnk8',             // L'App ID de ton application SPA dans Logto
  resources: [],                           // Optionnel: API Resource indicators
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  prompt: 'select_account',
};
