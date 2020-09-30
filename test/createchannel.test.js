const net = require("net");
const port = { port: 2300 };
let socket;

test("Create Channel", async (done) => {
  msgCount = 0;
  socket = net.createConnection(port, () => {
    socket.write("#newchannel=metaverse");
  });
  await socket.on("data", (data) => {
    msgCount++;
    if (msgCount > 1) {
      expect(data.toString()).toMatch(/metaverse/);
      socket.destroy();
      done();
    }
  });
});
