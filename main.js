const fs = require("fs");
const path = require("path");
const axios = require("axios");
const colors = require("colors");
const { HttpsProxyAgent } = require("https-proxy-agent");
const settings = require("./config/config.js");
const { sleep, loadData, getRandomNumber, saveToken, isTokenExpired, saveJson, getRandomElement, generateRandomNumber } = require("./utils/utils.js");
const { headers } = require("./core/header.js");
const { showBanner } = require("./core/banner.js");
const localStorage = require("./localStorage.json");
const { PromisePool } = require("@supercharge/promise-pool");
const refcodes = loadData("reffCodes.txt");
const { Impit } = require("impit");
const UserAgent = require("user-agents");
const { jwtDecode } = require("jwt-decode");
const tokens = loadData("tokens.txt");

class ClientAPI {
  constructor(itemData, accountIndex, proxy) {
    this.headers = headers;
    this.baseURL = settings.BASE_URL;
    this.baseURL_v2 = settings.BASE_URL_V2;
    this.localItem = null;
    this.itemData = itemData;
    this.accountIndex = accountIndex;
    this.proxy = proxy;
    this.proxyIP = null;
    this.session_name = null;
    this.session_user_agents = this.#load_session_data();
    this.token = null;
    this.identity_token = null;
    this.localStorage = localStorage;
    this.provider = null;
    this.sepoProvider = null;
    this.refCode = getRandomElement(refcodes) || settings.REF_CODE;
    this.sessionCookie = null;
    this.impit = new Impit({
      browser: "chrome",
      ignoreTlsErrors: true,
      headers: this.headers,
      ...(settings.USE_PROXY && this.proxy ? { proxyUrl: this.proxy } : {}),
    });
  }

  #load_session_data() {
    try {
      const filePath = path.join(process.cwd(), "session_user_agents.json");
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return {};
      } else {
        throw error;
      }
    }
  }

  #get_user_agent() {
    if (this.session_user_agents[this.session_name]) {
      return this.session_user_agents[this.session_name];
    }
    const agent = new UserAgent({
      deviceCategory: "desktop",
    }).random();
    const newUserAgent = agent.toString();
    this.session_user_agents[this.session_name] = newUserAgent;
    this.#save_session_data(this.session_user_agents);
    return newUserAgent;
  }

  #save_session_data(session_user_agents) {
    const filePath = path.join(process.cwd(), "session_user_agents.json");
    fs.writeFileSync(filePath, JSON.stringify(session_user_agents, null, 2));
  }

  #get_platform(userAgent) {
    const platformPatterns = [
      { pattern: /iPhone/i, platform: "ios" },
      { pattern: /Android/i, platform: "android" },
      { pattern: /iPad/i, platform: "ios" },
    ];

    for (const { pattern, platform } of platformPatterns) {
      if (pattern.test(userAgent)) {
        return platform;
      }
    }

    return "Unknown";
  }

  #set_headers() {
    const platform = this.#get_platform(this.#get_user_agent());
    this.headers["sec-ch-ua"] = `Not)A;Brand";v="99", "${platform} WebView";v="127", "Chromium";v="127`;
    this.headers["sec-ch-ua-platform"] = platform;
    this.headers["User-Agent"] = this.#get_user_agent();
  }

  createUserAgent() {
    try {
      this.session_name = this.itemData.sub;
      this.#get_user_agent();
    } catch (error) {
      this.log(`Can't create user agent: ${error.message}`, "error");
      return;
    }
  }

  async log(msg, type = "info") {
    const accountPrefix = `[VOYAGE][${this.accountIndex + 1}][${this.itemData.sub}]`;
    let ipPrefix = "[Local IP]";
    if (settings.USE_PROXY) {
      ipPrefix = this.proxyIP ? `[${this.proxyIP}]` : "[Unknown IP]";
    }
    let logMessage = "";

    switch (type) {
      case "success":
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.green;
        break;
      case "error":
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.red;
        break;
      case "warning":
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.yellow;
        break;
      case "custom":
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.magenta;
        break;
      default:
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.blue;
    }
    console.log(logMessage);
  }

  async checkProxyIP() {
    try {
      const proxyAgent = new HttpsProxyAgent(this.proxy);
      const response = await axios.get("https://api.ipify.org?format=json", { httpsAgent: proxyAgent });
      if (response.status === 200) {
        this.proxyIP = response.data.ip;
        return response.data.ip;
      } else {
        throw new Error(`Cannot check proxy IP. Status code: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Error checking proxy IP: ${error.message}`);
    }
  }

  async makeRequest(
    url,
    method,
    data = {},
    options = {
      retries: 5,
      isAuth: false,
      extraHeaders: {},
      refreshToken: null,
    }
  ) {
    if (!url || typeof url !== "string") {
      throw new Error("URL must be a valid string");
    }
    if (!["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase())) {
      throw new Error("Invalid HTTP method");
    }

    const { retries = 5, isAuth = false, extraHeaders = {}, refreshToken = null } = options;

    const headers = {
      ...this.headers,
      ...(!isAuth
        ? {
            authorization: `Bearer ${this.token}`,
          }
        : {}),
      ...extraHeaders,
    };

    const proxyAgent = settings.USE_PROXY ? new HttpsProxyAgent(this.proxy) : null;

    const fetchOptions = {
      method: method.toUpperCase(),
      headers,
      credentials: "include",
      timeout: 120000,
      ...(proxyAgent ? { agent: proxyAgent } : {}),
      ...(method.toLowerCase() !== "get" ? { body: JSON.stringify(data) } : {}),
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.impit.fetch(url, fetchOptions);
        const jsonResponse = await response.json();
        return {
          responseHeader: response.headers,
          status: response.status,
          success: true,
          data: jsonResponse?.data || jsonResponse,
          error: null,
        };
      } catch (error) {
        const errorStatus = error.status || 500;
        const errorMessage = error?.response?.data?.error || error?.response?.data || error.message;

        if (errorStatus >= 400 && errorStatus < 500) {
          if (errorStatus === 401) {
            return { success: false, status: errorStatus, error: "Access token expried", data: null };
          }
          if (errorStatus === 400) {
            return { success: false, status: errorStatus, error: errorMessage, data: null };
          }
          if (errorStatus === 429) {
            return { success: false, status: errorStatus, error: "You've reached daily limitation", data: null };
          }
          return { success: false, status: errorStatus, error: errorMessage, data: null };
        }

        if (attempt === retries) {
          return { success: false, status: errorStatus, error: errorMessage, data: null };
        }

        await sleep(5);
      }
    }

    return { success: false, status: 500, error: "Request failed after retries", data: null };
  }

  async getUserData() {
    return this.makeRequest(`${settings.BASE_URL}/v1/user/profile`, "get", null, {
      extraHeaders: {},
    });
  }

  async getPoints() {
    return this.makeRequest(`${settings.BASE_URL}/v1/points/balance`, "get", null, {
      extraHeaders: {},
    });
  }

  async checkInStatus() {
    return this.makeRequest(`${settings.BASE_URL}/v1/task/checkin/status`, "get", null, {
      extraHeaders: {},
    });
  }

  async auth() {}

  async checkin() {
    return this.makeRequest(`${settings.BASE_URL}/v1/task/checkin`, "post");
  }

  async onBoard() {
    return this.makeRequest(`${settings.BASE_URL}/v1//auth/onboard`, "post", {
      display_name: `user_${generateRandomNumber(6)}`,
      invite_code: this.refCode || "v_50362288",
    });
  }

  async getValidToken() {
    const existingToken = this.token;
    const { isExpired: isExp, expirationDate } = isTokenExpired(existingToken);
    this.log(`Access token status: ${isExp ? "Expired".yellow : "Valid".green} | Acess token exp: ${expirationDate}`);

    if (existingToken && !isExp) {
      return existingToken;
    }
    return false;
  }

  async handleCheckin() {
    const resCheck = await this.checkInStatus();
    if (resCheck?.data?.checked_in === false) {
      const res = await this.checkin();
      if (res.success) {
        this.log(`Check-in successful! You have earned ${res.data.reward} points.`, "success");
      } else {
        this.log(`Check-in failed: ${res.error || "Unknown error"}`, "warning");
      }
    } else {
      this.log("You have already checked in today, skipping...", "warning");
    }
  }
  async handleSyncData() {
    this.log(`Sync data...`);
    let userData = { success: false, data: null, status: 0 },
      retries = 0;
    do {
      userData = await this.getUserData();
      if (userData?.success) break;
      retries++;
    } while (retries < 1 && userData.status !== 400);

    const piontsRes = await this.getPoints();

    if (userData?.success) {
      const { username, status } = userData.data;
      const { balance } = piontsRes.data;
      this.log(`Ref Code: ${username} | Total points: ${balance} `, "custom");
      if (status == '"onboarding"') {
        this.log(`Apply ref code ${this.refCode} to complete onboarding...`);
        await this.onBoard();
      }
    } else {
      this.log("Can't sync new data...skipping", "warning");
    }
    return userData;
  }

  async runAccount() {
    const accountIndex = this.accountIndex;
    this.session_name = this.itemData.sub;
    this.localItem = JSON.parse(this.localStorage[this.session_name] || "{}");
    this.token = tokens[this.accountIndex];

    this.#set_headers();
    if (settings.USE_PROXY) {
      try {
        this.proxyIP = await this.checkProxyIP();
      } catch (error) {
        this.log(`Cannot check proxy IP: ${error.message}`, "warning");
        return;
      }
    }
    const timesleep = getRandomNumber(settings.DELAY_START_BOT[0], settings.DELAY_START_BOT[1]);
    console.log(`=========Tài khoản ${accountIndex + 1} | ${this.proxyIP || "Local IP"} | Bắt đầu sau ${timesleep} giây...`.green);
    await sleep(timesleep);

    try {
      const token = await this.getValidToken();
      if (!token) return this.log(`Not found token`, "warning");
      this.token = token;

      const userData = await this.handleSyncData();

      if (userData.success) {
        await this.handleCheckin();
      } else {
      }
    } catch (error) {}
  }
}

async function main() {
  console.clear();
  showBanner();
  const privateKeys = loadData("tokens.txt");
  const proxies = loadData("proxy.txt");

  if (privateKeys.length == 0 || (privateKeys.length > proxies.length && settings.USE_PROXY)) {
    console.log("Số lượng proxy và data phải bằng nhau.".red);
    console.log(`Data: ${privateKeys.length}`);
    console.log(`Proxy: ${proxies.length}`);
    process.exit(1);
  }
  if (!settings.USE_PROXY) {
    console.log(`You are running bot without proxies!!!`.yellow);
  }
  let maxThreads = settings.USE_PROXY ? settings.MAX_THEADS : settings.MAX_THEADS_NO_PROXY;

  const data = privateKeys
    .map((val, index) => {
      try {
        const item = jwtDecode(val);
        new ClientAPI(item, index, proxies[index]).createUserAgent();
        return item;
      } catch (error) {
        return null;
      }
    })
    .filter((item) => item !== null);
  await sleep(1);

  while (true) {
    const { results, errors } = await PromisePool.withConcurrency(maxThreads)
      .for(data)
      .process(async (itemData, index, pool) => {
        try {
          const to = new ClientAPI(itemData, index, proxies[index % proxies.length]);
          await Promise.race([to.runAccount(), new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 24 * 60 * 60 * 1000))]);
        } catch (error) {
          console.log("err", error.message);
        } finally {
        }
      });
    await sleep(5);
    console.log(`Completed all account | Waiting ${settings.TIME_SLEEP} minutes to new circle`.magenta);
    await sleep(settings.TIME_SLEEP * 60);
  }
}

main().catch((error) => {
  console.log("Lỗi rồi:", error);
  process.exit(1);
});
