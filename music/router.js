'use strict';
// endpoint is /api/music/

const express = require('express');
const router = express.Router();

const { Artist , Playlist } = require('./models');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
router.use(jsonParser);

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtAuth = passport.authenticate('jwt', { session: false });

// search for songs
router.get('/', (req, res) => {
  // check for optional query parameters
}); // end router.get (search for songs)

// create a new playlist
router.post('/playlist', jwtAuth, (req, res) => {
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
    playlistName: { min: 1 , max: 72 }
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
      return res.status(201).json(playlist.apiRepr());
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
router.put('/playlist/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and body id values mush match'
    });
  }
  const updated = {};
  const updateableFields = ['songs'];
  updateableFields.forEach(field => {
  if (field in req.body) {
    updated[field] = req.body[field];
  }
});
  Playlist
  .findByIdAndUpdate(req.params.id, {set: updated}, {new: true})
  .then(updatedPlaylist => res.status(204).end())
  .catch(err => res.status(500).json({message: 'something went wrong'}));
  // updated.songs = ['xxx'] or [ 'xxx, 'yyy', 'zzz' ]
});
 // end router.put (update a playlist)

// get a playlist
router.get('/playlist/:id', jwtAuth, (req, res) => {
  Playlist
  .findById(req.params.id)
  .then(post => res.json(post.apiRepr()))
  .catch(err => {
    res.status(500).json({error: 'something went horribly wrong'});
  });
  
}); 
// end router.get (update a playlist)

// delete a playlist
router.delete('/playlist/:id', jwtAuth, (req, res) => {
  Playlist
  .findByIdAndRemove(req.params.id)
  .then (() => {
    res.status(204).json({message: 'sucess yo'});
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'wrong on delete'});
  });
});
// end router.delete (delete a playlist)

// vote on a song
router.put('/vote/:id', jwtAuth, (req, res) => {
  // check for required query parameters
}); // end router.put (vot on a song)

module.exports = { router };
