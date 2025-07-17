const fetch = require("node-fetch"); fetch("http://192.168.2.130:4999/api/metrics/latest").then(r => r.text()).then(console.log).catch(console.error);
