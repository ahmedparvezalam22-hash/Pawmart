import { useEffect } from 'react';
import { updateDocumentSEO, SEOConfig } from '../services/seoService';

/**
 * Custom React hook to seamlessly synchronize page title, meta description,
 * canonical links, social tags, and Schema.org JSON-LD structured data on mount/update.
 */
export const useSEO = (config: SEOConfig) => {
  useEffect(() => {
    updateDocumentSEO(config);
  }, [
    config.title,
    config.description,
    config.canonicalPath,
    config.canonicalUrl,
    config.ogImage,
    config.ogType,
    config.noIndex,
    JSON.stringify(config.jsonLd || null),
  ]);
};
