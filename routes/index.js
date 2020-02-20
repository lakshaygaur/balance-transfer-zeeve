const router = require('express').Router();
var hfc = require('fabric-client');

const controller = require('../controller/index');
const helper = require('../app/helper');
const logger = helper.getLogger('Routes_Index');


router.get('/', async (req, res) => {
    let u1 = {
        username: "",
        asset: "",
        token: ""
    };
    let u2 = {
        username: "",
        asset: "",
        token: ""
    };
    let displayError = "";

    try {
        const users = hfc.getConfigSetting("users");
        if (!users)
            throw "Users are not registered.";

        const usernames = Object.keys(users);
        if (usernames.length < 2) {
            throw "Both users are not registered.";
        }

        logger.info("Users Registered : ", usernames);

        try {
            const user1 = await controller.getInitialValue(users[usernames[0]]);
            const user2 = await controller.getInitialValue(users[usernames[1]]);
            
            u1.username = user1.value.user;
            u1.asset= user1.value.asset;
            u1.token= users[usernames[0]].token;

            u2.username = user2.value.user;
            u2.asset= user2.value.asset;
            u2.token= users[usernames[1]].token;

        } catch (err) {
            if (err.indexOf("Missing") >= 0)
                throw "Cannot access chaincode. Chaincode is not instantiated yet or not accessible to the application.";
            throw err;
        }
    } catch (err) {
        logger.error(err);
        displayError = err + " Check the steps from the documentation";
    }

    res.render('index', {
        u1: u1,
        u2: u2,
        err: displayError
    });
});

router.post('/transfer', async (req, res) => {
    try {
        const users = hfc.getConfigSetting("users");
        const from = users[req.username];
        const to = users[req.body.to];
        const asset = req.body.value;

        logger.info(`Transfering ${asset} amount from ${from.username} to ${to.username}`);
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
        console.log("Error :: ", err);
        logger.error(err);
    }
});

module.exports = router;