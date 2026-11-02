import test from "node:test";
import assert from "node:assert/strict";

test("Cloudinary & Messages: Complete delivery URL vs legacy fallback", () => {
  const SERVER_URL = "https://swavio-backend.onrender.com";

  // Case 1: Cloudinary full URL
  const cloudinaryUrl =
    "https://res.cloudinary.com/swavio/image/upload/v123456789/swavio_chat/sample.png";
  const resolveUrl1 = (url) => (url.startsWith("http") ? url : `${SERVER_URL}${url}`);
  assert.equal(resolveUrl1(cloudinaryUrl), cloudinaryUrl);

  // Case 2: Legacy relative path fallback
  const legacyLocalUrl = "/uploads/1755804890855-image.jpg";
  const resolveUrl2 = (url) => (url.startsWith("http") ? url : `${SERVER_URL}${url}`);
  assert.equal(resolveUrl2(legacyLocalUrl), `${SERVER_URL}/uploads/1755804890855-image.jpg`);
});

test("Cloudinary: Public ID extraction from legacy Cloudinary delivery URLs", () => {
  const cloudinaryUrl =
    "https://res.cloudinary.com/demo/image/upload/v1612345678/swavio_profiles/user_pic_123.jpg";

  const parts = cloudinaryUrl.split("/upload/");
  assert.equal(parts.length, 2);

  const pathAfterUpload = parts[1];
  const publicId = pathAfterUpload
    .replace(/\.[^/.]+$/, "") // Remove file extension (.jpg)
    .replace(/^v\d+\//, ""); // Remove version prefix (v1612345678/)

  assert.equal(publicId, "swavio_profiles/user_pic_123");
});

test("Messages: MIME type detection for safe rendering", () => {
  const getRenderType = (mimeType, fileUrl) => {
    const ext = (fileUrl.split(".").pop() || "").toLowerCase();
    if (mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return "image";
    }
    if (mimeType === "application/pdf" || ext === "pdf") {
      return "pdf";
    }
    return "file";
  };

  assert.equal(getRenderType("image/jpeg", "https://res.cloudinary.com/pic.jpg"), "image");
  assert.equal(getRenderType("application/pdf", "https://res.cloudinary.com/doc.pdf"), "pdf");
  assert.equal(getRenderType("", "https://example.com/sheet.xlsx"), "file");
});

