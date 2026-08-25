// Wraps an async route handler so a rejected promise (e.g. a failed DB
// query) is passed to next(err) instead of crashing the process or hanging
// the request. Express doesn't do this automatically for async handlers.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
