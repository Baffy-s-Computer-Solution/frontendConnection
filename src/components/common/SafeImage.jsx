// frontend/src/components/common/SafeImage.jsx
// ============================================================
// <img> with graceful fallback on error.
// ============================================================

import { useState } from 'react';
import PropTypes from 'prop-types';

const FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23eef2ff"/><text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="28" fill="%236366f1" text-anchor="middle" dominant-baseline="middle">Career Connect Lesotho</text></svg>';

const SafeImage = ({ src, alt, fallback = FALLBACK, ...rest }) => {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? fallback : src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
};

SafeImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  fallback: PropTypes.string,
};

export default SafeImage;