// Auto-NGROK
const { exec } = require('child_process');
exec(`ngrok authtoken ${process.env.NGROK_AUTH} && ngrok http ${process.env.PORT}`, (err, stdout) => {
  console.log("NGROK:", stdout);
});