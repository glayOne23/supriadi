const wa = require("@open-wa/wa-automate");
const axios = require("axios");
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

wa.create({
  sessionId: "COVID_HELPER",
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  popup: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then((client) => {
  app.use(bodyParser.json());

  app.post("/send", (req, res) => {
    let toNumber = req.body.number;
    let msg = req.body.message;

    console.log(toNumber, msg, req.body);

    if (client) {
      client.sendText(`${toNumber}@c.us`, msg);
    }
    res.send("OK");
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
});