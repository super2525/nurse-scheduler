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

router.post('/postUserInfo', auth, responseWrapper(async (req, res) => {
  const userId = req.user.userId;
  const { fullname, displayName } = req.body;

  // ดึง user เดิมเพื่อตรวจสอบ username
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // ถ้าไม่ได้ส่ง fullname หรือ displayName มา ใช้ค่าเดียวกับ username
  const finalFullname = fullname || existingUser.username;
  const finalDisplayName = displayName || existingUser.username;

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { fullname: finalFullname, displayName: finalDisplayName },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return {
    statusCode: 200,
    message: "User info saved successfully",
    data: user,
  };
}));


module.exports = responseWrapper;
