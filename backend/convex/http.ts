import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// File upload endpoint
http.route({
  path: "/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Parse multipart form data
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const userId = formData.get("userId") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const category = formData.get("category") as string;
      const tags = (formData.get("tags") as string)?.split(",") || [];
      const isPrivate = formData.get("isPrivate") === "true";

      if (!file || !userId || !title || !category) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return new Response(
          JSON.stringify({ error: "File size exceeds 10MB limit" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ];

      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: "File type not allowed" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Convert file to ArrayBuffer for Convex storage
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });

      // Store file in Convex storage
      const storageId = await ctx.storage.store(blob);

      // Save document metadata
      const result = await ctx.runMutation(api.documents.saveDocumentMetadata, {
        userId: userId as any, // Type assertion needed for Convex ID
        title,
        description: description || undefined,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storageId,
        category: category as any, // Type assertion for category union
        tags,
        isPrivate,
        metadata: undefined,
        accessControl: undefined,
      });

      return new Response(
        JSON.stringify({
          success: true,
          documentId: result.documentId,
          message: result.message,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Upload error:", error);
      return new Response(
        JSON.stringify({ error: "Upload failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// File download endpoint
http.route({
  path: "/download/:documentId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const documentId = url.pathname.split("/").pop();
      const userId = url.searchParams.get("userId");

      if (!documentId || !userId) {
        return new Response(
          JSON.stringify({ error: "Missing documentId or userId" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Get document download URL
      const downloadInfo = await ctx.runQuery(api.documents.getDocumentDownloadUrl, {
        documentId: documentId as any,
        userId: userId as any,
      });

      if (!downloadInfo) {
        return new Response(
          JSON.stringify({ error: "Document not found or access denied" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Redirect to the signed download URL
      return new Response(null, {
        status: 302,
        headers: {
          Location: downloadInfo.downloadUrl,
        },
      });
    } catch (error) {
      console.error("Download error:", error);
      return new Response(
        JSON.stringify({ error: "Download failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Document info endpoint
http.route({
  path: "/document/:documentId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const documentId = url.pathname.split("/").pop();
      const userId = url.searchParams.get("userId");

      if (!documentId || !userId) {
        return new Response(
          JSON.stringify({ error: "Missing documentId or userId" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Get document info
      const document = await ctx.runQuery(api.documents.getDocumentById, {
        documentId: documentId as any,
        userId: userId as any,
      });

      if (!document) {
        return new Response(
          JSON.stringify({ error: "Document not found or access denied" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(document),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Document info error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get document info" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(
      JSON.stringify({ status: "healthy", timestamp: new Date().toISOString() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
