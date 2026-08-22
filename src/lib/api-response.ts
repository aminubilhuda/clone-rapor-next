import { NextResponse } from 'next/server';

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

export function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-KEY',
  };
}

export function apiOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export function apiSuccess<T = any>(
  data: T,
  message = 'Berhasil mengambil data',
  meta?: ApiMeta,
  statusCode = 200
): NextResponse {
  const body: {
    success: true;
    statusCode: number;
    message: string;
    data: T;
    meta?: ApiMeta;
  } = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta) {
    body.meta = meta;
  }

  return NextResponse.json(body, {
    status: statusCode,
    headers: getCorsHeaders(),
  });
}

export function apiError(
  message = 'Terjadi kesalahan pada server',
  statusCode = 500,
  error?: any
): NextResponse {
  const body: {
    success: false;
    statusCode: number;
    message: string;
    error?: any;
  } = {
    success: false,
    statusCode,
    message,
  };

  if (error !== undefined) {
    body.error = error;
  }

  return NextResponse.json(body, {
    status: statusCode,
    headers: getCorsHeaders(),
  });
}
