require("dotenv").config();
const { _isArray } = require("../utils/utils.js");

const settings = {
  TIME_SLEEP: process.env.TIME_SLEEP ? parseInt(process.env.TIME_SLEEP) : 8,
  MAX_THEADS: process.env.MAX_THEADS ? parseInt(process.env.MAX_THEADS) : 10,
  MAX_LEVEL_SPEED: process.env.MAX_LEVEL_SPEED ? parseInt(process.env.MAX_LEVEL_SPEED) : 10,
  MAX_THEADS_NO_PROXY: process.env.MAX_THEADS_NO_PROXY ? parseInt(process.env.MAX_THEADS_NO_PROXY) : 10,
  AMOUNT_REF: process.env.AMOUNT_REF ? parseInt(process.env.AMOUNT_REF) : 100,
  NUMBER_CHAT: process.env.NUMBER_CHAT ? parseInt(process.env.NUMBER_CHAT) : 100,
  NUMBER_SEND: process.env.NUMBER_SEND ? parseInt(process.env.NUMBER_SEND) : 10,
  NUMBER_SWAP: process.env.NUMBER_SWAP ? parseInt(process.env.NUMBER_SWAP) : 10,
  NUMBER_BORROW: process.env.NUMBER_BORROW ? parseInt(process.env.NUMBER_BORROW) : 10,
  NUMBER_REPAY: process.env.NUMBER_REPAY ? parseInt(process.env.NUMBER_REPAY) : 10,

  NUMBER_BRIDGE: process.env.NUMBER_BRIDGE ? parseInt(process.env.NUMBER_BRIDGE) : 10,
  NUMBER_DEPOSIT: process.env.NUMBER_DEPOSIT ? parseInt(process.env.NUMBER_DEPOSIT) : 10,
  NUMBER_STAKE: process.env.NUMBER_STAKE ? parseInt(process.env.NUMBER_STAKE) : 10,

  NUMBER_WITHDRAW: process.env.NUMBER_WITHDRAW ? parseInt(process.env.NUMBER_WITHDRAW) : 10,

  NUMBER_ADDLP: process.env.NUMBER_ADDLP ? parseInt(process.env.NUMBER_ADDLP) : 10,
  NUMBER_MINT: process.env.NUMBER_MINT ? parseInt(process.env.NUMBER_MINT) : 10,
  AMOUNT_CHAT: process.env.AMOUNT_CHAT ? parseInt(process.env.AMOUNT_CHAT) : 10,

  SKIP_TASKS: process.env.SKIP_TASKS ? JSON.parse(process.env.SKIP_TASKS.replace(/'/g, '"')) : [],
  TYPE_HERO_UPGRADE: process.env.TYPE_HERO_UPGRADE ? JSON.parse(process.env.TYPE_HERO_UPGRADE.replace(/'/g, '"')) : [],
  TYPE_HERO_RESET: process.env.TYPE_HERO_RESET ? JSON.parse(process.env.TYPE_HERO_RESET.replace(/'/g, '"')) : [],
  TOKENS_FAUCET: process.env.TOKENS_FAUCET ? JSON.parse(process.env.TOKENS_FAUCET.replace(/'/g, '"')) : [],
  TASKS_ID: process.env.TASKS_ID ? JSON.parse(process.env.TASKS_ID.replace(/'/g, '"')) : [],
  OPTIONS_BRIDGE: process.env.OPTIONS_BRIDGE ? JSON.parse(process.env.OPTIONS_BRIDGE.replace(/'/g, '"')) : [],
  OPTIONS_SWAP: process.env.OPTIONS_SWAP ? JSON.parse(process.env.OPTIONS_SWAP.replace(/'/g, '"')) : [],

  AUTO_TASK: process.env.AUTO_TASK ? process.env.AUTO_TASK.toLowerCase() === "true" : false,
  AUTO_CHAT: process.env.AUTO_CHAT ? process.env.AUTO_CHAT.toLowerCase() === "true" : false,
  SEND_RANDOM: process.env.SEND_RANDOM ? process.env.SEND_RANDOM.toLowerCase() === "true" : false,

  AUTO_SHOW_COUNT_DOWN_TIME_SLEEP: process.env.AUTO_SHOW_COUNT_DOWN_TIME_SLEEP ? process.env.AUTO_SHOW_COUNT_DOWN_TIME_SLEEP.toLowerCase() === "true" : false,
  AUTO_MINT: process.env.AUTO_MINT ? process.env.AUTO_MINT.toLowerCase() === "true" : false,
  AUTO_FAUCET_SWAP: process.env.AUTO_FAUCET_SWAP ? process.env.AUTO_FAUCET_SWAP.toLowerCase() === "true" : false,
  ENABLE_DEBUG: process.env.ENABLE_DEBUG ? process.env.ENABLE_DEBUG.toLowerCase() === "true" : false,

  AUTO_STAKE: process.env.AUTO_STAKE ? process.env.AUTO_STAKE.toLowerCase() === "true" : false,
  AUTO_BRIDGE: process.env.AUTO_BRIDGE ? process.env.AUTO_BRIDGE.toLowerCase() === "true" : false,
  AUTO_FAUCET_STABLE_COIN: process.env.AUTO_FAUCET_STABLE_COIN ? process.env.AUTO_FAUCET_STABLE_COIN.toLowerCase() === "true" : false,
  AUTO_CONNECT_SOCIALS: process.env.AUTO_CONNECT_SOCIALS ? process.env.AUTO_CONNECT_SOCIALS.toLowerCase() === "true" : false,

  AUTO_ADDLP: process.env.AUTO_ADDLP ? process.env.AUTO_ADDLP.toLowerCase() === "true" : false,

  ADVANCED_ANTI_DETECTION: process.env.ADVANCED_ANTI_DETECTION ? process.env.ADVANCED_ANTI_DETECTION.toLowerCase() === "true" : false,
  AUTO_BORROW: process.env.AUTO_BORROW ? process.env.AUTO_BORROW.toLowerCase() === "true" : false,
  AUTO_SUPPLY: process.env.AUTO_SUPPLY ? process.env.AUTO_SUPPLY.toLowerCase() === "true" : false,
  AUTO_WITHDRAW: process.env.AUTO_WITHDRAW ? process.env.AUTO_WITHDRAW.toLowerCase() === "true" : false,
  AUTO_DEPOSIT: process.env.AUTO_DEPOSIT ? process.env.AUTO_DEPOSIT.toLowerCase() === "true" : false,

  AUTO_REPAY: process.env.AUTO_REPAY ? process.env.AUTO_REPAY.toLowerCase() === "true" : false,

  USE_PROXY: process.env.USE_PROXY ? process.env.USE_PROXY.toLowerCase() === "true" : false,
  AUTO_UNSTAKE: process.env.AUTO_UNSTAKE ? process.env.AUTO_UNSTAKE.toLowerCase() === "true" : false,
  AUTO_FAUCET: process.env.AUTO_FAUCET ? process.env.AUTO_FAUCET.toLowerCase() === "true" : false,
  AUTO_SWAP: process.env.AUTO_SWAP ? process.env.AUTO_SWAP.toLowerCase() === "true" : false,
  AUTO_SEND: process.env.AUTO_SEND ? process.env.AUTO_SEND.toLowerCase() === "true" : false,
  SEND_ALL_TOKEN: process.env.SEND_ALL_TOKEN ? process.env.SEND_ALL_TOKEN.toLowerCase() === "true" : false,

  API_ID: process.env.API_ID ? process.env.API_ID : null,
  BASE_URL: process.env.BASE_URL ? process.env.BASE_URL : null,
  BASE_URL_V2: process.env.BASE_URL_V2 ? process.env.BASE_URL_V2 : "https://testnet-router.zenithswap.xyz",
  REF_CODE: process.env.REF_CODE ? process.env.REF_CODE : "6KrCMbaT8IZqPYUm",
  RPC_URL: process.env.RPC_URL ? process.env.RPC_URL : "https://evmrpc-testnet.0g.ai",
  RPC_KITE: process.env.RPC_KITE ? process.env.RPC_KITE : null,
  RPC_BASE: process.env.RPC_BASE ? process.env.RPC_BASE : null,

  CHAIN_ID: process.env.CHAIN_ID ? process.env.CHAIN_ID : 688688,

  TYPE_CAPTCHA: process.env.TYPE_CAPTCHA ? process.env.TYPE_CAPTCHA : null,
  API_KEY_2CAPTCHA: process.env.API_KEY_2CAPTCHA ? process.env.API_KEY_2CAPTCHA : null,
  API_KEY_ANTI_CAPTCHA: process.env.API_KEY_ANTI_CAPTCHA ? process.env.API_KEY_ANTI_CAPTCHA : null,
  CAPTCHA_URL: process.env.CAPTCHA_URL ? process.env.CAPTCHA_URL : null,
  WEBSITE_KEY: process.env.WEBSITE_KEY ? process.env.WEBSITE_KEY : null,
  NEURA_RPC: process.env.NEURA_RPC ? process.env.NEURA_RPC : null,
  SEPOLIA_RPC: process.env.SEPOLIA_RPC ? process.env.SEPOLIA_RPC : null,
  NEURA_CHAIN_ID: process.env.NEURA_CHAIN_ID ? process.env.NEURA_CHAIN_ID : null,
  SEPOLIA_CHAIN_ID: process.env.SEPOLIA_CHAIN_ID ? process.env.SEPOLIA_CHAIN_ID : null,

  DELAY_BETWEEN_REQUESTS: process.env.DELAY_BETWEEN_REQUESTS && _isArray(process.env.DELAY_BETWEEN_REQUESTS) ? JSON.parse(process.env.DELAY_BETWEEN_REQUESTS) : [1, 5],
  DELAY_START_BOT: process.env.DELAY_START_BOT && _isArray(process.env.DELAY_START_BOT) ? JSON.parse(process.env.DELAY_START_BOT) : [1, 15],
  AMOUNT_STAKE: process.env.AMOUNT_STAKE && _isArray(process.env.AMOUNT_STAKE) ? JSON.parse(process.env.AMOUNT_STAKE) : [1, 15],
  AMOUNT_BRIDGE: process.env.AMOUNT_BRIDGE && _isArray(process.env.AMOUNT_BRIDGE) ? JSON.parse(process.env.AMOUNT_BRIDGE) : [0.1, 0.5],
  DELAY_TASK: process.env.DELAY_TASK && _isArray(process.env.DELAY_TASK) ? JSON.parse(process.env.DELAY_TASK) : [10, 15],
  AMOUNT_SEND: process.env.AMOUNT_SEND && _isArray(process.env.AMOUNT_SEND) ? JSON.parse(process.env.AMOUNT_SEND) : [0.1, 0.2],
  AMOUNT_SWAP: process.env.AMOUNT_SWAP && _isArray(process.env.AMOUNT_SWAP) ? JSON.parse(process.env.AMOUNT_SWAP) : [0.1, 0.2],
  AMOUNT_BORROW: process.env.AMOUNT_BORROW && _isArray(process.env.AMOUNT_BORROW) ? JSON.parse(process.env.AMOUNT_BORROW) : [0.1, 0.2],
  AMOUNT_REPAY: process.env.AMOUNT_REPAY && _isArray(process.env.AMOUNT_REPAY) ? JSON.parse(process.env.AMOUNT_REPAY) : [0.1, 0.2],
  AMOUNT_MINT: process.env.AMOUNT_MINT && _isArray(process.env.AMOUNT_MINT) ? JSON.parse(process.env.AMOUNT_MINT) : [0.1, 0.2],
  AMOUNT_DEPOSIT: process.env.AMOUNT_DEPOSIT && _isArray(process.env.AMOUNT_DEPOSIT) ? JSON.parse(process.env.AMOUNT_DEPOSIT) : [0.1, 0.2],

  AMOUNT_SUPLLY: process.env.AMOUNT_SUPLLY && _isArray(process.env.AMOUNT_SUPLLY) ? JSON.parse(process.env.AMOUNT_SUPLLY) : [0.1, 0.2],

  DELAY_CHAT: process.env.DELAY_CHAT && _isArray(process.env.DELAY_CHAT) ? JSON.parse(process.env.DELAY_CHAT) : [5, 30],
};

module.exports = settings;
