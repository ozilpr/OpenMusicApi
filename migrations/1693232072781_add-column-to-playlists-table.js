exports.up = (pgm) => {
  pgm.addColumn('playlists', {
    createdAt: {
      type: 'TEXT',
    },
    updatedAt: {
      type: 'TEXT',
    },
  });

  pgm.addColumn('playlist_songs', {
    createdAt: {
      type: 'TEXT',
    },
    updatedAt: {
      type: 'TEXT',
    },
  });

  pgm.addColumn('users', {
    createdAt: {
      type: 'TEXT',
    },
    updatedAt: {
      type: 'TEXT',
    },
  });

  pgm.addColumn('collaborations', {
    createdAt: {
      type: 'TEXT',
    },
    updatedAt: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('playlists', 'createdAt');

  pgm.dropColumn('playlists', 'updatedAt');

  pgm.dropColumn('playlist_songs', 'createdAt');

  pgm.dropColumn('playlist_songs', 'updatedAt');

  pgm.dropColumn('users', 'createdAt');

  pgm.dropColumn('users', 'updatedAt');

  pgm.dropColumn('collaborations', 'createdAt');

  pgm.dropColumn('collaborations', 'updatedAt');
};
