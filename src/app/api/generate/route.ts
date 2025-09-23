import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

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

export async function POST(req: Request) {
  // Pindahkan pengecekan token ke dalam handler untuk memastikan dijalankan saat runtime
  if (!process.env.HUGGINGFACE_API_KEY) {
    // console.error("Backend Error: HUGGINGFACE_API_KEY tidak ditemukan atau tidak dikonfigurasi di .env.local.");
    return NextResponse.json({ error: 'Kunci API Hugging Face tidak diatur di server.' }, { status: 500 });
  }

  // console.log("--- Backend (Hugging Face): /api/generate endpoint dipanggil ---");

  // Inisialisasi klien di dalam handler untuk memastikan token sudah dimuat
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

  try {
    const { prompt } = await req.json();
    // console.log("Backend: Menerima prompt:", prompt);

    if (!prompt) {
      // console.error("Backend Error: Prompt kosong.");
      return NextResponse.json({ error: 'Prompt tidak boleh kosong' }, { status: 400 });
    }

    // console.log("Backend: Memanggil Hugging Face Inference API...");
    const model = 'stabilityai/stable-diffusion-xl-base-1.0';
    const response = await hf.textToImage({
      model: model,
      inputs: prompt,
    });

    // console.log("--- Backend: Respon dari Hugging Face API ---");
    // console.log(response);
    // console.log("----------------------------------------------------------");

        // Validasi respons menggunakan type guard
    if (!isBlob(response)) {
      // console.error("Backend Error: Respons dari Hugging Face API bukan Blob.", response);
      throw new Error('Respons dari Hugging Face API bukan gambar yang valid.');
    }

    // API mengembalikan gambar sebagai Blob, bukan URL.
    // Kita perlu mengubahnya menjadi Data URL (base64) agar bisa ditampilkan di <img>
    // console.log("Backend: Mengubah Blob menjadi Data URL...");
    const imageUrl = await blobToDataURL(response);

    // console.log("Backend: Mengirim Data URL ke frontend.");
    return NextResponse.json({ imageUrl });

  } catch (error) {
    // console.error("--- Backend: Terjadi Error ---");
    // console.error(error);
    // console.error("----------------------------");
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan internal server.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
