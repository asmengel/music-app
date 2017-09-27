'use strict';

const { TEST_DATABASE_URL, TEST_PORT } = require('../config');
process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { Artist, Playlist } = require('../music');
const { JWT_SECRET } = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

const faker = require('faker');

function fakeSongList() {
  return [
    { title: faker.company.bs()},
    { title: faker.commerce.color()},
    { title: faker.commerce.productAdjective()},
    { title: faker.address.city()},
    { title: faker.commerce.department()},
    { title: faker.company.catchPhraseNoun()},
    { title: faker.company.catchPhraseDescriptor()},
    { title: faker.hacker.verb() + '#' + faker.finance.amount()},
    { title: faker.company.bs()}
  ];
}

function fakeAlbumList() {
  return [
    { title: faker.commerce.color(),
      songs: fakeSongList()
    },
    { title: faker.commerce.productAdjective(),
      songs: fakeSongList()
    },
    { title: faker.commerce.department(),
      songs: fakeSongList()
    },
    { title: faker.company.catchPhraseDescriptor(),      songs: fakeSongList()
    },
  ];
}

function fakeGenres() {
  let arrayofGenres = [ // we have 20
    'Hip Hop', 'Folk', 'Classical', 'Heavy Metal', 'Punk', 'New Wave', 'Pop', 'Reggae', 'Rap', 'Country', 'Bluegrass', 'R&B', 'Motown Revival', 'Doo Wop', 'Disco', 
    'Crunk', 'Trap', 'Jazz', 'Electronica', 'Soul'
  ];
  let randomNumber = Math.floor(Math.random() * 10); // 0 - 10
  return [ 
    arrayofGenres[randomNumber], 
    arrayofGenres[randomNumber + 2],
    arrayofGenres[randomNumber + 3], 
    arrayofGenres[randomNumber + 10]
  ];
}

function fakeArtist() {
  return {
    artistName : faker.company.companyName(),
    albums : fakeAlbumList(),
    genres : fakeGenres()
  };
}

function fakeUser() {
  return {
    username : faker.internet.userName(),
    password : faker.internet.password(),
    firstName : faker.name.firstName(),
    lastName : faker.name.lastName()
  };
}

function fakePlaylist() {
  return {
    playlistName : faker.company.bsAdjective(),
    user: 'testUser',    
    songs : fakeSongList() // edit this so songs have real IDs
  };
}

describe('Music endpoints', function () {
  const username = 'exampleUzer';
  const password = 'examplePazz';
  const firstName = 'Jozie';
  const lastName = 'Schmozie';

  before(function () {
    return runServer(TEST_DATABASE_URL, TEST_PORT);
  });

  beforeEach(function () {
    Artist.remove({}); // clear all 3 tables
    Playlist.remove({});
    User.remove({});

    const fakeArtists = []; // create fake artists and users (two main collections)
    for (let i=0; i<10; i++){
      fakeArtists.push(fakeArtist());
    }
    Artist.insertMany(fakeArtists);

    const fakeUsers = [];
    for (let i=0; i<10; i++){
      fakeUsers.push(fakeUser());
    }

    let userIds = [];
    User.insertMany(fakeUsers)
      .then(users => {
        console.log('users found ', users);
        userIds = users.map(user => user._id);
      });

      console.log('uid1 ',userIds);
      console.log('fu1 ',fakeUsers);
      
    const fakePlaylists = []; // create join collection
    for (let i=0; i<10; i++){
      fakePlaylists.push(fakePlaylist());
      fakePlaylists[i].user = userIds[i]._id;
    }
    console.log('fpk ',fakePlaylists);

    return Playlist.insertMany(fakePlaylists);
  
  });

  afterEach(function () {
    //console.log('after each'); 
  });

  after(function () {
    return closeServer();
  });

  // get api/music/artist
  // 20 artists (no more than)
  // res is json object
  // each artist match artistList.apiRepr()
  // if fail 500

  // post api/music/artist
  // currently broken

  // put api/music/artist/:id
  // broken (post also broken)

  // delete api/music/artist/:id

  // post /api/music/playlist
  // working

  // put /api/music/playlist/:id
  let id = 'GET A PLAYLIST ID';

  describe('/api/music/playlist/:id', function () {
    // it.skip('Should update a playlist', function () {
    //   let fakeU = fakeUser();
    //   // Create an initial user
    //   return User.create( fakeU )
    //     .then(() =>
    //       // Try to create a second user with the same username
    //       chai.request(app)
    //         .post('/api/users')
    //   return chai
    //     .request(app)
    //     .put(`/api/music/playlist/${id}`)
    //     .then(res =>
    //       expect.res.to.have
    //   )
  });



  describe('/api/music', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .get('/api/music')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          //expect(res).to.have.status(401);
        });
    });

    it.skip('Should reject requests with an invalid token', function () {
      const token = jwt.sign(
        { username },
        'wrongSecret',
        {
          // algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .get('/api/music')
        .set('Authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it.skip('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: { username },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          // algorithm: 'HS256',
          subject: username
        }
      );

      return chai
        .request(app)
        .get('/api/music')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it.skip('Should send protected data', function () {
      const token = jwt.sign(
        {
          user: { username }
        },
        JWT_SECRET,
        {
          // algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .get('/api/music')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.data).to.equal('rosebud');
        });
    });
  });
});
