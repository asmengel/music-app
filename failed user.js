'use strict';
// endpoint is /api/users/

const express = require('express');
const router = express.Router();

const { User } = require('./models');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
router.use(jsonParser);

// function expects req.body to be passed in
// checks 4 essential fields for new users and updates
function validateUserFields(user) {
  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in user && typeof user[field] !== 'string'
  );

  if (nonStringField) {    
    return {
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    };
  }

  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => user[field].trim() !== user[field]
  );

  if (nonTrimmedField) {    
    return {
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    };
  }

  const sizedFields = {
    username: { min: 1 },
    password: { min: 10, max: 72 }
  };
  const tooSmallField = Object.keys(sizedFields).find(field =>
    'min' in sizedFields[field] &&
    user[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(field =>
    'max' in sizedFields[field] &&
    user[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {    
    return {
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    };
  }

  return {valid: true};
}

function confirmUniqueUsername (username) {
  return User.find({username})
    .count()
    .then(count => {      
      if (count > 0) {        
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      } else {
        return Promise.resolve();
      }
    });
}

// create a new user
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password', 'firstName', 'lastName'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {  
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
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

  const explicityTrimmedFields = ['username', 'password'];
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
    username: { min: 1 },
    password: { min: 10, max: 72 }
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

  let { username, password , lastName, firstName } = req.body;

  return User.find({ username })
    .count()
    .then(count => {      
      if (count > 0) {        
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {      
      return User.create({ username, password: hash, lastName, firstName });
    })
    .then(user => {      
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {      
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

// update a user
router.put('/:id', jsonParser, (req, res) => {

  let userValid = {};
  let promiseArray = [];
  console.log('1', req.body);
  
  if (!(validateUserFields(req.body) !== {valid: true})) {
    let code = validateUserFields(req.body).code;
    console.log('failing');
    return res.status(code).json(validateUserFields(req.body));
  } else {
    userValid = req.body;
  }
  console.log('2', userValid);
  
  if (userValid.password) {
    console.log('3', userValid.password);
    let hashIt = function() {
      // return bcrypt.hash(userValid.password, 10);
      return User.hashPassword(userValid.password);
    };
    let updateIt = function() {
      return userValid.password = hashIt();
    };
    promiseArray.push(updateIt());
  }
  console.log('4b', promiseArray);
  
  if (userValid.username) { 
    console.log('5', userValid.username);
    // if username is not being updated, it is undefined, so this won't run
    let confirmIt = function() {
      return confirmUniqueUsername(userValid.username);
    };
    promiseArray.push(confirmIt());
  } 
  console.log('6', promiseArray);
    
  return Promise.all(promiseArray)
    .then(() => {    
      console.log('7a', req.params.id);
      console.log('7b', userValid);
      return User.findByIdAndUpdate(req.params.id,
        { $set: userValid },
        { new: true }, 
        function(err, user) {
          if (err) return res.send(err);
          res.status(201).json(user.apiRepr());
        }
      );

    })
    .then(user => {
      console.log('8', user);      
      // return res.status(201).json(user.apiRepr());
    })
    .catch(err => {    
      console.log(err);  
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

module.exports = { router };