// src/components/layout/LoadingSpinner.jsx
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner Component
 * Displays a loading spinner with optional message and size variants
 */
export const LoadingSpinner = ({ message = 'Loading...', size = 'lg' }) => {
  const spinnerSize = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className={`${spinnerSize[size]} mx-auto animate-spin text-brand-600`} aria-label="Loading" />
        {message && <p className="mt-3 text-sm text-slate-500">{message}</p>}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default LoadingSpinner;
