import request from "request";

// Author: Liane Cagara, do not own :) its from v20.0 graph api docs
export class APIPage {
  constructor(pageAccessToken) {
    this.token = pageAccessToken;
  }

  sendMessage(content, senderID, callback) {
    let body;
    if (typeof content === "string") {
      body = { text: content };
    } else {
      body = { text: content.body };
      if (content.attachment) {
        body.attachment = content.attachment;
      }
    }

    const promise = new Promise((resolve, reject) => {
      request(
        {
          url: "https://graph.facebook.com/v20.0/me/messages",
          qs: { access_token: this.token },
          method: "POST",
          json: {
            recipient: { id: senderID },
            message: body,
          },
        },
        (error, response, responseBody) => {
          if (error) {
            if (callback) callback(error, null);
            reject(error);
          } else if (responseBody.error) {
            const err = new Error(responseBody.error.message);
            if (callback) callback(err, null);
            reject(err);
          } else {
            if (callback) callback(null, responseBody);
            resolve(responseBody);
          }
        },
      );
    });

    return promise;
  }

  getMessage(messageID, callback) {
    const promise = new Promise((resolve, reject) => {
      request(
        {
          url: `https://graph.facebook.com/v20.0/${messageID}`,
          qs: { access_token: this.token },
          method: "GET",
        },
        (error, response, responseBody) => {
          if (error) {
            if (callback) callback(error, null);
            reject(error);
          } else if (responseBody.error) {
            const err = new Error(responseBody.error.message);
            if (callback) callback(err, null);
            reject(err);
          } else {
            const data = JSON.parse(responseBody);
            if (callback) callback(null, data);
            resolve(data);
          }
        },
      );
    });

    return promise;
  }

  sendAttachment(attachment, senderID, callback) {
    const body = { attachment: attachment };

    const promise = new Promise((resolve, reject) => {
      request(
        {
          url: "https://graph.facebook.com/v20.0/me/messages",
          qs: { access_token: this.token },
          method: "POST",
          json: {
            recipient: { id: senderID },
            message: body,
          },
        },
        (error, response, responseBody) => {
          if (error) {
            if (callback) callback(error, null);
            reject(error);
          } else if (responseBody.error) {
            const err = new Error(responseBody.error.message);
            if (callback) callback(err, null);
            reject(err);
          } else {
            if (callback) callback(null, responseBody);
            resolve(responseBody);
          }
        },
      );
    });

    return promise;
  }

  sendTemplateMessage(templatePayload, senderID, callback) {
    const body = { attachment: { type: "template", payload: templatePayload } };

    const promise = new Promise((resolve, reject) => {
      request(
        {
          url: "https://graph.facebook.com/v20.0/me/messages",
          qs: { access_token: this.token },
          method: "POST",
          json: {
            recipient: { id: senderID },
            message: body,
          },
        },
        (error, response, responseBody) => {
          if (error) {
            if (callback) callback(error, null);
            reject(error);
          } else if (responseBody.error) {
            const err = new Error(responseBody.error.message);
            if (callback) callback(err, null);
            reject(err);
          } else {
            if (callback) callback(null, responseBody);
            resolve(responseBody);
          }
        },
      );
    });

    return promise;
  }

  setMessageReaction(reaction, messageID, callback) {
    const promise = new Promise((resolve, reject) => {
      request(
        {
          url: `https://graph.facebook.com/v20.0/${messageID}/reactions`,
          qs: { access_token: this.token },
          method: "POST",
          json: { reaction_type: reaction },
        },
        (error, response, responseBody) => {
          if (error) {
            if (callback) callback(error, null);
            reject(error);
          } else if (responseBody.error) {
            const err = new Error(responseBody.error.message);
            if (callback) callback(err, null);
            reject(err);
          } else {
            if (callback) callback(null, responseBody);
            resolve(responseBody);
          }
        },
      );
    });

    return promise;
  }
}
