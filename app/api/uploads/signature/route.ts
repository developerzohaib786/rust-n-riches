import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api-error";
import {
  ALLOWED_IMAGE_FORMATS,
  UPLOAD_FOLDERS,
  getCloudinaryConfig,
  signUploadParams,
  type UploadFolder,
} from "@/lib/cloudinary";

// Returns a short-lived signature so the admin's browser can upload straight to
// Cloudinary without the API secret ever leaving the server. Admin-only via middleware.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const subfolder: UploadFolder = UPLOAD_FOLDERS.includes(body?.folder) ? body.folder : "products";

    const { cloudName, apiKey, apiSecret, rootFolder } = getCloudinaryConfig();

    const params = {
      allowed_formats: ALLOWED_IMAGE_FORMATS,
      folder: `${rootFolder}/${subfolder}`,
      timestamp: Math.round(Date.now() / 1000),
    };

    return NextResponse.json({
      cloudName,
      apiKey,
      ...params,
      signature: signUploadParams(params, apiSecret),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Could not prepare the upload" }, { status: 500 });
  }
}
