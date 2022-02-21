"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function findPendingPaymentSession(paymentsSessions, { merchantOid }) {
    return paymentsSessions.find(session => (session.data.merchantOid === merchantOid && session.data.cart)
        && session.data.isPending === true
        && session.data.status === -1);
}
exports.default = findPendingPaymentSession;
