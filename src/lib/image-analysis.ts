import sharp from 'sharp';
import exifr from 'exifr';

export interface ImageAnalysis {
  dimensions: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  colorProfile: {
    dominantColors: string[];
    brightness: 'light' | 'dark' | 'medium';
    saturation: 'vibrant' | 'muted' | 'neutral';
  };
  composition: {
    orientation: 'landscape' | 'portrait' | 'square';
    quality: 'high' | 'medium' | 'low';
  };
  metadata: {
    fileSize: number;
    format: string;
    hasTransparency: boolean;
  };
  suggestedCategory: string;
  characteristics: string[];
}

export async function analyzeImageFromDataUri(dataUri: string): Promise<ImageAnalysis> {
  try {
    // Convert data URI to buffer
    const base64Data = dataUri.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Get image metadata using Sharp
    const metadata = await sharp(buffer).metadata();
    
    // Extract basic image stats
    const stats = await sharp(buffer).stats();
    
    // Calculate dimensions and aspect ratio
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const aspectRatio = getAspectRatioDescription(width, height);
    
    // Determine orientation
    let orientation: 'landscape' | 'portrait' | 'square' = 'square';
    if (width > height * 1.2) orientation = 'landscape';
    else if (height > width * 1.2) orientation = 'portrait';
    
    // Analyze brightness from stats
    const avgChannel = stats.channels?.reduce((sum, channel) => sum + channel.mean, 0) / (stats.channels?.length || 1) || 0;
    let brightness: 'light' | 'dark' | 'medium' = 'medium';
    if (avgChannel > 180) brightness = 'light';
    else if (avgChannel < 80) brightness = 'dark';
    
    // Determine quality based on file size and dimensions
    const fileSize = buffer.length;
    const pixelCount = width * height;
    const bytesPerPixel = fileSize / pixelCount;
    let quality: 'high' | 'medium' | 'low' = 'medium';
    if (bytesPerPixel > 3) quality = 'high';
    else if (bytesPerPixel < 1) quality = 'low';
    
    // Try to extract EXIF data (for camera info, etc.)
    try {
      await exifr.parse(buffer);
    } catch {
      console.log('No EXIF data available');
    }
    
    // Generate dominant colors (simplified)
    const dominantColors = await extractDominantColors(buffer);
    
    // Determine saturation based on color analysis
    const saturation = determineSaturation(dominantColors);
    
    // Suggest category based on image characteristics
    const suggestedCategory = suggestProductCategory({
      width, height, aspectRatio, orientation, brightness, 
      dominantColors, fileSize, format: metadata.format || 'unknown'
    });
    
    // Generate characteristics
    const characteristics = generateImageCharacteristics({
      orientation, brightness, saturation, quality, 
      aspectRatio, dominantColors, suggestedCategory
    });
    
    const analysis: ImageAnalysis = {
      dimensions: {
        width,
        height,
        aspectRatio
      },
      colorProfile: {
        dominantColors,
        brightness,
        saturation
      },
      composition: {
        orientation,
        quality
      },
      metadata: {
        fileSize,
        format: metadata.format || 'unknown',
        hasTransparency: metadata.hasAlpha || false
      },
      suggestedCategory,
      characteristics
    };
    
    return analysis;
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Return fallback analysis
    return {
      dimensions: { width: 0, height: 0, aspectRatio: 'unknown' },
      colorProfile: { dominantColors: ['#333333'], brightness: 'medium', saturation: 'neutral' },
      composition: { orientation: 'landscape', quality: 'medium' },
      metadata: { fileSize: 0, format: 'unknown', hasTransparency: false },
      suggestedCategory: 'general_product',
      characteristics: ['professional_photo', 'clear_image']
    };
  }
}

function getAspectRatioDescription(width: number, height: number): string {
  if (!width || !height) return 'unknown';
  
  const ratio = width / height;
  
  if (Math.abs(ratio - 1) < 0.1) return 'square (1:1)';
  else if (Math.abs(ratio - 1.33) < 0.1) return 'standard (4:3)';
  else if (Math.abs(ratio - 1.77) < 0.1) return 'widescreen (16:9)';
  else if (Math.abs(ratio - 1.5) < 0.1) return 'classic (3:2)';
  else if (ratio > 2) return 'ultra-wide';
  else if (ratio < 0.5) return 'ultra-tall';
  else return `custom (${ratio.toFixed(2)}:1)`;
}

async function extractDominantColors(buffer: Buffer): Promise<string[]> {
  try {
    // Resize image for faster processing
    const { data, info } = await sharp(buffer)
      .resize(100, 100, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Simple color analysis - get average colors from different regions
    const colors = [];
    const pixelCount = info.width * info.height;
    const channels = info.channels;
    
    // Sample colors from different areas
    for (let i = 0; i < pixelCount * channels; i += channels * 500) {
      if (i + 2 < data.length) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert to hex
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colors.push(hex);
      }
    }
    
    // Return unique colors (simplified)
    return [...new Set(colors)].slice(0, 5);
    
  } catch {
    return ['#666666', '#999999', '#CCCCCC'];
  }
}

function determineSaturation(colors: string[]): 'vibrant' | 'muted' | 'neutral' {
  // Simple saturation detection based on color values
  let totalSaturation = 0;
  
  colors.forEach(hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    totalSaturation += saturation;
  });
  
  const avgSaturation = totalSaturation / colors.length;
  
  if (avgSaturation > 0.6) return 'vibrant';
  else if (avgSaturation < 0.3) return 'muted';
  else return 'neutral';
}

function suggestProductCategory(params: {
  width: number;
  height: number;
  aspectRatio: string;
  orientation: string;
  brightness: string;
  dominantColors: string[];
  fileSize: number;
  format: string;
}): string {
  const { width, height, orientation, brightness, dominantColors, fileSize } = params;
  
  // Basic category suggestions based on image characteristics
  if (orientation === 'square' && brightness === 'light') {
    return 'fashion_lifestyle';
  } else if (orientation === 'landscape' && fileSize > 500000) {
    return 'real_estate_property';
  } else if (brightness === 'dark' && dominantColors.some(c => c.includes('00') || c.includes('FF'))) {
    return 'electronics_gadgets';
  } else if (width > 1000 && height > 1000) {
    return 'professional_product';
  } else {
    return 'general_merchandise';
  }
}

function generateImageCharacteristics(params: {
  orientation: string;
  brightness: string;
  saturation: string;
  quality: string;
  aspectRatio: string;
  dominantColors: string[];
  suggestedCategory: string;
}): string[] {
  const { orientation, brightness, saturation, quality, suggestedCategory } = params;
  
  const characteristics = [];
  
  // Orientation characteristics
  if (orientation === 'landscape') characteristics.push('wide_format', 'panoramic_view');
  if (orientation === 'portrait') characteristics.push('vertical_composition', 'tall_format');
  if (orientation === 'square') characteristics.push('social_media_ready', 'balanced_composition');
  
  // Brightness characteristics
  if (brightness === 'light') characteristics.push('bright_lighting', 'clean_background', 'professional_studio');
  if (brightness === 'dark') characteristics.push('dramatic_lighting', 'premium_look', 'sophisticated');
  
  // Saturation characteristics
  if (saturation === 'vibrant') characteristics.push('eye_catching', 'colorful', 'energetic');
  if (saturation === 'muted') characteristics.push('subtle_tones', 'elegant', 'minimalist');
  if (saturation === 'neutral') characteristics.push('balanced_colors', 'natural_look', 'versatile');
  
  // Quality characteristics
  if (quality === 'high') characteristics.push('high_resolution', 'detailed', 'professional_quality');
  if (quality === 'low') characteristics.push('compressed', 'web_optimized');
  
  // Category-specific characteristics
  if (suggestedCategory === 'fashion_lifestyle') {
    characteristics.push('trendy', 'stylish', 'lifestyle_focused');
  } else if (suggestedCategory === 'real_estate_property') {
    characteristics.push('spacious', 'architectural', 'investment_opportunity');
  } else if (suggestedCategory === 'electronics_gadgets') {
    characteristics.push('modern_tech', 'innovative', 'digital');
  }
  
  return characteristics.slice(0, 8); // Limit to 8 characteristics
}