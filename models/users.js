const mongoose = require("mongoose");
const Schema = mongoose.Schema ;

const usersSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            trim: true
        } ,

        password: {
            type: String,
            required: true
        },

        roles: {
            customer: {
                type: Number,
                default: 2001
            },

            admin: {
                type: Number
            }
        },

        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("users", usersSchema);