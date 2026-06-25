const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const PRODUCT_PRICE_MAP = {
  'lessentiel-base-pure-vrac-30g': { retail: 8.9, b2b: 5.3 },
  'elixir-nocturne-infusion-vrac-50g': { retail: 12.9, b2b: 7.7 },
  'elixir-nocturne-boite-de-10-infusettes': { retail: 7.9, b2b: 5.5 },
  'elixir-nocturne-boite-de-20-infusettes': { retail: 13.9, b2b: 9.7 },
  'linstant-pack-de-pre-roules-x3': { retail: 6.9, b2b: 4.5 },
  'linstant-pack-de-pre-roules-x5': { retail: 9.0, b2b: 5.85 },
  'le-coffret-transition-kit-de-roulage': { retail: 19.9, b2b: 13.9 },
};

const PRODUCT_ALIASES = {
  'lessentiel-base-pure-en-vrac-30g': 'lessentiel-base-pure-vrac-30g',
  'lessentiel-vrac-30g': 'lessentiel-base-pure-vrac-30g',
  'elixir-nocturne-infusion-en-vrac-50g': 'elixir-nocturne-infusion-vrac-50g',
  'elixir-nocturne-vrac-50g': 'elixir-nocturne-infusion-vrac-50g',
  'elixir-nocturne-boite-10-infusettes': 'elixir-nocturne-boite-de-10-infusettes',
  'elixir-nocturne-boite-20-infusettes': 'elixir-nocturne-boite-de-20-infusettes',
  'linstant-x3': 'linstant-pack-de-pre-roules-x3',
  'linstant-x5': 'linstant-pack-de-pre-roules-x5',
  'coffret-transition': 'le-coffret-transition-kit-de-roulage',
};

const resolvePricingKey = (product) => {
  const slug = normalizeText(product?.slug);
  if (slug && PRODUCT_PRICE_MAP[slug]) return slug;
  if (slug && PRODUCT_ALIASES[slug]) return PRODUCT_ALIASES[slug];

  const name = normalizeText(product?.name);

  if (name.includes('essentiel') && name.includes('30') && name.includes('vrac')) {
    return 'lessentiel-base-pure-vrac-30g';
  }
  if (name.includes('elixir') && name.includes('50') && name.includes('vrac')) {
    return 'elixir-nocturne-infusion-vrac-50g';
  }
  if (name.includes('elixir') && name.includes('10') && name.includes('infusettes')) {
    return 'elixir-nocturne-boite-de-10-infusettes';
  }
  if (name.includes('elixir') && name.includes('20') && name.includes('infusettes')) {
    return 'elixir-nocturne-boite-de-20-infusettes';
  }
  if (name.includes('instant') && name.includes('3')) {
    return 'linstant-pack-de-pre-roules-x3';
  }
  if (name.includes('instant') && name.includes('5')) {
    return 'linstant-pack-de-pre-roules-x5';
  }
  if (name.includes('transition')) {
    return 'le-coffret-transition-kit-de-roulage';
  }

  return slug || name;
};

export const getPricingTier = (product, role) => {
  const key = resolvePricingKey(product);
  const canonical = PRODUCT_PRICE_MAP[key];
  const isB2B = normalizeText(role) === 'b2b';

  const retailPrice = Number(canonical?.retail ?? product?.price ?? 0);
  const activePrice = Number(
    isB2B && canonical?.b2b !== undefined
      ? canonical.b2b
      : product?.price ?? retailPrice
  );
  const retailStrikePrice = Number(
    canonical?.retail ?? product?.old_price ?? product?.competitor_price ?? retailPrice
  );

  return {
    key,
    isB2B,
    activePrice,
    retailStrikePrice,
    showUnitMetric: !isB2B && Boolean(product?.price_per_unit && product?.unit_label),
    unitLabel: product?.unit_label || null,
  };
};

export const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

export const formatEuro = formatMoney;
