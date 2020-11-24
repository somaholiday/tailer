const fetch = require("node-fetch");
const TailFile = require("@logdna/tail-file");

const LOG_FILE = "/Users/soma/Library/Logs/Micro Snitch.log";
const OPTIONS = {
  encoding: "utf8",
};

const hue_ip = "10.10.10.180";
const user_id = "LzIW1FbvugzxXr4aCyNoeCc9Fd5ywYlpXr9ge7Oo";
const api_base_url = `http://${hue_ip}/api/${user_id}`;
const group = "0";
const url = `${api_base_url}/groups/${group}/action`;

function makeRequest(body) {
  fetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

const handlers = {
  "Video Device became active": () => {
    makeRequest({ on: true });
    console.log("On!");
  },
  "Video Device became inactive": () => {
    makeRequest({ on: false });
    console.log("Off!");
  },
};

function matchHandlers(chunk) {
  Object.entries(handlers).forEach(([str, fn]) => {
    if (chunk.indexOf(str) > -1) {
      fn();
    }
  });
}

const tail = new TailFile(LOG_FILE, OPTIONS);
tail
  .on("data", (chunk) => {
    matchHandlers(chunk);
    // console.log(`# CHUNK\n${chunk}`);
  })
  .on("tail_error", (err) => {
    console.error("TailFile had an error!", err);
  })
  .on("error", (err) => {
    console.error("A TailFile stream error was likely encountered", err);
  })
  .start()
  .catch((err) => {
    console.error("Cannot start. Does the file exist?", err);
  });

function cleanup(code) {
  tail.quit();
  console.log(`About to exit with code ${code}`);
}

process.on("SIGINT", (code) => cleanup(code));
process.on("exit", (code) => cleanup(code));
