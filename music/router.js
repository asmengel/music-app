'use strict';
// endpoint is /api/music/

const express = require('express');
const router = express.Router();

const { Artist, Playlist } = require('./models');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
router.use(jsonParser);

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtAuth = passport.authenticate('jwt', { session: false });

function artistIsValid(artist) {
  let validArtist = {};
  if(artist.artistName && typeof artist.artistName === "string"){
    validArtist = Object.assign({}, artist);
  }
  // check to see if artist is valid
  return validArtist;
}

// @@@@@@@@@@@@ IMPROVE: SHOW ONLY SONGS @@@@@@@@@@
// search for songs
router.get('/songs', (req, res) => {
  Artist
    .find( { 'albums.songs.title' : req.query.song})
    .limit(20)
    .then(artistList => {
      res.json({
        artistList: artistList.map(
          (artistList) => artistList.apiRepr())
      });
    })
    .catch(
      err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// @@@@@@@@@@@@ IMPROVE: SHOW ONLY ALBUMS @@@@@@@@@@
// search for albums
router.get('/albums', (req, res) => {
  Artist
    .find( { 'albums.title' : req.query.album})
    .limit(20)
    .then(artistList => {
      res.json({
        artistList: artistList.map(
          (artistList) => artistList.apiRepr())
      });
    })
    .catch(
      err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

/////////////////////////////////////////////// should add artist by id for future
router.get('/artists', (req, res) => {
  Artist
    .find()
    .limit(20)
    .then(artistList => {
      res.json({
        artistList: artistList.map(
          (artistList) => artistList.apiRepr())
      });
    })
    .catch(
      err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&TEST ME LATER&&&&&&&&&&&&&&&&&&&&&&
router.post('/artists', (req, res) => {
  console.log('aiv ', artistIsValid(req.body));
  // assume we get 1 artist
  if ( artistIsValid(req.body) ) {
    let validArtist = artistIsValid(req.body);
    console.log('in va', validArtist);
    Artist
    .create(validArtist)
    .then(playlist => res.status(201).json(playlist.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went wrong'});
    });
  } else {
    res.status(500).json({error: 'Something went wrong'});
  }
});

router.put('/artists/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and body id values must match'
    });
  }
  const updated = {};
  const updateableFields = ['artistName', 'albums']; // figure out how to access data from schema  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });
  return Artist
  .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
  .then(updatedArtist => res.status(204).end())
  .catch(err => res.status(500).json({message: 'something went wrong'}));
});

router.get('/artists/:id', (req, res) => {
  Artist
  .findById(req.params.id)
  .then(artist => {
    console.log(artist);    
    console.log(req.params.id);
    return res.status(204).send(artist);
  })
  .catch(err => {
    console.log('err',err);
    return res.status(500).json({message: 'something went wrong'});
  });
});

router.delete('/artists/:id', (req, res) => {
  Artist
  .findByIdAndRemove(req.params.id)
  .then(() => {
    console.log(`deleted artist data with id \`${req.params.ID}\``);
    res.status(204).end();
  });
});

// add JWT
// create a new playlist
router.post('/playlists', (req, res) => {
  const requiredFields = ['playlistName'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['playlistName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const explicityTrimmedFields = ['playlistName'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    playlistName: { min: 1, max: 72 }
  };
  const tooSmallField = Object.keys(sizedFields).find(field =>
    'min' in sizedFields[field] &&
    req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(field =>
    'max' in sizedFields[field] &&
    req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { playlistName } = req.body;

  return Playlist.find({ playlistName })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Playlist name already taken',
          location: 'playlistName'
        });
      }
      return ''; // we don't need this
    })
    .then(playlist => {
      return Playlist.create({ playlistName });
    })
    .then(playlist => {
      // APIREPR NOT WORKING !!!!!!!!!!
      return res.status(201).json(playlist);
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});
// end router.post (create a new playlist)

// update a playlist
router.put('/playlists/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and body id values mush match'
    });
  }
  const updated = {};
  const updateableFields = ['songs', 'playlistName'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });
  return Playlist
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPlaylist => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'something went wrong' }));

  // updated.songs = ['xxx'] or [ 'xxx, 'yyy', 'zzz' ]
});
// end router.put (update a playlist)

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// APIREPR NOT WORKING !!!!!!!!!!!!!!!!!!
// get a playlist
router.get('/playlists/:id', (req, res) => {
  Playlist
    .findById(req.params.id)
    // .populate({path: 'user', select: 'username'})
    // .populate({path: 'user', select: 'username'})
    .then(playlist => {
      console.log(playlist);
      res.status(201).json(playlist);
      // res.json(playlist.apiRepr());
    })
    .catch(err => {
      res.status(500).json({ error: 'something went horribly wrong' });
    });

});

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// APIREPR NOT WORKING !!!!!!!!!!!!!!!!!!
router.get('/playlists/user/:id', (req, res) => {
  Playlist
    .find({'user': req.params.id})
    // .populate({path: 'user', select: 'username'})
    .then(playlist => {
      console.log('playlist',playlist);
      return res.json(playlist);
    })
    .catch(err => {
      res.status(500).json({ error: 'something went horribly wrong' });
    });
});

// NOT WORKING!!!!!
// delete a playlist
router.delete('/playlists/:id', (req, res) => {
  Playlist
    .findByIdAndRemove(req.params.id)
    .then(() => {
      return res.status(204).json({ message: 'sucess yo' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'wrong on delete' });

    });
});
// end router.delete (delete a playlist)

// vote on a song

router.put('/votes/:id', (req, res) => {
  Artist
  findByIdAndUpdate(req.body.album.$.votes)
  .then(() => {
    res.status(204).json({ message: 'you upvoted'});
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'wrong on vote update'});
  });
  // find content to vote on
  // 

// check for required query parameters
}); // end router.put (vot on a song)



// router.use('*', (req, res) => {
//   res.status(404).json({message: 'cannot be found not found'});
// });
module.exports = { router };
