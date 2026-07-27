import { join, sep } from 'path';
import pdfMake from 'pdfmake';

export const mm = (value: number): number => value * (72 / 25.4);

const ROBOTO_DIRECTORY = join(process.cwd(), 'node_modules', 'pdfmake', 'fonts', 'Roboto');

pdfMake.addFonts({
  Roboto: {
    normal: join(ROBOTO_DIRECTORY, 'Roboto-Regular.ttf'),
    bold: join(ROBOTO_DIRECTORY, 'Roboto-Medium.ttf'),
    italics: join(ROBOTO_DIRECTORY, 'Roboto-Italic.ttf'),
    bolditalics: join(ROBOTO_DIRECTORY, 'Roboto-MediumItalic.ttf'),
  },
});
pdfMake.setUrlAccessPolicy(() => false);
pdfMake.setLocalAccessPolicy((filePath) => filePath.startsWith(`${ROBOTO_DIRECTORY}${sep}`));

export { pdfMake };
