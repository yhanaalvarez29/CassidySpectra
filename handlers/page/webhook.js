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
          global.logger(
            `api.${key} called with args: ${JSON.stringify(args)} - no effect!`,
            "API Warning"
          );
          console.log(`api.${key}(...) has no effect!`);
        };
      }
    },
    set(api, key, value) {
      global.logger(
        `Setting api.${key} to: ${JSON.stringify(value)}`,
        "API Set"
      );
      api[key] = value;
      return true;
    },
  });

  function handleGetEvents(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    global.logger(
      JSON.stringify({
        mode,
        token: token ? "[present]" : "[missing]",
        challenge,
      }),
      "Webhook Verification"
    );

    if (mode && token && VERIFY_TOKEN) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        global.logger("WEBHOOK_VERIFIED", "Webhook Success");
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        global.logger("Invalid mode or token", "Webhook Failed");
        res.sendStatus(403);
      }
    }
  }

  function handleEvents(req, res) {
    const body = req.body;
    global.logger(JSON.stringify(body), "Incoming Event");

    if (body.object === "page") {
      global.logger(
        `Processing ${body.entry.length} entries`,
        "Page Event"
      );

      body.entry.forEach((entry, index) => {
        global.logger(
          `Processing ${entry.messaging.length} messaging events`,
          `Entry ${index}`
        );

        entry.messaging.forEach((event, msgIndex) => {
          global.logger(
            `Event type: ${
              event.message
                ? "message"
                : event.reaction
                ? "reaction"
                : "postback"
            }`,
            `Message ${msgIndex}`
          );

          if (event.message || event.reaction) {
            const convertedEvent = convertEvent(event);
            global.logger(
              JSON.stringify(convertedEvent),
              "Handling Message"
            );
            handleMessage(null, convertedEvent, { pageApi: api });
          } else if (event.postback) {
            const convertedEvent = convertEvent(event);
            global.logger(
              JSON.stringify(convertedEvent),
              "Handling Postback"
            );
            handlePostback(null, convertedEvent, { pageApi: api });
          }
        });
      });

      global.logger("Sending EVENT_RECEIVED response", "Event Processed");
      res.status(200).send("EVENT_RECEIVED");
    } else {
      global.logger("Not a page object", "Invalid Event");
      res.sendStatus(404);
    }
  }

  return { handleEvents, handleGetEvents, pageApi: api };
}