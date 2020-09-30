// Author: Neil Jubinville
// Date:  September 17th, 2020

import net from "net";
import chalk from "chalk";
import * as emoji from "node-emoji";
import dateFormat from "dateformat";

//config
const port = 2300;
const users: any = [];
const channels: any = ["Lobby"];

//command regex
const com_quit = /^#quit$/i
const com_help = /^\?$/i
const com_whoami = /^\?\?$/i
const com_change_name = /^#name=[a-zA-Z0-9]+/i
const com_change_channel = /^#channel=[a-zA-Z0-9]+/i
const com_create_channel = /^#newchannel=[a-zA-Z0-9]+/i
const com_list_users = /^users\?/i
const com_list_channels = /^channels\?/i

class User {
    socket: net.Socket;
    name = "";
    channel = "Lobby";
    msgCount = 0;
    //user color props
    r: number;
    g: number;
    b: number;

    constructor(socket: any, name: string) {
        this.name = name;
        this.socket = socket;
        console.log("create user: " + this.name);

        //set some random color for the user, we want it on the brighter side.
        this.r = Math.floor(175 + Math.random() * 80);
        this.g = Math.floor(175 + Math.random() * 80);
        this.b = Math.floor(175 + Math.random() * 80);
    }

    relayMessage(data: string) {
        // note that this is user + socket designed for PURE TELNET chat.  No Client Software, just straight through port comms.
        // check for opcodes first
        data = data.trim();

        if (com_help.test(data)) {
            let helpMenu = chalk.redBright(" >>>>  COMMANDS <<<< \n");
            helpMenu += "Change Name        #name=new_name \n";
            helpMenu += "Change Channel)    #channel=channel_name \n";
            helpMenu += "List Users)        users? \n";
            helpMenu += "List Channels)     channels? \n";
            helpMenu += "Create Channel)    #newchannel=channel_name \n";
            helpMenu += "Who and Where am I)  ?? \n";
            helpMenu += "Disconnect)        #quit \n";
            this.socket.write(helpMenu);
        } else if (com_whoami.test(data)) {
            this.socket.write(
                chalk.greenBright(
                    "Your name is " +
                    this.name +
                    " and you are in the " +
                    this.channel +
                    " channel \n"
                )
            );
        } else if (com_create_channel.test(data)) {
            let chanName = data.split("=")[1];
            if (!channels.includes(chanName)){
                channels.push(chanName);
                this.socket.write(
                    chalk.greenBright("*** Channel Created!  > " + chanName + "\n"))
               }
               else{
                this.socket.write(
                    chalk.greenBright("*** Channel Already Exists \n"))
               }
        } else if (com_change_name.test(data)) {
            this.name = data.split("=")[1];
            this.socket.write(
                chalk.greenBright(
                    "*** Your name has been changed to > " + this.name + "\n"
                )
            );
        } else if (com_quit.test(data)) {
            this.socket.write(
                chalk.cyanBright("Come back soon " + this.name + "!\n")
            );
            for (var i = 0; i < users.length; i++) {
                if (users[i].name == this.name) {
                    users.splice(i, 1);
                }
            }
            this.socket.destroy();
        } else if (com_change_channel.test(data)) {
            const targetChannel = data.split("=")[1].trim();
            let channelFound = false;

            //verify the channel exists.
            for (let i = 0; i < channels.length; i++) {
                if (targetChannel == channels[i]) {
                    this.channel = targetChannel;
                    channelFound = true;
                    break;
                }
            }

            if (channelFound)
                this.socket.write(
                    "*** You are now in channel > " + this.channel + "\n"
                );
            else
                this.socket.write(
                    chalk.magentaBright(
                        " * error - We were unable to find the channel '" +
                        targetChannel +
                        "'\n"
                    )
                );
        } else if (com_list_users.test(data)) {
            this.socket.write(chalk.cyanBright("<---- USERS ---->\n"));
            for (let i in users) {
                this.socket.write(users[i].name + "\n");
            }
        } else if (com_list_channels.test(data)) {
            this.socket.write(chalk.cyanBright("<---- CHANNELS ---->\n"));
            for (let i in channels) {
                this.socket.write(channels[i] + "\n");
            }
        } else {
            this.msgCount++;

            if (this.msgCount > 1) {
                // msgCount > 1 ensures the preamble telnet protocol bytes sent on initial connect do not broadcast, and thus allows all subsequent messages.
                var msg = this.name + "] " + data.toString().trim();
                let now = Date.now();
                let dateString = dateFormat(now, "mm/dd/yyyy h:MM:ss TT");

                console.log(
                    chalk.rgb(this.r, this.g, this.b)(dateString + " - " + msg)
                );

                this.broadcastMessage(dateString + " - " + msg + "\n");
            }
        }
    }

    broadcastMessage(data: string) {
        // here we will brodcast to the other users - note we skip ourselves
        for (var i = 0; i < users.length; i++) {
            if (users[i].name == this.name) continue;
            else {
                // we are go to broadcast, just make sure users are in the same channel.
                if (users[i].channel == this.channel)
                    users[i].socket.write(chalk.rgb(this.r, this.g, this.b)(data));
            }
        }
    }
}

// --------- MAIN CHAT SERVER  ---------
console.log(
    chalk.green(
        " ----- " +
        emoji.get("high_brightness") +
        " Chat Server Running on Port " +
        port +
        " " +
        emoji.get("palm_tree") +
        " --------"
    )
);
const chatServer = net.createServer((socket) => {
    socket.setEncoding("utf8");
    console.log(chalk.yellow(emoji.get("sunny") + " NEW CLIENT CONNECTED "));
    var user = new User(
        socket,
        "buddy" + String(Math.floor(Math.random() * 1000))
    );

    socket.write(
        chalk.yellow(
            "Welcome to Chat World! It is like Water World but with no water or bad acting!" +
            '\n(Enter ? for more commands. You are in the "Lobby" channel )' +
            emoji.get("coffee") +
            "\n"
        )
    );

    users.push(user);

    socket.on("data", (data: string) => {
        user.relayMessage(data);
    });

    socket.on("end", () => {
        //user disconnected, remove user from users array to avoid relaying into a dead socket.
        for (var i = 0; i < users.length; i++) {
            if (users[i].name == user.name) {
                users.splice(i, 1);
            }
        }
        console.log(users)
        console.log(
            chalk.red(emoji.get("chipmunk") + "   " + user.name + " DISCONNECT ")
        );
    });
}); // closer to socket connect handler.

//fire up the server
chatServer.listen(port);
