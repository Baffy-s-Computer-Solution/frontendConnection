/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

import { logger } from '../utils/logger';

// Create context
const ThemeContext = createContext();

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const COLOR_SCHEMES = {
  DEFAULT: 'default',
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange',
};

// Initial state
const initialState = {
  theme: THEMES.LIGHT,
  colorScheme: COLOR_SCHEMES.DEFAULT,
  fontSize: 'medium', // small, medium, large
  reducedMotion: false,
  highContrast: false,
  customColors: {},
};

const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return THEMES.LIGHT;
  }

  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery && typeof mediaQuery.matches === 'boolean'
      ? mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT
      : THEMES.LIGHT;
  } catch (error) {
    logger.error('Failed to read system theme preference:', error);
    return THEMES.LIGHT;
  }
};

// Context provider component
export const ThemeProvider = ({ children, defaultTheme = THEMES.LIGHT }) => {
  const [state, setState] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem('theme_preferences');
        if (savedTheme) {
          const parsed = JSON.parse(savedTheme);
          return { ...initialState, ...parsed };
        }
      }
    } catch (error) {
      logger.error('Failed to load theme preferences:', error);
    }
    return { ...initialState, theme: defaultTheme };
  });

  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    let mediaQuery;
    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    } catch (error) {
      logger.error('Failed to subscribe to system theme changes:', error);
      return undefined;
    }

    if (!mediaQuery || typeof mediaQuery.matches !== 'boolean') {
      return undefined;
    }

    const handleChange = (e) => {
      setSystemTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const activeTheme = state.theme === THEMES.SYSTEM ? systemTheme : state.theme;

    // Apply theme class
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    root.classList.add(activeTheme);

    // Apply color scheme
    root.setAttribute('data-color-scheme', state.colorScheme);

    // Apply font size
    root.setAttribute('data-font-size', state.fontSize);

    // Apply accessibility settings
    if (state.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (state.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply custom colors
    Object.entries(state.customColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Save to localStorage
    try {
      localStorage.setItem('theme_preferences', JSON.stringify(state));
    } catch (error) {
      logger.error('Failed to save theme preferences:', error);
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const computedStyle = getComputedStyle(root);
      const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
      metaThemeColor.setAttribute('content', primaryColor || '#1976d2');
    }
  }, [state, systemTheme]);

  // Set theme
  const setTheme = useCallback((theme) => {
    if (!Object.values(THEMES).includes(theme)) {
      logger.warn(`Invalid theme: ${theme}`);
      return;
    }
    setState((prev) => ({ ...prev, theme }));
  }, []);

  // Set color scheme
  const setColorScheme = useCallback((scheme) => {
    if (!Object.values(COLOR_SCHEMES).includes(scheme)) {
      logger.warn(`Invalid color scheme: ${scheme}`);
      return;
    }
    setState((prev) => ({ ...prev, colorScheme: scheme }));
  }, []);

  // Set font size
  const setFontSize = useCallback((size) => {
    if (!['small', 'medium', 'large'].includes(size)) {
      logger.warn(`Invalid font size: ${size}`);
      return;
    }
    setState((prev) => ({ ...prev, fontSize: size }));
  }, []);

  // Toggle reduced motion
  const toggleReducedMotion = useCallback(() => {
    setState((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    setState((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  // Set custom color
  const setCustomColor = useCallback((key, value) => {
    setState((prev) => ({
      ...prev,
      customColors: { ...prev.customColors, [key]: value },
    }));
  }, []);

  // Reset to defaults
  const resetTheme = useCallback(() => {
    setState({ ...initialState, theme: defaultTheme });
  }, [defaultTheme]);

  // Get current effective theme
  const effectiveTheme = useMemo(
    () => (state.theme === THEMES.SYSTEM ? systemTheme : state.theme),
    [state.theme, systemTheme]
  );

  // Get CSS variables
  const cssVariables = useMemo(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const variables = {};

    // Extract all CSS custom properties
    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle[i];
      if (prop.startsWith('--')) {
        variables[prop] = computedStyle.getPropertyValue(prop).trim();
      }
    }

    return variables;
  }, [effectiveTheme, state.colorScheme]);

  const value = {
    // State
    theme: state.theme,
    colorScheme: state.colorScheme,
    fontSize: state.fontSize,
    reducedMotion: state.reducedMotion,
    highContrast: state.highContrast,
    customColors: state.customColors,
    effectiveTheme,
    systemTheme,
    cssVariables,

    // Actions
    setTheme,
    setColorScheme,
    setFontSize,
    toggleReducedMotion,
    toggleHighContrast,
    setCustomColor,
    resetTheme,

    // Helpers
    isDark: effectiveTheme === THEMES.DARK,
    isLight: effectiveTheme === THEMES.LIGHT,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Higher-order component
export const withTheme = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ThemeContext.Consumer>
        {(themeProps) => <Component {...props} theme={themeProps} />}
      </ThemeContext.Consumer>
    );
  };
};
