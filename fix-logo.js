const Jimp = require('jimp');

async function fixLogo() {
  try {
    console.log('A ler o logotipo atual...');
    const image = await Jimp.read('public/logo.jpg.jpg');
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const maxDim = Math.max(width, height);
    
    console.log(`Dimensões originais: ${width}x${height}. A criar um quadrado de ${maxDim}x${maxDim} com fundo preto...`);
    
    // Create a new black image
    const background = new Jimp(maxDim, maxDim, 0x000000FF);
    
    // Paste the original image in the center
    const x = (maxDim - width) / 2;
    const y = (maxDim - height) / 2;
    
    background.composite(image, x, y);
    
    // Save the new image
    await background.writeAsync('public/logo-square.png');
    console.log('✅ Sucesso! O novo logotipo (logo-square.png) foi criado!');
  } catch (err) {
    console.error('Erro:', err);
  }
}

fixLogo();
