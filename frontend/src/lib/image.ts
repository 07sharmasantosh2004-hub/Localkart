export async function compressImage(file: File, maxWidth = 1400, quality = 0.78) {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(file);
          return;
        }

        resolve(new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }));
      },
      "image/webp",
      quality,
    );
  });
}
