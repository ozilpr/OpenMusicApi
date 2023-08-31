const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();

    this._cacheService = cacheService;
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

    if (!result.rows[0].id) throw new InvariantError('Album gagal ditambahkan');

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
      text: 'SELECT id, name, year, "cover_url" FROM albums WHERE id = $1',
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
      text: 'UPDATE albums SET name = $1, year = $2, "updatedAt" = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
  }

  async deleteAlbumById(id) {
    const q = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
  }

  async setCoverUrl(albumId, fileLoc) {
    const q = {
      text: 'UPDATE albums SET "cover_url" = $1 WHERE id = $2 RETURNING id',
      values: [fileLoc, albumId],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Cover Url gagal ditambahkan, Id tidak ditemukan');
  }

  async verifyAlbumLikes(id, credentialId) {
    const q = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [credentialId, id],
    };

    const result = await this._pool.query(q);

    if (result.rows.length) throw new InvariantError('gagal coy');

    if (!result.rows.length) await this.addAlbumLikes(id, credentialId);
  }

  async addAlbumLikes(id, credentialId) {
    const likeId = `likes-${nanoid(16)}`;
    const q = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [likeId, credentialId, id],
    };

    const result = await this._pool.query(q);

    if (!result.rowCount) throw new InvariantError('Album gagal disukai, id tdik ditemukan');

    await this._cacheService.delete(`likes:${id}`);
  }

  async deleteAlbumLikes(id, credentialId) {
    const q = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [credentialId, id],
    };

    const result = await this._pool.query(q);

    if (!result.rows.length) throw new NotFoundError('Gagal batal menyukai album, Id tidak ditemukan');

    await this._cacheService.delete(`likes:${id}`);
  }

  async getAlbumLikes({ id }) {
    try {
      const result = await this._cacheService.get(`likes:${id}`);
      return { totalLikes: JSON.parse(result), cache: 1 };
    } catch (error) {
      const q = {
        text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const result = await this._pool.query(q);

      await this._cacheService.set(`likes:${id}`, JSON.stringify(result.rowCount));

      return { totalLikes: result.rowCount, cache: 0 };
    }
  }
}

module.exports = AlbumsService;
