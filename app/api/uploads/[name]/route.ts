import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { UPLOADS_DIR, getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/** Child photos are private: only admins and Activity Champions can view. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  if (!canAccess(requestRole(req), 'champion')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { name } = await ctx.params;
  const safe = path.basename(name); // no traversal
  getDb(); // ensure uploads dir exists
  const file = path.join(UPLOADS_DIR, safe);
  if (!fs.existsSync(file)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const ext = path.extname(safe).toLowerCase();
  return new NextResponse(new Uint8Array(fs.readFileSync(file)), {
    headers: {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
