const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils/songs');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const q = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this._pool.query(q);

    if (!result.rows[0].id) throw new InvariantError('Lagu gagal ditambahkan');

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let q = 'SELECT "id", "title", "performer" FROM songs';

    if (title && performer) q = `SELECT "id", "title", "performer" FROM songs WHERE LOWER(title) LIKE '%${title}%' AND LOWER(performer) LIKE '%${performer}%'`;

    if (title && !performer) q = `SELECT "id", "title", "performer" FROM songs WHERE LOWER(title) LIKE '%${title}%'`;

    if (performer && !title) q = `SELECT "id", "title", "performer" FROM songs WHERE LOWER(performer) LIKE '%${performer}%'`;

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Lagu tidak ditemukan');

    return result.rows.map(mapDBToModel);
  }

  async getSongById(id) {
    const q = {
      text: 'SELECT "id", "title", "year", "performer", "genre", "duration", "albumId" FROM songs WHERE "id" = $1',
      values: [id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Lagu tidak ditemukan');

    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const q = {
      text: 'UPDATE songs SET "title" = $1, "year" = $2, "genre" = $3, "performer" = $4, "duration" = $5, "albumId" = $6, "updatedAt" = $7 WHERE "id" = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
  }

  async deleteSongById(id) {
    const q = {
      text: 'DELETE FROM songs WHERE "id" = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }
}

module.exports = SongsService;
