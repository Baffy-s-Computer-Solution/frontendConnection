// frontend/src/components/common/Section.jsx
// ============================================================
// Accessible <section> with region role + labelledby + reveal.
// ============================================================

import PropTypes from 'prop-types';
import useScrollReveal from '../../hooks/useScrollReveal';
import useSectionView from '../../hooks/useSectionView';

const Section = ({
  id,
  label,
  className = '',
  children,
  onView,
  reveal = true,
  as: Tag = 'section',
  ...rest
}) => {
  const { ref: revealRef, revealed } = useScrollReveal({ threshold: 0.08, once: true });
  const viewRef = useSectionView(id, onView || (() => {}));

  const setRefs = (node) => {
    revealRef.current = node;
    viewRef.current = node;
  };

  return (
    <Tag
      id={id}
      ref={setRefs}
      role="region"
      aria-labelledby={label ? `${id}-heading` : undefined}
      className={`section ${reveal && revealed ? 'is-revealed' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

Section.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  onView: PropTypes.func,
  reveal: PropTypes.bool,
  as: PropTypes.elementType,
};

export default Section;