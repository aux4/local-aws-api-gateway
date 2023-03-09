import { replacePathParams, toMultiValueArray } from "./Utils.js";

export function createLocalRestAPI(app, mappings) {
  const methods = {
    OPTIONS: (path, callback) => app.options(path, callback),
    HEAD: (path, callback) => app.head(path, callback),
    GET: (path, callback) => app.get(path, callback),
    POST: (path, callback) => app.post(path, callback),
    PUT: (path, callback) => app.put(path, callback),
    DELETE: (path, callback) => app.delete(path, callback)
  };

  mappings.forEach(mapping => {
    methods[mapping.method](replacePathParams(mapping.path), (req, res) => {
      const event = {
        body: typeof req.body === "string" ? req.body : JSON.stringify(req.body),
        headers: req.headers,
        pathParameters: req.params,
        queryStringParameters: req.query,
        multiValueQueryStringParameters: toMultiValueArray(req.query)
      };

      mapping
        .handler(event)
        .then(response => {
          const contentType = (response.headers && response.headers["Content-Type"]) || "application/json";
          res.setHeader("Content-Type", contentType);

          Object.keys(response.headers || {}).forEach(name => {
            res.setHeader(name, response.headers[name]);
          });

          res.status(response.statusCode || 200).send(response.body);
        })
        .catch(err => {
          console.error("[ERROR]", err.message, err);
          res.status(500).send({ message: err.message, cause: err.stack });
        });
    });
  });
}
