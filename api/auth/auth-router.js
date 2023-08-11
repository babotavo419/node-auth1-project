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
    async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const hashedPassword = bcrypt.hashSync(password, 10); // hashing password with a salt of 10 rounds
            const newUser = await Users.add({ username, password: hashedPassword });

            res.status(200).json(newUser);
        } catch (err) {
            next(err);
        }
    });

// [POST] /api/auth/login
router.post('/login', 
    checkUsernameExists, 
    (req, res, next) => {
        const { password } = req.body;

        // check if the provided password matches the one in the database
        if (bcrypt.compareSync(password, req.userData.password)) {
            req.session.user = req.userData;
            res.status(200).json({ message: `Welcome ${req.userData.username}!` });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });

// [GET] /api/auth/logout
router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.json({ message: 'You cannot log out at the moment.' });
            } else {
                res.status(200).json({ message: 'logged out' });
            }
        });
    } else {
        res.status(200).json({ message: 'no session' });
    }
});

module.exports = router;

