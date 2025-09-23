# 🌍 UsahaKu AI

*Platform AI Terpadu untuk UKM Indonesia*

---

## 📋 Daftar Isi

1. [Overview Aplikasi](#-overview-aplikasi)
2. [Arsitektur & Teknologi](#-arsitektur--teknologi)
3. [Struktur Database](#️-struktur-database)
4. [Fitur-Fitur Lengkap](#-fitur-fitur-lengkap)
5. [API Routes](#-api-routes)
6. [Sistem AI](#-sistem-ai)
7. [Komponen UI](#-komponen-ui)
8. [Keamanan & Authentication](#️-keamanan--authentication)
9. [Deployment](#-deployment)
10. [Environment Variables](#-environment-variables)

---

## 🏢 Overview Aplikasi

**UsahaKu AI** adalah platform comprehensive yang dirancang khusus untuk membantu UKM (Usaha Kecil dan Menengah) di Indonesia. Platform ini mengintegrasikan multiple AI models dan real-time data untuk memberikan solusi bisnis yang lengkap.

### Tujuan Utama:
- 🎯 Membantu UKM Indonesia dalam perencanaan bisnis
- 💰 Memberikan analisis finansial yang akurat
- 🤖 Menyediakan konsultasi bisnis dengan AI
- 📊 Melakukan analisis pasar real-time
- 🎨 Membantu branding dan desain visual
- 📚 Menyediakan materi pembelajaran bisnis

### Target User:
- Pengusaha UKM Indonesia
- Startup founders
- Business consultants
- Individuals yang ingin memulai bisnis

---

## 🔧 Arsitektur & Teknologi

### **Frontend Stack:**
```
📦 Frontend
├── Next.js 15.3.3        # React Framework
├── React 18.3.1          # UI Library
├── TypeScript 5.x        # Type Safety
├── TailwindCSS 3.4.1     # Styling
├── Radix UI              # Component Library
├── shadcn/ui             # UI Components
├── Framer Motion         # Animations
├── React Hook Form       # Form Management
├── Zod                   # Schema Validation
└── Lucide React          # Icons
```

### **Backend & AI Stack:**
```
🧠 Backend & AI
├── Next.js API Routes    # Serverless Functions
├── Groq SDK             # AI Integration
├── HuggingFace          # Image Generation
├── Supabase             # Database & Auth
├── Exa API              # Market Intelligence
├── Tesseract.js         # OCR Processing
├── Chart.js             # Data Visualization
└── PDF Processing       # Document Analysis
```

### **Database & Storage:**
```
🗄️ Database
├── Supabase PostgreSQL   # Primary Database
├── Row Level Security    # Data Protection
├── Real-time Subscriptions
├── File Storage
└── Edge Functions
```

---


## 🚀 Fitur-Fitur Lengkap

### **1. 🏠 Dashboard Utama**

**Fitur:**
- ✅ **Progress Tracking** - Visualisasi penyelesaian tugas
- ✅ **Quick Access Cards** - Link cepat ke fitur utama
- ✅ **Featured New Features** - Highlight fitur terbaru
- ✅ **Financial Chart** - Grafik keuangan overview
- ✅ **Task Statistics** - Statistik tugas dan progress

```

### **2. 🤖 Multi-Agent AI System**

**5 Specialized AI Agents:**

#### **A. Business Strategy Agent**
- 🎯 **Expertise:** Strategic planning, growth strategy, competitive positioning
- 🎨 **Color:** Blue theme
- 📋 **Use Cases:** Business model canvas, strategic roadmaps, scaling strategies

#### **B. Financial Advisor Agent**  
- 💰 **Expertise:** Financial planning, investment, cash flow management
- 🎨 **Color:** Green theme
- 📋 **Use Cases:** Financial projections, investment advice, budgeting

#### **C. Market Analyst Agent**
- 📊 **Expertise:** Market research, trend analysis, competitive intelligence
- 🎨 **Color:** Purple theme  
- 📋 **Use Cases:** Market sizing, competitor analysis, trend forecasting

#### **D. Risk Assessor Agent**
- ⚠️ **Expertise:** Risk analysis, compliance, mitigation strategies
- 🎨 **Color:** Orange theme
- 📋 **Use Cases:** Risk assessment, compliance checking, mitigation planning

#### **E. Learning Curator Agent**
- 📚 **Expertise:** Educational content, skill development, training
- 🎨 **Color:** Teal theme
- 📋 **Use Cases:** Learning paths, skill assessments, training recommendations

**Advanced Features:**
- 🔄 **Auto-routing** to most appropriate agent
- 🧠 **RAG Integration** with user documents
- 🎙️ **Voice Input/Output** (speech-to-text & text-to-speech)
- 📝 **Context-aware** responses
- 🌍 **Multi-language** support

### **3. 🎯 Business Assistant**

#### **Module A: Business Plan Generator**
**8 Comprehensive Sections:**
1. **Executive Summary** - Ringkasan eksekutif
2. **Company Description** - Deskripsi perusahaan
3. **Products & Services** - Produk dan layanan
4. **Market Analysis** - Analisis pasar
5. **Marketing & Sales Strategy** - Strategi pemasaran
6. **Management Team** - Tim manajemen  
7. **Financial Plan** - Rencana keuangan
8. **Appendix** - Lampiran

**Features:**
- ✅ AI-powered content generation
- ✅ Save to database
- ✅ Export functionality
- ✅ Edit and update plans
- ✅ Version history

#### **Module B: Financial Insights**
**Analysis Components:**
- 📊 **Cash Flow Analysis** - Analisis arus kas
- 💹 **Profitability Analysis** - Analisis profitabilitas
- 💎 **Investment Opportunities** - Peluang investasi
- 🎯 **Smart Recommendations** - Rekomendasi cerdas

---

#### **Dual Generation System:**

**Primary: HuggingFace Stable Diffusion API**
- 🤖 Model: `stabilityai/stable-diffusion-xl-base-1.0`
- 🎨 High-quality AI-generated logos
- ⚡ Real-time generation

**Fallback: Smart Template System**
- 📐 **8+ Industry Templates:**
  1. **Geometric** - Modern, minimalist
  2. **Creative Agency** - Artistic, creative
  3. **Coffee Cup** - F&B industry
  4. **Medical** - Healthcare
  5. **Finance** - Professional services
  6. **Retail** - E-commerce
  7. **Tech** - Technology, startups
  8. **Education** - Learning, courses

---


**Smart Features:**
- 🔄 **Auto-fallback** when credits exceeded
- 🎨 **Dynamic color generation**
- 📛 **Smart business name extraction**
- 💾 **Download functionality** (SVG/PNG)
- 🏷️ **Generation method badges**

### **5. 🎮 Business Simulator**

**Game Mechanics:**
- 🎯 **Interactive Scenarios** - Real business challenges
- 📊 **Financial Metrics** - Revenue, expenses, market share
- ⏱️ **Time-based Progression** - Quarterly cycles
- 🏆 **Score System** - Performance tracking
- 💰 **Cash Management** - Critical resource management



### **6. 💡 Business Advice**

**Real-time Market Intelligence:**
- 📈 **Market Trends** - Latest industry developments
- 🏢 **Competitor Analysis** - Competitive landscape
- 📰 **Industry News** - Relevant business news
- ⚖️ **Regulations** - Legal and compliance updates
- 💎 **Opportunities** - Business opportunities

### **7. ✨ Content Generator**

**Content Types:**
- 📝 **Blog Posts** - SEO-optimized articles
- 📱 **Social Media** - Instagram, Facebook, LinkedIn posts
- 🎯 **Marketing Copy** - Advertising materials
- 📧 **Email Campaigns** - Newsletter content
- 🛍️ **Product Descriptions** - E-commerce copy

### **8. 📄 Document Analyzer**

**Processing Pipeline:**
1. 📎 **File Upload** - Multiple format support
2. 🔍 **OCR Processing** - Text extraction with Tesseract.js
3. 🧠 **AI Analysis** - Content understanding with Groq
4. 📋 **Summarization** - Key insights extraction
5. 💾 **Database Storage** - Results saved to database


### **9. 💰 Financial Summary**

**Features:**
- 📊 **Interactive Charts** - Revenue, expenses, profit trends
- 📅 **Date Range Selection** - Custom time periods
- 📈 **Trend Analysis** - Growth patterns
- 💹 **Performance Metrics** - KPI tracking
- 📁 **Export Options** - PDF, CSV, Excel

### **10. 📚 Learning Center**

**Content Types:**
- 🎧 **AI-Generated Audiobooks** - Business guides and stories
- 📖 **Interactive Courses** - Step-by-step learning
- 🎯 **Progress Tracking** - Learning milestones
- 🌍 **Multi-language Support** - Indonesian and English
- 🏆 **Achievements** - Gamified learning experience

### **11. ✅ Task Management**

**Features:**
- ➕ **Create Tasks** - Add new tasks with details
- ✏️ **Edit Tasks** - Update existing tasks
- 🗑️ **Delete Tasks** - Remove completed or unnecessary tasks
- 🏷️ **Priority Levels** - Low, Medium, High priorities
- 📅 **Due Dates** - Deadline tracking
- 📊 **Progress Visualization** - Completion statistics
- ⚠️ **Overdue Tracking** - Late task identification


### **12. 🔄 Resource Optimization Hub** ⭐ **NEW**

#### **Unified Resource Management:**
**Supply Chain + Finance + HR + Operations Integration**

**Core Modules:**

#### **A. Inventory Management**
- 📦 **Smart Inventory Tracking** - Real-time stock levels
- ⚠️ **Auto-Reorder System** - Automated purchase suggestions
- 📊 **Stock Movement Analytics** - In/out tracking
- 💰 **Inventory Valuation** - Cost analysis
- 🏪 **Supplier Management** - Contact and lead time tracking

#### **B. Workforce Optimization** 
- 👥 **Employee Performance Tracking** - Skills and performance scores
- 📅 **Smart Scheduling** - AI-powered staff allocation
- 💼 **Department Analytics** - Cross-department insights
- 💰 **Salary Cost Analysis** - Labor cost optimization
- 📈 **Productivity Metrics** - Efficiency tracking

#### **C. Operations Intelligence**
- 🎯 **Production Metrics** - Target vs actual performance
- ⏱️ **Downtime Analysis** - Efficiency bottlenecks
- 🔧 **Quality Scoring** - Product/service quality tracking
- 💡 **Energy Cost Monitoring** - Operational cost analysis
- ♻️ **Waste Management** - Waste percentage tracking

#### **D. Cash Flow Integration**
- 💸 **Real-time Cash Flow** - Income vs expense tracking
- 🏷️ **Category-based Analysis** - Detailed expense breakdown
- 🔄 **Recurring Payments** - Automated financial planning
- 📊 **Financial Forecasting** - AI-powered projections
- 🎯 **Budget Management** - Spend optimization

#### **E. AI Orchestration System**
- 🤖 **Cross-Department Analysis** - Holistic business intelligence
- ⚡ **Auto-Implementation** - High-confidence decisions executed automatically
- 🚨 **Smart Alerts** - Proactive issue detection
- 📈 **Optimization Recommendations** - AI-powered suggestions
- 🎯 **Priority Management** - Critical/High/Medium/Low prioritization

**Advanced Features:**
- 🔄 **Real-time Automation** - Trigger-based optimization
- 📊 **Health Score Dashboard** - Overall business health (0-100%)
- 💰 **Financial Impact Prediction** - ROI calculations
- 🎛️ **Customizable Thresholds** - User-defined automation triggers
- 📱 **Multi-tab Interface** - Overview, Decisions, Resources, Analytics

### **13. ⚙️ Settings**

**Settings Categories:**
- 👤 **Profile Information** - Name, email, business details
- 🏢 **Business Settings** - Company info, industry type
- 🔔 **Notifications** - Email and in-app preferences
- 🎨 **Theme Settings** - Dark/light mode preferences
- 🔒 **Security** - Password change, 2FA settings