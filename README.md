# WalmartLabs  CHAT WORLD!  
### by Neil Jubinville
## Language:  Typescript / ES6 , NodeJS / npm runtime.  

#### Project Summary

This chat server is for a code test demo, please do not use it in production or public.  It is only to demonstrate knowledge in planned abstractions, implementation, network socket management, and variable scoping.   

The example chat server is pure to the request in the sense that a user can join the chat server simply by initiating a telnet session. It is a pure telnet chat server.  No client software needs to run.  Simply run the server and let people connect.  To make it more challenging and demonstrate more skill, no networking or green thread packages were used.  Raw socket comms and connection handlers were implmented.   

#### Technology Choice

The choice for using NodeJS over Python / Flask was because single threaded runtimes like javascript are harder to implement for multi-user events and they showcase the awareness of subtle nuanced variable scope to bind functionality.  Normally I would do this in Python with threaded server modules and pipe the simple API in flask :).

### Security Notes
This is a simple test server, it can be run on port 23 the default telnet port but as you know ports under 1K require special privileges.  Therefore I set the port to 2300.  If you want to run it on the default telnet port, change the port setting and ensure you are running it jailed into an unprivileged container.   Of course this app can be DOS attacked, there is no bounds checking and likely shell injection with stack smashing is a real possibility.   This is just for kicks in a secure net. 

#### Architecture

The design is simple and all code is in the single index.js.  There we have a socket server and a User class defined.  On connection I create a User object and make a two way binding between the instantiated socket and the user object.  This allows the user class to communicate through the various data structures of the chat server like channels, users, and of course message relays with direct reference to it's own comm channel.  

All the abstractions live at the chat server.   There is no client software.


## FEATURES
- Change your Name
- Switch Channels
- Create a Channel
- Relay Messages / chat!
- List Channels
- List Users
- Get a help menu
- Show your current name and channel

## PACKAGES
- Chalk : Used to colorize the terminal output.
- dateformat : For simple date formatting.
- node-emoji : To insert some emojis.

## How to Run
Pre-reqs:  You need a fairly new NodeJS runtime installed and npm.

1) Clone the project.
2) Open a command prompt, navigate to the project folder and run: ``` npm install```
   This should install all your dependencies along with Typescript and Nodemon.
3) To run the the server type:  ``` npm run start:dev ```
4) To connect to the server and participate as a chatter, open a new command prompt window and type:
   ```telnet <server ip > 2300 ``` 

## How to Test
The framework used is Jest,  I did a few tests to show that I can extrapolate a full set when necessary.
Open a command prompt window, navigate to your repo folder and run:  ```npm run test''' . Note that the server needs to be a clean run instance for each pass. It is not automated to come up in build up / tear down routines.  I am still learning this test framework.

Other
* if you are testing on our own computer,  open a few command prompt windows and type:  ```telnet localhost ```
* When you connect you will be given a name and a random number, explore the help menu for syntax on how to change your chat name, if you want.


## Command Syntax When Connected

>>| Command | Syntax |
>>|---------|--------|
>>| Help Menu | ? |
>>| Change Name |   #name=new_name |
>>| Change Channel  |  #channel=channel_name |
>>| List Users   |    users? |
>>| List Channels  |   channels? |
>>| Create Channel |   #newchannel=channel_name |
>>| Who and Where am I | ??  |
>>| quit | #quit |




