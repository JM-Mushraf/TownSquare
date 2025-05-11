import dotenv from 'dotenv'
dotenv.config()

export const sendToken = (user, statusCode, res) => {
    const token = user.getJWT();

    const isProduction = process.env.NODE_ENV === "production";

    // Options for the cookie
    const options = {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        httpOnly: true,
        secure: isProduction, // Only secure in production
        sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in production
    };

    res.status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            token,
            user,
        });
};
