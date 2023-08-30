const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
// const { mapDBToModel } = require('../../utils/albums');
const ClientError = require('../../exceptions/ClientError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const q = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(q);

    if (!result.rows[0].id) throw new ClientError('Album gagal ditambahkan');

    return result.rows[0].id;
  }

  async getSongsByAlbumId(id) {
    const q = {
      text: 'SELECT id, title, performance FROM songs WHERE "albumId" = $1',
      values: [id],
    };

    const result = await this._pool.query(q);
    return result.rows;
  }

  // async getAlbumById(id) {
  //   const q = {
  //     text: 'SELECT "id", "name", "year" FROM albums WHERE id = $1',
  //     values: [id],
  //   };
  //   const result = await this._pool.query(q);

  //   if (!result.rows.length) throw new NotFoundError('Album tidak ditemukan');

  //   return result.rows.map(mapDBToModel)[0];
  // }

  async getSongsInAlbum(id) {
    const qSong = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM albums JOIN songs ON albums.id = songs."albumId" WHERE albums.id = $1',
      values: [id],
    };

    const resultSong = await this._pool.query(qSong);

    return resultSong.rows;
  }

  async getAlbumById(id) {
    const qAlbum = {
      text: 'SELECT "id", "name", "year" FROM albums WHERE id = $1',
      values: [id],
    };

    const resultAlbum = await this._pool.query(qAlbum);

    if (!resultAlbum.rows.length) throw new NotFoundError('Album tidak ditemukan');

    const qSong = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM albums JOIN songs ON albums.id = songs."albumId" WHERE albums.id = $1',
      values: [id],
    };

    const resultSong = await this._pool.query(qSong);

    return { resultAlbum: resultAlbum.rows[0], resultSongs: resultSong.rows };
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const q = {
      text: 'UPDATE albums SET "name" = $1, "year" = $2, "updatedAt" = $3 WHERE "id" = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const q = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
