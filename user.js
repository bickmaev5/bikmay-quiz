const API = process.env.HASURA_URL;

const queries = require('./queries');

const { request } = require('graphql-request');;

const getUserUUID = async (user_id) => {
    const res = await request(API, queries.isRegistered, {
        user_id: user_id,
    });
    if (res.telegram_users.length === 0) {
        return false;
    }
    return res.telegram_users[0].id;
};

const getUser = async(user_id) => {
    const res = await request(API, queries.isRegistered, {
        user_id: user_id,
    });
    if (res.telegram_users.length < 0) {
        return false;
    }
    return res.telegram_users[0];
}

module.exports = {
    getUserUUID,
    getUser
};
