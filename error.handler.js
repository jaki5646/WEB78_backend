const ErrorHandler = (err, req, res, next) => {
    let errMsg = err.message || 'Something went wrong';
    let errStatus = err.status || 500;
    let errStack = err.stack || 'No stack';
    let errData = err.data || null


    let customError = errMsg.split(' ')
    // customError = errMsg.split(' ') || null

    if(parseInt(customError[0])) {
        errStatus = parseInt(customError[0])
    }

    // multer & validator
    if(errStack.startsWith('MulterError:') || errStack.startsWith('ValidationError:')) {
        errStatus = 400
    }

    res.status(errStatus || 500).json({
        success: false,
        status: errStatus,
        message: errMsg,
        data: errData
    })
}

export default ErrorHandler