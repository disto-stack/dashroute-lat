export function orderLabel(orderId: string): string {
  return `#${orderId.slice(-6).toUpperCase()}`;
}
