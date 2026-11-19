// frontend/src/components/common/SafeIcon.jsx
// ============================================================
// Renders a lucide-react icon by name with a graceful fallback.
// ============================================================

import * as LucideIcons from 'lucide-react';
import { Circle } from 'lucide-react';
import PropTypes from 'prop-types';

const SafeIcon = ({ name, size = 24, className = '', ...rest }) => {
  const Icon = LucideIcons[name] || Circle;
  return <Icon size={size} className={className} aria-hidden="true" {...rest} />;
};

SafeIcon.propTypes = {
  name: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};

export default SafeIcon;