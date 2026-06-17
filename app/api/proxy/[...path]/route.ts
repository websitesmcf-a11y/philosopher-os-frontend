import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'https://web-production-a93f0.up.railway.app/api/v1';

export async function GET(request: NextRequest, { params }: any) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join('/')}${request.nextUrl.search}`;
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (k === 'authorization' || k === 'content-type') headers[k] = v;
  });
  const res = await fetch(url, { headers });
  return new NextResponse(res.body, { status: res.status, headers: res.headers });
}

export async function POST(request: NextRequest, { params }: any) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join('/')}${request.nextUrl.search}`;
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (k === 'authorization' || k === 'content-type') headers[k] = v;
  });
  const body = await request.text();
  const res = await fetch(url, { method: 'POST', headers, body: body || undefined });
  return new NextResponse(res.body, { status: res.status, headers: res.headers });
}

export async function PATCH(request: NextRequest, { params }: any) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join('/')}${request.nextUrl.search}`;
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (k === 'authorization' || k === 'content-type') headers[k] = v;
  });
  const body = await request.text();
  const res = await fetch(url, { method: 'PATCH', headers, body: body || undefined });
  return new NextResponse(res.body, { status: res.status, headers: res.headers });
}

export async function PUT(request: NextRequest, { params }: any) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join('/')}${request.nextUrl.search}`;
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (k === 'authorization' || k === 'content-type') headers[k] = v;
  });
  const body = await request.text();
  const res = await fetch(url, { method: 'PUT', headers, body: body || undefined });
  return new NextResponse(res.body, { status: res.status, headers: res.headers });
}

export async function DELETE(request: NextRequest, { params }: any) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join('/')}${request.nextUrl.search}`;
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    if (k === 'authorization' || k === 'content-type') headers[k] = v;
  });
  const res = await fetch(url, { method: 'DELETE', headers });
  return new NextResponse(res.body, { status: res.status, headers: res.headers });
}
