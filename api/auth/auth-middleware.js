const Users = require('../users/users-model'); 

function restricted(req, res, next) {
  if (req.session && req.session.user) {
      next();
  } else {
      res.status(401).json({ message: "You shall not pass!" });
  }
}

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

async function checkUsernameExists(req, res, next) {
  try {
      const users = await Users.findBy({ username: req.body.username });
      if (!users.length) {
          res.status(401).json({ message: "Invalid credentials" });
      } else {
          req.user = users[0];
          next();
      }
  } catch (err) {
      next(err);
  }
}

function checkPasswordLength(req, res, next) {
  const { password } = req.body;

  if (!password || password.length <= 3) {
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

