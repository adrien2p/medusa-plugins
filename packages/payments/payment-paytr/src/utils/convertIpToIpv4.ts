import ipaddr = require('ipaddr.js');

export default function convertIpToIpv4(ip: string): string {
    let result = ip;

    if (ip === '::1') {
        return '127.0.0.1';
    }

    const addr = ipaddr.parse(ip);
    if (addr.kind() === 'ipv6') {
        result = (addr as ipaddr.IPv6).toIPv4Address().toString();
    }

    return result;
}