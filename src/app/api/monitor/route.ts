import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  const stats = db.getStats();
  return NextResponse.json(stats);
}
