const router = require('express').Router();
var hfc = require('fabric-client');

const controller = require('../controller/index');
const helper = require('../app/helper');
const logger = helper.getLogger('Routes_Index');


router.get('/', async (req, res) => {
    try {
        const users = hfc.getConfigSetting("users");
        const usernames = Object.keys(users);
        logger.debug("Users Registered : ", usernames);

        const user1 = await controller.getInitialValue(users[usernames[0]]);
        const user2 = await controller.getInitialValue(users[usernames[1]]);

        res.render('index', {
            u1: {
                username: user1.value.user,
                asset: user1.value.asset,
                token: users[usernames[0]].token
            },
            u2: {
                username: user2.value.user,
                asset: user2.value.asset,
                token: users[usernames[1]].token
            }
        });
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.end("Network is not fully configured... Check all the steps");
    }

});

router.post('/transfer', async (req, res) => {
    try {
        const users = hfc.getConfigSetting("users");
        const from = users[req.username];
        const to = users[req.body.to];
        const asset = req.body.value;

        const result = await controller.transfer(from, to, asset);

        if (result.success) {
            const user1 = await controller.getInitialValue(users[from.username]);
            const user2 = await controller.getInitialValue(users[to.username]);

            result.u1 = {};
            result.u2 = {};
            result.u1.asset = user1.value.asset;
            result.u2.asset = user2.value.asset;
        }

        res.json(result);
    } catch (err) {
        logger.debug("Error : ", err)
    }
});

module.exports = router;