import { NextRequest, NextResponse } from 'next/server';
import { generateSalesContent } from '@/ai/flows/generate-sales-content';
import { createServerClient } from '@/lib/supabase/server';
import { createGeneratedContent, getGeneratedContentsByType } from '@/lib/supabase/generated-contents';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, imageDataUri, fileName, fileSize, title, description, hashtags } = body;

    if (action === 'save') {
      // Save generated content to database
      try {
        const savedContent = await createGeneratedContent({
          user_id: user.id,
          file_name: fileName,
          file_size: fileSize,
          title: title,
          description: description,
          hashtags: hashtags,
          content_type: 'sales_content'
        });

        // Return plain object
        const plainResult = JSON.parse(JSON.stringify(savedContent));
        return NextResponse.json(plainResult);
      } catch (dbError) {
        console.error('Save error:', dbError);
        return NextResponse.json({ error: 'Failed to save content to database' }, { status: 500 });
      }
    }

    // Generate content from image
    if (!imageDataUri) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Validate image data URI format
    if (!imageDataUri.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Generate sales content using AI
    const result = await generateSalesContent({ imageDataUri });
    
    // Ensure we return plain objects
    const plainResult = JSON.parse(JSON.stringify(result));
    
    return NextResponse.json(plainResult);
    
  } catch (error) {
    console.error('Error in content generator API:', error);
    
    // Return a user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: errorMessage,
        fallback: {
          title: 'Produk Unggulan - Segera Dapatkan!',
          description: 'Terjadi kendala teknis saat menganalisis gambar, namun produk ini tetap berkualitas tinggi dan layak untuk dipromosikan. Silakan sesuaikan deskripsi dengan detail produk Anda.',
          hashtags: ['#ProdukBerkualitas', '#JualOnline', '#PromoSpesial', '#KualitasTerbaik']
        }
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's generated content history
    try {
      const contents = await getGeneratedContentsByType(user.id, 'sales_content');
      
      // Return plain objects
      const plainContents = JSON.parse(JSON.stringify(contents));
      
      return NextResponse.json(plainContents);
    } catch (serviceError) {
      console.error('Service error:', serviceError);
      return NextResponse.json({ error: 'Failed to fetch content history' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error fetching content history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content history' }, 
      { status: 500 }
    );
  }
}