import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all projects (Public)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const visibility = searchParams.get('visibility');
    const category = searchParams.get('category');

    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (visibility) {
        query = query.eq('visibility', visibility);
    }

    if (category) {
        query = query.contains('category', [category]);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST new project (Admin Only)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
        .from('projects')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
