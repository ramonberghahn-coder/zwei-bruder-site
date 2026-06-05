import { createHash } from "crypto";

const DEFAULT_CLOUDINARY_FOLDER = "zwei-bruder-store";

type CloudinaryConfig = {
  cloudName: string;
  uploadPreset?: string;
  apiKey?: string;
  apiSecret?: string;
  folder: string;
};

type CloudinaryUploadResponse = {
  secure_url?: unknown;
  error?: {
    message?: unknown;
  };
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

function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = envValue("CLOUDINARY_CLOUD_NAME");
  const uploadPreset = envValue("CLOUDINARY_UPLOAD_PRESET");
  const apiKey = envValue("CLOUDINARY_API_KEY");
  const apiSecret = envValue("CLOUDINARY_API_SECRET");

  if (!cloudName) {
    throw new ImageStorageConfigError(
      "Upload externo não configurado. Defina CLOUDINARY_CLOUD_NAME e CLOUDINARY_UPLOAD_PRESET (preset unsigned) ou CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET."
    );
  }

  if (!uploadPreset && (!apiKey || !apiSecret)) {
    throw new ImageStorageConfigError(
      "Upload externo não configurado. Defina CLOUDINARY_UPLOAD_PRESET (preset unsigned) ou CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET."
    );
  }

  return {
    cloudName,
    uploadPreset,
    apiKey,
    apiSecret,
    folder: envValue("CLOUDINARY_UPLOAD_FOLDER") || DEFAULT_CLOUDINARY_FOLDER,
  };
}

function signCloudinaryParams(
  params: Record<string, string>,
  apiSecret: string
): string {
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
  return uploadToCloudinary(file);
}

export async function uploadImageDataUrlToStorage(dataUrl: string): Promise<string> {
  return uploadToCloudinary(dataUrl);
}
