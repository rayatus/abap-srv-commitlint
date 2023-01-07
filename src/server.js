import express from "express"
import commitlint from "@commitlint/core"
import conventional from "@commitlint/config-conventional"

export function run() {

  const PORT = process.env.PORT || 8080

  const srv = express()

  //allow to parse Body
  srv.use(express.json())

  //Hook server to port
  srv.listen(PORT, () => {
    console.log('Server is up')
  })

  //Ping / Help
  srv.get('/', (req, res) => {
    const help = {}

    res.setHeader('content-type', 'application/json')
    res.status(200)
      .send(help)
  })


  //GET default rules
  srv.get('/default_rules', (req, res) => {
    res.setHeader('content-type', 'application/json')
    res.status(200)
      .send(conventional.rules)
  })

  //Execute lint
  srv.post('/lint', async (req, res) => {
    const rules = isEmptyObject(req.body.rules) ? conventional.rules : req.body.rules
    const report = await commitlint.lint(req.body.message, rules)

    res.setHeader('content-type', 'application/json')
    res.status(200)
      .send(JSON.stringify(report))
  })

  function isEmptyObject(obj) {
    return !obj || Object.keys(obj).length === 0;
  }
}

