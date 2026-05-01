import { supabase } from "./supabase.config";

export class StorageService {
  private bucket = "documents";

  async uploadFile(path: string, file: Buffer | Blob | Uint8Array, contentType?: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(path, file, {
        upsert: true,
        contentType: contentType ?? "application/octet-stream",
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async getSignedUrl(publicUrl: string): Promise<string> {
    // Extract the storage path from the public URL
    const marker = `/object/public/${this.bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return publicUrl; // Fallback to public if format unexpected
    const filePath = decodeURIComponent(publicUrl.slice(idx + marker.length));

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(filePath, 60 * 15); // 15 minutes

    if (error) {
      console.error(`Error generating signed URL: ${error.message}`);
      return publicUrl; // Fallback
    }

    return data.signedUrl;
  }

  async deleteFile(publicUrl: string): Promise<void> {
    // Extract the storage path from the public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const marker = `/object/public/${this.bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const filePath = decodeURIComponent(publicUrl.slice(idx + marker.length));

    const { error } = await supabase.storage.from(this.bucket).remove([filePath]);
    if (error) {
      console.error(`Error deleting file from storage: ${error.message}`);
    }
  }
}
