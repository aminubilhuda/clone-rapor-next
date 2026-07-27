import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import type { Browser } from 'puppeteer';

interface RaporPdfDocument {
  html: string;
  footerTemplate: string;
}

const globalForPdf = globalThis as unknown as {
  raporPdfBrowserPromise?: Promise<Browser>;
};

async function launchPuppeteerBrowser() {
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    throw new Error('Puppeteer tidak tersedia di server');
  }
  if (!puppeteer?.default) {
    throw new Error('Puppeteer tidak tersedia di server');
  }

  const customChromePath = process.env.CHROME_PATH?.trim();
  const validExecutablePath = customChromePath && existsSync(customChromePath) ? customChromePath : undefined;
  const launchOptions = {
    headless: true as const,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  };

  try {
    return await puppeteer.default.launch({
      ...launchOptions,
      executablePath: validExecutablePath,
    });
  } catch (launchErr: any) {
    if (validExecutablePath) {
      try {
        return await puppeteer.default.launch(launchOptions);
      } catch (fallbackErr: any) {
        throw new Error(`Gagal membuka browser Puppeteer: ${fallbackErr?.message || fallbackErr}`);
      }
    }
    throw new Error(`Gagal membuka browser Puppeteer: ${launchErr?.message || launchErr}`);
  }
}

async function getPuppeteerBrowser(): Promise<Browser> {
  if (globalForPdf.raporPdfBrowserPromise) {
    try {
      const browser = await globalForPdf.raporPdfBrowserPromise;
      if (browser.connected) return browser;
    } catch {
      // A fresh browser will be started below.
    }
    delete globalForPdf.raporPdfBrowserPromise;
  }

  const browserPromise = launchPuppeteerBrowser();
  globalForPdf.raporPdfBrowserPromise = browserPromise;

  try {
    const browser = await browserPromise;
    browser.on('disconnected', () => {
      if (globalForPdf.raporPdfBrowserPromise === browserPromise) {
        delete globalForPdf.raporPdfBrowserPromise;
      }
    });
    return browser;
  } catch (error) {
    if (globalForPdf.raporPdfBrowserPromise === browserPromise) {
      delete globalForPdf.raporPdfBrowserPromise;
    }
    throw error;
  }
}

async function renderPdfBuffer(
  browser: Browser,
  html: string,
  footerTemplate: string,
  bottomMargin: string,
): Promise<Uint8Array> {
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10_000 });
    return await page.pdf({
      width: '210mm',
      height: '330mm',
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate,
      headerTemplate: '<div></div>',
      margin: { top: '6.2mm', bottom: bottomMargin, left: '14.5mm', right: '15.7mm' },
    });
  } finally {
    await page.close();
  }
}

export async function renderRaporPdf(
  html: string,
  footerTemplate: string,
  filename: string,
  bottomMargin = '12mm'
): Promise<NextResponse> {
  try {
    const browser = await getPuppeteerBrowser();
    const pdfArray = await renderPdfBuffer(browser, html, footerTemplate, bottomMargin);
    return pdfResponse(pdfArray, filename);
  } catch (error: any) {
    if (error?.message === 'Puppeteer tidak tersedia di server') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }
}

export async function renderRaporPdfBatch(
  documents: RaporPdfDocument[],
  filename: string,
  bottomMargin = '12mm',
): Promise<NextResponse> {
  if (documents.length === 0) {
    return NextResponse.json({ error: 'Tidak ada dokumen rapor untuk dicetak' }, { status: 400 });
  }

  try {
    const browser = await getPuppeteerBrowser();
    const mergedPdf = await PDFDocument.create();

    for (const document of documents) {
      const pdfArray = await renderPdfBuffer(browser, document.html, document.footerTemplate, bottomMargin);
      const studentPdf = await PDFDocument.load(pdfArray);
      const pages = await mergedPdf.copyPages(studentPdf, studentPdf.getPageIndices());
      for (const page of pages) mergedPdf.addPage(page);
    }

    return pdfResponse(await mergedPdf.save(), filename);
  } catch (error: any) {
    if (error?.message === 'Puppeteer tidak tersedia di server') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }
}

export function pdfResponse(
  pdfArray: Uint8Array,
  filename: string,
  extraHeaders?: Record<string, string>,
): NextResponse {
  return new NextResponse(Buffer.from(pdfArray), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      ...extraHeaders,
    },
  });
}
