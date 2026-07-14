// Procesador de pago en modo sandbox.
//
// La v1 lanza con Wompi en modo pruebas y catálogo dummy, por lo que el
// "pago" es una simulación explícita (igual que en el diseño aprobado, que
// incluye el enlace "Simular pago rechazado"). No se realizan cargos.
//
// Para conectar el widget real de Wompi sandbox cuando llegue el momento:
// ver README.md sección "Wompi". La firma de integridad debe calcularse en
// el servidor (Supabase Edge Function) — nunca exponer el secreto aquí.

export interface PaymentResult {
  approved: boolean;
  reference: string;
}

const SANDBOX_DELAY_MS = 1100;

export function processSandboxPayment(options: {
  amount: number;
  forceFail?: boolean;
}): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        approved: !options.forceFail,
        reference: `sandbox-${Date.now()}`,
      });
    }, SANDBOX_DELAY_MS);
  });
}
