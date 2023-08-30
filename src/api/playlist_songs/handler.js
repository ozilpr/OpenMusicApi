const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongToPlaylistHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._validator.validatePlaylistSongsPayload({ id, songId });
    await this._service.verifySong(songId);
    await this._service.verifyPlaylistOwner({ id, owner: credentialId });

    const playlistId = await this._service.postSongToPlaylist({ id, songId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsInPlaylistsHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner({ id, owner: credentialId });

    const { playlist, resultSongs } = await this._service.getSongsInPlaylists(id, credentialId);

    return {
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs: resultSongs,
        },
      },
    };
  }

  async deleteSongInPlaylistByIdHandler(request) {
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    const { songId } = request.payload;

    await this._validator.validatePlaylistSongsPayload({ id, songId });

    await this._service.verifyPlaylistOwner({ id, owner: credentialId });

    await this._service.deleteSongInPlaylistById(songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;
