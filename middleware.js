import CryptoJS from "crypto-js";

const secretKey = "abcdoke";
const allowedBrands = ["ajuntoto","rahasia"];

// Middleware to validate the request
export function validateRequest(req, res, next) {
    try {
        const { a, b } = req.query;
        const time = decodeURIComponent(a);
        const title = decodeURIComponent(b);

        // Decrypt the time and title
        const decryptedTime = CryptoJS.AES.decrypt(time, secretKey).toString(
            CryptoJS.enc.Utf8
        );
        const decryptedTitle = CryptoJS.AES.decrypt(title, secretKey).toString(
            CryptoJS.enc.Utf8
        );
        if (decryptedTitle === "" || time === undefined)
            return res.status(403).send("Unauthorized");
        if (decryptedTime === "" || time === undefined)
            return res.status(403).send("Unauthorized");

        // Check if the decrypted time is valid (within a certain time window, e.g., 1 hour)
        const currentTime = new Date();
        const requestTime = new Date(decryptedTime);
        const timeDiff = currentTime - requestTime;
        const timeWindow = 60 * 60 * 1000; // 1 hour in milliseconds

        if (timeDiff > 0 && timeDiff < timeWindow) {
            // Check if the decrypted title contains an allowed brand (case-insensitive)
            if (
                allowedBrands.some((brand) => {
                    const lowerBrand = brand.toLowerCase();
                    return decryptedTitle.toLowerCase().includes(lowerBrand);
                })
            ) {
                return next(); // Request is valid, continue to the route handler
            }
        }

        return res.status(403).send("Unauthorized");
    } catch (error) {
        return res.status(400).send("Bad Request");
    }
}
