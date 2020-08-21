const Discord = require("discord.js");
const userId = "646733536744833054";
const testChannelId = '736255385496977466';
const emojiTPC = '🔐';
const emojiAirdrop = '⛈️'
const emojiHome = '🏘'
const maxTimeout = 600000

const emojiMainnet = "1️⃣"
const emojixDai = "2️⃣"
const emojiRinkeby = "3️⃣"
const emojiKovan = "4️⃣"
let msg = {}

class DiscordService {
    constructor(token) {
        this.botToken = token;
        this.client = new Discord.Client();
    }

    async init() {
        this.client.on("ready", async () => {
            console.log('Discord client is ready');
            this.askForNetworkInput();
        });

        this.client.on("message", async message => {
            if (message.author.bot) return;
            console.log(message);
            message.channel.send("Ping?");
        });

        this.client.login(this.botToken);
    }

    async askForNetworkInput() {
        try {

            const channel = this.client.channels.cache.find(function (channel) {
                if (channel.id === testChannelId && channel.type === 'text') {
                    return channel;
                }
            })
            const embed = new Discord.MessageEmbed()
                .setTitle('Please choose a network')
                .setDescription(
                    `Which network would you like to setup guild?
                `
                )
                .setFooter(`Click on the reaction
    ${emojiMainnet}Mainnet, ${emojixDai}xDAI ${emojiRinkeby}Rinkeby, ${emojiKovan}Kovan ${emojiHome}Home`)

            const message = await channel.send(embed);
            msg.channelId = message.channel.id;
            await message.react(emojiMainnet);
            await message.react(emojixDai);
            await message.react(emojiRinkeby);
            await message.react(emojiKovan);
            await message.react(emojiHome);

            const filter = (reaction, user) => {
                return [emojiMainnet, emojixDai, emojiRinkeby, emojiKovan].includes(reaction.emoji.name) /*&& user.id === userId*/;
            };

            const collected = await message.awaitReactions(filter, { max: 1, time: maxTimeout, errors: ['time'] });
            const reaction = collected.first();

            if (reaction.emoji.name === emojiMainnet) {
                network = 'mainnet'
                sendConfigOption(channel)
            } else if (reaction.emoji.name === emojiRinkeby) {
                //  onActionTPC(message, channel);
                network = 'rinkeby'
                sendConfigOption(channel)
            }
            else if (reaction.emoji.name === emojixDai) {
                //  onActionTPC(message, channel);
                network = 'xdai'
                sendConfigOption(channel)
            }
            else if (reaction.emoji.name === emojiKovan) {
                //  onActionTPC(message, channel);
                network = 'kovan'
                sendConfigOption(channel)
            }
        } catch (error) {
            // msg.payload.error = error;
            console.log(error)
            // node.send(msg);
            // done();
        }
    }

    async sendConfigOption(channel) {
        try {

            // const channel = this.client.channels.cache.find( (channel) {
            //     if (channel.id === msg.payload.channel.id && channel.type === 'text') {
            //         return channel;
            //     }
            // })
            const embed = new Discord.MessageEmbed()
                .setTitle('Welcome to guild setup. Please choose service to configure')
                .setDescription(
                    `<Detailed description about both services >
                Airdrop
                Token Permission Channel
                `
                )
                .setFooter(`Click on the reaction
    ${emojiAirdrop}Airdrop, ${emojiTPC}Token Permission Channel, ${emojiHome}Home`)
            node.warn({ "Sending message to channel ": channel.name });
            const message = await channel.send(embed);
            node.warn({ "====== Message =======": message.channel.id });
            msg.channelId = message.channel.id;
            await message.react(emojiAirdrop);
            await message.react(emojiTPC);
            await message.react(emojiHome);

            const filter = (reaction, user) => {
                return [emojiAirdrop, emojiTPC].includes(reaction.emoji.name) /*&& user.id === userId*/;
            };

            collected = await message.awaitReactions(filter, { max: 1, time: maxTimeout, errors: ['time'] });
            const reaction = collected.first();

            if (reaction.emoji.name === emojiAirdrop) {
                onActionAirdrop(message, channel);
            } else if (reaction.emoji.name === emojiTPC) {
                onActionTPC(message, channel);
            }
        } catch (error) {
            msg.payload.error = error;
            console.log(error)
            node.send(msg);
            done();
        }

    }

    async onActionAirdrop(message) {
        existingConfig = '';


        if (msg.group.fields.airdrop_config !== undefined) {
            existingConfig = `
    **Existing Configuration:**
    \`\`\`css
    Token Address: ${msg.group.fields.airdrop_config.tokenAddress}
    Number of Airdrop Tokens: ${msg.group.fields.airdrop_config.numOfTokens} \`\`\`
    Network: ${msg.group.fields.network}
    `
        }

        description = `
    You are configuring Airdrop to **${msg.group.fields.name}** server
    <More airdrop description>
    ${existingConfig}
    Please input airdrop config in format below
    \`\`\`
    <Token contract address> <Number of tokens to airdrop>
    \`\`\``
        const embed = new Discord.MessageEmbed()
            .setTitle('Setup Airdrop')
            .setDescription(description)
        await message.reply(embed);
        const filter = m => (m.author.id === userId);
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: maxTimeout, errors: ['time'] });

        collector.on('collect', m => {
            node.warn({ "input": m.content });
            onMessageAirdrop(message, m);
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }

    async onMessageAirdrop(message, m) {
        // validate input
        console.log(`Collected ${m.content}`);
        // validate input then ask
        const inputs = m.content.split(" ");
        node.warn({ "Airdrop Input": inputs });
        let validInputs = true;
        let errorMessage = "";
        if (inputs.length != 2) {
            validInputs = false;
            errorMessage = "Incorrect number of arguments. Please try again."

        } else if (isNaN(inputs[1])) {
            validInputs = false
            errorMessage = "Incorrect number of tokens. Please try again."
        }

        if (!validInputs) {
            embed = new Discord.MessageEmbed()
                .setTitle("Error")
                .setDescription(errorMessage);
            message = await message.reply(embed);
            onActionAirdrop(message);
            return;
        }

        embed = new Discord.MessageEmbed()
            .setTitle("Last Step")
            .setDescription(`Add a message to send to the airdrop recipients! This can include links!`);
        message = await message.reply(embed);
        const filter = m => (m.author.id === userId);
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: maxTimeout, errors: ['time'] });

        collector.on('collect', m => {
            onAirdropSetupFinished(message, m, inputs)
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });

    }

    async onAirdropSetupFinished(message, m, inputs) {
        description = `
    >>> Congrats!!! Airdrop config is completed for ***${msg.group.fields.name}***
    Please make sure to have enough eth and token to your assigned admin address 
    
    Admin Address:
    \`\`\`
    ${msg.group.fields.admin_ether_address}
    \`\`\`
    Network: ${network}
    `
        embed = new Discord.MessageEmbed()
            .setTitle("Ready to Roll!!!")
            .setDescription(description);
        await message.reply(embed);
        node.warn({ "airdrop message": m.content })
        msg.airdrop = {
            userId,
            inputs,
            completedMessage: m.content
        }
        msg.action = "airdrop"
        done(msg);
    }

    async onActionTPC(message, channel) {

        let existingConfig = '';

        try {
            if (msg.group.fields.config !== undefined) {
                let tokenDetail = "";
                let roles = msg.group.fields.config.membership.roles;
                let role = roles[0] // only supporting one role
                if (role.tokenSymbol) {
                    tokenDetail = `Token Symbol: ${role.tokenSymbol}`;
                } else if (role.tokenDetails.contractAddress) {
                    tokenDetail = `Token Address: ${role.tokenDetails.contractAddress}`;
                }

                existingConfig = `
                **Existing Configuration:**
                \`\`\`css
    Membership Type: ${role.type}
    Number of Tokens: ${role.minToken}
    ${tokenDetail}\`\`\``
            }
        } catch (error) {
            console.log(error);
        }

        const roll = '🤣'
        const erc20 = '💰'
        const erc721 = '🤑'

        const title = `Token Based Roles`;
        const description = `This section describe about token permission guild configuration. <include help>
            ${existingConfig}
        **Please choose type:**
        Roll    <Description>
        ERC 20  <Description>
        ERC721  <Description>
        `

        let embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setFooter(`Click on the reaction
    ${roll}Roll, ${erc20}ERC20, ${erc721}ERC721, ${emojiHome}Home`)
        message = await message.reply(embed);
        await message.react(roll);
        await message.react(erc20);
        await message.react(erc721);
        await message.react(emojiHome);

        const filter = (reaction, user) => {
            return [roll, erc20, erc721].includes(reaction.emoji.name) && user.id === userId;
        };

        collected = await message.awaitReactions(filter, { max: 1, time: maxTimeout, errors: ['time'] });
        const reaction = collected.first();
        if (reaction.emoji.name === roll) {
            onReactionRoll(message);
        } else if (reaction.emoji.name === erc20) {
            onReactionERC20(message);
        } else if (reaction.emoji.name === erc721) {
            onReactionERC721(message);
        }
    }


    async onReactionERC721(message) {
        embed = new Discord.MessageEmbed()
            .setTitle("ERC721 Membership")
            .setDescription(`Please input token details (ERC721) in format below
    \`\`\`css
    <ERC721 token contract address> <Minimum number of tokens> <Discord Role>
    \`\`\``
            )
            .setFooter(`i.e 0xxxxx 5 role_name
    Role name is case sensetive.
            `);
        await message.reply(embed);
        const filter = m => (m.author.id === userId);
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: maxTimeout, errors: ['time'] });

        collector.on('collect', m => {
            erc721Input(message, m)
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }

    async erc721Input(message, m) {
        console.log(`Collected ${m.content}`);
        // validate input then ask
        const inputs = m.content.split(" ");
        node.warn({ "ERC721 Input": inputs });
        let validInputs = true;
        let errorMessage = "";
        if (inputs.length != 3) {
            validInputs = false;
            errorMessage = "Incorrect number of arguments. Please try again."

        } else if (isNaN(inputs[1])) {
            validInputs = false
            errorMessage = "Incorrect number of tokens. Please try again."
        }

        if (!validInputs) {
            embed = new Discord.MessageEmbed()
                .setTitle("Error")
                .setDescription(errorMessage);
            message = await message.reply(embed);
            onReactionERC20(message);
            return;
        }

        const title = 'Ready To Roll'
        const description = `\`\`\`css
    Membership Type: ERC721
    Tooken Address: ${inputs[0]}
    Number of Tokens: ${inputs[1]}
    Role: ${inputs[2]}
    Network: ${network}
            \`\`\``
        embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setFooter(help)
        await message.reply(embed);
        // send data to next node and save information
        msg.symbol = inputs[0];
        msg.tpc = {
            userId,
            membership: {
                type: "ERC721",
                inputs
            }

        }
        msg.action = "save_tpc"
        done(msg);
    }

    async onReactionERC20(message) {
        embed = new Discord.MessageEmbed()
            .setTitle("ERC20 Membership")
            .setDescription(`Please input token details (ERC20) in format below
    \`\`\`css
    <ERC20 token contract address> <Minimum number of tokens> <Discord Role>
    \`\`\``
            )
            .setFooter(`i.e 0xxxxx 5 role_name
    Role name is case sensetive.
            `);
        await message.reply(embed);
        const filter = m => (m.author.id === userId);
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: maxTimeout, errors: ['time'] });

        collector.on('collect', m => {
            erc20Input(message, m)
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }

    async erc20Input(message, m) {
        console.log(`Collected ${m.content}`);
        // validate input then ask
        const inputs = m.content.split(" ");
        node.warn({ "ERC20 Input": inputs });
        let validInputs = true;
        let errorMessage = "";
        if (inputs.length != 3) {
            validInputs = false;
            errorMessage = "Incorrect number of arguments. Please try again."

        } else if (isNaN(inputs[1])) {
            validInputs = false
            errorMessage = "Incorrect number of tokens. Please try again."
        }

        if (!validInputs) {
            embed = new Discord.MessageEmbed()
                .setTitle("Error")
                .setDescription(errorMessage);
            message = await message.reply(embed);
            onReactionERC20(message);
            return;
        }

        const title = 'Ready To Roll'
        const description = `\`\`\`css
    Membership Type: ERC20
    Tooken Address: ${inputs[0]}
    Number of Tokens: ${inputs[1]}
    Role: ${inputs[2]}
    Network: ${network}
            \`\`\``
        embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setFooter(help)
        await message.reply(embed);
        // send data to next node and save information
        msg.symbol = inputs[0];
        msg.tpc = {
            userId,
            membership: {
                type: "ERC20",
                inputs
            }

        }
        msg.action = "save_tpc"
        done(msg);
    }

    async onReactionRoll(message) {
        embed = new Discord.MessageEmbed()
            .setTitle("Roll Membership")
            .setDescription(`Please input token details (Roll) in format below
    \`\`\`css
    <Token Symbol> <Minimum number of tokens> <Discord Role>
    \`\`\``
            )
            .setFooter(`i.e ALEX 5 role_name
    Role name is case sensetive.
            `);
        await message.reply(embed);
        const filter = m => (m.author.id === userId);
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: maxTimeout, errors: ['time'] });

        collector.on('collect', m => {
            rollInput(message, m)
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }

    isAddress(address) {
        try {
            getAddress(address);
        } catch (e) { return false; }
        return true;
    }

    async rollInput(message, m) {
        console.log(`Collected ${m.content}`);
        // validate input then ask
        const inputs = m.content.split(" ");
        node.warn({ "Roll Input": inputs });
        let validInputs = true;
        let errorMessage = "";
        if (inputs.length != 3) {
            validInputs = false;
            errorMessage = "Incorrect number of arguments. Please try again."

        } else if (isNaN(inputs[1])) {
            validInputs = false
            errorMessage = "Incorrect number of tokens. Please try again."
        }

        if (!validInputs) {
            embed = new Discord.MessageEmbed()
                .setTitle("Error")
                .setDescription(errorMessage);
            message = await message.reply(embed);
            onReactionRoll(message);
            return;
        }

        const title = 'Ready To Roll'
        const description = `\`\`\`css
    Membership Type: Roll
    Tooken Symbol: ${inputs[0]}
    Number of Tokens: ${inputs[1]}
    Role: ${inputs[2]}
            \`\`\``
        embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setFooter(help)
        await message.reply(embed);
        // send data to next node and save information
        msg.symbol = inputs[0];
        msg.tpc = {
            userId,
            membership: {
                type: "roll",
                inputs
            }

        }
        msg.action = "save_tpc"
        done(msg);
    }
}

module.exports = DiscordService;