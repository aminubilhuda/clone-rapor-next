import { NextResponse } from 'next/server';

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
    return NextResponse.json({ error: 'Puppeteer tidak tersedia' }, { status: 500 });
  }
  if (!puppeteer?.default) {
    return NextResponse.json({ error: 'Puppeteer tidak tersedia' }, { status: 500 });
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.CHROME_PATH || undefined,
  });

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
}
