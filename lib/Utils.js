export function toMultiValueArray(query) {
  const response = {};

  Object.entries(query).forEach(([key, value]) => {
    response[key] = Array.isArray(value) ? value : [value];
  });

  return response;
}

export function replacePathParams(path) {
  const REGEX = /{([^}]+)}/g;
  return path.replace(REGEX, ":$1");
}
