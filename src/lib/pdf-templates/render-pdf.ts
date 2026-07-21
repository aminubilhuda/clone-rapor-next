import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { PDFDocument } from 'pdf-lib';

interface RaporPdfDocument {
  html: string;
  footerTemplate: string;
}

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

async function renderPdfBuffer(
  browser: Awaited<ReturnType<typeof launchPuppeteerBrowser>>,
  html: string,
  footerTemplate: string,
  bottomMargin: string,
): Promise<Uint8Array> {
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'load' });
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
    const browser = await launchPuppeteerBrowser();
    try {
      const pdfArray = await renderPdfBuffer(browser, html, footerTemplate, bottomMargin);
      return pdfResponse(pdfArray, filename);
    } finally {
      await browser.close();
    }
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

  let browser;
  try {
    browser = await launchPuppeteerBrowser();
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
  } finally {
    if (browser) await browser.close();
  }
}

function pdfResponse(pdfArray: Uint8Array, filename: string): NextResponse {
  return new NextResponse(Buffer.from(pdfArray), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
