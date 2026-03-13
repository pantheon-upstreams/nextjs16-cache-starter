import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

/**
 * Validate the webhook secret from either the X-Webhook-Secret header
 * or the request body's secret field.
 */
function validateWebhookSecret(request: NextRequest, bodySecret?: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('[Revalidate] WEBHOOK_SECRET not set — rejecting request');
    return false;
  }

  const headerSecret = request.headers.get('X-Webhook-Secret');
  if (headerSecret === WEBHOOK_SECRET) return true;
  if (bodySecret === WEBHOOK_SECRET) return true;

  return false;
}

/**
 * POST /api/revalidate
 *
 * Receives webhook requests from WordPress and calls revalidateTag()
 * for each surrogate key. Secured with WEBHOOK_SECRET.
 *
 * Body format:
 *   {
 *     "surrogate_keys": ["post-123", "post-my-slug", "post-list", "term-5"],
 *     "secret": "<WEBHOOK_SECRET>"  // optional if using X-Webhook-Secret header
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, surrogate_keys } = body;

    if (!validateWebhookSecret(request, secret)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid webhook secret' },
        { status: 401 }
      );
    }

    if (!surrogate_keys || !Array.isArray(surrogate_keys) || surrogate_keys.length === 0) {
      return NextResponse.json(
        { error: 'surrogate_keys array is required' },
        { status: 400 }
      );
    }

    console.log(`[Revalidate] Revalidating ${surrogate_keys.length} surrogate key(s): ${surrogate_keys.join(', ')}`);

    const results = [];
    for (const key of surrogate_keys) {
      try {
        revalidateTag(key, { expire: 0 });
        results.push({ key, status: 'success' });
      } catch (error) {
        results.push({ key, status: 'error', message: String(error) });
      }
    }

    return NextResponse.json({
      message: `Revalidated ${surrogate_keys.length} cache tags`,
      revalidated_at: new Date().toISOString(),
      results,
    }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process webhook', message: String(error) },
      { status: 500 }
    );
  }
}
