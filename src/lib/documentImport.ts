import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export interface ImportedDocumentResult {
  html: string;
}

const FULL_WIDTH_IMAGE = -1;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function textToHtml(text: string): string {
  return text
    .split(/\r?\n\r?\n+/)
    .map((part) => `<p>${escapeHtml(part).replace(/\r?\n/g, '<br/>')}</p>`)
    .join('');
}

async function parseDocx(file: File): Promise<{ html: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return { html: result.value || '<p>Document imported.</p>' };
}

async function parsePdf(file: File): Promise<{ html: string }> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const htmlParts: string[] = [];

  const blobFromCanvas = (canvas: HTMLCanvasElement): Promise<Blob> => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not render PDF page image.'));
    }, 'image/jpeg', 0.92);
  });

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.35 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;

    const pageBlob = await blobFromCanvas(canvas);
    const pageUrl = URL.createObjectURL(pageBlob);
    htmlParts.push(
      `<figure style="margin: 0 0 22px 0; width: 100%;"><img src="${pageUrl}" alt="PDF page ${pageNum}" data-width="${FULL_WIDTH_IMAGE}" style="display:block;width:100%;max-width:100%;height:auto;border-radius:10px;" /></figure>`
    );
  }

  if (!htmlParts.length) {
    return { html: '<p>Could not render PDF pages.</p>' };
  }

  return { html: htmlParts.join('') };
}

async function parseEpub(file: File): Promise<{ html: string }> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const htmlEntries = Object.keys(zip.files)
    .filter((name) => /\.(xhtml|html|htm)$/i.test(name))
    .sort((a, b) => a.localeCompare(b));

  const parts: string[] = [];
  for (const name of htmlEntries) {
    const entry = zip.file(name);
    if (!entry) continue;
    const content = await entry.async('string');
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const bodyHtml = doc.body?.innerHTML?.trim();
    if (bodyHtml) parts.push(`<section>${bodyHtml}</section>`);
  }

  if (!parts.length) {
    return { html: '<p>Could not extract readable EPUB content.</p>' };
  }

  return { html: parts.join('') };
}

async function parseHtml(file: File): Promise<{ html: string }> {
  const text = await file.text();
  return { html: text };
}

async function parseTxt(file: File): Promise<{ html: string }> {
  const text = await file.text();
  return { html: textToHtml(text) };
}

function normalizeImportedHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  if (!body) return html;

  body.querySelectorAll('script').forEach(node => node.remove());

  body.querySelectorAll('figure').forEach((figure) => {
    const existing = figure.getAttribute('style') || '';
    figure.setAttribute('style', `${existing};margin:0 0 22px 0;width:100%;max-width:none;`.trim());
  });

  body.querySelectorAll('img').forEach((img) => {
    img.setAttribute('data-width', String(FULL_WIDTH_IMAGE));
    img.removeAttribute('width');
    const existing = img.getAttribute('style') || '';
    img.setAttribute('style', `${existing};display:block;width:100%;max-width:100%;height:auto;margin:0 auto 18px auto;`.trim());
  });

  body.querySelectorAll('iframe, embed, object').forEach((node) => {
    const existing = node.getAttribute('style') || '';
    node.setAttribute('style', `${existing};display:block;width:100%;min-height:75vh;border:0;`.trim());
  });

  body.querySelectorAll('table').forEach((table) => {
    const existing = table.getAttribute('style') || '';
    table.setAttribute('style', `${existing};display:block;width:100%;overflow:auto;`.trim());
  });

  return body.innerHTML || html;
}

export async function importDocumentFile(file: File): Promise<ImportedDocumentResult> {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  let parsed: { html: string };

  if (ext === 'docx') parsed = await parseDocx(file);
  else if (ext === 'pdf') parsed = await parsePdf(file);
  else if (ext === 'epub') parsed = await parseEpub(file);
  else if (ext === 'html' || ext === 'htm') parsed = await parseHtml(file);
  else if (ext === 'md' || ext === 'markdown' || ext === 'rtf') parsed = await parseTxt(file);
  else parsed = await parseTxt(file);

  return { html: normalizeImportedHtml(parsed.html) };
}
