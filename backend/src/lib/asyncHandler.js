import ApiError from "./ApiError.js";

const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return err;
  }

  return new ApiError(
    err?.statusCode || 500,
    err?.message || "Internal Server Error",
    [],
    err?.stack || "",
  );
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(err);
    } else if (
      process.env.NODE_ENV === "production" &&
      (err instanceof ApiError === false || err.statusCode === 500)
    ) {
      console.error("Unexpected error in production environment:", err);
    }

    const error = normalizeError(err);
    next(error);
  });

export default asyncHandler;