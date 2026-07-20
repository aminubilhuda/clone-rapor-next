import { NextResponse } from 'next/server';
import { existsSync } from 'fs';

export async function renderRaporPdf(
  html: string,
  footerTemplate: string,
  filename: string,
  bottomMargin = '12mm'
): Promise<NextResponse> {
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    return NextResponse.json({ error: 'Puppeteer tidak tersedia di server' }, { status: 500 });
  }
  if (!puppeteer?.default) {
    return NextResponse.json({ error: 'Puppeteer tidak tersedia di server' }, { status: 500 });
  }

  // Hanya gunakan CHROME_PATH jika berkas benar-benar ada di disk (mencegah error path Mac di Windows/Linux)
  const customChromePath = process.env.CHROME_PATH?.trim();
  const validExecutablePath = customChromePath && existsSync(customChromePath) ? customChromePath : undefined;

  let browser;
  try {
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      executablePath: validExecutablePath,
    });
  } catch (launchErr: any) {
    // Fallback: coba launch tanpa executablePath jika pembukaan kustom gagal
    if (validExecutablePath) {
      try {
        browser = await puppeteer.default.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
        });
      } catch (fallbackErr: any) {
        throw new Error(`Gagal membuka browser Puppeteer: ${fallbackErr?.message || fallbackErr}`);
      }
    } else {
      throw new Error(`Gagal membuka browser Puppeteer: ${launchErr?.message || launchErr}`);
    }
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const pdfArray = await page.pdf({
      width: '210mm',
      height: '330mm',
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate,
      headerTemplate: '<div></div>',
      margin: { top: '6.2mm', bottom: bottomMargin, left: '14.5mm', right: '15.7mm' },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfArray), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (pdfErr: any) {
    if (browser) await browser.close();
    throw pdfErr;
  }
}
