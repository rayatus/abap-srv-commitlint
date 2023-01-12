import express from "express"
import helmet from "helmet";
import commitlint from "@commitlint/core"
import conventional from "@commitlint/config-conventional"

const rawBody = function (req, _res, next) {
  req.setEncoding('utf8');
  req.rawBody = '';
  req.on('data', (chunk) => (req.rawBody += chunk));
  req.on('end', function () {
    next();
  });
}

const isEmptyObject = function (obj) {
  return !obj || Object.keys(obj).length === 0;
}

const mapPayload = function (req) {
  try {
    return { message, rules } = JSON.parse(req.rawBody)
  } catch (error) {
    return {
      message: req.rawBody,
      rules: {}
    }
  }
}

const getDefaultRules = (_req, res) => {
  console.info(`Serving default rules`)
  res.setHeader('content-type', 'application/json')
  res.status(200).send(conventional.rules)
}

const Lint = async (req, res, _next) => {
  const payload = mapPayload(req) //Convert Payload into expected format (JSON)
  const rules = (isEmptyObject(payload.rules))
    ? () => {
      console.info(`No rules provided, linting with Default Conventional Rules`)
      return conventional.rules
    }
    : payload.rules

  const report = await commitlint.lint(payload.message, rules).catch((error) => {
    res.setHeader('content-type', 'application/text')
    res.status(400).send(error.message)
    console.error(`Error: ${error.message}`);
    return
  });

  res.setHeader('content-type', 'application/json')
  res.status(200).send(JSON.stringify(report))
}


export function run() {

  const srv = express()

  //Set Port
  const PORT = process.env.PORT || 8080
  //Hook server to port
  srv.listen(PORT, () => {
    console.log('Server is up')           
  })

  //inject helmet for header offuscation
  srv.use(helmet());
  //allow to manually parse Body, in case client sends a JSON in text/plain
  srv.use(rawBody);
  //Get default rules  
  srv.get('/default_rules', getDefaultRules(req, res))
  //Execute lint
  srv.post('/lint', Lint(req, res, next))
  //Wrong URI path
  srv.use("*", (req, res) => {
    res.status(404).send(`forbidden: unexpected request to '${req.originalUrl}'`);
  });
}




