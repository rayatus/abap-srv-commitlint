import express from "express"
import helmet from "helmet";
import commitlint from "@commitlint/core"
import conventional from "@commitlint/config-conventional"

const bodyParser = function (req, _res, next) {
  req.setEncoding('utf8')
  req.rawBody = ''
  req.on('data', (chunk) => (req.rawBody += chunk))
  req.on('end', () => next())
}

const isEmptyObject = function (obj) {
  return !obj || Object.keys(obj).length === 0;
}

const mapPayload = function (req) {
  try {
    return ({ message, rules } = JSON.parse(req.rawBody))
  } catch (error) {
    return {
      message: req.rawBody,
      rules: {}
    }
  }
}

const serveDefaultRules = (res) => {
  console.info(`Serving default rules`)
  res.setHeader('content-type', 'application/json')
  res.status(200).send(conventional.rules)
}

const Lint = async (req, res) => {
  const payload = mapPayload(req) //Convert Payload into expected format (JSON)
  console.info(`Linting ${JSON.stringify(payload.message)}`)

  const rules = (isEmptyObject(payload.rules))
    ? conventional.rules  
    : payload.rules

  const report = await commitlint.lint(payload.message, rules).catch((error) => {
    res.setHeader('content-type', 'application/text')
    res.status(400).send(error.message)
    console.error(`Error: ${error.message}`)
    return
  });

  res.setHeader('content-type', 'application/json')
  res.status(200).send(JSON.stringify(report))
}

export default () => {

  const srv = express()
  //inject helmet for header offuscation
  srv.use(helmet());
  //allow to manually parse Body, in case client sends a JSON in text/plain
  srv.use(bodyParser);

  //Hook server to port
  srv.listen(process.env.PORT || 8080, () => { console.log('Server is up') })
  //Get default rules  
  srv.get('/default_rules', (_req, res) => serveDefaultRules(res))
  //Execute lint
  srv.post('/lint', (req, res) => Lint(req, res))
  //Wrong URI path
  srv.use("*", (req, res) => {
    res.status(404).send(`forbidden: unexpected request to '${req.originalUrl}'`);
  });
}