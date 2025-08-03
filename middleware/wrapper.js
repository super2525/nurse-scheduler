function responseWrapper(handler) {
  return async function (req, res) {
    try {
      const result = await handler(req, res);
      
      const statusCode = result?.statusCode || 200;
      const responseData = { ...result };
      delete responseData.statusCode;

      res.status(statusCode).json({
        result: "success",
        message: result?.message || "OK",
        ...responseData
      });
    } catch (err) {
      res.status(err.statusCode || 500).json({
        result: "fail",
        message: err.message || "Internal Server Error"
      });
    }
  };
};
module.exports = responseWrapper;
