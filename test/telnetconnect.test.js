const net = require("net");
const port = { port: 2300 };
let socket;

test("Server Socket Connection and Welcome", async (done) => {
  socket = net.createConnection(port, () => {});
  await socket.on("data", async (data) => {
    expect(data.toString()).toMatch(/Welcome to Chat World!/);
    socket.destroy();
    done();
  });
});
