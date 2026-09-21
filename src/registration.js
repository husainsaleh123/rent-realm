export function normalizeContactPhone(value) {
  const raw = String(value || '').trim();
  if (!/^[+\d\s().-]+$/.test(raw)) return '';
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('00')) digits = digits.slice(2);
  else if (!raw.startsWith('+') && /^\d{8}$/.test(digits)) digits = `973${digits}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : '';
}
export function registrationMetadata({displayName, phone}) {
  const username = String(displayName || '').trim();
  if (username.length < 2) throw new Error('Display name must be at least 2 characters.');
  const contact = normalizeContactPhone(phone);
  if (!contact) throw new Error('Enter a valid phone number with country code.');
  return {username, full_name: username, phone: contact, role: 'property_owner'};
}
