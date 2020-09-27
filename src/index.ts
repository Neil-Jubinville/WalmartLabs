// Author: Neil Jubinville
// Date:  September 17th, 2020

import net from 'net';
import chalk from 'chalk';
import * as emoji from 'node-emoji';
import dateFormat from 'dateformat';


//config
const port = 23;
const users:any = [];
const channels:any = ["Lobby"];

class User {

    socket:net.Socket; 
    name = "";
    channel = "Lobby";
    msgCount = 0;
    //user color props
    r:number;
    g:number;
    b:number;

    constructor (socket:any, name:string){

        this.name = name;
        this.socket = socket;
        console.log('create user: ' + this.name);

        //set some random color for the user, we want it on the brighter side.
        this.r = Math.floor(175 + Math.random()*80);
        this.g = Math.floor(175 + Math.random()*80);
        this.b = Math.floor(175 + Math.random()*80);

    }

    relayMessage(data:string){

        // note that this is user + socket designed for PURE TELNET chat.  No Client Software, just straight through port comms.
        // check for opcodes first
        if(data.trim() == "?"){
            let helpMenu = chalk.redBright(" >>>>  COMMANDS <<<< \n")
            helpMenu += "Change Name        #name=new_name \n"
            helpMenu += "Change Channel)    #channel=channel_name \n"
            helpMenu += "List Users)        users? \n"
            helpMenu += "List Channels)     channels? \n"
            helpMenu += "Create Channel)    #newchannel=channel_name \n"
            helpMenu += "Who and Where am I)  ?? \n"
            this.socket.write(helpMenu);
        }

        else if(data.includes('??')){

            this.socket.write(chalk.greenBright("Your name is " + this.name +" and you are in the "+this.channel+" channel \n"));

        }   
        else if(data.includes('#newchannel=')){

            let chanName = data.split('=')[1].trim()
            channels.push(chanName);
            this.socket.write(chalk.greenBright("*** Channel Created!  > " + chanName +"\n"));

        } else if(data.includes('#name=')){

            this.name = data.split('=')[1].trim();
            this.socket.write(chalk.greenBright("*** Your name has been changed to > " + this.name +"\n"));

        } else if(data.includes('#channel=')){
            
            const targetChannel = data.split('=')[1].trim();
            let channelFound = false;

            //verify the channel exists.
            for(let i=0; i<channels.length ;i++ ){
                if ( targetChannel == channels[i] ){
                    this.channel = targetChannel;
                    channelFound = true;
                    break;
                }
            }

            if(channelFound)
                this.socket.write("*** You are now in channel > " + this.channel +"\n");
            else
                this.socket.write(chalk.magentaBright(" * error - We were unable to find the channel '" + targetChannel +"'\n"));
  

        } else if (data.includes('users?')){

            this.socket.write(chalk.cyanBright("<---- USERS ---->\n"));
            for(let i in users){
                this.socket.write(users[i].name +"\n");
            }
            
        } else if (data.includes('channels?')){

            this.socket.write(chalk.cyanBright("<---- CHANNELS ---->\n"));
            for(let i in channels){
                this.socket.write(channels[i] +"\n");
            }
            
        } else{

            this.msgCount++;

            if(this.msgCount>1){  // this ensures the followup telnet protocol bytes sent on initial connect broadcast and thus allowing all subsequent messages.
                var msg = this.name+ "] "+data.toString().trim();
                let now = Date.now();
                let dateString  = dateFormat(now, "mm/dd/yyyy h:MM:ss TT");
                
                console.log(  chalk.rgb( this.r,this.g,this.b)(dateString+" - "+msg) );
                
                
                this.broadcastMessage(dateString+" - "+msg+"\n");
            }
        }
    }


    broadcastMessage(data:string){

        // here we will brodcast to the other users - note we skip ourselves 
        for(var i=0 ;i<users.length; i++ ){
            
            if(users[i].name == this.name)
               continue;
            else{
                // we are go to broadcast, just make sure users are in the same room.
                if(users[i].channel == this.channel)
                    users[i].socket.write( chalk.rgb(this.r,this.g,this.b)(data) );
            }
          }
    }
}


// --------- MAIN CHAT SERVER  ---------
console.log(chalk.green(' ----- '+ emoji.get('high_brightness') +' Chat Server Running on Port ' + port +' '+ emoji.get('palm_tree')+'  --------'))
const chatServer = net.createServer( (socket) => {

    socket.setEncoding('utf8');
    console.log(chalk.yellow(emoji.get('sunny')+' NEW CLIENT CONNECTED '))
    var user = new User(socket, 'buddy'+ String(Math.floor(Math.random() * 1000)))
       
    socket.write(chalk.yellow('Welcome to Chat World! It is like Water World but with no water or bad acting!'
                 +'\n(Enter ? for more commands. You are in the "Lobby" channel )'+emoji.get('coffee') +'\n'));

    users.push(user)
 
    socket.on('data', (data:string) => {      
        user.relayMessage(data);
    });
    
    socket.on('end', () => {

        //user disconnected, remove user from users array to avoid relaying into a dead socket.
        for(var i=0 ;i<users.length; i++ ){
            if(users[i].name == user.name){
                users.splice(i,1);
            }
        }
    
        console.log(chalk.red(emoji.get('chipmunk')+'   '+user+' DISCONNECT ') );
    });
});   // closer to socket connect handler.


//fire up the server
chatServer.listen(port)