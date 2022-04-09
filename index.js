const http = require('http')
const fs = require('fs')

const SOCKET = process.argv.length > 2 ? process.argv[2] : './http.sock'

try {
  fs.unlinkSync(SOCKET)
} catch (err) {}

const oui = JSON.parse(fs.readFileSync('./oui.json'))

const server = http.createServer((req, res) => {
  let date = new Date().toLocaleString()
  console.log(`${date} ${req.method} ${req.url}`)

  let m = null
  if (req.method == 'GET' && (m = req.url.match(/^\/([0-9a-f:,]+)/i))) {
    let prefixs = m[1]
      .split(',')
      .map((mac) => mac.replace(/:/g, '').toUpperCase())
      .filter((mac) => mac.length == 6)

    let result = prefixs
      .map((prefix) => {
        if (!oui[prefix]) {
          return null
        }

        let [provider, addr1, addr2, country] = oui[prefix].split('\n')

        return { provider, country, prefix }
      })
      .filter((x) => x)

    if (!result.length) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      return res.end(`404 - not found`)
    }

    if (prefixs.length == 1) {
      result = result[0]
    }

    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify(result))
    return res.end()
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('404 - File not found')
})

const shutdown = () => {
  server.close()
}

server.listen(SOCKET)

process.on('exit', shutdown)
process.on('SIGINT', shutdown)
