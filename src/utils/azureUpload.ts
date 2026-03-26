export const uploadBlobToAzure = async (
  uploadUrl: string,
  blob: Blob
): Promise<void> => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",   // ✅ REQUIRED
      "Content-Type": blob.type || "image/png"
    },
    body: blob
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Azure upload failed:", errorText);
    throw new Error(errorText || "Azure blob upload failed");
  }
};
