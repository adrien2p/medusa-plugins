import { PayTrResponse } from "../types";
import * as FormData from "form-data";

export default function request(endpoint: string, data: Record<string, unknown>): Promise<string> {
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
                const parsedRes: PayTrResponse = JSON.parse(resBody);
                if (parsedRes.status === 'failed') {
                    return reject((parsedRes as PayTrResponse<'failed'>).reason);
                }
                return resolve(parsedRes.token);
            });
        }));
    });
}