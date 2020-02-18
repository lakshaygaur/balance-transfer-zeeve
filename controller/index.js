var hfc = require('fabric-client');

const query = require('../app/query');
const invoke = require('../app/invoke-transaction');
const helper = require('../app/helper');
const logger = helper.getLogger('Controller_Index');

const channelName = hfc.getConfigSetting('channelName');

const getInitialValue = async function (user) {
    logger.info(" ****** Getting Initial User[", user.username, "] - [START] ******");

    const chaincodeName = hfc.getConfigSetting('chaincodeName');
    const client = await helper.getClientForOrg(user.orgName, user.username);
    const peers = client.getPeersForOrg(client.getMspid());
    const peer = peers[0].getName();

    if(!peer) {
        throw Error("Peer not found for organization - ", user.orgName)
    }

    const result = await query.queryChaincode(peer, channelName, chaincodeName, [user.username], "query", user.username, user.orgName);

    if (!result.success || !result.value)
        throw result.message

    logger.info(" ****** Getting Initial User[", user.username, "] - [END] ******");
    return result;
};

const transfer = async function (sender, receiver, asset) {
    logger.info(" ****** Transfering Assets - [START] ******");

    const chaincodeName = hfc.getConfigSetting('chaincodeName');
    const senderClient = await helper.getClientForOrg(sender.orgName, sender.username);
    const receiverClient = await helper.getClientForOrg(receiver.orgName, receiver.username);

    const senderPeers = senderClient.getPeersForOrg(senderClient.getMspid());
    const receiverPeers = receiverClient.getPeersForOrg(receiverClient.getMspid());

    const peers = [senderPeers[0], receiverPeers[0]]

    const args = [sender.username, receiver.username, asset];
    const result = await invoke.invokeChaincode(peers, channelName, chaincodeName, "move", args, sender.username, sender.orgName);
    logger.info("Transfer Result : ", result);

    if (result.success && result.message.indexOf("Error") >= 0)
        result.success = false;
    
    logger.info(" ****** Transfering Assets - [END] ******");
    return result;
};


module.exports.getInitialValue = getInitialValue;
module.exports.transfer = transfer;