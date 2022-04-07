const http = require('http')
const fs = require('fs')

const SOCKET = './http.sock'

const oui = JSON.parse(fs.readFileSync('./oui.json'))

const server = http.createServer((req, res) => {
  console.log(` ${req.method} ${req.url}`)

  let m = null
  if (req.method == 'GET' && (m = req.url.match(/^\/oui\/([0-9a-f]{6})/i))) {
    let prefix = m[1]
    res.setHeader('Content-Type', 'application/json')
    let data = oui[prefix] || null
    let [provider, addr1, addr2, country] = data.split('\n')
    let result = data ? { provider, country } : { error: 'not found' }

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

process.on('SIGINT', shutdown)