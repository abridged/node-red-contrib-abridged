
module.exports = function (RED) {
    function DiscordRoleManagerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", data => {
            input(RED, node, data, config);
        });
    }
    RED.nodes.registerType("discord-role-manager", DiscordRoleManagerNode);
}

async function input(RED, node, data, config) {
    // console.log('Discord TPC', RED, node, data, config);
    try {
        node.status({ fill: "green", shape: "dot", text: "Initializing..." });
        node.status({});
        data.payload.success = true;
        return node.send([data, null]);
    } catch (error) {
        console.log('Error: ', error)
        data.payload.error = error;
        return node.send([null, data]);
    }
}