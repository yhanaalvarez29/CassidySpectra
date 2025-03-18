// Commenting everything to make sure I wouldn't loose track of what I was doing
export const meta = {
  name: "botpack-utils",
  author: "Botpack | Mirai | Liane Cagara",
  version: "1.0.0",
  description:
    "Important utils like Users, Threads, and Currencies to make them compatible with Cassidy.",
  supported: "^1.0.0",
  order: 2,
  type: "plugin",
};

// Utility functions to manage user data (I rewrote 'em all)
function createUsers({ api }) {
  const { writeFileSync, existsSync } = require("fs");
  const path = `${__dirname}/data/botpack-usersData.json`;

  let usersData = {};

  // Initialize user data file if it doesn't exist
  if (!existsSync(path)) {
    writeFileSync(path, "{}", { flag: "a+" });
  } else {
    usersData = require(path);
  }

  // Save user data to file
  async function saveData(data) {
    if (!data) throw new Error("Data cannot be empty");
    writeFileSync(path, JSON.stringify(data, null, 4));
    return true;
  }

  // Get user info (deprecated, dangerous)
  async function getInfo(id) {
    throw new Error("Users.getInfo is deprecated.");
  }

  // Get user name by user ID
  async function getNameUser(userID) {
    if (!userID) throw new Error("User ID cannot be blank");
    if (isNaN(userID)) throw new Error("Invalid user ID");
    const { [userID]: user } = await api.getUserInfo(userID);
    return user?.name || "Facebook users";
  }

  // Get full user info including email, about, birthday, and link, does not work since no accessToken
  async function getUserFull(id) {
    try {
      const response = await api.httpGet(
        `https://graph.facebook.com/${id}?fields=email,about,birthday,link&access_token=${global.Cassidy.accessToken}`,
      );
      const userInfo = JSON.parse(response);
      return {
        error: 0,
        author: "D-Jukie",
        data: {
          uid: userInfo.id || null,
          about: userInfo.about || null,
          link: userInfo.link || null,
          imgavt: `https://graph.facebook.com/${userInfo.id}/picture?height=1500&width=1500&access_token=1073911769817594|aa417da57f9e260d1ac1ec4530b417de`,
        },
      };
    } catch (error) {
      return { error: 1, author: "D-Jukie", data: {} };
    }
  }

  // Get all users or specific user keys, as Array
  async function getAll(keys, callback) {
    try {
      if (!keys) return Object.values(usersData);
      if (!Array.isArray(keys))
        throw new Error("The input parameter must be an array");
      const data = Object.entries(usersData).map(([userID, userData]) => {
        const user = { ID: userID };
        keys.forEach((key) => (user[key] = userData[key]));
        return user;
      });
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  // Get user data by user ID
  async function getData(userID, callback) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");
      if (isNaN(userID)) throw new Error("Invalid user ID");
      if (!usersData[userID]) await createData(userID);
      const data = usersData[userID];
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  // Set user data by user ID (options can merge the current data)
  async function setData(userID, options, callback) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");
      if (isNaN(userID)) throw new Error("Invalid user ID");
      if (!usersData[userID])
        throw new Error(`User ID: ${userID} does not exist in Database`);
      if (typeof options !== "object")
        throw new Error("The options parameter must be an object");
      usersData[userID] = { ...usersData[userID], ...options };
      await saveData(usersData);
      callback?.(null, usersData[userID]);
      return usersData[userID];
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  // Delete user data by user ID
  async function delData(userID, callback) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");
      if (isNaN(userID)) throw new Error("Invalid user ID");
      if (!usersData[userID])
        throw new Error(`User ID: ${userID} does not exist in Database`);
      delete usersData[userID];
      await saveData(usersData);
      callback?.(null, usersData);
      return usersData;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  // Create user data for a new user ID (helper function)
  async function createData(userID, callback) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");
      if (isNaN(userID)) throw new Error("Invalid user ID");
      if (usersData[userID])
        throw new Error(`User ID: ${userID} already exists in Database`);
      const data = {
        [userID]: {
          userID,
          money: 0,
          exp: 0,
          createTime: { timestamp: Date.now() },
          data: { timestamp: Date.now() },
          lastUpdate: Date.now(),
        },
      };
      Object.assign(usersData, data);
      await saveData(usersData);
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  return {
    getInfo, // deprecated
    getNameUser,
    getAll,
    getData,
    setData,
    delData,
    createData,
    getUserFull,
  };
}

// Utility functions to manage thread data
function createThreads({ api }) {
  const Users = createUsers({ api });
  const { writeFileSync, existsSync } = require("fs");
  const path = `${__dirname}/data/threadsData.json`;

  let threadsData = {};

  // Initialize thread data file if it doesn't exist
  if (!existsSync(path)) {
    writeFileSync(path, "{}", { flag: "a+" });
  } else {
    threadsData = require(path);
  }

  // Get thread info (deprecated, dangerous asf)
  async function getInfo(threadID) {
    throw new Error("Threads.getInfo is deprecated.");
  }

  // Get thread data by thread ID
  async function getData(threadID, callback) {
    try {
      if (!threadID) throw new Error("Thread ID cannot be empty");
      if (isNaN(threadID)) throw new Error("Invalid thread ID");
      if (!threadsData[threadID]) await createData(threadID);
      const data = threadsData[threadID];
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  // Save thread data to file
  async function saveData(data) {
    if (!data) throw new Error("Data cannot be empty");
    writeFileSync(path, JSON.stringify(data, null, 4));
    return true;
  }

  // Get all threads or specific thread keys as Areay
  async function getAll(keys, callback) {
    try {
      if (!keys) return Object.values(threadsData);
      if (!Array.isArray(keys))
        throw new Error("The input parameter must be an array");
      const data = Object.entries(threadsData).map(([ID, threadData]) => {
        const thread = { ID };
        keys.forEach((key) => (thread[key] = threadData[key]));
        return thread;
      });
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  // Set thread data by thread ID
  async function setData(threadID, options, callback) {
    try {
      if (!threadID) throw new Error("Thread ID cannot be empty");
      if (isNaN(threadID)) throw new Error("Invalid thread ID");
      if (!threadsData[threadID])
        throw new Error(
          `Thread with ID: ${threadID} does not exist in Database`,
        );
      if (typeof options !== "object")
        throw new Error("The options parameter must be an object");
      threadsData[threadID] = { ...threadsData[threadID], ...options };
      await saveData(threadsData);
      callback?.(null, threadsData[threadID]);
      return threadsData[threadID];
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  // Delte thread data by thread ID
  async function delData(threadID, callback) {
    try {
      if (!threadID) throw new Error("Thread ID cannot be empty");
      if (isNaN(threadID)) throw new Error("Invalid thread ID");
      if (!threadsData[threadID])
        throw new Error(
          `Thread with ID: ${threadID} does not exist in Database`,
        );
      delete threadsData[threadID];
      await saveData(threadsData);
      callback?.(null, `Thread with ID: ${threadID} successfully removed`);
      return true;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  // Create thread data for a new thread ID (helper)
  async function createData(threadID, callback) {
    try {
      if (!threadID) throw new Error("Thread ID cannot be empty");
      if (isNaN(threadID)) throw new Error("Invalid thread ID");
      if (threadsData[threadID])
        throw new Error(
          `Thread with ID: ${threadID} already exists in Database`,
        );

      const threadInfo = await api.getThreadInfo(threadID);
      const data = {
        [threadID]: {
          threadInfo: {
            threadID,
            threadName: threadInfo.threadName,
            emoji: threadInfo.emoji,
            adminIDs: threadInfo.adminIDs,
            participantIDs: threadInfo.participantIDs,
            isGroup: threadInfo.isGroup,
          },
          createTime: {
            timestamp: Date.now(),
          },
          data: {
            timestamp: Date.now(),
          },
        },
      };

      Object.assign(threadsData, data);

      const dataUser = global.data.allUserID;
      for (const singleData of threadInfo.userInfo) {
        if (singleData.gender !== undefined) {
          try {
            if (
              dataUser.includes(singleData.id) ||
              Users.hasOwnProperty(singleData.id)
            )
              continue;
            dataUser.push(singleData.id);
            await Users.createData(singleData.id);
          } catch (e) {
            console.log(e);
          }
        }
      }

      await saveData(threadsData);
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  return {
    getInfo, // deprecated
    getAll,
    getData,
    setData,
    delData,
    createData,
  };
}

// Finally, we are here
export async function use(obj) {
  obj.Users = createUsers({ api: obj.origAPI });
  obj.Threads = createThreads({ api: obj.origAPI });
  // I'm not going to automatically save their data
  obj.next();
}
