import { SxProps, Theme } from '@mui/material/styles';

// Advanced utility functions for responsive design and theming

export const responsiveSpacing = (multiplier: number = 1) => ({
  xs: multiplier * 0.5,
  sm: multiplier * 1,
  md: multiplier * 1.5,
  lg: multiplier * 2,
  xl: multiplier * 2.5,
});

export const responsiveFontSize = (baseSize: number) => ({
  xs: `${baseSize * 0.8}px`,
  sm: `${baseSize}px`,
  md: `${baseSize * 1.1}px`,
  lg: `${baseSize * 1.2}px`,
});

export const responsiveBorderRadius = (baseRadius: number = 8) => ({
  xs: baseRadius * 0.5,
  sm: baseRadius * 0.75,
  md: baseRadius,
  lg: baseRadius * 1.25,
});

export const glassmorphism = (opacity: number = 0.1, blur: number = 10): SxProps<Theme> => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

export const gradientBackground = (colors: string[], direction: string = '135deg'): SxProps<Theme> => ({
  background: `linear-gradient(${direction}, ${colors.join(', ')})`,
});

export const responsiveFlex = (
  direction: 'row' | 'column' = 'row',
  align: 'flex-start' | 'center' | 'flex-end' | 'stretch' = 'center',
  justify: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' = 'center'
): SxProps<Theme> => ({
  display: 'flex',
  flexDirection: direction,
  alignItems: align,
  justifyContent: justify,
  flexWrap: 'wrap',
});

export const responsiveGrid = (
  columns: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number },
  gap: number = 2
): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: {
    xs: `repeat(${columns.xs || 1}, 1fr)`,
    sm: `repeat(${columns.sm || columns.xs || 1}, 1fr)`,
    md: `repeat(${columns.md || columns.sm || columns.xs || 2}, 1fr)`,
    lg: `repeat(${columns.lg || columns.md || columns.sm || columns.xs || 3}, 1fr)`,
    xl: `repeat(${columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 4}, 1fr)`,
  },
  gap: responsiveSpacing(gap),
});

export const responsiveContainer = (maxWidth: string = 'lg'): SxProps<Theme> => ({
  width: '100%',
  maxWidth: maxWidth,
  mx: 'auto',
  px: responsiveSpacing(2),
});

export const responsiveTypography = (
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2',
  fontWeight?: number
): SxProps<Theme> => ({
  fontSize: {
    xs: variant === 'h1' ? '2rem' : variant === 'h2' ? '1.75rem' : variant === 'h3' ? '1.5rem' :
         variant === 'h4' ? '1.25rem' : variant === 'h5' ? '1.125rem' : variant === 'h6' ? '1rem' :
         variant === 'body1' ? '1rem' : '0.875rem',
    sm: variant === 'h1' ? '2.5rem' : variant === 'h2' ? '2rem' : variant === 'h3' ? '1.75rem' :
         variant === 'h4' ? '1.5rem' : variant === 'h5' ? '1.25rem' : variant === 'h6' ? '1.125rem' :
         variant === 'body1' ? '1rem' : '0.875rem',
    md: variant === 'h1' ? '3rem' : variant === 'h2' ? '2.25rem' : variant === 'h3' ? '2rem' :
         variant === 'h4' ? '1.75rem' : variant === 'h5' ? '1.5rem' : variant === 'h6' ? '1.25rem' :
         variant === 'body1' ? '1rem' : '0.875rem',
  },
  fontWeight: fontWeight || (variant.startsWith('h') ? 600 : 400),
  lineHeight: variant.startsWith('h') ? 1.2 : 1.5,
});

export const responsiveCard = (elevation: number = 2): SxProps<Theme> => ({
  p: responsiveSpacing(2),
  borderRadius: responsiveBorderRadius(),
  boxShadow: elevation > 0 ? `0 ${elevation * 2}px ${elevation * 4}px rgba(0,0,0,0.1)` : 'none',
  transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
  '&:hover': {
    boxShadow: elevation > 0 ? `0 ${elevation * 4}px ${elevation * 8}px rgba(0,0,0,0.15)` : 'none',
    transform: 'translateY(-2px)',
  },
});

export const responsiveButton = (size: 'small' | 'medium' | 'large' = 'medium'): SxProps<Theme> => ({
  px: size === 'small' ? 2 : size === 'medium' ? 3 : 4,
  py: size === 'small' ? 1 : size === 'medium' ? 1.5 : 2,
  fontSize: size === 'small' ? '0.875rem' : size === 'medium' ? '1rem' : '1.125rem',
  borderRadius: responsiveBorderRadius(6),
  textTransform: 'none',
  fontWeight: 500,
});

export const responsiveInput = (): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: responsiveBorderRadius(6),
    '&:hover fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused fieldset': {
      borderWidth: 2,
    },
  },
});

export const responsiveScrollbar = (theme: Theme): SxProps<Theme> => ({
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
  },
});

export const responsiveDrawer = (width: number = 280): SxProps<Theme> => ({
  '& .MuiDrawer-paper': {
    width: {
      xs: '280px',
      sm: '320px',
      md: `${width}px`,
    },
    boxSizing: 'border-box',
  },
});

export const responsiveAppBar = (): SxProps<Theme> => ({
  position: 'fixed',
  zIndex: (theme) => theme.zIndex.drawer + 1,
  transition: (theme) => theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
});

export const responsiveMain = (drawerWidth: number = 280): SxProps<Theme> => ({
  flexGrow: 1,
  p: responsiveSpacing(2),
  transition: (theme) => theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: {
    md: `${drawerWidth}px`,
  },
});

// Theme-aware color utilities
export const themeAwareColor = (lightColor: string, darkColor: string) => (theme: Theme) =>
  theme.palette.mode === 'light' ? lightColor : darkColor;

export const themeAwareBackground = (lightBg: string, darkBg: string) => (theme: Theme) =>
  theme.palette.mode === 'light' ? lightBg : darkBg;

// Animation utilities
export const fadeIn = {
  animation: 'fadeIn 0.5s ease-in-out',
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
};

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'up') => ({
  animation: `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} 0.5s ease-out`,
  [`@keyframes slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: {
    '0%': {
      opacity: 0,
      transform: direction === 'left' ? 'translateX(-100%)' :
                 direction === 'right' ? 'translateX(100%)' :
                 direction === 'up' ? 'translateY(-100%)' : 'translateY(100%)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
});

// Accessibility utilities
export const focusVisible = {
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
};

export const highContrast = (theme: Theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
});