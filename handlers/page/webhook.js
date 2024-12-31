const VERIFY_TOKEN = global.Cassidy.config.pageVerifyToken;

const PAGE_ACCESS_TOKEN = global.Cassidy.config.pageAccessToken;
import { APIPage } from "./sendMessage.js";
import { convertEvent } from "./convertEvent.js";
// Verify that the verify token matches
export function creatorX(handleMessage, handlePostback = () => {}) {
  const api = new Proxy(new APIPage(PAGE_ACCESS_TOKEN), {
    get(api, key) {
      if (key in api) {
        return api[key];
      } else {
        return function (...args) {
          console.log(`api.${key}(...) has no effect!`);
        };
      }
    },
    set(api, key, value) {
      api[key] = value;
      return true;
    },
  });
  function handleGetEvents(req, res) {
    // /webhook GET
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  }

  // Handle messages and postbacks and events
  function handleEvents(req, res) {
    // /webhook POST
    const body = req.body;

    if (body.object === "page") {
      body.entry.forEach((entry) => {
        entry.messaging.forEach((event) => {
          if (event.message || event.reaction) {
            handleMessage(null, convertEvent(event), { pageApi });
          } else if (event.postback) {
            handlePostback(null, convertEvent(event), { pageApi });
          }
        });
      });

      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  }
  return { handleEvents, handleGetEvents, pageApi: api };
}
