/**
 * Simple icon generator for learning content
 * Generates SVG icons based on content type and title
 */

export interface IconConfig {
  backgroundColor: string;
  iconColor: string;
  emoji: string;
  svgIcon?: string;
}

// Predefined icons for different learning topics
const LEARNING_ICONS: Record<string, IconConfig> = {
  // Marketing & Business
  'pemasaran': {
    backgroundColor: '#3B82F6',
    iconColor: '#FFFFFF',
    emoji: '📈',
    svgIcon: 'M2 10l3-3m3 3l3-3m3 3l3-3'
  },
  'digital': {
    backgroundColor: '#8B5CF6',
    iconColor: '#FFFFFF', 
    emoji: '💻',
    svgIcon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'
  },
  'keuangan': {
    backgroundColor: '#10B981',
    iconColor: '#FFFFFF',
    emoji: '💰',
    svgIcon: 'M12 2v20m8-9H4'
  },
  'manajemen': {
    backgroundColor: '#F59E0B',
    iconColor: '#FFFFFF',
    emoji: '📊',
    svgIcon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  'branding': {
    backgroundColor: '#EF4444',
    iconColor: '#FFFFFF',
    emoji: '🎨',
    svgIcon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 5H5v12a2 2 0 104 0V5z'
  },
  'inovasi': {
    backgroundColor: '#06B6D4',
    iconColor: '#FFFFFF',
    emoji: '💡',
    svgIcon: 'M9.663 17h4.674M9 12h6m-8 5a9 9 0 118 0'
  },
  'penjualan': {
    backgroundColor: '#84CC16',
    iconColor: '#FFFFFF',
    emoji: '🛍️',
    svgIcon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 6a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z'
  },
  'ekspansi': {
    backgroundColor: '#F97316',
    iconColor: '#FFFFFF',
    emoji: '🌐',
    svgIcon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
  },
  'online': {
    backgroundColor: '#A855F7',
    iconColor: '#FFFFFF',
    emoji: '🔗',
    svgIcon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
  },
  'customer': {
    backgroundColor: '#EC4899',
    iconColor: '#FFFFFF',
    emoji: '👥',
    svgIcon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  'sdm': {
    backgroundColor: '#059669',
    iconColor: '#FFFFFF',
    emoji: '👤',
    svgIcon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  'strategi': {
    backgroundColor: '#DC2626',
    iconColor: '#FFFFFF',
    emoji: '🎯',
    svgIcon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
  },
  'produk': {
    backgroundColor: '#7C3AED',
    iconColor: '#FFFFFF',
    emoji: '📦',
    svgIcon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
  }
};

// Default fallback icon
const DEFAULT_ICON: IconConfig = {
  backgroundColor: '#6B7280',
  iconColor: '#FFFFFF',
  emoji: '📚',
  svgIcon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
};

/**
 * Get icon configuration based on content title and type
 */
export function getIconForContent(title: string): IconConfig {
  const normalizedTitle = title.toLowerCase();
  
  // Find the best matching icon based on keywords in title
  for (const [keyword, config] of Object.entries(LEARNING_ICONS)) {
    if (normalizedTitle.includes(keyword)) {
      return config;
    }
  }
  
  // Return default icon if no match found
  return DEFAULT_ICON;
}

/**
 * Generate SVG icon as data URL
 */
export function generateSVGIcon(config: IconConfig, size: number = 200): string {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${config.backgroundColor}" rx="16"/>
      <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-size="${size * 0.4}" 
            text-anchor="middle" dominant-baseline="middle" fill="${config.iconColor}">
        ${config.emoji}
      </text>
    </svg>
  `;
  
  // Use encodeURIComponent instead of btoa to handle Unicode characters
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Generate a gradient background SVG icon
 */
export function generateGradientIcon(config: IconConfig, size: number = 200): string {
  const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;
  const lightColor = adjustColor(config.backgroundColor, 20);
  const darkColor = adjustColor(config.backgroundColor, -20);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${lightColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#${gradientId})" rx="16"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="rgba(255,255,255,0.1)" />
      <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-size="${size * 0.25}" 
            text-anchor="middle" dominant-baseline="middle" fill="${config.iconColor}" font-weight="bold">
        ${config.emoji}
      </text>
    </svg>
  `;
  
  // Use encodeURIComponent instead of btoa to handle Unicode characters
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Adjust color brightness
 */
function adjustColor(hexColor: string, percent: number): string {
  const num = parseInt(hexColor.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

/**
 * List of popular learning topics for random selection
 */
export const LEARNING_TOPICS = [
  'Pemasaran Digital',
  'Manajemen Keuangan',
  'Strategi Bisnis',
  'Inovasi Produk',
  'Branding',
  'Customer Service',
  'Manajemen SDM',
  'Ekspansi Pasar',
  'E-commerce',
  'Social Media Marketing',
  'Leadership',
  'Produktivitas'
];

/**
 * Generate simple geometric icon as fallback
 */
export function generateGeometricIcon(config: IconConfig, size: number = 200): string {
  const shapes = [
    `<circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="${config.iconColor}" opacity="0.8"/>`,
    `<rect x="${size/3}" y="${size/3}" width="${size/3}" height="${size/3}" fill="${config.iconColor}" opacity="0.8" rx="4"/>`,
    `<polygon points="${size/2},${size/4} ${size/4},${size*3/4} ${size*3/4},${size*3/4}" fill="${config.iconColor}" opacity="0.8"/>`,
    `<rect x="${size/4}" y="${size/3}" width="${size/2}" height="${size/6}" fill="${config.iconColor}" opacity="0.8" rx="2"/>
     <rect x="${size/4}" y="${size/2}" width="${size/2}" height="${size/6}" fill="${config.iconColor}" opacity="0.8" rx="2"/>`
  ];
  
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${config.backgroundColor}" rx="16"/>
      ${randomShape}
    </svg>
  `;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Generate safe icon that works on all browsers
 */
export function generateSafeIcon(config: IconConfig, size: number = 200): string {
  try {
    // Try to generate with emoji first
    return generateGradientIcon(config, size);
  } catch (error) {
    console.warn('Failed to generate emoji icon, falling back to geometric icon:', error);
    // Fallback to geometric shapes if emoji fails
    return generateGeometricIcon(config, size);
  }
}

/**
 * Get random learning icon
 */
export function getRandomLearningIcon(): IconConfig {
  const icons = Object.values(LEARNING_ICONS);
  return icons[Math.floor(Math.random() * icons.length)];
}
