import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createFinancialInsight, getFinancialInsights } from '@/lib/supabase/financial-insights';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getFinancialInsights(user.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching financial insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const insightData = {
      ...body,
      user_id: user.id,
    };

    const data = await createFinancialInsight(insightData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating financial insight:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}