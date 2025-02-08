// making ws variable available in the top level scope
let ws;
let password = localStorage.getItem("password");
if (!password) {
  password = prompt("Enter your cassidy password.");
  localStorage.setItem("password", password);
}

const emojis = ["👍", "💗", "😮", "😂", "😭", "🥲"];
/* create MAX_PROPERTIES variable.

higher = saves more messages.
higher = more pain for browsers.

*/
const MAX_PROPERTIES = 200;

// I'm lazy so I made this, it automatically saves and load localStorage items.
// It's the one responsible for message info.
const infos = new Proxy(
  {},
  {
    get(_, prop) {
      return JSON.parse(localStorage.getItem("infos") || "{}")[prop];
    },
    set(_, prop, value) {
      const storedInfos = JSON.parse(localStorage.getItem("infos") || "{}");

      if (Object.keys(storedInfos).length >= MAX_PROPERTIES) {
        const oldestProp = Object.keys(storedInfos)[0];
        delete storedInfos[oldestProp];
      }

      storedInfos[prop] = value;
      localStorage.setItem("infos", JSON.stringify(storedInfos));
      return true;
    },
  }
);

// Simple, load the convo as array.
function loadConvo() {
  const convo = JSON.parse(localStorage.getItem("convo") || "[]");
  return convo;
}

// window.onload always execute when the page loads..
window.onload = async () => {
  //const reactOptions = document.querySelector("#reactOptions");
  for (const emoji of emojis) {
    reactOptions.innerHTML += `<span onclick="sendReact('${emoji}', '%1')"${emoji}</span>`;
  }
  /*const {
    data: { url },
  } = await axios.get("/ws-url");*/

  function scrollA(e) {
    if (isScrolledBottom(e, 20)) {
      smoothScroll2(e);
    }
  }

  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);
  const ccc = document.querySelector("#ccc");
  // You can freely customize this ws.onopen, just make sure it doesn't do stuffs that may break the page :)

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "login",
        password,
      })
    );
  };
  ws.onmessage = (i) => {
    const data = JSON.parse(i.data);
    switch (data.type) {
      case "login_failure":
        localStorage.removeItem("password");
        break;
      case "message":
        handleMessage(data);
        if (data.botSend) {
          scrollA(ccc);
        } else {
          smoothScroll2(ccc);
        }
        break;
      case "message_reply":
        handleMessage(data);
        if (data.botSend) {
          scrollA(ccc);
        } else {
          smoothScroll2(ccc);
        }
        break;
      case "message_edit":
        handleMessageEdit(data);
        scrollA(ccc);
        break;
    }
  };
  ws.onclose = () => {
    //window.location.href = window.location.href;
    // Lmao refresh
  };
  // Get the chatPad, I don't want to type it every time lmao
  const chatPad = document.getElementById("chatPad");
  // remember the loadConvo function?
  const convo = loadConvo();
  convo.forEach((c) => {
    if (c.message) {
      // Just iterate the shit
      return appendSend({ message: c.message, chatPad });
    }
    // if the message is from bot..
    return appendRep({ body: c.body, messageID: c.messageID, chatPad });
  });
  // After a lot of appending, we gonna scroll the entire page.
  smoothScroll2(ccc);
};
function pushConvo(data) {
  const convo = loadConvo();

  convo.push(data);

  if (convo.length > MAX_PROPERTIES) {
    convo.splice(0, convo.length - MAX_PROPERTIES);
  }
  // This thing saves the convo automatically, and ofc filter the length using the MAX_PROPERTIES, but the length only applies every refresh..

  localStorage.setItem("convo", JSON.stringify(convo));
}
function localEdit(message, messageID) {
  // Self explanatory, save edit changes to your browser
  let convo = loadConvo();
  for (const index in convo) {
    const { messageID: targetID } = convo[index];
    if (messageID === targetID) {
      convo[index].body = message;
    }
  }
  localStorage.setItem("convo", JSON.stringify(convo));
}
// I'm lazy to explain these all, but this one applies the edit changes to the message, uhh how the hell do i explain it, it just applies the edit message data sent by websocket
function handleMessageEdit({ messageID, body }) {
  const doc = document.querySelector(`#${messageID}_text`);
  if (!doc) {
    return;
  }
  doc.innerText = body;
  localEdit(body, messageID);
}
// This one is responsible for appending replies from bot
function appendRep({ body, messageID, chatPad }) {
  pushConvo({ body, messageID, chatPad });
  const elem = document.createElement("span");
  elem.innerHTML += `<div class="response-message-container" id="${messageID}_box"><div class="response-message" ><div onclick="togOpt('${messageID}')" id="${messageID}_text" >${autoAnchor(
    sanitize(body)
  )}</div><span id="${messageID}_options" style="display: none;"><br><br><div class="vanillaButton bnw" onclick="xCopy('${messageID}'); ">Copy</div><br><div class="vanillaButton bnw" onclick="chooseReaction('${messageID}'); ">React</div><br><div class="vanillaButton bnw" onclick="reply('${messageID}')">Reply</div></span></div></div>`;
  chatPad.appendChild(elem);
  animateSend(elem);
}
// some stuffs don't need to be documented
function togOpt(messageID) {
  const elem = document.querySelector(`#${messageID}_options`);
  if (elem.style.display !== "none") {
    elem.style.display = "none";
  } else {
    elem.style.display = "block";
  }
}
function xCopy(id) {
  copyToClipboard(document.querySelector(`#${id}_text`).innerText);
}
// this one also appends but it's a little different one, it appends messages sent by YOU
function appendSendOld({ message, chatPad }) {
  const elem = document.createElement("span");
  pushConvo({ message });
  elem.innerHTML += `<div class="user-message-container"><div class="user-message">${autoAnchor(
    sanitize(message)
  )}</div></div>`;
  chatPad.appendChild(elem);
  animateSend(elem);
}

function appendSend({ message, chatPad }) {
  if (chatPad instanceof HTMLElement) {
    pushConvo({ message });
    const messageContainer =
      chatPad.lastElementChild &&
      chatPad.lastElementChild &&
      chatPad.lastElementChild.classList.contains("user-message-container")
        ? chatPad.lastElementChild
        : document.createElement("div");
    messageContainer.classList.add("user-message-container");

    if (messageContainer instanceof HTMLElement) {
      const userMessage = document.createElement("div");
      userMessage.classList.add("user-message");
      const wrapper = messageContainer.querySelector(".col-user-message")
        ? messageContainer.querySelector(".col-user-message")
        : document.createElement("div");
      wrapper.classList.add("col-user-message");
      userMessage.textContent = message;
      wrapper.append(userMessage);
      messageContainer.append(wrapper);

      chatPad.appendChild(messageContainer);
      animateSend(userMessage);
    }
  }
}

// this handles messages sent by user/bot
function handleMessage(data) {
  const chatPad = document.getElementById("chatPad");
  if (data.messageID) {
    infos[data.messageID] = data;
  }
  if (data.botSend) {
    appendRep({ body: data.body, messageID: data.messageID, chatPad });
  } else {
    let appended = data.body;
    if (data.messageReply) {
      const { body } = infos[data.messageReply.messageID] || {};
      appended = `Replying to: ${limitStr(body, 10)}

${data.body}`;
    }

    appendSend({ message: appended, chatPad });
  }
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {
    return;
  }
  const messageDoc = document.querySelector("#userText");
  messageDoc.focus();
});

document.addEventListener("keydown", function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    send();
  }
});

// this one is for sending messages..
async function send(isReply, mid, extra = {}) {
  const messageDoc = document.querySelector("#userText");

  const message = messageDoc.value.trim();
  if (!message) {
    return alert(
      `You can't send an empty message, please type at the textarea first.`
    );
  }
  let payload = {
    params: {
      body: message,
      messageReply: isReply ? { ...infos[mid] } : null,
      type: isReply ? "message_reply" : "message",
      ...extra,
    },
  };
  ws.send(JSON.stringify(payload.params));

  messageDoc.value = "";
  adjustRows();
}
function chooseReaction(messageID) {
  const reactOpt = document.querySelector("#reactOpt");
  const reactBG = document.querySelector("#reactBG");

  const reactOptions = document.querySelector("#reactOptions");
  reactOptions.innerHTML = "";
  for (const emoji of emojis) {
    reactOptions.innerHTML += `<span onclick="sendReact('${emoji}', '${messageID}')" style="font-size: 30px;">${emoji}</span>  `;
  }
  reactOpt.style.display = "block";
  reactOpt.disabled = false;
  reactBG.style.display = "block";
  reactBG.disabled = false;
}
function sendReact(reaction, messageID) {
  const reactOpt = document.querySelector("#reactOpt");
  const reactBG = document.querySelector("#reactBG");

  const reactOptions = document.querySelector("#reactOptions");
  reactOptions.innerHTML = "";
  reactOpt.style.display = "none";
  reactOpt.disabled = true;
  reactBG.style.display = "none";
  reactBG.disabled = true;

  ws.send(
    JSON.stringify({
      type: "message_reaction",
      reaction,
      messageID,
    })
  );
}
// this one is the oldest cassidy send function, and it sucks but t faster
async function sendOld(isReply, mid, extra = {}) {
  const message = document.getElementById("userText").value?.trim();
  if (!message) {
    return alert(
      `You can't send an empty message, please type at the textarea first.`
    );
  }
  const chatPad = document.getElementById("chatPad");
  document.getElementById("userText").value = "";
  try {
    let appended = message;
    if (isReply) {
      const { body } = infos[mid];
      appended = `Replying to: ${limitStr(body, 10)}

${message}`;
    }
    let payload = {
      params: {
        body: message,
        messageReply: isReply ? { ...infos[mid] } : null,
        type: isReply ? "message_reply" : "message",
        ...extra,
      },
    };
    const emojis = ["👍", "❤️", "😮", "😢", "😠", "👎"];
    if (isReply && emojis.includes(message)) {
      const { messageID, body } = infos[mid];
      appended = `Reacting to ${limitStr(body, 10)}

${message}`;
      payload = {
        params: {
          type: "message_reaction",
          messageID,
          reaction: message,
          userID: 1,
          ...extra,
        },
      };
    }
    appendSend({ message: appended, chatPad });
    smoothScroll();
    const response = await axios.get(`/postWReply`, payload);
    const {
      result,
      result: { body, messageID },
    } = response.data;
    infos[messageID] = result;
    appendRep({ messageID, body, chatPad });
    smoothScroll();
  } catch (err) {
    console.error(err);
  }
}
// Liane ain't documenting these all
async function reply(mid) {
  await send(true, mid);
}
// self explanatory, avoid xss even tho not needed very much since nobody else can chat together..
function sanitize(input) {
  const sanitizedInput = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const sanitizedWithLineBreaks = sanitizedInput.replace(/\n/g, "<br>");

  return sanitizedWithLineBreaks;
}

const textarea = document.getElementById("userText");
const MAX_ROWS = 7;
function adjustRows() {
  const lines = textarea.value.split("\n");
  const rowCount = Math.min(lines.length, MAX_ROWS);

  textarea.setAttribute("rows", rowCount);

  const ccc = document.querySelector("#ccc");
  if (isScrolledBottom(ccc, 20)) {
    ccc.lastElementChild.scrollIntoView({ behavior: "smooth" });
  }
}

function animateSend(element) {
  if (element instanceof HTMLElement) {
    element.animate(
      [
        {
          transform: "translateY(20px)",
          opacity: 0,
        },
        {
          transform: "translateY(0)",
          opacity: 1,
        },
      ],
      {
        duration: 300,
        easing: "ease-out",
      }
    );
  }
}

textarea.addEventListener("input", adjustRows);

function isScrolledBottom(element, allowance) {
  if (!element) return false;

  if (element instanceof HTMLElement) {
    const scrollPosition = element.scrollTop + element.clientHeight;
    const scrollHeight = element.scrollHeight;

    console.log(
      `${scrollPosition} >= ${scrollHeight} - ${allowance} (${
        scrollHeight - allowance
      })`,
      scrollPosition >= scrollHeight - allowance
    );

    return scrollPosition >= scrollHeight - allowance;
  }

  return false;
}
