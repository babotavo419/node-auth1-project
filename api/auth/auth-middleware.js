const Users = require('../users/users-model'); 

// Check for active session
function restricted(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ message: "You shall not pass!" });
    }
}

// Check if username is free
async function checkUsernameFree(req, res, next) {
    try {
        const users = await Users.findBy({ username: req.body.username });
        if (users.length) {
            res.status(422).json({ message: "Username taken" });
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
}

// Check if username exists and has necessary properties
async function checkUsernameExists(req, res, next) {
  try {
      const users = await Users.findBy({ username: req.body.username });
      if (!users.length || !users[0].password || !users[0].username) {
          res.status(401).json({ message: "Invalid credentials" });
      } else {
          req.userData = users[0];
          next();
      }
  } catch (err) {
      next(err);
  }
}

// Check password length
function checkPasswordLength(req, res, next) {
    if (!req.body.password || req.body.password.length <= 3) {
        res.status(422).json({ message: "Password must be longer than 3 chars" });
    } else {
        next();
    }
}

module.exports = {
    restricted,
    checkUsernameFree,
    checkUsernameExists,
    checkPasswordLength
};

