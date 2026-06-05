import { NextFunction } from "express";

const errorHandler = (err, req, res, next) => {
    if (err.statusCode === 400) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        })
    }

    console.error(err.message)
    return res.status(err.statusCode || 500).json({
        success: false,
        message: "Something went wrong. Please try again later."
    })
}

export default errorHandler;