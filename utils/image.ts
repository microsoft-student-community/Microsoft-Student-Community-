export async function compressAndConvertImage(
  file: File,
  maxWidth = 900,
  maxHeight = 900
): Promise<File> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Image compression is only available in the browser"));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Failed to get canvas context"));
      }
      
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error("Canvas to Blob failed"));
          }
          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const newFile = new File([blob], `${originalName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        "image/webp",
        0.8 // 80% quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
  });
}
