const VERIFY_TOKEN = global.Cassidy.config.pageVerifyToken;
const PAGE_ACCESS_TOKEN = global.Cassidy.config.pageAccessToken;
import { APIPage } from "./sendMessage.js";
import { convertEvent } from "./convertEvent.js";

export function creatorX(handleMessage, handlePostback = () => {}) {
  const api = new Proxy(new APIPage(PAGE_ACCESS_TOKEN), {
    get(api, key) {
      if (key in api) {
        return api[key];
      } else {
        return function (...args) {
          global.log(
            "API Warning",
            `api.${key} called with args: ${JSON.stringify(args)} - no effect!`
          );
          console.log(`api.${key}(...) has no effect!`);
        };
      }
    },
    set(api, key, value) {
      global.log("API Set", `Setting api.${key} to: ${JSON.stringify(value)}`);
      api[key] = value;
      return true;
    },
  });

  function handleGetEvents(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    global.log("Webhook Verification", {
      mode,
      token: token ? "[present]" : "[missing]",
      challenge,
    });

    if (mode && token && VERIFY_TOKEN) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        global.log("Webhook Success", "WEBHOOK_VERIFIED");
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        global.log("Webhook Failed", "Invalid mode or token");
        res.sendStatus(403);
      }
    }
  }

  function handleEvents(req, res) {
    const body = req.body;
    global.log("Incoming Event", { body: JSON.stringify(body) });

    if (body.object === "page") {
      global.log("Page Event", `Processing ${body.entry.length} entries`);

      body.entry.forEach((entry, index) => {
        global.log(
          `Entry ${index}`,
          `Processing ${entry.messaging.length} messaging events`
        );

        entry.messaging.forEach((event, msgIndex) => {
          global.log(
            `Message ${msgIndex}`,
            `Event type: ${
              event.message
                ? "message"
                : event.reaction
                ? "reaction"
                : "postback"
            }`
          );

          if (event.message || event.reaction) {
            const convertedEvent = convertEvent(event);
            global.log("Handling Message", { convertedEvent });
            handleMessage(null, convertedEvent, { pageApi: api });
          } else if (event.postback) {
            const convertedEvent = convertEvent(event);
            global.log("Handling Postback", { convertedEvent });
            handlePostback(null, convertedEvent, { pageApi: api });
          }
        });
      });

      global.log("Event Processed", "Sending EVENT_RECEIVED response");
      res.status(200).send("EVENT_RECEIVED");
    } else {
      global.log("Invalid Event", "Not a page object");
      res.sendStatus(404);
    }
  }

  return { handleEvents, handleGetEvents, pageApi: api };
}
