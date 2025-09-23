'use server';

/**
 * @fileOverview Generates new learning content (audiobooks or courses).
 *
 * - generateLearningContent - A function that generates new learning material.
 * - GenerateLearningContentInput - The input type for the generateLearningContent function.
 * - GenerateLearningContentOutput - The return type for the generateLearningContent function.
 */

import { generateWithGroq, GROQ_MODELS } from '@/ai/groq-helper';
import {z} from 'zod';

export type GenerateLearningContentInput = {
  contentType: 'audiobook' | 'course';
  existingTitles: string[];
};

const GenerateLearningContentOutputSchema = z.object({
  title: z.string().describe('The title of the new learning content.'),
  description: z.string().describe('A brief description of the new learning content.'),
  content: z.string().describe('The full detailed content of the learning material.'),
  chapters: z.array(z.object({
    title: z.string(),
    content: z.string()
  })).optional().describe('Chapter breakdown for courses (optional, for courses only).')
});
export type GenerateLearningContentOutput = z.infer<typeof GenerateLearningContentOutputSchema>;

export async function generateLearningContent(input: GenerateLearningContentInput): Promise<GenerateLearningContentOutput> {
  const systemPrompt = `Anda adalah pengembang kurikulum ahli untuk pengusaha UKM Indonesia.

Tugas Anda adalah menghasilkan konten pembelajaran yang komprehensif, edukatif, dan praktis untuk pengusaha UKM di Indonesia.

PENTING: Berikan respons HANYA dalam format JSON yang valid, tanpa teks tambahan atau penjelasan di luar JSON. Pastikan semua tanda kutip ganda (") di dalam nilai string di-escape dengan garis miring terbalik (\\").`;

  const existingTitlesText = input.existingTitles.length > 0 
    ? input.existingTitles.map(title => `- ${title}`).join('\n')
    : 'Tidak ada judul yang sudah ada';

  const contentTypeIndonesian = input.contentType === 'audiobook' ? 'Audiobook' : 'Kursus';

  const userPrompt = `Jenis Konten: ${contentTypeIndonesian}
Judul yang Sudah Ada (jangan diulang):
${existingTitlesText}

Hasilkan konten pembelajaran baru yang:
- Topiknya relevan untuk UKM di Indonesia
- Judulnya menarik dan informatif
- Deskripsinya ringkas dan menarik, mendorong pengguna untuk terlibat dengan konten
- Konten lengkap dan edukatif (minimal 300 kata untuk audiobook, atau terstruktur dalam bab-bab untuk kursus)
- Menggunakan Bahasa Indonesia yang baik dan mudah dipahami
- Berisi informasi praktis dan actionable untuk UKM
- Mencakup contoh nyata dari konteks bisnis Indonesia

${input.contentType === 'course' ? `
Untuk KURSUS, sertakan pembagian bab-bab (chapters) dengan struktur:
- Setiap bab memiliki judul dan konten yang jelas
- Minimal 3-5 bab per kursus
- Setiap bab berisi 200-350 kata
` : `
Untuk AUDIOBOOK, buat konten naratif yang mengalir dengan baik:
- Cocok untuk didengarkan (bukan dibaca)
- Gunakan gaya bercerita yang menarik
- Sertakan transisi yang smooth antar topik
- Minimal 450 kata
`}

Berikan respons dalam format JSON yang valid dengan struktur berikut:
{
  "title": "Judul konten pembelajaran dalam Bahasa Indonesia",
  "description": "Deskripsi singkat yang menarik dalam Bahasa Indonesia",
  "content": "Konten lengkap dalam Bahasa Indonesia",
  ${input.contentType === 'course' ? '\"chapters\": [{ \"title\": \"Judul Bab\", \"content\": \"Isi bab\" }]' : ''}
}

Hanya berikan JSON, tanpa teks lain di luar format JSON.`;

  try {
    const result = await generateWithGroq({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
      temperature: 0.9,
      max_tokens: 1200
    });

    // Extract JSON from markdown response if needed
    let jsonString = result.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse the JSON response
    const parsed = JSON.parse(jsonString) as GenerateLearningContentOutput;
    
    // Validate the response against our schema and ensure plain object
    const validated = GenerateLearningContentOutputSchema.parse(parsed);
    return JSON.parse(JSON.stringify(validated));
  } catch (error) {
    console.error('Error generating learning content:', error);
    
    // Return fallback content as plain object with random topics
    const audiobookTopics = [
      {
        title: 'Strategi Pemasaran Digital untuk UKM Indonesia',
        description: 'Pelajari cara memanfaatkan media sosial dan platform digital untuk mengembangkan bisnis UKM Anda di era digital.',
        theme: 'pemasaran digital'
      },
      {
        title: 'Inovasi Produk dan Layanan untuk Daya Saing UKM',
        description: 'Temukan cara mengembangkan produk dan layanan inovatif yang dapat meningkatkan daya saing bisnis UKM Anda.',
        theme: 'inovasi produk'
      },
      {
        title: 'Membangun Brand yang Kuat untuk UKM',
        description: 'Pelajari langkah-langkah membangun identitas brand yang memorable dan meningkatkan loyalitas pelanggan.',
        theme: 'branding'
      },
      {
        title: 'Strategi Ekspansi Bisnis UKM ke Pasar Online',
        description: 'Panduan lengkap untuk memperluas jangkauan bisnis UKM melalui platform e-commerce dan marketplace.',
        theme: 'ekspansi online'
      }
    ];

    const courseTopics = [
      {
        title: 'Kursus Manajemen Keuangan UKM',
        description: 'Kuasai dasar-dasar manajemen keuangan yang essential untuk kesuksesan bisnis UKM Anda.',
        theme: 'keuangan'
      },
      {
        title: 'Kursus Manajemen SDM untuk UKM',
        description: 'Pelajari cara merekrut, mengelola, dan mengembangkan tim yang efektif untuk bisnis UKM Anda.',
        theme: 'sdm'
      },
      {
        title: 'Kursus Strategi Penjualan dan Customer Service',
        description: 'Tingkatkan kemampuan penjualan dan layanan pelanggan untuk meningkatkan revenue bisnis UKM.',
        theme: 'penjualan'
      },
      {
        title: 'Kursus Digital Marketing untuk UKM Pemula',
        description: 'Panduan step-by-step menggunakan digital marketing untuk meningkatkan visibilitas dan penjualan UKM.',
        theme: 'digital marketing'
      }
    ];

    const topics = input.contentType === 'audiobook' ? audiobookTopics : courseTopics;
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const fallbackContent = input.contentType === 'audiobook'
      ? `Selamat datang di panduan strategi pemasaran digital untuk UKM Indonesia.

Di era digital ini, pemasaran online bukan lagi pilihan, tetapi kebutuhan mutlak bagi setiap UKM yang ingin berkembang. Mari kita mulai perjalanan untuk memahami bagaimana Anda dapat memanfaatkan kekuatan digital untuk mengembangkan bisnis Anda.

Pertama-tama, mari kita pahami mengapa pemasaran digital sangat penting. Menurut data Asosiasi Penyelenggara Jasa Internet Indonesia (APJII), lebih dari 210 juta orang Indonesia kini menggunakan internet. Ini adalah pasar yang sangat besar yang tidak boleh Anda lewatkan.

Langkah pertama dalam pemasaran digital adalah memahami target audiens Anda. Siapa pelanggan ideal Anda? Apa kebutuhan dan keinginan mereka? Di platform media sosial mana mereka menghabiskan waktu mereka? Dengan memahami hal ini, Anda dapat mengarahkan upaya pemasaran Anda dengan lebih efektif.

Selanjutnya, mari kita bahas tentang platform media sosial. Facebook, Instagram, TikTok, dan WhatsApp Business adalah platform yang paling populer di Indonesia. Setiap platform memiliki karakteristik dan audiens yang berbeda. Facebook cocok untuk membangun komunitas dan berbagi konten informatif. Instagram sangat baik untuk bisnis yang visual seperti fashion, makanan, dan kerajinan. TikTok efektif untuk menjangkau audiens muda dengan konten yang kreatif dan menghibur.

Sekarang, bagaimana cara membuat konten yang menarik? Konten adalah raja dalam pemasaran digital. Buatlah konten yang memberikan nilai kepada audiens Anda. Berbagi tips, tutorial, cerita di balik produk, atau testimoni pelanggan. Konsistensi adalah kunci. Buatlah jadwal posting yang teratur dan patuhi jadwal tersebut.

Dalam pemasaran digital, engagement atau keterlibatan audiens sangat penting. Jangan hanya fokus pada jumlah followers, tetapi pada kualitas interaksi. Responlah komentar dan pesan dengan cepat dan ramah. Buatlah konten yang mengajak audiens untuk berpartisipasi, seperti tanya jawab, kontes, atau polling.

Terakhir, jangan lupa untuk mengukur hasil dari upaya pemasaran digital Anda. Gunakan tools analytics yang disediakan oleh setiap platform untuk memahami performa konten Anda. Pelajari konten mana yang paling disukai audiens dan replikasi formula tersebut.

Ingatlah bahwa pemasaran digital adalah marathon, bukan sprint. Hasilnya tidak akan terlihat dalam semalam, tetapi dengan konsistensi dan strategi yang tepat, bisnis UKM Anda akan berkembang di era digital ini.`
      : `Manajemen keuangan adalah fondasi kesuksesan setiap UKM. Tanpa pemahaman yang baik tentang keuangan, bisnis Anda akan seperti kapal tanpa kompas.

Bab 1: Pentingnya Pembukuan
Pembukuan adalah pencatatan sistematis semua transaksi keuangan bisnis Anda. Setiap rupiah yang masuk dan keluar harus dicatat dengan rapi. Ini bukan hanya untuk keperluan pajak, tetapi juga untuk membantu Anda memahami kondisi finansial bisnis Anda. Mulailah dengan mencatat semua pemasukan dan pengeluaran harian. Gunakan aplikasi sederhana atau bahkan buku tulis jika perlu.

Bab 2: Memisahkan Keuangan Pribadi dan Bisnis
Salah satu kesalahan terbesar UKM adalah mencampur keuangan pribadi dengan bisnis. Buatlah rekening bank terpisah untuk bisnis Anda. Ini akan memudahkan Anda melacak cash flow bisnis dan menghitung pajak yang harus dibayar.

Bab 3: Mengelola Cash Flow
Cash flow adalah aliran uang masuk dan keluar dari bisnis Anda. Bisnis bisa untung di atas kertas tetapi bangkrut karena masalah cash flow. Buatlah proyeksi cash flow bulanan dan mingguan. Pastikan Anda selalu memiliki cukup uang tunai untuk operasional sehari-hari.

Bab 4: Membuat Budget dan Forecast
Budget adalah rencana keuangan Anda, sedangkan forecast adalah prediksi keuangan berdasarkan tren saat ini. Buatlah budget realistis berdasarkan data historis dan kondisi pasar. Review dan update budget Anda secara berkala.

Bab 5: Memahami Laporan Keuangan Dasar
Ada tiga laporan keuangan utama: Laporan Laba Rugi, Neraca, dan Laporan Cash Flow. Laporan Laba Rugi menunjukkan profitabilitas bisnis Anda. Neraca menunjukkan aset, liabilitas, dan modal. Laporan Cash Flow menunjukkan pergerakan uang tunai. Pelajari cara membaca dan menginterpretasi laporan-laporan ini.`;

    const fallbackChapters = input.contentType === 'course' ? [
      {
        title: "Pentingnya Pembukuan",
        content: "Pembukuan adalah pencatatan sistematis semua transaksi keuangan bisnis Anda. Setiap rupiah yang masuk dan keluar harus dicatat dengan rapi. Ini bukan hanya untuk keperluan pajak, tetapi juga untuk membantu Anda memahami kondisi finansial bisnis Anda. Mulailah dengan mencatat semua pemasukan dan pengeluaran harian. Gunakan aplikasi sederhana atau bahkan buku tulis jika perlu."
      },
      {
        title: "Memisahkan Keuangan Pribadi dan Bisnis", 
        content: "Salah satu kesalahan terbesar UKM adalah mencampur keuangan pribadi dengan bisnis. Buatlah rekening bank terpisah untuk bisnis Anda. Ini akan memudahkan Anda melacak cash flow bisnis dan menghitung pajak yang harus dibayar."
      },
      {
        title: "Mengelola Cash Flow",
        content: "Cash flow adalah aliran uang masuk dan keluar dari bisnis Anda. Bisnis bisa untung di atas kertas tetapi bangkrut karena masalah cash flow. Buatlah proyeksi cash flow bulanan dan mingguan. Pastikan Anda selalu memiliki cukup uang tunai untuk operasional sehari-hari."
      }
    ] : undefined;

    return JSON.parse(JSON.stringify({
      title: randomTopic.title,
      description: randomTopic.description,
      content: fallbackContent,
      chapters: fallbackChapters
    }));
  }
}
