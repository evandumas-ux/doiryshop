const REVOLUT_ME_URL = 'https://revolut.me/dumase07';

export const buildOrderReference = (orderId) => `Doiry-${orderId}`;

export const buildRevolutMeUrl = ({ amount, orderId, reference }) => {
  const paymentReference = reference || buildOrderReference(orderId);
  const paymentAmount = Number.parseFloat(amount);

  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    throw new Error('Montant Revolut invalide');
  }

  const params = new URLSearchParams({
    currency: 'EUR',
    amount: paymentAmount.toFixed(2),
    note: paymentReference
  });

  return `${REVOLUT_ME_URL}?${params.toString()}`;
};
