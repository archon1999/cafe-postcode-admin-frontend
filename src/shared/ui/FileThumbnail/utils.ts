import { uuidv4 } from 'minimal-shared/utils';

import { CONFIG } from 'app/config/globalConfig.ts';

export const FILE_FORMATS = {
  txt: ['txt', 'md', 'rtf', 'csv', 'log'],
  zip: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'],
  audio: ['wav', 'aif', 'aiff', 'mp3', 'aac', 'flac', 'ogg', 'm4a', 'wma'],
  image: [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'tif',
    'tiff',
    'heic',
    'heif',
    'ico',
    'jfif',
    'raw',
    'svg',
    'svg+xml',
    'indd',
  ],
  video: ['m4v', 'avi', 'mpg', 'mpeg', 'mp4', 'webm', 'mov', 'flv', 'mkv', 'wmv', '3gp'],
  word: ['doc', 'docx', 'odt'],
  excel: ['xls', 'xlsx', 'ods', 'csv'],
  powerpoint: ['ppt', 'pptx', 'odp'],
  pdf: ['pdf', 'xps'],
  photoshop: ['psd'],
  illustrator: ['ai', 'eps'],
} as const;

export const EXTRA_EXTENSIONS = ['folder'] as const;

export const FILE_ICONS: Record<FileFormat | 'folder' | 'unknown', string> = {
  txt: 'ic-txt',
  zip: 'ic-zip',
  pdf: 'ic-pdf',
  word: 'ic-word',
  image: 'ic-img',
  audio: 'ic-audio',
  video: 'ic-video',
  excel: 'ic-excel',
  unknown: 'ic-file',
  folder: 'ic-folder',
  photoshop: 'ic-pts',
  illustrator: 'ic-ai',
  powerpoint: 'ic-power-point',
};

export type FileFormat = keyof typeof FILE_FORMATS;
export type FileExtension = (typeof FILE_FORMATS)[FileFormat][number];
export type AllExtensions = FileExtension | FileFormat | 'folder';
export type FileInput = string | null;

export type FileMetaData = {
  key?: string;
  name: string;
  type: string;
  size: number;
  path?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  format?: FileFormat | 'unknown';
};

const ALL_EXTENSIONS = new Set<AllExtensions>([
  ...EXTRA_EXTENSIONS,
  ...Object.keys(FILE_FORMATS),
  ...Object.values(FILE_FORMATS).flat(),
] as AllExtensions[]);

const EXTENSION_TO_FORMAT: Record<string, FileFormat> = Object.fromEntries(
  Object.entries(FILE_FORMATS).flatMap(([format, exts]) => exts.map((ext) => [ext, format as FileFormat])),
);

const isSupportedExtension = (ext: string): ext is AllExtensions => ALL_EXTENSIONS.has(ext as AllExtensions);

export function getFileName(input?: FileInput): string {
  if (!input?.trim()) return '';

  try {
    const cleanInput = input.split(/[?#]/)[0].trim();
    return decodeURIComponent(cleanInput.split('/').pop() || '');
  } catch {
    return '';
  }
}

export function getFileExtension(input?: FileInput): AllExtensions | 'unknown' {
  if (!input?.trim()) return 'unknown';

  const cleanInput = input.trim().toLowerCase();
  const [mimeType, mimeSubtype] = cleanInput.split('/');
  const ext = getFileName(cleanInput).match(/\.([^.]+)$/)?.[1];

  if (ext && isSupportedExtension(ext)) return ext;

  if (mimeSubtype && isSupportedExtension(mimeSubtype)) return mimeSubtype;

  if (mimeType && isSupportedExtension(mimeType)) return mimeType;

  if (isSupportedExtension(cleanInput)) return cleanInput;

  return 'unknown';
}

export function detectFileFormat(input?: FileInput): FileFormat | 'unknown' {
  const ext = getFileExtension(input);
  return EXTENSION_TO_FORMAT[ext] ?? ext;
}

export function getFileIcon(input?: FileInput): string {
  const format = detectFileFormat(input);
  const iconName = FILE_ICONS[format] || FILE_ICONS.unknown;

  return `${CONFIG.assetsDir}/assets/icons/files/${iconName}.svg`;
}

export function getFileMeta(file?: File | string | null): FileMetaData {
  if (file instanceof File) {
    const formatFromMime = detectFileFormat(file.type);
    const formatFromName = detectFileFormat(file.name);

    return {
      key: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
      format: formatFromMime !== 'unknown' ? formatFromMime : formatFromName,
      path: (file as File & { path?: string }).path ?? file.webkitRelativePath,
    };
  }

  if (typeof file === 'string') {
    return {
      key: file,
      path: file,
      size: 0,
      name: getFileName(file),
      type: getFileExtension(file),
      format: detectFileFormat(file),
    };
  }

  return {
    name: '',
    type: '',
    size: 0,
    format: 'unknown',
  };
}
