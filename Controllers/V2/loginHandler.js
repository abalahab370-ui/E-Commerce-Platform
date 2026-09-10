const Users = require('../../models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const loginHandler = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const foundUser = await Users.findOne({ username }).exec();
        if (!foundUser) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Convert Mongoose doc to plain object before reading roles
        const userObj = foundUser.toObject();
        const roles = Array.isArray(userObj.roles) 
            ? userObj.roles 
            : Object.values(userObj.roles || {});

        const accessToken = jwt.sign(
            {
                userInfo: {
                    username: foundUser.username,
                    roles: roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '2h' }
        );

        const refreshToken = jwt.sign(
            { username: foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '6h' }
        );

        foundUser.refreshToken = refreshToken;
        await foundUser.save();

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({ accessToken });

    } catch (err) {
        console.error(`Login error: ${err.message}`);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
};

module.exports = loginHandler;