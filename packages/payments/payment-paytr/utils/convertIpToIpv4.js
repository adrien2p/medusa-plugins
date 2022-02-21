"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipaddr = require("ipaddr.js");
function convertIpToIpv4(ip) {
    let result = ip;
    if (ip === '::1') {
        return '127.0.0.1';
    }
    const addr = ipaddr.parse(ip);
    if (addr.kind() === 'ipv6') {
        result = addr.toIPv4Address().toString();
    }
    return result;
}
exports.default = convertIpToIpv4;
