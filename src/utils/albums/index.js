const mapDBToModel = ({ id, name, year, createdAt, updatedAt }) => ({
  id,
  name,
  year,
  createdAt: createdAt,
  updatedAt: updatedAt,
})

module.exports = { mapDBToModel }
