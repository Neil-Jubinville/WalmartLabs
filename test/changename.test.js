const net = require("net");
const { count } = require("console");
const port = { port: 2300 };
let socket;

test("Change Name", async (done) => {
  msgCount = 0;
  socket = net.createConnection(port, () => {
    socket.write("#name=Hiro");
  });
  await socket.on("data", (data) => {
    msgCount++;
    if (msgCount > 1) {
      expect(data.toString()).toMatch(/Hiro/);
      socket.destroy();
      done();
    }
  });
});
