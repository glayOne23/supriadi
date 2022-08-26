const wa = require('@open-wa/wa-automate');
const axios = require('axios')
wa.create({
  sessionId: "COVID_HELPER",
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: 'PT_BR',
  logConsole: false,
  popup: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => start(client));




function send(client) {
  client
}
