// Typography System & Font Scale Constants

export const typography = {
  fontFamily: {
    heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
    body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
  },
  fontSize: {
    h1: { size: '48px', lineHeight: '1.2', letterSpacing: '-0.02em', weight: '800' },
    h2: { size: '36px', lineHeight: '1.25', letterSpacing: '-0.015em', weight: '700' },
    h3: { size: '28px', lineHeight: '1.3', letterSpacing: '-0.01em', weight: '700' },
    h4: { size: '24px', lineHeight: '1.35', letterSpacing: '0em', weight: '600' },
    h5: { size: '20px', lineHeight: '1.4', letterSpacing: '0em', weight: '600' },
    h6: { size: '16px', lineHeight: '1.45', letterSpacing: '0.01em', weight: '600' },
    bodyLg: { size: '18px', lineHeight: '1.6', weight: '500' },
    bodyBase: { size: '16px', lineHeight: '1.6', weight: '400' },
    bodySm: { size: '14px', lineHeight: '1.5', weight: '400' },
    caption: { size: '12px', lineHeight: '1.5', weight: '400' },
    micro: { size: '11px', lineHeight: '1.4', letterSpacing: '0.05em', weight: '600' },
  }
};

export default typography;
