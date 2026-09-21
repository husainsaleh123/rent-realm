import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};
export function createReceipt({ tenant, property, month, date, method, amount, rentDue, previouslyPaid = 0, balance = 0, issuer }) {
  const id = crypto.randomUUID();
  return { id, number: `RCPT/${date.slice(2,4)}/${id.slice(0,8).toUpperCase()}`, invoice: `INV/${month.replace('-','')}/${tenant.id.slice(0,8).toUpperCase()}`, month, date, method, amount: Number(amount), rentDue: Number(rentDue ?? tenant.rent), previouslyPaid: Number(previouslyPaid), balance: Number(balance), tenant: { name: tenant.name, phone: tenant.phone || '', email: tenant.email || '', unit: tenant.unit }, property: property?.name || '', propertyAddress: property?.address || '', issuer: { ...issuer } };
}
export function receiptDocument(receipt) {
  const doc = new jsPDF();
  const amount = `${receipt.amount.toFixed(3)} BD`;
  const rentDue = `${Number(receipt.rentDue ?? (receipt.amount + Number(receipt.balance || 0))).toFixed(3)} BD`;
  const previouslyPaid = Number(receipt.previouslyPaid || 0);
  const date = receipt.date.split('-').reverse().join('/');
  const reference = new Date(`${receipt.month}-02T12:00:00`).toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  const ink = [35,44,56], gold = [174,161,135], purple = [143,96,137];
  doc.setFillColor(249,248,246); doc.rect(0,0,210,49,'F');
  doc.setTextColor(...ink); doc.setFont('helvetica','bold'); doc.setFontSize(17);
  doc.text(doc.splitTextToSize(receipt.issuer.username || 'Rent Realm',88),14,20);
  doc.setFont('helvetica','bold'); doc.setFontSize(10);
  const buildingName = doc.splitTextToSize(receipt.property || '',88);
  doc.text(buildingName,14,31);
  doc.setFont('helvetica','normal'); doc.setFontSize(9);
  doc.text(doc.splitTextToSize(receipt.propertyAddress || '',88),14,31 + buildingName.length * 4);
  doc.text(doc.splitTextToSize(receipt.issuer.email || '',82),196,18,{align:'right'});
  doc.setTextColor(...gold); doc.setFontSize(23); doc.text('Receipt Voucher',196,44,{align:'right'});
  doc.setTextColor(...ink); doc.setFontSize(11); doc.text('Tenant',14,61);
  const contact = [receipt.tenant.name,receipt.tenant.phone ? `Mobile: ${receipt.tenant.phone}` : '',receipt.tenant.email ? `Email: ${receipt.tenant.email}` : ''].filter(Boolean);
  doc.text(contact.flatMap(line=>doc.splitTextToSize(line,180)),14,68);
  const start = Math.max(98, 72 + contact.length*7);
  doc.setFont('helvetica','bold'); doc.setTextColor(...purple); doc.text(`Receipt No.: ${receipt.number}`,14,start); doc.text(amount,196,start,{align:'right'});
  autoTable(doc,{startY:start+8,theme:'striped',body:[[`Payment Date: ${date}`,''],[`Property: ${receipt.property} · ${receipt.tenant.unit}`,''],[`Amount Paid: ${amount}`,`Payment Method: ${receipt.method}`],[`Memo: ${receipt.invoice}`,'']],styles:{fontSize:10,textColor:ink,cellPadding:3},alternateRowStyles:{fillColor:[243,244,246]},columnStyles:{0:{cellWidth:105}},margin:{left:14,right:14}});
  const ledgerRows=[[ `01/${receipt.month.slice(5)}/${receipt.month.slice(0,4)}`,receipt.invoice,reference,rentDue]];
  if(previouslyPaid>0)ledgerRows.push(['','Previous payments',receipt.invoice,`-${previouslyPaid.toFixed(3)} BD`]);
  ledgerRows.push([date,receipt.number,receipt.invoice,`-${amount}`],['',`Balance Amount for ${receipt.invoice}`,'',`${Number(receipt.balance||0).toFixed(3)} BD`]);
  autoTable(doc,{startY:doc.lastAutoTable.finalY+9,theme:'striped',head:[['Invoice Date','Invoice Number','Reference','Amount']],body:ledgerRows,styles:{fontSize:9,textColor:ink,cellPadding:3},headStyles:{fillColor:[255,255,255],textColor:ink,fontStyle:'normal'},alternateRowStyles:{fillColor:[243,244,246]},columnStyles:{3:{halign:'right'}},didParseCell:cell=>{if(cell.section==='body'&&cell.row.index===ledgerRows.length-1)cell.cell.styles.fontStyle='bold'},margin:{left:14,right:14}});
  doc.setFontSize(9); doc.setTextColor(0,128,0); doc.text('This is a computer-generated document and does not require a stamp or signature.',105,doc.lastAutoTable.finalY+10,{align:'center'});
  return doc;
}
export function downloadReceipt(receipt) { receiptDocument(receipt).save(`${receipt.number.replaceAll('/','-')}.pdf`); }
