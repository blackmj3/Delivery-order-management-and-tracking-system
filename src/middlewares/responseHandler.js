const responseHandler = (req, res, next) => {
  if (!res.locals.response) return next();

  const { status, ...payload } = res.locals.response;
  return res.status(status).json(payload);
};

module.exports = responseHandler;
