import { useRef } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { validateDocumentFile } from '../lib/applicationDocuments';

interface ApplicationDocumentUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPT =
  'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx';

export default function ApplicationDocumentUpload({ files, onChange, disabled }: ApplicationDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...files];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      const err = validateDocumentFile(f);
      if (err) {
        alert(err);
        continue;
      }
      if (next.length >= 5) {
        alert('Maximum 5 files allowed.');
        break;
      }
      next.push(f);
    }
    onChange(next);
  };

  const removeAt = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Upload supporting documents: <strong>PDF</strong>, <strong>images</strong> (JPG, PNG, WebP, GIF), or{' '}
        <strong>Word</strong> (.doc, .docx). Max 10 MB per file, up to 5 files.
      </p>
      <div
        className={`border-2 border-dashed border-slate-200 rounded-lg p-6 text-center ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600 text-sm mb-3">Drag and drop files here or browse</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          disabled={disabled}
          className="hidden"
          onChange={e => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
        >
          Choose files
        </button>
      </div>
      <div
        onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          if (disabled) return;
          addFiles(e.dataTransfer.files);
        }}
        className="min-h-[1px]"
      />
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, idx) => (
            <li
              key={`${f.name}-${idx}`}
              className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="truncate text-slate-800">{f.name}</span>
                <span className="text-slate-500 shrink-0">({(f.size / 1024).toFixed(1)} KB)</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(idx)}
                className="p-1 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
