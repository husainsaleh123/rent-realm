export function whatsappNumber(phone = '') {
  const raw = String(phone).trim();
  if (!/^[+\d\s().-]+$/.test(raw)) return '';
  let number = raw.replace(/\D/g, '');
  if (number.startsWith('00')) number = number.slice(2);
  // Bahrain local mobile numbers use eight digits.
  if (!raw.startsWith('+') && !raw.startsWith('00') && /^[36]\d{7}$/.test(number)) number = `973${number}`;
  return /^[1-9]\d{8,14}$/.test(number) ? number : '';
}
export function paymentMessage(receipt) {
  const month = new Date(`${receipt.month}-02T12:00:00`).toLocaleDateString('en-GB', {month:'long',year:'numeric'});
  return `Hello ${receipt.tenant.name},\n\nYour rent for ${month} has been paid.\nProperty: ${receipt.property} · ${receipt.tenant.unit}\nAmount received: BHD ${Number(receipt.amount).toFixed(3)}\nPayment date: ${receipt.date.split('-').reverse().join('/')}\nPayment method: ${receipt.method}\nReceipt No.: ${receipt.number}\n\nThank you,\n${receipt.issuer.username || 'Rent Realm'}`;
}
export function paymentWhatsAppUrl(receipt) {
  const number = whatsappNumber(receipt.tenant.phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(paymentMessage(receipt))}` : '';
}

export function canShareReceipt(file, browser = globalThis.navigator) {
  try { return Boolean(file && browser?.share && browser?.canShare?.({files:[file]})); }
  catch { return false; }
}
export async function shareReceipt(receipt, file, browser = globalThis.navigator) {
  if (!canShareReceipt(file, browser)) return 'unsupported';
  try {
    await browser.share({files:[file],title:`Receipt ${receipt.number}`,text:paymentMessage(receipt)});
    return 'shared';
  } catch (error) {
    if (error.name === 'AbortError') return 'cancelled';
    return 'failed';
  }
}
