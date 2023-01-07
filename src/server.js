import express from "express"
import helmet from "helmet";
import commitlint from "@commitlint/core"
import conventional from "@commitlint/config-conventional"

export function run() {

  const srv = express()

  function rawBody(req, _res, next) {
    req.setEncoding('utf8');
    req.rawBody = '';
    req.on('data', function (chunk) {
      req.rawBody += chunk;
    });
    req.on('end', function () {
      next();
    });
  }

  //Set Port
  const PORT = process.env.PORT || 8080
  //Hook server to port
  srv.listen(PORT, () => {
    console.log('Server is up')
  })

  //inject helmet for header offuscation
  srv.use(helmet());
  //allow to parse Body
  srv.use(rawBody);
  //srv.use(express.json())
  //srv.use(express.methodOverride());


  //Ping / Help
  srv.get('/help', (_req, res) => {
    const help = {}

    res.setHeader('content-type', 'application/json')
    res.status(200)
      .send(help)
  })


  //GET default rules
  srv.get('/default_rules', (_req, res) => {
    console.info(`Serving default_rules`)
    res.setHeader('content-type', 'application/json')
    res.status(200)
      .send(conventional.rules)
  })

  //Execute lint
  srv.post('/lint', async (req, res, _next) => {

    console.info(`Begin -> Linting commit message`)
    const payload = getPayload(req)
    console.info(`Payload: ${payload}`)

    let rules = payload.rules
    if (isEmptyObject(rules)) {
      console.info(`No rules provided, linting with Default Conventional Rules`)
      rules = conventional.rules
    }

    try {
      const report = await commitlint.lint(payload.message, rules)

    res.setHeader('content-type', 'application/json')
    res.status(200)
      .send(JSON.stringify(report))

    } catch (error) {
      res.setHeader('content-type', 'application/text')
      res.status(400)
        .send(error.message)
      console.error(`Error: ${error.message}`)
    }
    console.info(`End -> Linting commit message`)
  })

  //Wrong URI path
  srv.use("*", (req, res) => {
    res.status(404).send(`forbidden: unexpected request ${req.originalUrl}`);
  });

  function isEmptyObject(obj) {
    return !obj || Object.keys(obj).length === 0;
  }

  function getPayload(req) {
    if (req.is('json')) {
      return JSON.parse(req.rawBody)
    }
    if (req.is('text/*')) {
      return {
        message: req.rawBody,
        rules: {}
      }
    }

  }
}

