const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .then((response) => {
      if (response) {
        res.locals.response = response;
        next();
      }
    })
    .catch(next);
};

<<<<<<< HEAD
module.exports = asyncHandler;
=======
module.exports = asyncHandler;
>>>>>>> main
