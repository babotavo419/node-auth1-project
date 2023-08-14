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

            // Return only user_id and username.
            res.status(200).json({
                user_id: newUser.user_id,
                username: newUser.username
            });
        } catch (err) {
            next(err);
        }
    });

// [POST] /api/auth/login
router.post('/login', 
    checkUsernameExists, 
    (req, res, next) => {
        const { password } = req.body;

        // Ensure req.user is defined and contains the password.
        if (!req.user || !req.user.password) {
            return res.status(500).json({ message: 'Internal server error.' });
        }

        // check if the provided password matches the one in the database
        if (bcrypt.compareSync(password, req.user.password)) {
            req.session.user = req.user;
            res.status(200).json({ message: `Welcome ${req.user.username}!` });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });

// [GET] /api/auth/logout
router.get('/logout', (req, res, next) => {
    if (req.session.user) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ message: 'You cannot log out at the moment.' }); // Set status to 500 to indicate a server error
            } else {
                res.status(200).json({ message: 'logged out' });
            }
        });
    } else {
        res.status(401).json({ message: 'no session' });
    }
});

module.exports = router;
