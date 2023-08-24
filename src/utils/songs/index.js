const mapDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  createdAt,
  updatedAt,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  createdAt: createdAt,
  updatedAt: updatedAt,
})

module.exports = { mapDBToModel }
