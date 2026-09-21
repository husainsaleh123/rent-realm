export function paymentTransactions(payment) {
  if (!payment) return [];
  return Array.isArray(payment.transactions) ? payment.transactions.filter(Boolean) : [payment];
}

export function amountCollected(payment) {
  return paymentTransactions(payment).reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0);
}

export function amountOutstanding(rent, payment) {
  return Math.max(0, Number(rent) - amountCollected(payment));
}

export function paymentStatus(rent, payment) {
  const collected = amountCollected(payment);
  if (collected <= 0) return 'unpaid';
  return collected >= Number(rent) ? 'paid' : 'partial';
}

export function latestReceipt(payment) {
  const transactions = paymentTransactions(payment);
  return transactions[transactions.length - 1];
}

export function addPaymentTransaction(existing, receipt) {
  if (!existing) return receipt;
  return { transactions: [...paymentTransactions(existing), receipt] };
}
