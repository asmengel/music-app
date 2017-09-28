'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// @@@@@@@@@@@@@ ARTISTS @@@@@@@@@@@@@@@

// I can think of a TON more to add here... what data is available?
const ArtistSchema = mongoose.Schema({
  artistName: { type: String, required: true, unique: true },
  albums: [{
    title: {type: String},
    songs: [{
      title: {type: String},
      votes: {type: Number, default: 0}
    }] // end songs
  }], // end albums
  genres: [{type: String}]
});

ArtistSchema.methods.apiRepr = function () {
  return { 
    artistName: this.artistName,
    genres: this.genres,

    albums: this.albums,
    _id: this.id };

};

const Artist = mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);

// @@@@@@@@@@@@@ PLAYLISTS @@@@@@@@@@@@@@@

const PlaylistSchema = mongoose.Schema({
  playlistName: { type: String, required: true },
  songs: [{
    id: {type: String},
  }], // end songs
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'} // this says 'I'll contain an id, use that as a foreign key to refernce the primary key of User (which is users)
});

PlaylistSchema.methods.apiRepr = function () {
  return { 
    playlistName: this.playlistName,
    songs: this.songs.length(), // later this can be ref
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    album: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    id: this._id
  };

};

const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

module.exports = { Artist , Playlist };
