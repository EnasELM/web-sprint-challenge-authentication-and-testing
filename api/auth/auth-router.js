const router = require('express').Router();
const bcrypt = require('bcryptjs')
const User = require('../jokes/jokes-model')
const { JWT_SECRET } = require("../secrets");
const jwt = require("jsonwebtoken");
const { checkingUsernameAndPassword, checkUsernameFree, checkUsernameExists } = require('./auth-middlewares')

router.post('/register',checkingUsernameAndPassword, checkUsernameFree, (req, res, next) => {
  //res.end('implement register, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
      const { username, password } = req.body
      const hash =  bcrypt.hashSync(password, 6) 
      User.add({ username, password:hash})
       .then(newUser => {
         res.status(201).json({
          id: newUser.id,
          username: newUser.username,
          password: newUser.password,
         })
       })
      
       .catch(next) 
});

router.post('/login', checkingUsernameAndPassword,checkUsernameExists, (req, res, next) => {
  //res.end('implement login, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
   if (bcrypt.compareSync(req.body.password, req.user.password)) {
        const token = buildToken(req.user);
        res.json({
          message: `welcome, ${req.user.username}`,
          token
        })
   } else {
        next({ message: 'invalid credentials', status: 401 })
      }      
});

function buildToken(user) {
  const payload = {
     id: user.id,
     username: user.username,
     password: user.password,
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

module.exports = router;
