"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = __importDefault(require("net"));
var chalk_1 = __importDefault(require("chalk"));
var emoji = __importStar(require("node-emoji"));
//config
var port = 23;
var connections = [];
console.log(chalk_1.default.green(' -----  Chat Server Running on Port ' + port));
var chatServer = net_1.default.createServer(function (socket) {
    connections.push(socket);
    socket.write('Welcome to Chat World! ' + emoji.get('coffee') + '\n\r');
    socket.on('data', function (data) {
        console.log(data.toString());
    });
});
chatServer.listen(port);
