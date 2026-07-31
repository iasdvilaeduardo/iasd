const WEBP_TYPE = 'image/webp';

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(objectUrl); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Não foi possível processar a imagem.')); };
    image.src = objectUrl;
  });
}

function canvasBlob(canvas, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Conversão WebP não suportada neste navegador.')), WEBP_TYPE, quality));
}

export async function createGalleryVariants(file) {
  const image = await loadImage(file);
  const render = async (maxWidth, quality) => {
    const scale = Math.min(1, maxWidth / image.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext('2d', { alpha: false }).drawImage(image, 0, 0, canvas.width, canvas.height);
    return new File([await canvasBlob(canvas, quality)], 'imagem.webp', { type: WEBP_TYPE });
  };
  return { thumb: await render(400, 0.78), display: await render(1600, 0.86), original: file };
}
