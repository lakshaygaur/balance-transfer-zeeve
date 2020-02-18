var hfc = require('fabric-client');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

const query = require('../app/query');
const invoke = require('../app/invoke-transaction');
const helper = require('../app/helper');
const logger = helper.getLogger('Controller_Index');

const channelName = hfc.getConfigSetting('channelName');
const chaincodeName = hfc.getConfigSetting('chaincodeName');

const getOrganizations = function () {
    try {
        filePath = path.join(__dirname, '../artifacts/network-config.yaml');
        var doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
        return doc.organizations;
    } catch (e) {
        console.log(e);
    }
}
const orgs = getOrganizations();

const getInitialValue = async function (user) {
    const org = orgs[user.orgName];
    const peer = org.peers[0];

    const result = await query.queryChaincode(peer, channelName, chaincodeName, [user.username], "query", user.username, user.orgName);

    if (result.success && !parseInt(result.value.asset)) {
        logger.log("Getting Initial User Assets : ", result);
        error = result.value.asset.split('"')[3];
        result.value.asset = error;
    }
    return result;
};

const transfer = async function (from, to, asset) {
    const peers = [];

    let org = orgs[from.orgName];
    peers.push(org.peers[0]);

    org = orgs[to.orgName];
    peers.push(org.peers[0]);

    const args = [from.username, to.username, asset];
    logger.log("Tranfering args : ", args);

    const result = await invoke.invokeChaincode(peers, channelName, chaincodeName, "move", args, from.username, from.orgName);

    logger.log("Transfer Reslut :", result);
    if (result.success && result.message.indexOf("Error") >= 0) result.success = false;

    return result;
};


module.exports.getInitialValue = getInitialValue;
module.exports.transfer = transfer;