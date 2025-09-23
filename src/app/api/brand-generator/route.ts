/**
 * Brand Generator API Route
 * 
 * STATUS: Using HuggingFace API for logo generation
 * - Brand analysis works with Groq/Llama
 * - Logo generation uses HuggingFace Stable Diffusion API
 * - Returns base64 image data URL for direct display
 */

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { HfInference } from '@huggingface/inference';
import { Buffer } from 'buffer';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Fungsi untuk mengubah Blob menjadi base64 Data URL
async function blobToDataURL(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  return `data:${blob.type};base64,${buffer.toString('base64')}`;
}

// Type guard untuk memvalidasi objek Blob dengan aman di lingkungan server
function isBlob(value: unknown): value is Blob {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Blob).arrayBuffer === 'function' &&
    typeof (value as Blob).type === 'string' &&
    typeof (value as Blob).size === 'number'
  );
}

// Logo template designs for SVG generation - Enhanced with more creative designs
const LOGO_TEMPLATES = [
  // Modern Geometric Logo
  {
    id: 'geometric',
    categories: ['tech', 'modern', 'startup', 'agency'],
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="geomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
            <stop offset="50%" style="stop-color:#${color2};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${color1};stop-opacity:0.8" />
          </linearGradient>
          <filter id="geomShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="4" result="offsetblur"/>
            <feFlood flood-color="rgba(0,0,0,0.2)"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect width="512" height="512" fill="white"/>
        
        <!-- Main geometric shape -->
        <polygon points="256,80 350,180 300,280 212,280 162,180" fill="url(#geomGrad)" filter="url(#geomShadow)"/>
        
        <!-- Inner geometric details -->
        <polygon points="256,120 320,190 290,240 222,240 192,190" fill="white" opacity="0.3"/>
        <polygon points="256,140 300,200 280,220 232,220 212,200" fill="#${color2}" opacity="0.7"/>
        
        <!-- Accent elements -->
        <circle cx="256" cy="180" r="15" fill="white" opacity="0.9"/>
        <circle cx="256" cy="180" r="8" fill="#${color1}"/>
        
        <!-- Modern typography -->
        <text x="256" y="360" font-family="'Helvetica Neue', Arial, sans-serif" font-size="32" font-weight="300" text-anchor="middle" fill="#${color1}" letter-spacing="2px">${text.toUpperCase()}</text>
        <rect x="196" y="375" width="120" height="2" fill="#${color2}" opacity="0.6"/>
      </svg>
    `
  },
  
  // Coffee/Food & Beverage Logo
  {
    id: 'coffee-cup',
    categories: ['coffee', 'food', 'restaurant', 'cafe', 'kuliner'],
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="coffeeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
          </linearGradient>
          <radialGradient id="steamGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:white;stop-opacity:0.2" />
          </radialGradient>
          <filter id="coffeeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="rgba(0,0,0,0.25)"/>
          </filter>
        </defs>
        <rect width="512" height="512" fill="white"/>
        
        <!-- Coffee cup -->
        <ellipse cx="256" cy="320" rx="90" ry="15" fill="#${color2}" opacity="0.3" filter="url(#coffeeShadow)"/>
        <path d="M 200 160 Q 200 140 220 140 L 292 140 Q 312 140 312 160 L 300 280 Q 298 300 280 300 L 232 300 Q 214 300 212 280 Z" fill="url(#coffeeGrad)" filter="url(#coffeeShadow)"/>
        
        <!-- Coffee surface -->
        <ellipse cx="256" cy="160" rx="46" ry="8" fill="#${color2}" opacity="0.8"/>
        <ellipse cx="256" cy="158" rx="46" ry="8" fill="white" opacity="0.3"/>
        
        <!-- Handle -->
        <path d="M 312 180 Q 340 180 340 210 Q 340 240 312 240" stroke="#${color1}" stroke-width="12" fill="none" filter="url(#coffeeShadow)"/>
        
        <!-- Steam waves -->
        <path d="M 235 120 Q 245 100 235 80 Q 225 60 235 40" stroke="url(#steamGrad)" stroke-width="4" fill="none" opacity="0.7">
          <animate attributeName="d" values="M 235 120 Q 245 100 235 80 Q 225 60 235 40;M 235 120 Q 225 100 235 80 Q 245 60 235 40;M 235 120 Q 245 100 235 80 Q 225 60 235 40" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M 256 125 Q 266 105 256 85 Q 246 65 256 45" stroke="url(#steamGrad)" stroke-width="4" fill="none" opacity="0.6">
          <animate attributeName="d" values="M 256 125 Q 266 105 256 85 Q 246 65 256 45;M 256 125 Q 246 105 256 85 Q 266 65 256 45;M 256 125 Q 266 105 256 85 Q 246 65 256 45" dur="2.5s" repeatCount="indefinite"/>
        </path>
        <path d="M 277 120 Q 287 100 277 80 Q 267 60 277 40" stroke="url(#steamGrad)" stroke-width="4" fill="none" opacity="0.5">
          <animate attributeName="d" values="M 277 120 Q 287 100 277 80 Q 267 60 277 40;M 277 120 Q 267 100 277 80 Q 287 60 277 40;M 277 120 Q 287 100 277 80 Q 267 60 277 40" dur="3.5s" repeatCount="indefinite"/>
        </path>
        
        <!-- Elegant typography -->
        <text x="256" y="380" font-family="'Playfair Display', serif" font-size="34" font-weight="400" text-anchor="middle" fill="#${color1}">${text}</text>
        <text x="256" y="410" font-family="'Helvetica Neue', sans-serif" font-size="14" font-weight="300" text-anchor="middle" fill="#${color2}" letter-spacing="3px">COFFEE & MORE</text>
      </svg>
    `
  },
  
  // Creative Agency/Design Logo
  {
    id: 'creative-agency',
    categories: ['design', 'agency', 'creative', 'art', 'studio'],
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="creativeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
            <stop offset="50%" style="stop-color:#${color2};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${color1};stop-opacity:0.7" />
          </linearGradient>
          <filter id="creativeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.2)"/>
          </filter>
        </defs>
        <rect width="512" height="512" fill="white"/>
        
        <!-- Paint brush stroke -->
        <path d="M 120 180 Q 200 100 300 160 Q 380 220 320 300 Q 260 380 180 320 Q 100 260 120 180" fill="url(#creativeGrad)" filter="url(#creativeShadow)" opacity="0.8">
          <animate attributeName="d" values="M 120 180 Q 200 100 300 160 Q 380 220 320 300 Q 260 380 180 320 Q 100 260 120 180;M 130 190 Q 210 110 290 170 Q 370 230 310 310 Q 250 390 170 330 Q 90 270 130 190;M 120 180 Q 200 100 300 160 Q 380 220 320 300 Q 260 380 180 320 Q 100 260 120 180" dur="6s" repeatCount="indefinite"/>
        </path>
        
        <!-- Color palette dots -->
        <circle cx="200" cy="200" r="20" fill="#${color1}" filter="url(#creativeShadow)"/>
        <circle cx="256" cy="180" r="25" fill="#${color2}" filter="url(#creativeShadow)"/>
        <circle cx="312" cy="200" r="18" fill="#${color1}" opacity="0.7" filter="url(#creativeShadow)"/>
        
        <!-- Brush handle -->
        <rect x="340" y="120" width="40" height="120" rx="20" fill="#8b7355" filter="url(#creativeShadow)"/>
        <rect x="345" y="125" width="30" height="110" rx="15" fill="#a0845c"/>
        
        <!-- Creative typography -->
        <text x="256" y="360" font-family="'Montserrat', sans-serif" font-size="32" font-weight="600" text-anchor="middle" fill="#${color1}" transform="rotate(-2 256 360)">${text}</text>
        <text x="256" y="390" font-family="'Helvetica Neue', sans-serif" font-size="12" font-weight="300" text-anchor="middle" fill="#${color2}" letter-spacing="4px" transform="rotate(-1 256 390)">CREATIVE STUDIO</text>
      </svg>
    `
  },
  
  // Medical/Health Logo
  {
    id: 'medical',
    categories: ['medical', 'health', 'clinic', 'hospital', 'kesehatan'],
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="medicalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
          </linearGradient>
          <filter id="medicalShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.15)"/>
          </filter>
        </defs>
        <rect width="512" height="512" fill="white"/>
        
        <!-- Medical cross background -->
        <circle cx="256" cy="200" r="100" fill="url(#medicalGrad)" filter="url(#medicalShadow)" opacity="0.1"/>
        
        <!-- Cross symbol -->
        <rect x="236" y="140" width="40" height="120" rx="20" fill="url(#medicalGrad)" filter="url(#medicalShadow)"/>
        <rect x="196" y="180" width="120" height="40" rx="20" fill="url(#medicalGrad)" filter="url(#medicalShadow)"/>
        
        <!-- Heart beat line -->
        <path d="M 100 320 L 140 320 L 160 290 L 180 350 L 200 280 L 220 340 L 240 320 L 412 320" stroke="#${color2}" stroke-width="4" fill="none" opacity="0.7">
          <animate attributeName="stroke-dasharray" values="0 1000;1000 0;0 1000" dur="3s" repeatCount="indefinite"/>
        </path>
        
        <!-- Pulse dots -->
        <circle cx="180" cy="320" r="4" fill="#${color2}">
          <animate attributeName="r" values="4;8;4" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Professional typography -->
        <text x="256" y="380" font-family="'Lato', sans-serif" font-size="30" font-weight="400" text-anchor="middle" fill="#${color1}">${text}</text>
        <text x="256" y="410" font-family="'Helvetica Neue', sans-serif" font-size="12" font-weight="300" text-anchor="middle" fill="#${color2}" letter-spacing="2px">HEALTHCARE</text>
      </svg>
    `
  },
  
  // Tech/AI/Robot Logo (Enhanced)
  {
    id: 'tech',
    categories: ['tech', 'robot', 'ai', 'teknologi', 'startup', 'software'],
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
          </linearGradient>
          <filter id="robotShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        <rect width="512" height="512" fill="white"/>
        <!-- Robot Head -->
        <rect x="156" y="120" width="200" height="160" rx="20" fill="url(#robotGrad)" filter="url(#robotShadow)"/>
        <!-- Antenna -->
        <rect x="240" y="100" width="32" height="30" rx="16" fill="#${color2}"/>
        <circle cx="256" cy="95" r="8" fill="#${color1}"/>
        <!-- Eyes -->
        <circle cx="206" cy="180" r="25" fill="white"/>
        <circle cx="306" cy="180" r="25" fill="white"/>
        <circle cx="206" cy="180" r="15" fill="#${color2}"/>
        <circle cx="306" cy="180" r="15" fill="#${color2}"/>
        <circle cx="210" cy="175" r="5" fill="white"/>
        <circle cx="310" cy="175" r="5" fill="white"/>
        <!-- Mouth -->
        <rect x="220" y="220" width="72" height="20" rx="10" fill="#${color2}"/>
        <rect x="228" y="224" width="12" height="12" rx="2" fill="white"/>
        <rect x="244" y="224" width="12" height="12" rx="2" fill="white"/>
        <rect x="260" y="224" width="12" height="12" rx="2" fill="white"/>
        <!-- Body -->
        <rect x="176" y="280" width="160" height="100" rx="15" fill="#${color1}" opacity="0.8" filter="url(#robotShadow)"/>
        <!-- Buttons -->
        <circle cx="216" cy="320" r="8" fill="#${color2}"/>
        <circle cx="256" cy="320" r="8" fill="#${color2}"/>
        <circle cx="296" cy="320" r="8" fill="#${color2}"/>
        <text x="256" y="420" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#333">${text}</text>
      </svg>
    `
  },
  
  // Retail/E-commerce Logo
  {
    id: 'retail',
    categories: ['retail', 'shop', 'store', 'ecommerce', 'toko', 'online'],
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="retailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
          </linearGradient>
          <filter id="retailShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.2)"/>
          </filter>
        </defs>
        <rect width="512" height="512" fill="white"/>
        
        <!-- Shopping bag -->
        <path d="M 180 180 L 180 160 Q 180 140 200 140 L 312 140 Q 332 140 332 160 L 332 180 L 350 180 Q 360 180 360 190 L 360 320 Q 360 340 340 340 L 172 340 Q 152 340 152 320 L 152 190 Q 152 180 162 180 Z" fill="url(#retailGrad)" filter="url(#retailShadow)"/>
        
        <!-- Bag handles -->
        <path d="M 200 180 L 200 160 Q 200 150 210 150 L 230 150 Q 240 150 240 160 L 240 180" stroke="#${color2}" stroke-width="8" fill="none"/>
        <path d="M 272 180 L 272 160 Q 272 150 282 150 L 302 150 Q 312 150 312 160 L 312 180" stroke="#${color2}" stroke-width="8" fill="none"/>
        
        <!-- Shopping tag -->
        <rect x="280" y="200" width="60" height="40" rx="5" fill="white" opacity="0.9" filter="url(#retailShadow)"/>
        <circle cx="295" cy="210" r="4" fill="#${color2}"/>
        <rect x="305" y="205" width="30" height="3" fill="#${color2}" opacity="0.7"/>
        <rect x="305" y="215" width="25" height="3" fill="#${color2}" opacity="0.5"/>
        
        <!-- Decorative elements -->
        <circle cx="200" cy="250" r="8" fill="white" opacity="0.4"/>
        <circle cx="230" cy="280" r="6" fill="white" opacity="0.3"/>
        <circle cx="320" cy="260" r="10" fill="white" opacity="0.3"/>
        
        <!-- Commercial typography -->
        <text x="256" y="390" font-family="'Open Sans', sans-serif" font-size="32" font-weight="600" text-anchor="middle" fill="#${color1}">${text}</text>
        <text x="256" y="420" font-family="'Helvetica Neue', sans-serif" font-size="12" font-weight="400" text-anchor="middle" fill="#${color2}" letter-spacing="3px">RETAIL</text>
      </svg>
    `
  },
  
  // Finance/Banking Logo
  {
    id: 'finance',
    categories: ['finance', 'bank', 'financial', 'keuangan', 'investment'],
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="financeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
          </linearGradient>
          <filter id="financeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.15)"/>
          </filter>
        </defs>
        <rect width="512" height="512" fill="white"/>
        
        <!-- Bank building/pillars -->
        <rect x="160" y="120" width="40" height="180" rx="8" fill="url(#financeGrad)" filter="url(#financeShadow)"/>
        <rect x="220" y="100" width="40" height="200" rx="8" fill="url(#financeGrad)" filter="url(#financeShadow)"/>
        <rect x="280" y="140" width="40" height="160" rx="8" fill="url(#financeGrad)" filter="url(#financeShadow)"/>
        
        <!-- Rising arrow/growth -->
        <path d="M 120 280 L 160 240 L 200 200 L 240 160 L 280 120 L 320 80 L 360 60" stroke="#${color2}" stroke-width="6" fill="none" opacity="0.8">
          <animate attributeName="stroke-dasharray" values="0 500;500 0" dur="3s" repeatCount="indefinite"/>
        </path>
        
        <!-- Arrow head -->
        <polygon points="360,60 350,55 350,65" fill="#${color2}" opacity="0.8"/>
        
        <!-- Dollar/currency symbol -->
        <circle cx="380" cy="180" r="30" fill="white" opacity="0.9" filter="url(#financeShadow)"/>
        <text x="380" y="195" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#${color1}">$</text>
        
        <!-- Professional typography -->
        <text x="256" y="360" font-family="'Roboto', sans-serif" font-size="30" font-weight="500" text-anchor="middle" fill="#${color1}">${text}</text>
        <text x="256" y="390" font-family="'Helvetica Neue', sans-serif" font-size="12" font-weight="300" text-anchor="middle" fill="#${color2}" letter-spacing="2px">FINANCIAL SERVICES</text>
      </svg>
    `
  },
  
  // Education Logo
  {
    id: 'education',
    categories: ['education', 'school', 'learning', 'pendidikan', 'kursus'],
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eduGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
          </linearGradient>
          <filter id="eduShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        <rect width="512" height="512" fill="white"/>
        <!-- Graduation Cap -->
        <polygon points="256,100 380,140 380,180 256,220 132,180 132,140" fill="url(#eduGrad)" filter="url(#eduShadow)"/>
        <rect x="240" y="80" width="32" height="40" rx="16" fill="#${color2}"/>
        <circle cx="256" cy="75" r="8" fill="#${color1}"/>
        <!-- Book Stack -->
        <rect x="180" y="240" width="152" height="20" rx="5" fill="#${color1}" filter="url(#eduShadow)"/>
        <rect x="185" y="220" width="142" height="20" rx="5" fill="#${color2}" filter="url(#eduShadow)"/>
        <rect x="190" y="200" width="132" height="20" rx="5" fill="#${color1}" opacity="0.8" filter="url(#eduShadow)"/>
        <!-- Pencil -->
        <rect x="340" y="180" width="12" height="80" rx="6" fill="#fbbf24" filter="url(#eduShadow)"/>
        <rect x="340" y="175" width="12" height="10" rx="6" fill="#f59e0b"/>
        <polygon points="340,175 346,165 352,175" fill="#ef4444"/>
        <!-- Apple -->
        <circle cx="200" cy="180" r="20" fill="#ef4444" filter="url(#eduShadow)"/>
        <ellipse cx="200" cy="175" rx="8" ry="12" fill="#dc2626"/>
        <rect x="195" y="160" width="4" height="8" fill="#16a34a"/>
        <ellipse cx="198" cy="158" rx="6" ry="3" fill="#16a34a"/>
        <text x="256" y="320" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#333">${text}</text>
      </svg>
    `
  },
  // Business Card Mockup
  {
    id: 'business-card',
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="white"/>
        <rect x="96" y="176" width="320" height="160" rx="8" fill="#${color1}"/>
        <rect x="116" y="196" width="120" height="20" rx="4" fill="#${color2}"/>
        <rect x="116" y="236" width="280" height="10" rx="2" fill="#${color2}" opacity="0.5"/>
        <rect x="116" y="256" width="280" height="10" rx="2" fill="#${color2}" opacity="0.5"/>
        <rect x="116" y="276" width="180" height="10" rx="2" fill="#${color2}" opacity="0.5"/>
        <circle cx="356" cy="226" r="30" fill="#${color2}" opacity="0.8"/>
        <text x="256" y="380" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="#333">${text}</text>
      </svg>
    `
  },
  // Website Mockup
  {
    id: 'website',
    template: (color1: string, color2: string, text: string) => `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="white"/>
        <rect x="86" y="126" width="340" height="260" rx="8" fill="#f5f5f5" stroke="#ddd" stroke-width="2"/>
        <rect x="86" y="126" width="340" height="40" rx="8" fill="#${color1}"/>
        <circle cx="116" cy="146" r="8" fill="#${color2}"/>
        <circle cx="136" cy="146" r="8" fill="white" opacity="0.7"/>
        <circle cx="156" cy="146" r="8" fill="white" opacity="0.7"/>
        <rect x="106" y="186" width="140" height="80" rx="4" fill="#${color1}" opacity="0.8"/>
        <rect x="266" y="186" width="140" height="80" rx="4" fill="#${color2}" opacity="0.8"/>
        <rect x="106" y="286" width="300" height="20" rx="4" fill="#${color1}" opacity="0.5"/>
        <rect x="106" y="326" width="300" height="40" rx="4" fill="#${color2}" opacity="0.3"/>
        <text x="256" y="430" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="#333">${text}</text>
      </svg>
    `
  }
];

// Define interface for brand colors
interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  neutral?: string;
  background?: string;
}

// Smart template selection based on business description with contextual matching
function selectBestTemplate(businessDescription: string, imageType: 'logo' | 'card' | 'website' = 'logo'): string {
  if (imageType === 'card') return 'business-card';
  if (imageType === 'website') return 'website';
  
  const desc = businessDescription.toLowerCase();
  const matchingTemplates: string[] = [];
  
  // Industry-specific keyword matching with weighted scoring
  const industryMatchers = {
    'coffee': { templates: ['coffee-cup'], keywords: ['kopi', 'coffee', 'cafe', 'kedai', 'warung', 'barista'] },
    'tech': { templates: ['geometric', 'creative-agency', 'tech'], keywords: ['teknologi', 'tech', 'software', 'aplikasi', 'digital', 'startup', 'it', 'komputer'] },
    'food': { templates: ['coffee-cup'], keywords: ['makanan', 'food', 'restaurant', 'kuliner', 'masakan', 'dapur', 'chef'] },
    'health': { templates: ['medical'], keywords: ['kesehatan', 'health', 'medical', 'klinik', 'dokter', 'obat', 'therapy'] },
    'retail': { templates: ['retail', 'geometric'], keywords: ['toko', 'shop', 'retail', 'jual', 'beli', 'market', 'store'] },
    'finance': { templates: ['finance', 'geometric'], keywords: ['keuangan', 'finance', 'bank', 'investasi', 'asuransi', 'kredit'] },
    'creative': { templates: ['creative-agency', 'geometric'], keywords: ['kreatif', 'creative', 'design', 'advertising', 'marketing', 'brand'] },
    'education': { templates: ['education', 'geometric'], keywords: ['pendidikan', 'education', 'sekolah', 'kursus', 'training', 'belajar'] },
    'mining': { templates: ['finance', 'geometric'], keywords: ['tambang', 'mining', 'emas', 'batu bara', 'mineral', 'ekstraksi', 'pertambangan'] }
  };
  
  // Check for industry matches
  for (const [, matcher] of Object.entries(industryMatchers)) {
    for (const keyword of matcher.keywords) {
      if (desc.includes(keyword)) {
        matchingTemplates.push(...matcher.templates);
      }
    }
  }
  
  // Check template categories directly
  for (const template of LOGO_TEMPLATES) {
    if (template.categories) {
      for (const category of template.categories) {
        if (desc.includes(category.toLowerCase())) {
          matchingTemplates.push(template.id);
        }
      }
    }
  }
  
  // Remove duplicates
  const uniqueTemplates = [...new Set(matchingTemplates)];
  
  // If we have matches, randomly select from the best matches
  if (uniqueTemplates.length > 0) {
    // Add some randomization while still being contextual
    const randomIndex = Math.floor(Math.random() * uniqueTemplates.length);
    return uniqueTemplates[randomIndex];
  }
  
  // Smart fallbacks based on business characteristics
  if (desc.includes('modern') || desc.includes('minimal') || desc.includes('clean')) {
    return 'geometric';
  }
  
  if (desc.includes('creative') || desc.includes('art') || desc.includes('design')) {
    return 'creative-agency';
  }
  
  if (desc.includes('professional') || desc.includes('service')) {
    return Math.random() > 0.5 ? 'geometric' : 'creative-agency';
  }
  
  // Final fallback with some randomization
  const fallbackTemplates = ['geometric', 'creative-agency', 'retail'];
  return fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
}

// Helper function to adjust color brightness
function adjustColorBrightness(hexColor: string, amount: number): string {
  const clamp = (val: number) => Math.min(255, Math.max(0, val));
  
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);
  
  const newR = clamp(r + amount);
  const newG = clamp(g + amount);
  const newB = clamp(b + amount);
  
  return newR.toString(16).padStart(2, '0') + 
         newG.toString(16).padStart(2, '0') + 
         newB.toString(16).padStart(2, '0');
}

// Generate contextual colors based on business type
function generateContextualColors(businessDescription: string): { primary: string; secondary: string } {
  const desc = businessDescription.toLowerCase();
  
  // Industry-specific color palettes
  const colorPalettes = {
    coffee: [
      { primary: '8B4513', secondary: 'D2691E' }, // Browns
      { primary: '6F4E37', secondary: 'A0522D' },
      { primary: '4A4A4A', secondary: 'CD853F' }
    ],
    tech: [
      { primary: '0066CC', secondary: '4A9EFF' }, // Blues
      { primary: '6366F1', secondary: '8B5CF6' },
      { primary: '10B981', secondary: '34D399' }
    ],
    food: [
      { primary: 'FF6B35', secondary: 'FFB627' }, // Warm oranges
      { primary: 'E74C3C', secondary: 'F39C12' },
      { primary: 'C0392B', secondary: 'D35400' }
    ],
    health: [
      { primary: '27AE60', secondary: '2ECC71' }, // Greens
      { primary: '3498DB', secondary: '5DADE2' },
      { primary: '1ABC9C', secondary: '48C9B0' }
    ],
    retail: [
      { primary: 'E91E63', secondary: 'F06292' }, // Pinks/Purples
      { primary: '9C27B0', secondary: 'BA68C8' },
      { primary: 'FF5722', secondary: 'FF8A65' }
    ],
    finance: [
      { primary: '1565C0', secondary: '42A5F5' }, // Professional blues
      { primary: '2E7D32', secondary: '66BB6A' },
      { primary: '424242', secondary: '757575' }
    ],
    creative: [
      { primary: 'FF4081', secondary: 'FF80AB' }, // Vibrant colors
      { primary: '7C4DFF', secondary: 'B388FF' },
      { primary: 'FF6D00', secondary: 'FFB74D' }
    ],
    education: [
      { primary: '3F51B5', secondary: '7986CB' }, // Academic blues
      { primary: 'FFC107', secondary: 'FFD54F' },
      { primary: '795548', secondary: 'A1887F' }
    ],
    mining: [
      { primary: 'FFD700', secondary: 'B8860B' }, // Gold colors
      { primary: 'DAA520', secondary: '8B7355' },
      { primary: '2F4F4F', secondary: '696969' } // Industrial grays
    ]
  };
  
  // Determine industry
  let selectedPalette = colorPalettes.tech; // Default
  
  if (desc.includes('kopi') || desc.includes('coffee') || desc.includes('cafe')) {
    selectedPalette = colorPalettes.coffee;
  } else if (desc.includes('teknologi') || desc.includes('tech') || desc.includes('software')) {
    selectedPalette = colorPalettes.tech;
  } else if (desc.includes('makanan') || desc.includes('food') || desc.includes('restaurant')) {
    selectedPalette = colorPalettes.food;
  } else if (desc.includes('kesehatan') || desc.includes('health') || desc.includes('medical')) {
    selectedPalette = colorPalettes.health;
  } else if (desc.includes('toko') || desc.includes('retail') || desc.includes('jual')) {
    selectedPalette = colorPalettes.retail;
  } else if (desc.includes('keuangan') || desc.includes('finance') || desc.includes('bank')) {
    selectedPalette = colorPalettes.finance;
  } else if (desc.includes('kreatif') || desc.includes('creative') || desc.includes('design')) {
    selectedPalette = colorPalettes.creative;
  } else if (desc.includes('pendidikan') || desc.includes('education') || desc.includes('sekolah')) {
    selectedPalette = colorPalettes.education;
  } else if (desc.includes('tambang') || desc.includes('mining') || desc.includes('emas')) {
    selectedPalette = colorPalettes.mining;
  }
  
  // Randomly select from the appropriate palette
  const randomIndex = Math.floor(Math.random() * selectedPalette.length);
  return selectedPalette[randomIndex];
}

// Extract business name from description
function extractBusinessName(description: string): string {
  const desc = description.toLowerCase();
  
  // Common patterns for business names
  const patterns = [
    /(?:nama|bernama|disebut|dinamakan)\s+([a-zA-Z0-9\s]{2,20})/i,
    /([A-Z][a-zA-Z0-9\s]{1,15})(?:\s+adalah|\s+merupakan|\s+bergerak)/,
    /^([A-Z][a-zA-Z0-9\s]{1,20})(?:\s+[a-z])/,
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Fallback based on industry
  if (desc.includes('coffee') || desc.includes('kopi')) return 'Coffee Co';
  if (desc.includes('tech') || desc.includes('teknologi')) return 'TechCorp';
  if (desc.includes('design') || desc.includes('creative')) return 'Creative Studio';
  if (desc.includes('medical') || desc.includes('kesehatan')) return 'Healthcare+';
  
  return 'Brand';
}

// Generate template-based mockups (SVG) - for mockups only, not for main logo
async function generateTemplateBasedLogo(prompt: string, brandColors: BrandColors, businessDescription: string = '', imageType: 'logo' | 'card' | 'website' = 'logo'): Promise<string> {
  try {
    // Smart template selection
    const templateId = selectBestTemplate(businessDescription || prompt, imageType);
    
    // Find the template
    const template = LOGO_TEMPLATES.find(t => t.id === templateId) || LOGO_TEMPLATES[0];
    
    // Dynamic color generation with variation to avoid same colors on regenerate
    let color1, color2;
    
    if (brandColors.primary && brandColors.secondary) {
      // Use provided colors but add slight variation for each generation
      const variation = Math.floor(Math.random() * 30) - 15; // -15 to +15
      color1 = adjustColorBrightness(brandColors.primary.replace('#', ''), variation);
      color2 = adjustColorBrightness(brandColors.secondary.replace('#', ''), variation);
    } else {
      // Generate contextual colors based on business type
      const contextualColors = generateContextualColors(businessDescription || prompt);
      color1 = contextualColors.primary;
      color2 = contextualColors.secondary;
    }
    
    // Generate smart display text
    let displayText = 'Brand';
    if (imageType === 'card') {
      displayText = 'Business Card';
    } else if (imageType === 'website') {
      displayText = 'Website';
    } else {
      // Extract business name from description
      displayText = extractBusinessName(businessDescription || prompt);
    }
    
    // Generate SVG
    const svgContent = template.template(color1, color2, displayText);
    
    // Convert SVG to data URL
    const base64Svg = Buffer.from(svgContent).toString('base64');
    return `data:image/svg+xml;base64,${base64Svg}`;
  } catch (error) {
    console.error('Template logo generation error:', error);
    // Fallback to simple placeholder
    const fallbackColors = ['6366f1', '8b5cf6', '10b981', 'f59e0b', 'ef4444'];
    const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
    return `https://placehold.co/512x512/${randomColor}/ffffff?text=${encodeURIComponent('Logo')}`;
  }
}

// Generate actual logo image using HuggingFace API with automatic fallback
async function generateHuggingFaceLogoWithFallback(prompt: string, brandColors: BrandColors, businessDescription: string = ''): Promise<{ logoUrl: string; method: 'huggingface' | 'template'; error?: string }> {
  // First, try HuggingFace API if key is available
  if (process.env.HUGGINGFACE_API_KEY) {
    console.log("🔄 Attempting HuggingFace API logo generation...");
    
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    try {
      if (!prompt) {
        throw new Error('Prompt tidak boleh kosong');
      }

      const model = 'stabilityai/stable-diffusion-xl-base-1.0';
      const response = await hf.textToImage({
        model: model,
        inputs: prompt,
      });

      // Validasi respons menggunakan type guard
      if (!isBlob(response)) {
        throw new Error('Respons dari Hugging Face API bukan gambar yang valid.');
      }

      // Convert Blob to Data URL
      const imageUrl = await blobToDataURL(response);
      console.log("✅ HuggingFace API generation successful!");
      
      return {
        logoUrl: imageUrl,
        method: 'huggingface'
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("❌ HuggingFace API failed:", errorMessage);
      
      // Check if it's a credit limit error
      const isCreditsExceeded = errorMessage.includes('exceeded') || 
                               errorMessage.includes('credits') ||
                               errorMessage.includes('quota') ||
                               errorMessage.includes('limit');
      
      if (isCreditsExceeded) {
        console.log("💳 Credits exceeded - falling back to template generation");
      } else {
        console.log("🔧 API error - falling back to template generation");
      }
      
      // Fall through to template generation
    }
  } else {
    console.log("🔑 No HuggingFace API key found - using template generation");
  }

  // Fallback to template-based generation
  console.log("🎨 Using template-based logo generation...");
  try {
    const templateLogo = await generateTemplateBasedLogo(prompt, brandColors, businessDescription, 'logo');
    console.log("✅ Template-based generation successful!");
    
    return {
      logoUrl: templateLogo,
      method: 'template'
    };
  } catch (templateError) {
    console.error("❌ Template generation also failed:", templateError);
    
    // Final fallback to simple placeholder
    const fallbackColors = ['6366f1', '8b5cf6', '10b981', 'f59e0b', 'ef4444'];
    const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
    const placeholderUrl = `https://placehold.co/512x512/${randomColor}/ffffff?text=${encodeURIComponent('Logo')}`;
    
    return {
      logoUrl: placeholderUrl,
      method: 'template',
      error: 'Both HuggingFace API and template generation failed'
    };
  }
}


export async function POST(request: NextRequest) {
  try {
    const { businessDescription } = await request.json();

    if (!businessDescription) {
      return NextResponse.json(
        { error: 'Business description is required' },
        { status: 400 }
      );
    }

    // Step 1: Analyze business and generate brand strategy with Llama Groq
    const brandAnalysisPrompt = `
Analisis bisnis berikut dan buat brand identity strategy yang komprehensif:

BUSINESS DESCRIPTION: "${businessDescription}"

Berikan output dalam format JSON berikut:
{
  "brandPersonality": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "visualStyle": "detailed description of visual style",
  "colorPalette": {
    "primary": "#hexcode",
    "secondary": "#hexcode", 
    "accent": "#hexcode",
    "neutral": "#hexcode",
    "background": "#hexcode"
  },
  "typography": {
    "headline": "font-family-name",
    "body": "font-family-name",
    "display": "font-family-name"
  },
  "logoPrompt": "detailed creative prompt for AI logo generation in English (include style, mood, industry-specific elements, and visual aesthetics)",
  "targetMood": "brand mood and feeling"
}

Persyaratan PENTING:
1. Brand personality harus spesifik dan sesuai target market Indonesia
2. Color palette harmonis, professional, dan mempertimbangkan psikologi warna  
3. Typography readable, modern, dan sesuai industri spesifik
4. Logo prompt SANGAT DETAIL dengan elemen:
   - Style aesthetic (modern/vintage/minimalist/organic/geometric)
   - Industry-specific symbols atau metaphors
   - Color mood dan atmosphere
   - Typography style suggestion
   - Visual composition (circular/angular/flowing/structured)
5. Semua dalam konteks budaya Indonesia dan karakteristik UKM lokal
6. Mempertimbangkan kemudahan reproduksi logo di berbagai media`;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ API key not configured' },
        { status: 500 }
      );
    }

    const brandAnalysisCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Kamu adalah brand strategist expert dengan pengalaman 15 tahun. Berikan analisis yang detail dan praktis untuk UKM Indonesia. PENTING: Output harus berupa VALID JSON tanpa komentar, tanpa markdown, dan tanpa teks tambahan."
        },
        {
          role: "user", 
          content: brandAnalysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const brandAnalysisText = brandAnalysisCompletion.choices[0]?.message?.content || '';
    
    // Parse JSON response from Llama with better error handling
    let brandStrategy;
    try {
      // Clean the response text first
      let cleanedText = brandAnalysisText.trim();
      
      // Remove any markdown code blocks
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Extract JSON from response (find the most complete JSON object)
      const jsonMatches = cleanedText.match(/\{[\s\S]*\}/g);
      let jsonToParse = '';
      
      if (jsonMatches && jsonMatches.length > 0) {
        // Use the longest JSON match (most complete)
        jsonToParse = jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
      } else {
        jsonToParse = cleanedText;
      }
      
      // Try to fix common JSON issues
      jsonToParse = jsonToParse
        .replace(/\/\/[^\n\r]*[\n\r]/g, '\n')  // Remove single-line comments
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*):/g, '$1"$2":');  // Quote unquoted keys
      
      brandStrategy = JSON.parse(jsonToParse);
      
      // Validate required fields and provide defaults
      if (!brandStrategy.colorPalette || typeof brandStrategy.colorPalette !== 'object') {
        brandStrategy.colorPalette = {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#6b7280',
          background: '#ffffff'
        };
      }
      
      if (!brandStrategy.brandPersonality || !Array.isArray(brandStrategy.brandPersonality)) {
        brandStrategy.brandPersonality = ['professional', 'trustworthy', 'innovative', 'customer-focused', 'reliable'];
      }
      
      if (!brandStrategy.logoPrompt || typeof brandStrategy.logoPrompt !== 'string') {
        brandStrategy.logoPrompt = `modern minimalist logo design for ${businessDescription}, clean and professional style`;
      }
      
      if (!brandStrategy.visualStyle || typeof brandStrategy.visualStyle !== 'string') {
        brandStrategy.visualStyle = 'Modern and clean design with professional appearance';
      }
      
      if (!brandStrategy.targetMood || typeof brandStrategy.targetMood !== 'string') {
        brandStrategy.targetMood = 'Professional and trustworthy';
      }
      
      if (!brandStrategy.typography || typeof brandStrategy.typography !== 'object') {
        brandStrategy.typography = {
          headline: 'Inter',
          body: 'Open Sans',
          display: 'Poppins'
        };
      }
      
    } catch {
      // console.error('Failed to parse brand analysis JSON');
      
      // Fallback brand strategy
      brandStrategy = {
        brandPersonality: ['professional', 'trustworthy', 'innovative', 'customer-focused', 'reliable'],
        visualStyle: 'Modern and clean design with professional appearance suitable for Indonesian market',
        colorPalette: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#6b7280',
          background: '#ffffff'
        },
        typography: {
          headline: 'Inter',
          body: 'Open Sans',
          display: 'Poppins'
        },
        logoPrompt: `modern minimalist logo design for ${businessDescription}, clean professional style with Indonesian market appeal`,
        targetMood: 'Professional and trustworthy'
      };
    }

    // Step 2: Generate logo with automatic fallback system (HuggingFace API → Template)
    const logoPrompt = `${brandStrategy.logoPrompt}, professional logo design, clean minimal style, vector art, business logo, high quality, white background`;
    
    // Try HuggingFace API first, fallback to template if needed
    const logoResult = await generateHuggingFaceLogoWithFallback(logoPrompt, brandStrategy.colorPalette, businessDescription);
    const logoUrl = logoResult.logoUrl;
    
    // Log generation method for debugging
    if (logoResult.method === 'huggingface') {
      console.log('✅ Logo generated using HuggingFace AI API');
    } else if (logoResult.method === 'template') {
      console.log('🎨 Logo generated using Template System (fallback)');
    }
    
    if (logoResult.error) {
      console.warn('⚠️ Generation warning:', logoResult.error);
    }

    // Step 3: Generate additional visual assets with template-based system (not HuggingFace)
    const mockupPrompts = [
      { prompt: `business card mockup with ${brandStrategy.colorPalette.primary} color scheme, professional design`, type: 'card' as const },
      { prompt: `website header mockup with ${brandStrategy.visualStyle}, modern UI design`, type: 'website' as const },
      { prompt: `social media post template with ${brandStrategy.targetMood} mood, ${brandStrategy.colorPalette.primary} colors`, type: 'logo' as const }
    ];

    const mockups = await Promise.all(
      mockupPrompts.map(({ prompt, type }) => 
        generateTemplateBasedLogo(prompt, brandStrategy.colorPalette, businessDescription, type)
      )
    );

    // Step 4: Create comprehensive brand identity response
    const brandIdentity = {
      logoUrl,
      logoPrompt: brandStrategy.logoPrompt,
      colorPalette: brandStrategy.colorPalette,
      typography: brandStrategy.typography,
      brandPersonality: brandStrategy.brandPersonality,
      visualStyle: brandStrategy.visualStyle,
      mockups,
      targetMood: brandStrategy.targetMood,
      generatedAt: new Date().toISOString(),
      businessDescription,
      // Include generation method info
      generationInfo: {
        method: logoResult.method,
        isAiGenerated: logoResult.method === 'huggingface',
        isTemplateGenerated: logoResult.method === 'template',
        hasError: !!logoResult.error,
        error: logoResult.error
      }
    };

    return NextResponse.json(brandIdentity);

  } catch {
    // console.error('Brand generator error');
    return NextResponse.json(
      { error: 'Failed to generate brand identity' },
      { status: 500 }
    );
  }
}