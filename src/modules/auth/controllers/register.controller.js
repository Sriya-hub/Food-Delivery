import registerService from "../services/register.service.js";

const register = async (req, res, next) => {
  try {
    const result = await registerService(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });

  } catch (err) {
    next(err);
  }
};

export default { register };