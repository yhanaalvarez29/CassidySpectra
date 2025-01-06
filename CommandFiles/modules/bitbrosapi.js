import axios from "axios";

export class BitBrosAPI {
  constructor({ username, password, token }) {
    this.username = String(username);
    this.password = String(password);
    this.token = String(token);
    this.base = "https://bb.ruii.site";
  }

  async init(willSignup = false, strict) {
    let isTokenFine = false;
    if (this.token) {
      try {
        console.log("Fetching if token is correct:", this.token);
        const response = await axios.post(`${this.base}/verifyToken`, {
          token: this.token,
        });
        let { message } = response.data;
        message = String(message);
        if (message === "Token is valid") {
          isTokenFine = true;
        }
      } catch (error) {
        console.error(error?.response || error);
      }
    }
    if (!isTokenFine) {
      const { username, password } = this;

      if (willSignup) {
        try {
          const response = await axios.post(`${this.base}/api/signup`, {
            username,
            password,
          });

          console.log("Signup Success!");
        } catch (error) {
          console.error(error?.response || error);
          if (strict) {
            throw new Error(
              `Signup failed: ${
                error?.response?.data?.message || error.message
              }`
            );
          }
          console.error(
            `Signup failed : ${error?.response?.data?.message || error.message}`
          );
        }
      }
      try {
        const response = await axios.post(`${this.base}/api/login`, {
          username,
          password,
        });
        const { token } = response.data;
        this.token = String(token);
        isTokenFine = true;
        console.log("Login Success!");
      } catch (error) {
        console.error(error?.response || error);
        throw new Error(
          `Login failed: ${error?.response?.data?.message || error.message}`
        );
      }
    }
  }

  async getUserInfo() {
    const response = await axios.post(`${base}/api/getUserInfo`, {
      token: this.token,
    });
    const { userInfo } = response.data;
    return {
      ...userInfo,
      userID: userInfo.userID,
      money: userInfo.money,
      username: userInfo.username,
      name: userInfo.username,
      admin: userInfo.admin,
      isAdmin: userInfo.isAdmin,
      depositMoney: userInfo.depositMoney,
    };
  }

  async setMoney(money) {
    money = Number(money);

    const response = await axios.post(`${base}/api/setMoney`, {
      token: this.token,
      money,
    });

    return response.data;
  }
}
