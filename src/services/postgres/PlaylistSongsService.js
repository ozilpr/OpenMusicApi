const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');
// const { mapDBToModel } = require('../../utils/playlists');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async postSongToPlaylist({ id, songId }) {
    const playlistSongId = `playlistsong-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const q = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [playlistSongId, id, songId, createdAt, createdAt],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new InvariantError('Lagu gagal ditambahkan ke playlist');

    return result.rows[0].id;
  }

  async getSongsInPlaylists(id) {
    const qPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlist_songs
      LEFT JOIN playlists ON playlist_songs.playlist_id = playlists.id
      JOIN songs ON playlist_songs.song_id = songs.id
      JOIN users ON playlists.owner = users.id
      WHERE playlists.id = $1
      GROUP BY playlists.id, songs.id, users.id`,
      values: [id],
    };

    const qSongs = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
      LEFT JOIN playlists ON playlist_songs.playlist_id = playlists.id
      JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlists.id = $1
      GROUP BY playlists.id, songs.id`,
      values: [id],
    };

    const resultPlaylist = await this._pool.query(qPlaylist);

    if (!resultPlaylist.rows.length) throw new NotFoundError('Playlist tidak ditemukan...');

    const resultSongs = await this._pool.query(qSongs);

    return ({ playlist: resultPlaylist.rows[0], resultSongs: resultSongs.rows });
  }

  async deleteSongInPlaylistById(id) {
    const q = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }

  async verifyPlaylistOwner({ id, owner }) {
    const q = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan');

    const playlist = result.rows[0];

    if (playlist.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }

  async verifySong(songId) {
    const q = {
      text: 'SELECT id FROM songs where id = $1',
      values: [songId],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Lagu tidak ditemukan');
  }
}

module.exports = PlaylistSongsService;
