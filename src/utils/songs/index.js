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
  created_at: createdAt,
  updated_at: updatedAt,
});

module.exports = { mapDBToModel };
