const fs = require('fs');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(albumId, cover, fileExt) {
    const filename = `${albumId}.${fileExt}`;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => resolve(filename));
      cover.pipe(fileStream);
      fileStream.on('error', (error) => reject(error));
    });
  }
}

module.exports = StorageService;
