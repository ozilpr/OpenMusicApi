const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class SongsService {
  constructor() {
    this._songs = []
  }

  addSong({ title = 'untitled', year, genre, performer, duration, albumId }) {
    const id = nanoid(16)
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const newSongs = {
      id,
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
      createdAt,
      updatedAt,
    }

    this._songs.push(newSongs)

    const isSuccess = songs.filter((s) => s.id === id).length > 0

    if (!isSuccess) throw new InvariantError('Lagu gagal ditambahkan')

    return id
  }

  getSongs() {
    return this._songs
  }

  getSongById(id) {
    const song = this._songs.filter((s) => s.id === id)[0]
    if (!song) throw new NotFoundError('Lagu tidak ditemukan')

    return song
  }

  editSongById(
    id,
    { title = 'untitled', year, genre, performer, duration, albumId }
  ) {
    const index = this._songs.findIndex((a) => a.id === id)

    if (index === -1)
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')

    const updatedAt = new Date().toISOString()

    this._songs[index] = {
      ...this._songs[index],
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
      updatedAt,
    }
  }

  deleteSongById(id) {
    const index = this._songs.findIndex((a) => a.id === id)

    if (index === -1)
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')

    this._songs.splice(index, 1)
  }
}

module.exports = SongsService
