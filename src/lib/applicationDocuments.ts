import { supabase } from './supabase';

export const APPLICATION_DOCS_BUCKET = 'application-documents';

/** Stored in `applications.documents` JSON column */
export interface ApplicationDocumentMeta {
  bucket: string;
  path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
}

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

function mimeFromFileName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return null;
}

export function validateDocumentFile(file: File): string | null {
  if (file.size > MAX_BYTES) return `File too large (max 10 MB): ${file.name}`;
  let mime = file.type || '';
  if (!mime || mime === 'application/octet-stream') {
    mime = mimeFromFileName(file.name) || '';
  }
  if (!ALLOWED_MIME.has(mime)) {
    return `Unsupported type for "${file.name}". Use PDF, JPG/PNG/WebP/GIF, or DOC/DOCX.`;
  }
  return null;
}

export function validateDocumentFiles(files: File[]): string | null {
  if (files.length === 0) return 'Please upload at least one document.';
  if (files.length > MAX_FILES) return `You can upload at most ${MAX_FILES} files.`;
  for (const f of files) {
    const err = validateDocumentFile(f);
    if (err) return err;
  }
  return null;
}

function sanitizeSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}

/**
 * Upload files to Supabase Storage under `{userId}/{applicationNumber}/...`.
 * Create bucket `application-documents` in Supabase and apply policies (see supabase/migrations).
 */
export async function uploadApplicationDocuments(
  userId: string,
  applicationNumber: string,
  files: File[],
): Promise<ApplicationDocumentMeta[]> {
  const err = validateDocumentFiles(files);
  if (err) throw new Error(err);

  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData.session) {
    throw new Error('You must be signed in to upload documents. Please log in again.');
  }
  const jwtUserId = sessionData.session.user.id;
  if (jwtUserId !== userId) {
    throw new Error('Session mismatch. Sign out and sign in again, then retry.');
  }

  const safeApp = sanitizeSegment(applicationNumber);
  const uploaded: ApplicationDocumentMeta[] = [];
  const now = new Date().toISOString();

  for (const file of files) {
    const safeName = sanitizeSegment(file.name);
    const path = `${userId}/${safeApp}/${Date.now()}_${safeName}`;
    let contentType = file.type || '';
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = mimeFromFileName(file.name) || 'application/octet-stream';
    }
    const { error } = await supabase.storage.from(APPLICATION_DOCS_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    });
    if (error) throw new Error(error.message);

    uploaded.push({
      bucket: APPLICATION_DOCS_BUCKET,
      path,
      file_name: file.name,
      mime_type: contentType,
      size_bytes: file.size,
      uploaded_at: now,
    });
  }
  return uploaded;
}

export async function getDocumentSignedUrl(path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage
    .from(APPLICATION_DOCS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export function parseApplicationDocuments(raw: unknown): ApplicationDocumentMeta[] {
  if (!raw) return [];
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is ApplicationDocumentMeta =>
      typeof x === 'object' &&
      x !== null &&
      typeof (x as ApplicationDocumentMeta).path === 'string' &&
      typeof (x as ApplicationDocumentMeta).bucket === 'string',
  );
}
