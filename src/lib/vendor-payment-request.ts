import type { VendorPaymentRequest } from '@/types';

function storageKey(flowId: string): string {
  return `vendor-payment-request:${flowId}`;
}

export function loadVendorPaymentRequest(flowId: string): VendorPaymentRequest | null {
  if (!flowId || typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey(flowId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as VendorPaymentRequest;
    if (!parsed.alias || !parsed.rail || !parsed.destination) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveVendorPaymentRequest(flowId: string, request: VendorPaymentRequest): void {
  if (!flowId || typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey(flowId), JSON.stringify(request));
}

export function clearVendorPaymentRequest(flowId: string): void {
  if (!flowId || typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(storageKey(flowId));
}
