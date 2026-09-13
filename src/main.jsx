import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Building2, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign,
  DoorOpen, Home, KeyRound, LayoutDashboard, LogOut, Menu, MoreHorizontal,
  Plus, Search, Settings, TrendingUp, UserPlus, Users, Wallet, X, Check,
  AlertCircle, CalendarDays, Trash2, Pencil, Globe2, Camera, Moon, Sun
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'rentora-data-v1';
const SESSION_KEY = 'rentora-session';
const DEFAULT_PROPERTY_IMAGE = '/images/default-property.webp';
const ar = {
  'Overview':'نظرة عامة','Properties':'العقارات','Tenants':'المستأجرون','Payments':'الدفعات','Settings':'الإعدادات','Log out':'تسجيل الخروج','Dark mode':'الوضع الداكن','Light mode':'الوضع الفاتح',
  'Good evening':'مساء الخير','Here’s what’s happening with your properties.':'إليك آخر مستجدات عقاراتك.','Manage your rental portfolio.':'أدر محفظتك العقارية.','Everyone who calls your properties home.':'جميع المستأجرين في عقاراتك.','Track monthly rent collection.':'تابع تحصيل الإيجارات الشهرية.',
  'Add property':'إضافة عقار','Add tenant':'إضافة مستأجر','Active tenants':'المستأجرون النشطون','Collected this month':'المحصّل هذا الشهر','Collection rate':'نسبة التحصيل','Across all properties':'في جميع العقارات','total units':'إجمالي الوحدات','payments':'دفعات','outstanding':'مستحق',
  'MONTHLY PROGRESS':'التقدم الشهري','Rent collection':'تحصيل الإيجار','View all':'عرض الكل','Total expected':'إجمالي القيمة المطلوبة','Collected':'القيمة المدفوعة','Outstanding':'القيمة المتبقية','collected':'مدفوع','NEEDS ATTENTION':'يحتاج للمتابعة','Outstanding rent':'الإيجارات غير المدفوعة','Mark paid':'تحديد كمدفوع','All caught up!':'تم تحصيل جميع الإيجارات!','Everyone has paid for':'دفع جميع المستأجرين إيجار شهر','PORTFOLIO':'المحفظة العقارية','Your properties':'عقاراتك','Manage properties':'إدارة العقارات','tenants':'مستأجرين','units':'وحدات',
  'YOUR PORTFOLIO':'محفظتك','All properties':'جميع العقارات','properties':'عقارات','Tenants':'المستأجرون','Units':'الوحدات','Monthly rent':'الإيجار الشهري','Search tenants or units':'ابحث عن مستأجر أو وحدة','active tenants':'مستأجرون نشطون','Tenant':'المستأجر','Property':'العقار','Unit':'الوحدة','Paid':'مدفوع','Unpaid':'غير مدفوع','Expected':'المتوقع','Viewing month':'الشهر المعروض','PAYMENT REGISTER':'سجل الدفعات','Click a status to update':'اضغط على الحالة لتحديثها','Mark as paid':'تحديد كمدفوع',
  'Edit tenant':'تعديل المستأجر','Add a new tenant':'إضافة مستأجر جديد','Update their personal, property, or rent details.':'حدّث البيانات الشخصية أو العقار أو الإيجار.','Enter their lease and rent details.':'أدخل تفاصيل العقد والإيجار.','Full name':'الاسم الكامل','Select property':'اختر العقار','Monthly rent (BHD)':'الإيجار الشهري (د.ب)','Move-in date':'تاريخ بدء السكن','Phone number':'رقم الهاتف','Photo (optional)':'الصورة (اختيارية)','Upload photo':'رفع صورة','Change photo':'تغيير الصورة','Cancel':'إلغاء','Save changes':'حفظ التغييرات',
  'Edit property':'تعديل العقار','Create a new property in your portfolio.':'أنشئ عقاراً جديداً في محفظتك.','Update the property information below.':'حدّث بيانات العقار أدناه.','Property name':'اسم العقار','Location or address':'الموقع أو العنوان','Number of units':'عدد الوحدات','Property photo (optional)':'صورة العقار (اختيارية)','English':'English','Arabic':'العربية','Language':'اللغة',
  'Welcome to Rentora':'مرحباً بك في رنتورا','Welcome back':'مرحباً بعودتك','Create a password to secure your rent management dashboard.':'أنشئ كلمة مرور لحماية لوحة إدارة الإيجارات.','Enter your password to continue to your portfolio.':'أدخل كلمة المرور للمتابعة إلى محفظتك.','Password':'كلمة المرور','Confirm password':'تأكيد كلمة المرور','Create account':'إنشاء حساب','Log in':'تسجيل الدخول','SECURE ACCESS':'دخول آمن','Your information stays securely on this device.':'تبقى معلوماتك محفوظة بأمان على هذا الجهاز.','Delete property':'حذف العقار','Delete tenant':'حذف المستأجر',
  'Your properties':'عقاراتك','Property Manager':'مدير العقارات','Owner account':'حساب المالك','Rent due':'الإيجار المستحق','Status':'الحالة','Property & unit':'العقار والوحدة','Remove':'إزالة','of':'من','Every property.':'كل عقار.','Every payment.':'كل دفعة.','Perfectly clear.':'بكل وضوح.','RENT MANAGEMENT, SIMPLIFIED':'إدارة الإيجارات بكل سهولة','A calm, organized space to manage your tenants and stay on top of every month.':'مساحة منظمة وسهلة لإدارة المستأجرين ومتابعة كل شهر.','Enter your password':'أدخل كلمة المرور','Repeat your password':'أعد إدخال كلمة المرور','Password must be at least 4 characters.':'يجب ألا تقل كلمة المرور عن 4 أحرف.','Passwords do not match.':'كلمتا المرور غير متطابقتين.','That password is incorrect.':'كلمة المرور غير صحيحة.','Delete this property and all of its tenants?':'هل تريد حذف هذا العقار وجميع مستأجريه؟','Remove this tenant?':'هل تريد إزالة هذا المستأجر؟','No properties yet':'لا توجد عقارات بعد','No tenants yet':'لا يوجد مستأجرون بعد'
};
const tx = (lang, text) => lang === 'ar' ? (ar[text] || text) : text;
let activeLanguage = localStorage.getItem('rentora-lang') || 'en';
const t = text => tx(activeLanguage, text);

function resizeImage(file, maxSize = 1000) {
  return new Promise((resolve, reject) => { const reader=new FileReader(); reader.onerror=reject; reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const scale=Math.min(1,maxSize/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.82))};img.src=reader.result};reader.readAsDataURL(file) });
}

function ImageField({ value, onChange, property=false, lang='en' }) {
 const fallback=property?DEFAULT_PROPERTY_IMAGE:'/images/default-tenant.webp';
 return <label className="image-field"><span>{tx(lang,property?'Property photo (optional)':'Photo (optional)')}</span><div>{value||fallback?<img src={value||fallback} alt=""/>:<span className="avatar large"><Users size={22}/></span>}<label className="upload-btn"><Camera size={16}/>{tx(lang,value?'Change photo':'Upload photo')}<input type="file" accept="image/*" onChange={async e=>{if(e.target.files[0])onChange(await resizeImage(e.target.files[0],property?1200:500))}}/></label>{value&&<button type="button" className="remove-photo" onClick={()=>onChange('')}>{tx(lang,'Remove')}</button>}</div></label>
}
function PersonAvatar({ tenant }) { return <img className="avatar avatar-photo" src={tenant.image||'/images/default-tenant.webp'} alt=""/> }
const initialData = {
  password: '',
  properties: [
    { id: 'p1', name: 'Marina Heights', address: 'Seef District', units: 12 },
    { id: 'p2', name: 'Palm Residence', address: 'Juffair', units: 8 },
  ],
  tenants: [
    { id: 't1', propertyId: 'p1', name: 'Omar Hassan', unit: '4A', rent: 620, phone: '+973 3900 4821', joined: '2026-02-01' },
    { id: 't2', propertyId: 'p1', name: 'Sara Ahmed', unit: '7B', rent: 575, phone: '+973 3612 9044', joined: '2026-01-15' },
    { id: 't3', propertyId: 'p2', name: 'Yousef Ali', unit: '2C', rent: 450, phone: '+973 3771 2208', joined: '2025-11-01' },
    { id: 't4', propertyId: 'p2', name: 'Mariam Isa', unit: '5A', rent: 490, phone: '+973 3360 1182', joined: '2026-03-01' },
  ],
  payments: {
    '2026-09': { t1: true, t2: false, t3: true, t4: false },
    '2026-08': { t1: true, t2: true, t3: true, t4: true },
  },
};

const activeLocale = () => activeLanguage==='ar'?'ar-BH-u-nu-latn':'en-US';
const money = (n) => new Intl.NumberFormat(activeLocale(), { style: 'currency', currency: 'BHD', minimumFractionDigits: 0 }).format(n);
const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (key) => new Date(`${key}-02`).toLocaleDateString(activeLocale(), { month: 'long', year: 'numeric' });
const initials = (name) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

function Modal({ title, subtitle, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="modal" onMouseDown={e => e.stopPropagation()}>
      <div className="modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-btn" onClick={onClose}><X size={20}/></button></div>
      {children}
    </div>
  </div>;
}

function Auth({ password, onLogin, onSetPassword, lang, setLang }) {
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const setup = !password;
  function submit(e) {
    e.preventDefault(); setError('');
    if (value.length < 4) return setError('Password must be at least 4 characters.');
    if (setup && value !== confirm) return setError('Passwords do not match.');
    if (!setup && value !== password) return setError('That password is incorrect.');
    setup ? onSetPassword(value) : onLogin();
  }
  const t=s=>tx(lang,s); return <main className="auth-page">
    <section className="auth-brand">
      <div className="brand brand-light"><span className="brand-mark"><Building2 size={24}/></span>rentora</div>
      <div className="auth-copy"><span className="eyebrow light">{t('RENT MANAGEMENT, SIMPLIFIED')}</span><h1>{t('Every property.')}<br/>{t('Every payment.')}<br/><em>{t('Perfectly clear.')}</em></h1><p>{t('A calm, organized space to manage your tenants and stay on top of every month.')}</p></div>
      <div className="building-art"><div className="tower one">{Array(12).fill(0).map((_,i)=><i key={i}/>)}</div><div className="tower two">{Array(8).fill(0).map((_,i)=><i key={i}/>)}</div><div className="ground"/></div>
    </section>
    <section className="auth-form-wrap">
      <form className="auth-form" onSubmit={submit}>
        <div className="mobile-brand brand"><span className="brand-mark"><Building2 size={20}/></span>rentora</div>
        <button type="button" className="lang-auth" onClick={()=>setLang(lang==='en'?'ar':'en')}><Globe2 size={16}/>{lang==='en'?'العربية':'English'}</button>
        <span className="eyebrow">{t('SECURE ACCESS')}</span>
        <h2>{t(setup ? 'Welcome to Rentora' : 'Welcome back')}</h2>
        <p>{t(setup ? 'Create a password to secure your rent management dashboard.' : 'Enter your password to continue to your portfolio.')}</p>
        <label>{t('Password')}<input autoFocus type="password" value={value} onChange={e=>setValue(e.target.value)} placeholder={t('Enter your password')}/><KeyRound size={18}/></label>
        {setup && <label>{t('Confirm password')}<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={t('Repeat your password')}/><KeyRound size={18}/></label>}
        {error && <div className="form-error"><AlertCircle size={16}/>{t(error)}</div>}
        <button className="primary wide" type="submit">{t(setup ? 'Create account' : 'Log in')} <ChevronRight size={18}/></button>
        <small><KeyRound size={13}/> {t('Your information stays securely on this device.')}</small>
      </form>
    </section>
  </main>;
}

function Sidebar({ page, setPage, onLogout, open, setOpen, lang, setLang, theme, setTheme }) {
  const links = [
    ['dashboard', LayoutDashboard, 'Overview'], ['properties', Building2, 'Properties'],
    ['tenants', Users, 'Tenants'], ['payments', Wallet, 'Payments']
  ];
  const t=s=>tx(lang,s); return <><aside className={`sidebar ${open?'open':''}`}>
    <div className="brand"><span className="brand-mark"><Building2 size={21}/></span>rentora</div>
    <button className="close-menu" onClick={()=>setOpen(false)}><X/></button>
    <nav>{links.map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>{setPage(id);setOpen(false)}}><Icon size={19}/>{t(label)}</button>)}</nav>
    <div className="side-bottom"><button onClick={()=>setLang(lang==='en'?'ar':'en')}><Globe2 size={19}/>{lang==='en'?'العربية':'English'}</button><button onClick={()=>setTheme(theme==='light'?'dark':'light')}>{theme==='light'?<Moon size={19}/>:<Sun size={19}/>} {t(theme==='light'?'Dark mode':'Light mode')}</button><button><Settings size={19}/> {t('Settings')}</button><button onClick={onLogout}><LogOut size={19}/> {t('Log out')}</button><div className="side-card"><div className="avatar">RM</div><div><strong>{t('Property Manager')}</strong><span>{t('Owner account')}</span></div></div></div>
  </aside>{open&&<div className="side-overlay" onClick={()=>setOpen(false)}/>}</>;
}

function Header({ page, setMenu, onAdd, lang }) {
  const titles = { dashboard:['Good evening','Here’s what’s happening with your properties.'], properties:['Properties','Manage your rental portfolio.'], tenants:['Tenants','Everyone who calls your properties home.'], payments:['Payments','Track monthly rent collection.'] };
  const t=s=>tx(lang,s); return <header className="topbar"><button className="menu-btn" onClick={()=>setMenu(true)}><Menu/></button><div><span className="date">{new Date().toLocaleDateString(lang==='ar'?'ar-BH-u-nu-latn':'en-US',{weekday:'long',month:'long',day:'numeric'})}</span><h1>{t(titles[page][0])}</h1><p>{t(titles[page][1])}</p></div><button className="primary" onClick={onAdd}><Plus size={18}/>{t(page==='properties'?'Add property':'Add tenant')}</button></header>;
}

function Stat({ icon:Icon, label, value, meta, tone }) { return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={21}/></div><span>{label}</span><strong>{value}</strong><small>{meta}</small></article> }

function Dashboard({ data, month, setMonth, setPage, togglePaid, lang }) {
  const t = text => tx(lang, text);
  const paidMap = data.payments[month] || {};
  const paid = data.tenants.filter(t=>paidMap[t.id]);
  const unpaid = data.tenants.filter(t=>!paidMap[t.id]);
  const total = data.tenants.reduce((s,t)=>s+t.rent,0), collected=paid.reduce((s,t)=>s+t.rent,0);
  const moveMonth = d => { const x=new Date(`${month}-02`); x.setMonth(x.getMonth()+d); setMonth(monthKey(x)); };
  return <>
    <div className="month-row"><button className="month-nav" onClick={()=>moveMonth(-1)}><ChevronLeft/></button><div><CalendarDays size={18}/><strong>{monthLabel(month)}</strong></div><button className="month-nav" onClick={()=>moveMonth(1)}><ChevronRight/></button></div>
    <section className="stats"><Stat icon={Building2} label={t('Properties')} value={data.properties.length} meta={`${data.properties.reduce((s,p)=>s+p.units,0)} ${t('total units')}`} tone="sage"/><Stat icon={Users} label={t('Active tenants')} value={data.tenants.length} meta={t('Across all properties')} tone="blue"/><Stat icon={CircleDollarSign} label={t('Collected this month')} value={money(collected)} meta={`${paid.length} ${t('of')} ${data.tenants.length} ${t('payments')}`} tone="gold"/><Stat icon={TrendingUp} label={t('Collection rate')} value={`${total?Math.round(collected/total*100):0}%`} meta={`${money(total-collected)} ${t('outstanding')}`} tone="rose"/></section>
    <section className="dash-grid">
      <div className="panel"><div className="panel-head"><div><span className="eyebrow">{t('MONTHLY PROGRESS')}</span><h2>{t('Rent collection')}</h2></div><button className="text-btn" onClick={()=>setPage('payments')}>{t('View all')} <ChevronRight size={16}/></button></div><div className="collection"><div className="donut" style={{'--progress':`${total?collected/total*360:0}deg`}}><div><strong>{total?Math.round(collected/total*100):0}%</strong><span>{t('Collected').toLowerCase()}</span></div></div><div className="collection-info"><span>{t('Total expected')}</span><strong>{money(total)}</strong><div className="legend"><i className="dot green"/>{t('Collected')} <b>{money(collected)}</b></div><div className="legend"><i className="dot coral"/>{t('Outstanding')} <b>{money(total-collected)}</b></div></div></div></div>
      <div className="panel overdue"><div className="panel-head"><div><span className="eyebrow coral-text">{t('NEEDS ATTENTION')}</span><h2>{t('Outstanding rent')}</h2></div><span className="count-badge">{unpaid.length}</span></div>{unpaid.length===0?<div className="empty"><Check/><b>{t('All caught up!')}</b><span>{t('Everyone has paid for')} {monthLabel(month)}.</span></div>:<div className="unpaid-list">{unpaid.slice(0,4).map(tenant=><div className="person" key={tenant.id}><PersonAvatar tenant={tenant}/><div className="person-main"><strong>{tenant.name}</strong><span>{data.properties.find(p=>p.id===tenant.propertyId)?.name} · {t('Unit')} {tenant.unit}</span></div><b>{money(tenant.rent)}</b><button className="mark-btn" onClick={()=>togglePaid(tenant.id)}>{t('Mark paid')}</button></div>)}</div>}</div>
    </section>
    <section className="panel recent"><div className="panel-head"><div><span className="eyebrow">{t('PORTFOLIO')}</span><h2>{t('Your properties')}</h2></div><button className="text-btn" onClick={()=>setPage('properties')}>{t('Manage properties')} <ChevronRight size={16}/></button></div><div className="property-preview">{data.properties.slice(0,3).map(p=>{const ts=data.tenants.filter(tenant=>tenant.propertyId===p.id);return <article key={p.id}><div className="property-art has-photo" style={{backgroundImage:`linear-gradient(#173e3038,#173e3038),url(${p.image||DEFAULT_PROPERTY_IMAGE})`}}><Building2/></div><div><strong>{p.name}</strong><span>{p.address}</span><small><Users size={14}/>{ts.length} {t('tenants')} <i/> {p.units} {t('units')}</small></div></article>})}</div></section>
  </>;
}

function Properties({ data, onDelete, onEdit }) { return <section className="content-panel"><div className="section-title"><div><span className="eyebrow">{t('YOUR PORTFOLIO')}</span><h2>{t('All properties')}</h2></div><span>{data.properties.length} {t('properties')}</span></div><div className="property-grid">{data.properties.map(p=>{const ts=data.tenants.filter(tenant=>tenant.propertyId===p.id);const income=ts.reduce((sum,tenant)=>sum+tenant.rent,0);return <article className="property-card" key={p.id}><div className="property-hero has-photo" style={{backgroundImage:`linear-gradient(#173e3028,#173e3028),url(${p.image||DEFAULT_PROPERTY_IMAGE})`}}><div className="property-actions"><button onClick={()=>onEdit(p)} title={t('Edit property')}><Pencil size={17}/></button><button onClick={()=>onDelete(p.id)} title={t('Delete property')}><Trash2 size={17}/></button></div></div><div className="property-body"><h3>{p.name}</h3><p>{p.address}</p><div className="property-metrics"><div><span>{t('Tenants')}</span><b>{ts.length}</b></div><div><span>{t('Units')}</span><b>{p.units}</b></div><div><span>{t('Monthly rent')}</span><b>{money(income)}</b></div></div></div></article>})}</div></section> }

function Tenants({ data, month, togglePaid, onDelete, onEdit }) {
  const [query,setQuery]=useState(''); const rows=data.tenants.filter(t=>t.name.toLowerCase().includes(query.toLowerCase())||t.unit.toLowerCase().includes(query.toLowerCase()));
  return <section className="content-panel"><div className="table-tools"><div className="search"><Search size={18}/><input placeholder={t('Search tenants or units')} value={query} onChange={e=>setQuery(e.target.value)}/></div><span>{rows.length} {t('active tenants')}</span></div><div className="table-wrap"><table><thead><tr><th>{t('Tenant')}</th><th>{t('Property')}</th><th>{t('Unit')}</th><th>{t('Monthly rent')}</th><th>{monthLabel(month)}</th><th></th></tr></thead><tbody>{rows.map(tenant=>{const paid=data.payments[month]?.[tenant.id];return <tr key={tenant.id}><td><div className="person"><PersonAvatar tenant={tenant}/><div><strong>{tenant.name}</strong><span>{tenant.phone}</span></div></div></td><td>{data.properties.find(p=>p.id===tenant.propertyId)?.name}</td><td>{tenant.unit}</td><td><b>{money(tenant.rent)}</b></td><td><button className={`status ${paid?'paid':'unpaid'}`} onClick={()=>togglePaid(tenant.id)}>{paid?<Check size={14}/>:<AlertCircle size={14}/>} {t(paid?'Paid':'Unpaid')}</button></td><td><div className="row-actions"><button className="icon-btn" title={t('Edit tenant')} onClick={()=>onEdit(tenant)}><Pencil size={17}/></button><button className="icon-btn danger" title={t('Delete tenant')} onClick={()=>onDelete(tenant.id)}><Trash2 size={17}/></button></div></td></tr>})}</tbody></table></div></section>;
}

function Payments({ data, month, setMonth, togglePaid }) {
 const paid=data.payments[month]||{}; const total=data.tenants.reduce((s,t)=>s+t.rent,0); const received=data.tenants.filter(t=>paid[t.id]).reduce((s,t)=>s+t.rent,0);
 return <><div className="payment-summary"><div><span>{t('Expected')}</span><b>{money(total)}</b></div><div><span>{t('Collected')}</span><b className="green-text">{money(received)}</b></div><div><span>{t('Outstanding')}</span><b className="coral-text">{money(total-received)}</b></div><label>{t('Viewing month')}<input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label></div><section className="content-panel"><div className="section-title"><div><span className="eyebrow">{t('PAYMENT REGISTER')}</span><h2>{monthLabel(month)}</h2></div><span>{t('Click a status to update')}</span></div><div className="table-wrap"><table><thead><tr><th>{t('Tenant')}</th><th>{t('Property & unit')}</th><th>{t('Rent due')}</th><th>{t('Status')}</th></tr></thead><tbody>{data.tenants.map(tenant=><tr key={tenant.id}><td><div className="person"><PersonAvatar tenant={tenant}/><strong>{tenant.name}</strong></div></td><td>{data.properties.find(p=>p.id===tenant.propertyId)?.name} · {tenant.unit}</td><td><b>{money(tenant.rent)}</b></td><td><button className={`status ${paid[tenant.id]?'paid':'unpaid'}`} onClick={()=>togglePaid(tenant.id)}>{paid[tenant.id]?<Check size={14}/>:<AlertCircle size={14}/>} {t(paid[tenant.id]?'Paid':'Mark as paid')}</button></td></tr>)}</tbody></table></div></section></>;
}

function AddTenant({ properties, onClose, onSave, initial, lang }) {
 const [form,setForm]=useState(initial||{name:'',propertyId:properties[0]?.id||'',unit:'',rent:'',phone:'',joined:new Date().toISOString().slice(0,10)}); const set=(k,v)=>setForm({...form,[k]:v});
 const t=s=>tx(lang,s); return <Modal title={t(initial?'Edit tenant':'Add a new tenant')} subtitle={t(initial?'Update their personal, property, or rent details.':'Enter their lease and rent details.')} onClose={onClose}><form className="modal-form" onSubmit={e=>{e.preventDefault();onSave({...form,rent:Number(form.rent)})}}><ImageField value={form.image} onChange={v=>set('image',v)} lang={lang}/><label>{t('Full name')}<input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Ahmed Khalid"/></label><div className="form-row"><label>{t('Property')}<select required value={form.propertyId} onChange={e=>set('propertyId',e.target.value)}><option value="" disabled>{t('Select property')}</option>{properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>{t('Unit')}<input required value={form.unit} onChange={e=>set('unit',e.target.value)} placeholder="e.g. 4A"/></label></div><div className="form-row"><label>{t('Monthly rent (BHD)')}<input required min="1" type="number" value={form.rent} onChange={e=>set('rent',e.target.value)} placeholder="500"/></label><label>{t('Move-in date')}<input required type="date" value={form.joined} onChange={e=>set('joined',e.target.value)}/></label></div><label>{t('Phone number')}<input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+973 0000 0000"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>{t('Cancel')}</button><button className="primary" type="submit">{initial?<Pencil size={17}/>:<UserPlus size={17}/>} {t(initial?'Save changes':'Add tenant')}</button></div></form></Modal>;
}

function AddProperty({ onClose,onSave,initial,lang }) { const [f,setF]=useState(initial||{name:'',address:'',units:'',image:''}); const t=s=>tx(lang,s); return <Modal title={t(initial?'Edit property':'Add a property')} subtitle={t(initial?'Update the property information below.':'Create a new property in your portfolio.')} onClose={onClose}><form className="modal-form" onSubmit={e=>{e.preventDefault();onSave({...f,units:Number(f.units)})}}><ImageField property value={f.image} onChange={image=>setF({...f,image})} lang={lang}/><label>{t('Property name')}<input required autoFocus value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="e.g. Bay View Residence"/></label><label>{t('Location or address')}<input required value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="e.g. Amwaj Islands"/></label><label>{t('Number of units')}<input required min="1" type="number" value={f.units} onChange={e=>setF({...f,units:e.target.value})} placeholder="10"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>{t('Cancel')}</button><button className="primary">{initial?<Pencil size={17}/>:<Building2 size={17}/>} {t(initial?'Save changes':'Add property')}</button></div></form></Modal> }

function App() {
 const [data,setData]=useState(()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||initialData}catch{return initialData}});
 const [lang,setLang]=useState(()=>localStorage.getItem('rentora-lang')||'en');
 const [theme,setTheme]=useState(()=>localStorage.getItem('rentora-theme')||'light');
 activeLanguage=lang;
 document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr'; document.documentElement.dataset.theme=theme;
 const [logged,setLogged]=useState(()=>sessionStorage.getItem(SESSION_KEY)==='yes'); const [page,setPage]=useState('dashboard'); const [month,setMonth]=useState(monthKey(new Date())); const [modal,setModal]=useState(null); const [menu,setMenu]=useState(false);
 useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(data)),[data]);
 useEffect(()=>{localStorage.setItem('rentora-lang',lang);document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr'},[lang]);
 useEffect(()=>{localStorage.setItem('rentora-theme',theme);document.documentElement.dataset.theme=theme},[theme]);
 const togglePaid=id=>setData(d=>({...d,payments:{...d.payments,[month]:{...(d.payments[month]||{}),[id]:!d.payments[month]?.[id]}}}));
 const saveTenant=f=>{setData(d=>({...d,tenants:f.id?d.tenants.map(t=>t.id===f.id?f:t):[...d.tenants,{...f,id:crypto.randomUUID()}]}));setModal(null)};
 const saveProperty=f=>{setData(d=>({...d,properties:f.id?d.properties.map(p=>p.id===f.id?f:p):[...d.properties,{...f,id:crypto.randomUUID()}]}));setModal(null)};
 if(!logged) return <Auth lang={lang} setLang={setLang} password={data.password} onSetPassword={p=>{setData({...data,password:p});sessionStorage.setItem(SESSION_KEY,'yes');setLogged(true)}} onLogin={()=>{sessionStorage.setItem(SESSION_KEY,'yes');setLogged(true)}}/>;
 const add=()=>setModal(page==='properties'?'property':'tenant');
 return <div className="app"><Sidebar page={page} setPage={setPage} open={menu} setOpen={setMenu} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} onLogout={()=>{sessionStorage.removeItem(SESSION_KEY);setLogged(false)}}/><main className="main"><Header page={page} setMenu={setMenu} onAdd={add} lang={lang}/><div className="content">{page==='dashboard'&&<Dashboard lang={lang} data={data} month={month} setMonth={setMonth} setPage={setPage} togglePaid={togglePaid}/>} {page==='properties'&&<Properties data={data} onEdit={p=>setModal({type:'property',item:p})} onDelete={id=>{if(confirm(tx(lang,'Delete this property and all of its tenants?')))setData(d=>({...d,properties:d.properties.filter(p=>p.id!==id),tenants:d.tenants.filter(t=>t.propertyId!==id)}))}}/>} {page==='tenants'&&<Tenants data={data} month={month} togglePaid={togglePaid} onEdit={tenant=>setModal({type:'tenant',item:tenant})} onDelete={id=>{if(confirm(tx(lang,'Remove this tenant?')))setData(d=>({...d,tenants:d.tenants.filter(tenant=>tenant.id!==id)}))}}/>} {page==='payments'&&<Payments data={data} month={month} setMonth={setMonth} togglePaid={togglePaid}/>}</div></main>{(modal==='tenant'||modal?.type==='tenant')&&<AddTenant lang={lang} properties={data.properties} initial={modal?.item} onClose={()=>setModal(null)} onSave={saveTenant}/>} {(modal==='property'||modal?.type==='property')&&<AddProperty lang={lang} initial={modal?.item} onClose={()=>setModal(null)} onSave={saveProperty}/>}</div>;
}

createRoot(document.getElementById('root')).render(<App/>);
