import { PaymentSession } from "@medusajs/medusa/dist";

export default async function findPendingPaymentSession(
    paymentsSessions: PaymentSession[],
    { merchantOid }: { merchantOid: string }
): Promise<PaymentSession> {
    return paymentsSessions.find(session => (
        session.provider_id === 'paytr'
        && session.data.merchantOid === merchantOid && session.data.cart)
        && session.data.isPending === true
        && session.data.status === -1
    );
}