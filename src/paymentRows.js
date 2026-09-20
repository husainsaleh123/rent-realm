export function paymentRows(data, selectedMonth, {query='',sort='month',direction='asc',allMonths=false}={}) {
  const months=allMonths?[...new Set([...Object.keys(data.payments),selectedMonth])]:[selectedMonth];
  const term=query.trim().toLocaleLowerCase();
  const rows=months.flatMap(month=>data.tenants.filter(tenant=>month===selectedMonth || Object.hasOwn(data.payments[month]||{},tenant.id)).map(tenant=>({tenant,month,payment:data.payments[month]?.[tenant.id]}))).filter(({tenant})=>[tenant.name,tenant.unit].some(value=>String(value||'').toLocaleLowerCase().includes(term)));
  const compare=(a,b)=>String(a||'').localeCompare(String(b||''),undefined,{numeric:true,sensitivity:'base'});
  return rows.sort((a,b)=>{
    const primary=sort==='month'?compare(a.month,b.month):compare(a.tenant[sort==='unit'?'unit':'name'],b.tenant[sort==='unit'?'unit':'name']);
    return (direction==='desc'?-1:1)*(primary||compare(a.month,b.month)||compare(a.tenant.name,b.tenant.name)||compare(a.tenant.unit,b.tenant.unit));
  });
}
