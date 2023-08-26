const mapDBToModel = ({
  id, name, year, createdAt, updatedAt,
}) => ({
  id,
  name,
  year,
  created_at: createdAt,
  updated_at: updatedAt,
});

module.exports = { mapDBToModel };
