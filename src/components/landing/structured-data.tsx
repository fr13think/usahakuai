export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "UsahaKu AI",
    "description": "Platform AI terdepan untuk UKM Indonesia",
    "url": "https://usahaku.ai",
    "logo": "https://usahaku.ai/logo.png",
    "sameAs": [
      "https://www.instagram.com/usahakunav",
      "https://www.linkedin.com/company/usahaku-ai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-21-1234-5678",
      "contactType": "customer service",
      "areaServed": "ID",
      "availableLanguage": "Indonesian"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Jakarta",
      "addressCountry": "Indonesia"
    },
    "offers": {
      "@type": "Offer",
      "name": "AI Business Platform",
      "price": "0",
      "priceCurrency": "IDR",
      "description": "Free AI platform for Indonesian SMEs"
    },
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}