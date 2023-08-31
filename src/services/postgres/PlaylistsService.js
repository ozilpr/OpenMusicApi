const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils/playlists');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const q = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [
        id,
        name,
        owner,
        createdAt,
        createdAt,
      ],
    };

    const result = await this._pool.query(q);

    if (!result.rows[0].id) throw new InvariantError('Playlist gagal ditambahkan');

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const q = {
      text: 'SELECT id, name, owner FROM playlists WHERE owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(q);

    return result.rows.map(mapDBToModel);
  }

  async deletePlaylistById(id) {
    const q = {
      text: 'DELETE FROM playlists WHERE "id" = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }

  async postSongToPlaylist({ id, songId }) {
    const playlistSongId = `playlistsong-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const q = {
      text: 'INSERT INTO playlist_song VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [playlistSongId, id, songId, createdAt, createdAt],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new InvariantError('Lagu gagal ditambahkan ke playlist');

    return result.rows[0].id;
  }

  async getSongsInPlaylists(id) {
    const q = {
      text: `SELECT songs.id, songs.title, songs.performer, playlists.id, playlists.name, playlists.owner FROM playlist_songs
      JOIN playlists ON playlist_songs.playlist_id = playlists.id
      JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(q);

    return result.rows;
  }

  async deleteSongInPlaylistById(id) {
    const q = {
      text: 'DELETE FROM playlist_songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }

  async verifyPlaylistOwner(id, owner) {
    const q = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan');

    const playlist = result.rows[0];

    if (playlist.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }
}

module.exports = PlaylistsService;
