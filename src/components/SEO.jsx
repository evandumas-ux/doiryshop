import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Doiry Shop';
const SITE_URL = 'https://doiryshop.com';
const DEFAULT_IMAGE = `${SITE_URL}/logo.jpg`;

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  robots = 'index, follow',
  children,
}) => {
  const fullTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : SITE_NAME;
  const canonicalUrl = url || (typeof window !== 'undefined' ? `${SITE_URL}${window.location.pathname}` : SITE_URL);
  const metaImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || ''} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || ''} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || ''} />
      <meta name="twitter:image" content={metaImage} />

      {children}
    </Helmet>
  );
};

export default SEO;
