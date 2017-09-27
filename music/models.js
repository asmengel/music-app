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
    title: {type: String},
    id: {type: String},
  }], // end songs
});

PlaylistSchema.methods.apiRepr = function () {
  return { 
    playlistName: this.playlistName,
    songs: this.songs.length(),
    _id: this.id };
};

const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

module.exports = { Artist , Playlist };
