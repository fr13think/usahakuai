import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createBusinessPlan, getBusinessPlans } from '@/lib/supabase/business-plans';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getBusinessPlans(user.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching business plans:', error);
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
    const businessPlanData = {
      ...body,
      user_id: user.id,
    };

    const data = await createBusinessPlan(businessPlanData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating business plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}