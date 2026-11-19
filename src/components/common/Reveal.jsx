// frontend/src/components/common/Reveal.jsx
// ============================================================

import PropTypes from 'prop-types';
import useScrollReveal from '../../hooks/useScrollReveal';

const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const { ref, revealed } = useScrollReveal({ threshold: 0.1, once: true });
  return (
    <Tag
      ref={ref}
      className={`reveal ${revealed ? 'is-revealed' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};

Reveal.propTypes = {
  children: PropTypes.node,
  delay: PropTypes.number,
  className: PropTypes.string,
  as: PropTypes.elementType,
};

export default Reveal;