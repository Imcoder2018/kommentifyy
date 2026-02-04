import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    prisma_tcp: { status: 'pending' },
    supabase_rest: { status: 'pending' }
  };

  try {
    const dbUrl = process.env.DATABASE_URL;
    const maskedUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'MISSING';

    console.log('Debug endpoint called');
    console.log('DB URL:', maskedUrl);

    // 1. Test Prisma (TCP 5432/6543)
    try {
      const userCount = await prisma.user.count();
      results.prisma_tcp = {
        status: 'success',
        data: { userCount }
      };
    } catch (e) {
      results.prisma_tcp = {
        status: 'failed',
        error: e instanceof Error ? e.message : String(e)
      };
    }

    // 2. Test Supabase Client (HTTPS 443)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        results.supabase_rest = {
          status: 'skipped',
          error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
        };
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey);
        // Test public schema (always available)
        // We use a non-existent table to check connectivity without needing specific table permissions
        const { data, error } = await supabase.from('NonExistentTable').select('*');

        // PGRST205 means "relation does not exist", which implies successful connection to Postgres
        const isConnectionSuccess = error && error.code === 'PGRST205';

        results.supabase_rest = {
          status: isConnectionSuccess ? 'success' : (error ? 'failed_query' : 'success'),
          data: data,
          error: error
        };
      }
    } catch (e) {
      results.supabase_rest = {
        status: 'failed_connection',
        error: e instanceof Error ? e.message : String(e)
      };
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug execution failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
