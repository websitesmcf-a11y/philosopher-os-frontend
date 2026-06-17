import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'https://web-production-a93f0.up.railway.app/api/v1';

function buildUrl(path: string[], search: string, addTrailingSlash = false) {
  const pathStr = path.join('/');
  let base = pathStr ? `${BACKEND}/${pathStr}` : BACKEND;
  if (addTrailingSlash) base += '/';
  return base + search;
}

async function proxyHandler(
  request: NextRequest,
  params: any,
  method: string,
  hasBody = false,
) {
  const { path } = await params;
  const addSlash = method === 'POST' || method === 'PUT' || method === 'PATCH';
  const url = buildUrl(path, request.nextUrl.search, addSlash);
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (k === 'authorization' || k === 'content-type') headers[k] = v;
  });
  const opts: RequestInit & { headers: Record<string, string> } = { method, headers };
  if (hasBody) {
    const body = await request.text();
    if (body) opts.body = body;
  }
  const res = await fetch(url, opts);
  return new NextResponse(res.body, { status: res.status, headers: res.headers });
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
