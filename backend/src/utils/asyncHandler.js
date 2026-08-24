// Wraps an async Express route handler so that any rejected promise
// (e.g. a thrown error or failed await) is passed to next(), reaching
// the centralized errorHandler middleware instead of crashing the process.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
