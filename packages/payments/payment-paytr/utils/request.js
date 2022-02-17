"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FormData = require("form-data");
function request(endpoint, data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
    });
    return new Promise((resolve, reject) => {
        formData.submit(endpoint, ((err, res) => {
            if (err) {
                return reject(err);
            }
            const resBodyChunks = [];
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                resBodyChunks.push(chunk);
            });
            res.on('end', () => {
                const resBody = resBodyChunks.join('').toString();
                const parsedRes = JSON.parse(resBody);
                if (parsedRes.status === 'failed') {
                    return reject(parsedRes.reason);
                }
                return resolve(parsedRes.token);
            });
        }));
    });
}
exports.default = request;
