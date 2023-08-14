const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Users = require('../users/users-model');
const { 
    checkUsernameFree, 
    checkUsernameExists, 
    checkPasswordLength 
} = require('./auth-middleware');

// [POST] /api/auth/register
router.post('/register', 
    checkUsernameFree, 
    checkPasswordLength, 
    (req, res, next) => {
            const { username, password } = req.body;
            const hashedPassword = bcrypt.hashSync(password, 10); // hashing password with a salt of 10 rounds

            Users.add({ username, password: hashedPassword });
            res.status(201).json(newUser)
        .catch(next)
  
    });

// [POST] /api/auth/login
router.post('/login', 
    checkUsernameExists, 
    (req, res, next) => {
        const { password } = req.body;
        // check if the provided password matches the one in the database
        if (bcrypt.compareSync(password, req.user.password)) {
            req.session.user = req.user;
            res.json({ message: `Welcome ${req.user.username}!` });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });

// [GET] /api/auth/logout
router.get('/logout', (req, res, next) => {
    if (req.session.user) {
        req.session.destroy(err => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({ message: 'logged out' });
            }
        });
    } else {
        res.status(401).json({ message: 'no session' });
    }
});

module.exports = router;
