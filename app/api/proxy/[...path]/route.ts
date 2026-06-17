import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'https://web-production-a93f0.up.railway.app/api/v1';

async function proxyHandler(
  request: NextRequest,
  params: any,
  method: string,
  hasBody = false,
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const url = pathStr ? `${BACKEND}/${pathStr}${request.nextUrl.search}` : `${BACKEND}${request.nextUrl.search}`;
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (k === 'authorization' || k === 'content-type') headers[k] = v;
  });

  // Read body once, cache it for redirect retries
  const bodyText = hasBody ? await request.text() : undefined;

  async function doFetch(u: string, redirectCount = 0): Promise<Response> {
    const opts: RequestInit & { headers: Record<string, string> } = { method, headers, redirect: 'manual' };
    if (bodyText) opts.body = bodyText;
    const res = await fetch(u, opts);

    if ((res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) && redirectCount < 5) {
      const location = res.headers.get('location');
      if (location) {
        const next = location.startsWith('http')
          ? location.replace(/^http:\/\//, 'https://')
          : `${BACKEND}${location}`;
        return doFetch(next, redirectCount + 1);
      }
    }
    return res;
  }

  const res = await doFetch(url);
  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('transfer-encoding');
  return new NextResponse(res.body, { status: res.status, headers: responseHeaders });
}

export async function GET(request: NextRequest, { params }: any) {
  return proxyHandler(request, params, 'GET');
}

export async function POST(request: NextRequest, { params }: any) {
  return proxyHandler(request, params, 'POST', true);
}

export async function PATCH(request: NextRequest, { params }: any) {
  return proxyHandler(request, params, 'PATCH', true);
}

export async function PUT(request: NextRequest, { params }: any) {
  return proxyHandler(request, params, 'PUT', true);
}

export async function DELETE(request: NextRequest, { params }: any) {
  return proxyHandler(request, params, 'DELETE');
}
