function responseWrapper(handler) {
  return async function (req, res) {
    try {
      const result = await handler(req, res);

      const statusCode = result?.statusCode || 200;
      const responseData = { ...result };
      delete responseData.statusCode;

      res.status(statusCode).json({
        result: result?.result || "success", // เพิ่มความยืดหยุ่น
        message: result?.message || "OK",
        ...responseData
      });

    } catch (err) {
      const isDev = process.env.NODE_ENV !== "production";
      res.status(err.statusCode || 500).json({
        result: "fail",
        message: err.message || "Internal Server Error",
        ...(isDev ? { stack: err.stack } : {})
      });
    }
  };
}

module.exports = responseWrapper;
