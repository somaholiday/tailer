const fetch = require("node-fetch");
const TailFile = require("@logdna/tail-file");

const LOG_FILE = "/Users/soma/Library/Logs/Micro Snitch.log";
const OPTIONS = {
  encoding: "utf8",
};

const halo_ip = "10.10.10.235";
const api_base_url = `http://${halo_ip}`;

function makeRequest(body) {
  const url = `${api_base_url}/power`;
  fetch(url);
}

const handlers = {
  "Video Device became active": () => {
    makeRequest({ on: true });
    // console.log("On!");
  },
  "Video Device became inactive": () => {
    makeRequest({ on: false });
    // console.log("Off!");
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
