const Joi = require('joi');

const PlaylistSongsPayloadSchema = Joi.object({
  id: Joi.string().required(),
  songId: Joi.string().required(),
});

module.exports = { PlaylistSongsPayloadSchema };
