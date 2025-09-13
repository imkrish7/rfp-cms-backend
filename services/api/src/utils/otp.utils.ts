
export const generateOTP = () => {
    let otp = (Math.random() * 10000).toFixed().toString()

    return otp.length===3 ? `0${otp}`: otp;
}