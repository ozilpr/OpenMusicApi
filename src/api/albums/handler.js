const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const album_id = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId: album_id,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const { resultAlbum, resultSongs } = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album: {
          id: resultAlbum.id,
          name: resultAlbum.name,
          year: resultAlbum.year,
          coverUrl: resultAlbum.cover_url !== null ? resultAlbum.cover_url : null,
          songs: resultSongs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;

    this._validator.validateAlbumCover(cover.hapi.headers);

    const fileExt = cover.hapi.filename.split('.').pop();

    const filename = await this._storageService.writeFile(albumId, cover, fileExt);

    const fileLoc = `http://${process.env.HOST}:${process.env.PORT}/albums/${filename}/covers`;

    await this._service.setCoverUrl(albumId, fileLoc);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhsil diunggah',
      data: {
        fileLocation: fileLoc,
      },
    });
    response.code(201);
    return response;
  }

  async postAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.getAlbumById(id);
    await this._service.verifyAlbumLikes(id, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(id);
    await this._service.deleteAlbumLikes(id, credentialId);

    return {
      status: 'success',
      message: 'Album berhenti disukai',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { totalLikes, cache } = await this._service.getAlbumLikes(request.params);

    const response = h.response({
      status: 'success',
      data: {
        likes: totalLikes,
      },
    });

    return cache ? response.header('X-Data-Source', 'cache') : response;
  }
}

module.exports = AlbumsHandler;
