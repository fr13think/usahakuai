# Exa API Integration Guide

## Overview
Integrasi Exa API untuk market intelligence real-time dan Groq AI untuk business recommendations. Kombinasi ini memberikan analisis pasar yang komprehensif dengan rekomendasi bisnis yang cerdas.

## Setup

1. Tambahkan API keys ke file `.env.local`:
```bash
EXA_API_KEY=your_exa_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

2. Import library di kode Anda:
```typescript
import { exaAPI, MarketIntelligence } from '@/lib/exa-api';
```

## Contoh Penggunaan

### 1. Market Intelligence Komprehensif
```typescript
// Mendapatkan analisis pasar lengkap untuk bisnis tertentu
const intelligence = await exaAPI.getMarketIntelligence(
  'kedai kopi specialty', 
  'food & beverage'
);

console.log('Market Trends:', intelligence.marketTrends);
console.log('Competitor Analysis:', intelligence.competitorAnalysis);
console.log('Industry News:', intelligence.industryNews);
console.log('Regulations:', intelligence.regulations);
console.log('Opportunities:', intelligence.opportunities);
```

### 2. Analisis Kompetitor
```typescript
// Mencari kompetitor untuk bisnis tertentu
const competitors = await exaAPI.searchCompetitors(
  'aplikasi delivery makanan', 
  'Indonesia'
);

competitors.forEach(competitor => {
  console.log(`${competitor.title}: ${competitor.url}`);
  console.log(`Summary: ${competitor.summary}`);
});
```

### 3. Trending Topics
```typescript
// Mendapatkan topik yang sedang trending di industri tertentu
const trends = await exaAPI.getTrendingTopics('teknologi fintech');

trends.forEach(trend => {
  console.log(`Trending: ${trend.title}`);
  console.log(`Score: ${trend.score}`);
});
```

### 4. Update Regulasi
```typescript
// Monitoring perubahan regulasi untuk bisnis
const regulations = await exaAPI.getRegulationUpdates('e-commerce');

regulations.forEach(regulation => {
  console.log(`Regulation: ${regulation.title}`);
  console.log(`Published: ${regulation.publishedDate}`);
  console.log(`Summary: ${regulation.summary}`);
});
```

### 5. Search Kustom
```typescript
// Pencarian dengan parameter khusus
const results = await exaAPI.search({
  query: 'startup unicorn Indonesia 2024',
  numResults: 15,
  includeText: true,
  includeSummary: true,
  includeDomains: ['techinasia.com', 'dailysocial.id'],
  startPublishedDate: '2024-01-01',
  language: 'id'
});

console.log('Search results:', results.results);
```

## Integrasi dengan Business Plan Generator

### Di API Route
```typescript
// src/app/api/business-plan/route.ts
import { exaAPI } from '@/lib/exa-api';

export async function POST(request: Request) {
  const { businessType, industry } = await request.json();
  
  // Dapatkan market intelligence
  const marketData = await exaAPI.getMarketIntelligence(businessType, industry);
  
  // Gabungkan dengan analisis AI untuk business plan
  const businessPlan = await generateBusinessPlan({
    businessType,
    industry,
    marketData
  });
  
  return NextResponse.json(businessPlan);
}
```

### Di Component React
```typescript
// src/components/MarketAnalysis.tsx
import { useState, useEffect } from 'react';
import { exaAPI, MarketIntelligence } from '@/lib/exa-api';

export function MarketAnalysis({ businessType }: { businessType: string }) {
  const [intelligence, setIntelligence] = useState<MarketIntelligence | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMarketData() {
      setLoading(true);
      try {
        const data = await exaAPI.getMarketIntelligence(businessType);
        setIntelligence(data);
      } catch (error) {
        console.error('Failed to fetch market intelligence:', error);
      } finally {
        setLoading(false);
      }
    }

    if (businessType) {
      fetchMarketData();
    }
  }, [businessType]);

  if (loading) return <div>Loading market analysis...</div>;
  if (!intelligence) return null;

  return (
    <div className="market-analysis">
      <h3>Market Intelligence</h3>
      
      <section>
        <h4>Market Trends</h4>
        {intelligence.marketTrends.map(trend => (
          <div key={trend.id} className="trend-item">
            <h5>{trend.title}</h5>
            <p>{trend.summary}</p>
            <a href={trend.url} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        ))}
      </section>

      <section>
        <h4>Competitor Analysis</h4>
        {intelligence.competitorAnalysis.map(competitor => (
          <div key={competitor.id} className="competitor-item">
            <h5>{competitor.title}</h5>
            <p>{competitor.summary}</p>
          </div>
        ))}
      </section>

      {/* ... other sections */}
    </div>
  );
}
```

## Best Practices

1. **Rate Limiting**: Exa API memiliki rate limits, gunakan caching untuk mengurangi API calls.

2. **Error Handling**: Selalu handle error dengan graceful fallback:
```typescript
try {
  const data = await exaAPI.getMarketIntelligence(query);
  return data;
} catch (error) {
  console.error('Exa API error:', error);
  // Fallback to cached data or show error message
  return getCachedData(query) || null;
}
```

3. **Caching**: Implementasikan caching untuk data yang tidak berubah frequently:
```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedMarketIntelligence(query: string) {
  const cacheKey = `market_intelligence:${query}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const fresh = await exaAPI.getMarketIntelligence(query);
  await redis.setex(cacheKey, 3600, JSON.stringify(fresh)); // Cache 1 hour
  
  return fresh;
}
```

4. **Filtering Domain**: Gunakan `includeDomains` untuk mendapatkan sumber yang reliable:
```typescript
const trustworthySources = [
  'katadata.co.id',
  'kontan.co.id', 
  'bisnis.com',
  'cnbcindonesia.com',
  'kemenperin.go.id'
];
```

## Troubleshooting

### API Key Issues
- Pastikan `EXA_API_KEY` dan `GROQ_API_KEY` ada di `.env.local`
- Verifikasi API keys valid di dashboard masing-masing
- Check quota dan billing status
- Exa API: https://dashboard.exa.ai/
- Groq API: https://console.groq.com/

### Rate Limiting
- Implement exponential backoff untuk retry
- Gunakan caching untuk mengurangi API calls
- Monitor usage di dashboard Exa

### No Results
- Coba query yang lebih spesifik
- Adjust date range filters
- Remove atau expand domain filters