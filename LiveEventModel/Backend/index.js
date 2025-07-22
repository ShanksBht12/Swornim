const http = require("http");
const app = require("./src/config/express.config");
const os = require('os');

const httpServer = http.createServer(app);
const PORT = 9009;
const host = "0.0.0.0"; // Allows access from other devices on the same network

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

httpServer.listen(PORT, host, (err) => {
  if (err) {
    console.error("Error starting server:", err);
    return;
  }

  const localIP = getLocalIP();
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://${localIP}:${PORT}`);
});
