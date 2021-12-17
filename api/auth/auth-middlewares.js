const User = require('../jokes/jokes-model')



async function checkUsernameFree(req, res, next) {
    try {
      const users = await User.findBy({ username: req.body.username })
      if (!users.length) {
        next()
      } else next({ message: "username taken", status: 422 })
    } catch (err) {
      next(err);
    }
  }

  function checkPassAndUserHere(req, res, next) {
    if (!req.body.password || !req.body.username) {
      next({ message: "username and password required", status: 422 });
    } else {
      next();
    }
  }

  module.exports = {
    checkPassAndUserHere,
    checkUsernameFree,
  };