const jwt = require("jsonwebtoken");
const User = require("../../models/users");
require("dotenv").config();

const refreshTokenController = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return res.status(401).json({ message: 'Refresh token cookie missing.' });
        }

        const refreshToken = cookies.jwt;
        const foundUser = await User.findOne({ refreshToken }).exec();

        if (!foundUser) {
            return res.status(403).json({ message: 'Invalid or revoked refresh token.' });
        }

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err || foundUser.username !== decoded.username) {
                    return res.status(403).json({ message: 'Token verification failed.' });
                }

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

                return res.json({ accessToken });
            }
        );
    } catch (err) {
        console.error(`Refresh token error: ${err.message}`);
        return res.status(500).json({ message: 'Internal server error during token refresh.' });
    }
};

module.exports = refreshTokenController;