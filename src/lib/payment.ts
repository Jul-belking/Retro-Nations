// Procesador de pago (simulación local para la demostración).
//
// El "pago" se resuelve en el cliente sin cargos reales. Para conectar el
// widget real de pago (p. ej. Wompi) cuando llegue el momento: ver
// README.md. La firma de integridad debe calcularse en el servidor
// (Supabase Edge Function) — nunca exponer el secreto aquí.

export interface PaymentResult {
  approved: boolean;
  reference: string;
}

const PAYMENT_DELAY_MS = 1100;

export function processPayment(options: {
  amount: number;
  forceFail?: boolean;
}): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        approved: !options.forceFail,
        reference: `pay-${Date.now()}`,
      });
    }, PAYMENT_DELAY_MS);
  });
}
