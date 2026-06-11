import { createHash, randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const DEFAULT_CLOUDINARY_FOLDER = "zwei-bruder-store";
const LOCAL_PRODUCTS_DIR = path.join("uploads", "products");
const LOCAL_SETTINGS_DIR = path.join("uploads", "settings");

export type ImageStorageMode = "local" | "wordpress" | "cloudinary";

type CloudinaryConfig = {
  cloudName: string;
  uploadPreset?: string;
  apiKey?: string;
  apiSecret?: string;
  folder: string;
};

type WordPressMediaConfig = {
  url: string;
  user: string;
  appPassword: string;
};

type CloudinaryUploadResponse = {
  secure_url?: unknown;
  error?: {
    message?: unknown;
  };
};

type WordPressMediaResponse = {
  source_url?: unknown;
  guid?: {
    rendered?: unknown;
  };
  message?: unknown;
};

export class ImageStorageConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageStorageConfigError";
  }
}

function envValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function extensionForMime(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

function parseDataUrl(dataUrl: string): { mimeType: string; bytes: Buffer } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl.trim());
  if (!match) return null;
  return {
    mimeType: match[1],
    bytes: Buffer.from(match[2], "base64"),
  };
}

function getWordPressMediaConfig(): WordPressMediaConfig | null {
  const url = envValue("WORDPRESS_MEDIA_URL") || envValue("WOOCOMMERCE_URL");
  const user = envValue("WORDPRESS_MEDIA_USER");
  const appPassword = envValue("WORDPRESS_MEDIA_APP_PASSWORD");

  if (!url || !user || !appPassword) return null;

  return {
    url: url.replace(/\/+$/, ""),
    user,
    appPassword,
  };
}

function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = envValue("CLOUDINARY_CLOUD_NAME");
  const uploadPreset = envValue("CLOUDINARY_UPLOAD_PRESET");
  const apiKey = envValue("CLOUDINARY_API_KEY");
  const apiSecret = envValue("CLOUDINARY_API_SECRET");

  if (!cloudName) return null;
  if (!uploadPreset && (!apiKey || !apiSecret)) return null;

  return {
    cloudName,
    uploadPreset,
    apiKey,
    apiSecret,
    folder: envValue("CLOUDINARY_UPLOAD_FOLDER") || DEFAULT_CLOUDINARY_FOLDER,
  };
}

export function getImageStorageMode(): ImageStorageMode {
  const explicit = envValue("IMAGE_STORAGE")?.toLowerCase();

  if (explicit === "local" || explicit === "filesystem" || explicit === "kinghost") {
    return "local";
  }
  if (explicit === "wordpress") {
    return getWordPressMediaConfig() ? "wordpress" : "local";
  }
  if (explicit === "cloudinary") {
    return getCloudinaryConfig() ? "cloudinary" : "local";
  }

  if (getWordPressMediaConfig()) return "wordpress";
  if (getCloudinaryConfig()) return "cloudinary";
  return "local";
}

function storageConfigError(mode: ImageStorageMode): ImageStorageConfigError {
  if (mode === "wordpress") {
    return new ImageStorageConfigError(
      "WordPress não configurado. Defina WOOCOMMERCE_URL, WORDPRESS_MEDIA_USER e WORDPRESS_MEDIA_APP_PASSWORD."
    );
  }
  if (mode === "cloudinary") {
    return new ImageStorageConfigError(
      "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME e CLOUDINARY_UPLOAD_PRESET (ou API key/secret)."
    );
  }
  return new ImageStorageConfigError("Falha ao salvar imagem no servidor.");
}

async function writeLocalFile(
  relativeDir: string,
  bytes: Buffer,
  mimeType: string,
  prefix = "img"
): Promise<string> {
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const filename = `${prefix}-${Date.now()}-${randomBytes(4).toString("hex")}.${extensionForMime(mimeType)}`;
  await writeFile(path.join(absoluteDir, filename), bytes);

  return `/${relativeDir.replace(/\\/g, "/")}/${filename}`;
}

async function uploadFileToLocal(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  return writeLocalFile(LOCAL_PRODUCTS_DIR, bytes, file.type, "produto");
}

async function uploadDataUrlToLocal(dataUrl: string): Promise<string> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new ImageStorageConfigError("Data URL de imagem inválida.");
  }
  return writeLocalFile(LOCAL_PRODUCTS_DIR, parsed.bytes, parsed.mimeType, "produto");
}

function sanitizeFilename(name: string, mimeType: string): string {
  const fallbackExtension = extensionForMime(mimeType);
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!base) return `imagem-${Date.now()}.${fallbackExtension}`;
  if (base.includes(".")) return base;
  return `${base}.${fallbackExtension}`;
}

function wordpressAuthHeader(config: WordPressMediaConfig): string {
  return `Basic ${Buffer.from(`${config.user}:${config.appPassword}`).toString("base64")}`;
}

function wordpressMediaUrl(payload: WordPressMediaResponse | undefined): string | undefined {
  if (typeof payload?.source_url === "string") return payload.source_url;
  if (typeof payload?.guid?.rendered === "string") return payload.guid.rendered;
  return undefined;
}

async function uploadFileToWordPress(file: File): Promise<string> {
  const config = getWordPressMediaConfig();
  if (!config) throw storageConfigError("wordpress");

  const filename = sanitizeFilename(file.name, file.type);
  const bytes = Buffer.from(await file.arrayBuffer());
  const response = await fetch(`${config.url}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: wordpressAuthHeader(config),
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
    body: bytes,
  });

  let payload: WordPressMediaResponse | undefined;
  try {
    payload = (await response.json()) as WordPressMediaResponse;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    throw new Error(
      typeof payload?.message === "string"
        ? payload.message
        : `Falha ao enviar imagem para o WordPress (HTTP ${response.status}).`
    );
  }

  const url = wordpressMediaUrl(payload);
  if (!url || !url.startsWith("http")) {
    throw new Error("WordPress não retornou uma URL pública para a imagem.");
  }

  return url;
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string): string {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

function cloudinaryErrorMessage(payload: unknown): string | undefined {
  const error = (payload as CloudinaryUploadResponse | null)?.error;
  if (typeof error?.message === "string") return error.message;
  return undefined;
}

async function uploadToCloudinary(source: File | string): Promise<string> {
  const config = getCloudinaryConfig();
  if (!config) throw storageConfigError("cloudinary");

  const formData = new FormData();
  formData.append("file", source);
  formData.append("folder", config.folder);

  if (config.uploadPreset) {
    formData.append("upload_preset", config.uploadPreset);
  } else {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureParams = {
      folder: config.folder,
      timestamp,
    };

    formData.append("api_key", config.apiKey || "");
    formData.append("timestamp", timestamp);
    formData.append(
      "signature",
      signCloudinaryParams(signatureParams, config.apiSecret || "")
    );
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  let payload: CloudinaryUploadResponse | undefined;
  try {
    payload = (await response.json()) as CloudinaryUploadResponse;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    throw new Error(
      cloudinaryErrorMessage(payload) ||
        `Falha ao enviar imagem para o Cloudinary (HTTP ${response.status}).`
    );
  }

  if (typeof payload?.secure_url !== "string" || !payload.secure_url.startsWith("https://")) {
    throw new Error("Cloudinary não retornou uma URL segura para a imagem.");
  }

  return payload.secure_url;
}

export async function uploadImageFileToStorage(file: File): Promise<string> {
  const mode = getImageStorageMode();

  if (mode === "local") return uploadFileToLocal(file);
  if (mode === "wordpress") return uploadFileToWordPress(file);
  return uploadToCloudinary(file);
}

export async function uploadImageDataUrlToStorage(dataUrl: string): Promise<string> {
  const mode = getImageStorageMode();

  if (mode === "local") return uploadDataUrlToLocal(dataUrl);
  return uploadToCloudinary(dataUrl);
}

/** QR PIX e outros assets do painel (pasta separada no disco local). */
export async function uploadSettingsImageFileToStorage(file: File): Promise<string> {
  const mode = getImageStorageMode();

  if (mode === "local") {
    const bytes = Buffer.from(await file.arrayBuffer());
    return writeLocalFile(LOCAL_SETTINGS_DIR, bytes, file.type, "config");
  }

  return uploadImageFileToStorage(file);
}
