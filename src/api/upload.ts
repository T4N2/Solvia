import { Elysia } from "elysia";
import { requireAuth } from "../auth/middleware";
import path from "path";
import { mkdir, readdir, stat as fsStat, unlink, writeFile, access } from "fs/promises";

const uploadDir = path.join(process.cwd(), "public/images/uploads");

// Ensure upload directory exists
try {
  await mkdir(uploadDir, { recursive: true });
} catch (error) {
  // Directory might already exist, ignore error
}

export const uploadRoutes = new Elysia()
  .post("/api/admin/upload", async ({ request, body, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }

    try {
      const formData = await request.formData();
      const file = formData.get("image") as File;

      if (!file) {
        set.status = 400;
        return { success: false, message: "No file uploaded" };
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        set.status = 400;
        return {
          success: false,
          message: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP",
        };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        set.status = 400;
        return { success: false, message: "File size must be less than 5MB" };
      }

      // Generate unique filename
      const ext = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = `upload-${timestamp}-${randomStr}.${ext}`;
      const filepath = `${uploadDir}/${filename}`;

      // Save file
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, buffer);

      // Return public URL
      const publicUrl = `/images/uploads/${filename}`;

      return {
        success: true,
        message: "Upload successful",
        url: publicUrl,
        filename: filename,
        size: file.size,
      };
    } catch (error) {
      console.error("Upload error:", error);
      set.status = 500;
      return { success: false, message: "Failed to upload file" };
    }
  })
  .delete("/api/admin/upload/:filename", async ({ params, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }

    try {
      const filename = params.filename;

      // Security check: prevent directory traversal
      if (filename.includes("..") || filename.includes("/")) {
        set.status = 400;
        return { success: false, message: "Invalid filename" };
      }

      const filepath = `${uploadDir}/${filename}`;

      try {
        await access(filepath);
      } catch {
        set.status = 404;
        return { success: false, message: "File not found" };
      }

      // Delete file
      await unlink(filepath);

      return { success: true, message: "File deleted successfully" };
    } catch (error) {
      console.error("Delete file error:", error);
      set.status = 500;
      return { success: false, message: "Failed to delete file" };
    }
  })
  .get("/api/admin/uploads", async ({ request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }

    try {
      const files = [];
      const entries = await readdir(uploadDir, { withFileTypes: true });

      for await (const dirent of await readdir(uploadDir, { withFileTypes: true })) {
        if (dirent.isFile()) {
          const ext = dirent.name.split(".").pop()?.toLowerCase();
          if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext!)) {
            const fileStat = await fsStat(`${uploadDir}/${dirent.name}`);
            files.push({
              name: dirent.name,
              url: `/images/uploads/${dirent.name}`,
              size: fileStat.size,
              createdAt: fileStat.birthtime || fileStat.mtime,
            });
          }
        }
      }

      // Sort by newest first
      files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
        success: true,
        files: files,
      };
    } catch (error) {
      console.error("List uploads error:", error);
      set.status = 500;
      return { success: false, message: "Failed to list uploads" };
    }
  });
