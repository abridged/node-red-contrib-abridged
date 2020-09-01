const Discord = require("discord.js");


class DiscordRoleManager {
    constructor(token, groups, users) {
        this.botToken = token;
        this.groups = groups;
        this.users = users;
        this.client = new Discord.Client();
    }

    async init() {
        this.client.on("ready", async () => {
            console.log('[DiscordRoleManager] initilized');
            await this._processGuildRoles();
        });
        this.client.login(this.botToken);
    }

    async _processGuildRoles() {
        // loop through all groups
        let guildManager = this.client.guilds;
        for (let guild of guildManager.cache) {
            guild = guild[1];
            let group;
            this.groups.some((grp) => {
                if (grp.fields.guild_id === guild.id) {
                    group = grp
                    return true;
                }
            })
            if (group === undefined) {
                continue
            }
            let config = group.fields.config
            if (config !== undefined) {
                try {
                    group.fields.config = JSON.parse(config)
                } catch (error) {
                    continue;
                }
            }
            const roles = await guild.roles.fetch();
            const temp = await guild.members;
            await temp.fetch();

            for (const temp of guild.members.cache) {
                let member = temp[1]
                if (!member.user.bot && group.fields.config !== undefined) {
                    const hasRole = member.roles.cache.findKey(role => role.name === group.fields.config.membership.roles[0].roleName);


                    if (hasRole) {
                        let resp = {
                            role: hasRole,
                            group,
                            users: this.users,
                            member: JSON.parse(JSON.stringify(member))
                        }
                        //node.send(resp, false);
                        console.log('resp', resp);
                    }

                    // now lets pass group and user to next node that will add or remove role based on tokens
                }
            }

        }
    }


    async _updateRoles() {
        let guildManager = this.client.guilds;
        // All groups from airtable
        // All users with discord platform

        for (let guild of guildManager.cache) {
            guild = guild[1];
            // log(guild);
            // find if guild id is in groups from airtable, if not return
            // find if group has config setup for this guild, if not return
            // if (guild.id !== "647808690648252417") {
            //     return;
            // }
            let group;
            msg.records.some((grp) => {
                if (grp.fields.guild_id === guild.id) {
                    group = grp
                    return true;
                }
            })
            if (group === undefined) {
                continue
            }
            let config = group.fields.config
            // node.warn({"config": config})
            if (config !== undefined) {
                try {
                    group.fields.config = JSON.parse(config)
                } catch (error) {
                    continue;
                }
            }
            // node.warn({"groupConfig": group.fields.config });

            // const group = msg.records.find(group => group.fields.id === guild.id);

            // const group = msg.records.find(function (group) {
            //     if(group.fields.id === guild.id){
            //         return group
            //     }
            // });

            // log("group", group)

            // log('Guild Availabe: ', guild.available);
            // fetch all roles
            const roles = await guild.roles.fetch();
            // log(`There are ${roles.cache.size} roles.`);

            // log("Total Guild Members: ", guild.memberCount);
            // log("GuildManager: ", guild.members);
            // fetch all members
            const guildManager = await guild.members;
            await guildManager.fetch();
            // log(`There are ${guild.members.cache.size} members.`);
            // await members.forEach(processMembers);

            for (const temp of guild.members.cache) {
                member = temp[1]
                if (!member.user.bot && group.fields.config !== undefined) {
                    // log("Getting Member's Roles");
                    const hasRole = member.roles.cache.findKey(role => role.name === group.fields.config.membership.roles[0].roleName);
                    // log(hasRole);
                    if (hasRole) {
                        // if member is in airtable members list, if not continue
                        // if not remove role
                        // if part of list check for balance
                        // if has balance continue else remove role
                        // node.send()? (user, guildId, role)
                        //log('has role', hasRole);
                        // let result = await member.roles.remove(hasRole);
                        // log(member.roles);
                        resp = {
                            // user: "abc",
                            // role: hasRole,
                            // guildId: guild.id,
                            role: hasRole,
                            group,
                            users: msg.users,
                            member: JSON.parse(JSON.stringify(member))
                        }
                        node.send(resp, false);
                    }
                }
            }
        }
        log("Done...");
        client.destroy();
    }
}
module.exports = DiscordRoleManager;