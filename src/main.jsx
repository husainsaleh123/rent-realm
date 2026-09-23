import { supabase, supabaseConfigured } from './supabase';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Building2, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign,
  DoorOpen, Home, KeyRound, LayoutDashboard, LogOut, Menu, MoreHorizontal,
  Plus, Search, Settings, TrendingUp, UserPlus, Users, Wallet, X, Check,
  AlertCircle, CalendarDays, Trash2, Pencil, Globe2, Camera, Moon, Sun,
  Eye, EyeOff, Mail, FileText, Download
  , ArrowRight, BellRing, CheckCircle2, ShieldCheck, Sparkles, PlayCircle, Video, Clock, MessageCircle
} from 'lucide-react';
import './styles.css';
import { normalizeContactPhone, registrationMetadata } from './registration';
import { paymentRows } from './paymentRows';
import { createReceipt, downloadReceipt, localDate, receiptDocument } from './receipts';
import { addPaymentTransaction, amountCollected, amountOutstanding, latestReceipt, paymentStatus } from './paymentAmounts';
import { paymentWhatsAppUrl, shareReceipt } from './whatsapp';

const STORAGE_KEY = 'rentora-data-v1';
const DEFAULT_PROPERTY_IMAGE = '/images/default-property.webp';
const ar = {
  'Amount paid':'المبلغ المدفوع','Partially paid':'مدفوع جزئياً','Record another payment':'تسجيل دفعة أخرى','Cheque':'شيك','Previously collected':'المحصّل سابقاً','Remaining balance':'الرصيد المتبقي','Amount must be greater than zero and no more than the remaining balance.':'يجب أن يكون المبلغ أكبر من صفر وألا يتجاوز الرصيد المتبقي.',
  'Share receipt & message':'مشاركة الإيصال والرسالة','Choose WhatsApp, then select the tenant and review before sending.':'اختر واتساب ثم المستأجر وراجع الرسالة قبل الإرسال.','To attach the receipt, download the PDF, open WhatsApp confirmation, and attach it as a document before sending.':'لإرفاق الإيصال، نزّل PDF وافتح التأكيد عبر واتساب وأرفقه كمستند قبل الإرسال.','Sharing could not start. Download the PDF and attach it in WhatsApp instead.':'تعذّر بدء المشاركة. نزّل PDF وأرفقه في واتساب.','Receipt passed to your chosen app. Check the chat before sending.':'تم تمرير الإيصال إلى التطبيق المحدد. تحقق من المحادثة قبل الإرسال.','Change password':'تغيير كلمة المرور','New password':'كلمة المرور الجديدة','Confirm new password':'تأكيد كلمة المرور الجديدة','Password changed successfully.':'تم تغيير كلمة المرور بنجاح.','Role':'الدور','Select your role':'اختر دورك','Select your role.':'اختر دورك.','Property Owner':'مالك العقار','Enter a valid phone number with country code.':'أدخل رقم هاتف صالحاً مع رمز الدولة.','Display name must be at least 2 characters.':'يجب ألا يقل الاسم المعروض عن حرفين.','Display name':'الاسم المعروض','Mobile number (optional)':'رقم الجوال (اختياري)','Account settings':'إعدادات الحساب','Sort by':'ترتيب حسب','By Month':'حسب الشهر','By Tenant':'حسب المستأجر','By Unit':'حسب الوحدة','Ascending':'تصاعدي','Descending':'تنازلي','All recorded months':'كل الأشهر المسجلة','Selected month':'الشهر المحدد','Month':'الشهر','No matching payments.':'لا توجد دفعات مطابقة.','No matching outstanding amounts.':'لا توجد مبالغ مستحقة مطابقة.','Outstanding amounts':'المبالغ المستحقة','Amount outstanding':'المبلغ المستحق','No outstanding amounts for this month.':'لا توجد مبالغ مستحقة لهذا الشهر.','Total outstanding':'إجمالي المبالغ المستحقة','WhatsApp confirmation':'تأكيد عبر واتساب','Review the message in WhatsApp and tap Send.':'راجع الرسالة في واتساب واضغط إرسال.','Add a valid mobile number with country code to enable WhatsApp confirmation.':'أضف رقم جوال صالحاً مع رمز الدولة لتفعيل التأكيد عبر واتساب.','Mobile number':'رقم الجوال','View receipt':'عرض الإيصال','Receipt voucher':'سند قبض','Open PDF':'فتح PDF','Receipt':'إيصال','Download receipt':'تنزيل الإيصال','Record payment':'تسجيل دفعة','Payment date':'تاريخ الدفع','Payment method':'طريقة الدفع','Cash':'نقداً','Debit Card':'بطاقة خصم','Credit Card':'بطاقة ائتمان','BenefitPay':'بنفت باي','ApplePay':'آبل باي','Save payment':'حفظ الدفعة','Receipt details':'تفاصيل الإيصال',
  'Overview':'نظرة عامة','Properties':'العقارات','Tenants':'المستأجرون','Payments':'الدفعات','Settings':'الإعدادات','Log out':'تسجيل الخروج','Dark mode':'الوضع الداكن','Light mode':'الوضع الفاتح','Username':'اسم المستخدم','Email address':'البريد الإلكتروني','Create your account':'أنشئ حسابك','Use your email and password to access your portfolio.':'استخدم بريدك الإلكتروني وكلمة المرور للدخول إلى محفظتك.','Show password':'إظهار كلمة المرور','Hide password':'إخفاء كلمة المرور','Email or password is incorrect.':'البريد الإلكتروني أو كلمة المرور غير صحيحة.','An account with this email already exists.':'يوجد حساب مسجل بهذا البريد الإلكتروني.','Enter a valid email address.':'أدخل بريداً إلكترونياً صحيحاً.','Username must be at least 2 characters.':'يجب ألا يقل اسم المستخدم عن حرفين.','Password must be at least 6 characters.':'يجب ألا تقل كلمة المرور عن 6 أحرف.','Your password is encrypted before it is stored on this device.':'يتم تشفير كلمة المرور قبل حفظها على هذا الجهاز.','Already have an account? Log in':'لديك حساب؟ سجّل الدخول','New here? Create an account':'مستخدم جديد؟ أنشئ حساباً',
  'Good evening':'مساء الخير','Here’s what’s happening with your properties.':'إليك آخر مستجدات عقاراتك.','Manage your rental portfolio.':'أدر محفظتك العقارية.','Everyone who calls your properties home.':'جميع المستأجرين في عقاراتك.','Track monthly rent collection.':'تابع تحصيل الإيجارات الشهرية.',
  'Add property':'إضافة عقار','Add tenant':'إضافة مستأجر','Active tenants':'المستأجرون النشطون','Collected this month':'المحصّل هذا الشهر','Collection rate':'نسبة التحصيل','Across all properties':'في جميع العقارات','total units':'إجمالي الوحدات','payments':'دفعات','outstanding':'مستحق',
  'MONTHLY PROGRESS':'التقدم الشهري','Rent collection':'تحصيل الإيجار','View all':'عرض الكل','Total expected':'إجمالي القيمة المطلوبة','Collected':'القيمة المدفوعة','Outstanding':'القيمة المتبقية','collected':'مدفوع','NEEDS ATTENTION':'يحتاج للمتابعة','Outstanding rent':'الإيجارات غير المدفوعة','Mark paid':'تحديد كمدفوع','All caught up!':'تم تحصيل جميع الإيجارات!','Everyone has paid for':'دفع جميع المستأجرين إيجار شهر','PORTFOLIO':'المحفظة العقارية','Your properties':'عقاراتك','Manage properties':'إدارة العقارات','tenants':'مستأجرين','units':'وحدات',
  'YOUR PORTFOLIO':'محفظتك','All properties':'جميع العقارات','properties':'عقارات','Tenants':'المستأجرون','Units':'الوحدات','Monthly rent':'الإيجار الشهري','Search tenants or units':'ابحث عن مستأجر أو وحدة','active tenants':'مستأجرون نشطون','Tenant':'المستأجر','Property':'العقار','Unit':'الوحدة','Paid':'مدفوع','Unpaid':'غير مدفوع','Expected':'المتوقع','Viewing month':'الشهر المعروض','PAYMENT REGISTER':'سجل الدفعات','Click a status to update':'اضغط على الحالة لتحديثها','Mark as paid':'تحديد كمدفوع',
  'Edit tenant':'تعديل المستأجر','Add a new tenant':'إضافة مستأجر جديد','Update their personal, property, or rent details.':'حدّث البيانات الشخصية أو العقار أو الإيجار.','Enter their lease and rent details.':'أدخل تفاصيل العقد والإيجار.','Full name':'الاسم الكامل','Select property':'اختر العقار','Monthly rent (BHD)':'الإيجار الشهري (د.ب)','Move-in date':'تاريخ بدء السكن','Phone number':'رقم الهاتف','Photo (optional)':'الصورة (اختيارية)','Upload photo':'رفع صورة','Change photo':'تغيير الصورة','Cancel':'إلغاء','Save changes':'حفظ التغييرات',
  'Edit property':'تعديل العقار','Create a new property in your portfolio.':'أنشئ عقاراً جديداً في محفظتك.','Update the property information below.':'حدّث بيانات العقار أدناه.','Property name':'اسم العقار','Location or address':'الموقع أو العنوان','Number of units':'عدد الوحدات','Empty flats':'الشقق الفارغة','Empty flats cannot exceed the total number of units.':'لا يمكن أن يتجاوز عدد الشقق الفارغة إجمالي عدد الوحدات.','Property photo (optional)':'صورة العقار (اختيارية)','English':'English','Arabic':'العربية','Language':'اللغة',
  'Welcome to Rent Realm':'مرحباً بك في رنت ريلم','Welcome back':'مرحباً بعودتك','Sign up with your email, phone number, and password.':'سجّل باستخدام بريدك الإلكتروني ورقم هاتفك وكلمة المرور.','Sign up with your display name, email, phone number, and password.':'سجّل باستخدام اسم العرض والبريد الإلكتروني ورقم الهاتف وكلمة المرور.','Enter your password to continue to your portfolio.':'أدخل كلمة المرور للمتابعة إلى محفظتك.','Password':'كلمة المرور','Confirm password':'تأكيد كلمة المرور','Create account':'إنشاء حساب','Log in':'تسجيل الدخول','SECURE ACCESS':'دخول آمن','Delete property':'حذف العقار','Delete tenant':'حذف المستأجر',
  'Your properties':'عقاراتك','Property Manager':'مدير العقارات','Owner account':'حساب المالك','Rent due':'الإيجار المستحق','Status':'الحالة','Property & unit':'العقار والوحدة','Remove':'إزالة','of':'من','Every property.':'كل عقار.','Every payment.':'كل دفعة.','Perfectly clear.':'بكل وضوح.','RENT MANAGEMENT, SIMPLIFIED':'إدارة الإيجارات بكل سهولة','A calm, organized space to manage your tenants and stay on top of every month.':'مساحة منظمة وسهلة لإدارة المستأجرين ومتابعة كل شهر.','Enter your password':'أدخل كلمة المرور','Repeat your password':'أعد إدخال كلمة المرور','Passwords do not match.':'كلمتا المرور غير متطابقتين.','Delete this property and all of its tenants?':'هل تريد حذف هذا العقار وجميع مستأجريه؟','Remove this tenant?':'هل تريد إزالة هذا المستأجر؟','No properties yet':'لا توجد عقارات بعد','No tenants yet':'لا يوجد مستأجرون بعد','Rent contract':'عقد الإيجار','Upload contract':'رفع العقد','Replace contract':'استبدال العقد','View contract':'عرض العقد','Download PDF':'تنزيل PDF','PDF or image, up to 10 MB':'ملف PDF أو صورة، حتى 10 ميجابايت','Contract file must be a PDF or image under 10 MB.':'يجب أن يكون ملف العقد PDF أو صورة بحجم أقل من 10 ميجابايت.'
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
const emptyData = () => ({ properties: [], tenants: [], payments: {} });
const hasPortfolioData = data => Boolean(data?.properties?.length || data?.tenants?.length || Object.keys(data?.payments || {}).length);

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

function Auth({ hasAccounts, onLogin, onRegister, lang, setLang, initialMode='login', onBack }) {
  const [mode, setMode] = useState(initialMode==='register'?'register':hasAccounts?'login':'register');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setup = mode==='register';
  async function submit(e) {
    e.preventDefault(); setError(''); setNotice('');
    const normalizedEmail=email.trim().toLowerCase();
    if(setup && displayName.trim().length<2)return setError('Display name must be at least 2 characters.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))return setError('Enter a valid email address.');
    if(setup && !normalizeContactPhone(phone))return setError('Enter a valid phone number with country code.');
    if (value.length < 6) return setError('Password must be at least 6 characters.');
    if (setup && value !== confirm) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const result=setup?await onRegister({displayName:displayName.trim(),phone:normalizeContactPhone(phone),email:normalizedEmail,password:value}):await onLogin({email:normalizedEmail,password:value});
      if(result?.error)setError(result.error);
      if(result?.message){setNotice(result.message);setMode('login');setValue('');setConfirm('')}
    } catch(error) { setError(error.message); } finally { setSubmitting(false); }
  }
  const t=s=>tx(lang,s); return <main className="auth-page">
    <section className="auth-brand">
      <div className="brand brand-light"><span className="brand-mark"><Building2 size={24}/></span>Rent Realm</div>
      <div className="auth-copy"><span className="eyebrow light">{t('RENT MANAGEMENT, SIMPLIFIED')}</span><h1>{t('Every property.')}<br/>{t('Every payment.')}<br/><em>{t('Perfectly clear.')}</em></h1><p>{t('A calm, organized space to manage your tenants and stay on top of every month.')}</p></div>
      <div className="building-art"><div className="tower one">{Array(12).fill(0).map((_,i)=><i key={i}/>)}</div><div className="tower two">{Array(8).fill(0).map((_,i)=><i key={i}/>)}</div><div className="ground"/></div>
    </section>
    <section className="auth-form-wrap">
      <form className="auth-form" onSubmit={submit}>
        <div className="mobile-brand brand"><span className="brand-mark"><Building2 size={20}/></span>Rent Realm</div>
        {onBack&&<button type="button" className="auth-back" onClick={onBack}><ChevronLeft size={16}/>{t('Back to home')}</button>}
        <button type="button" className="lang-auth" onClick={()=>setLang(lang==='en'?'ar':'en')}><Globe2 size={16}/>{lang==='en'?'العربية':'English'}</button>
        {hasAccounts&&<div className="auth-mode-toggle" role="tablist" aria-label={t('Account access')}>
          <button type="button" role="tab" aria-selected={!setup} className={!setup?'active':''} onClick={()=>{setMode('login');setError('');setNotice('')}}>{t('Log in')}</button>
          <button type="button" role="tab" aria-selected={setup} className={setup?'active':''} onClick={()=>{setMode('register');setError('');setNotice('')}}>{t('Create account')}</button>
        </div>}
        <span className="eyebrow">{t('SECURE ACCESS')}</span>
        <h2>{t(setup ? 'Create your account' : 'Welcome back')}</h2>
        <p>{t(setup ? 'Sign up with your display name, email, phone number, and password.' : 'Use your email and password to access your portfolio.')}</p>
        {setup&&<label>{t('Display name')}<input required minLength="2" autoFocus type="text" autoComplete="name" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder={t('Display name')}/></label>}
        <label>{t('Email address')}<input required autoFocus={!setup} type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/><Mail size={18}/></label>
        {setup&&<label>{t('Mobile number')}<input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+973 0000 0000"/></label>}
        <label>{t('Password')}<input required minLength="6" type={showPassword?'text':'password'} autoComplete={setup?'new-password':'current-password'} value={value} onChange={e=>setValue(e.target.value)} placeholder={t('Enter your password')}/><button className="password-toggle" type="button" title={t(showPassword?'Hide password':'Show password')} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></label>
        {setup && <label>{t('Confirm password')}<input required minLength="6" type={showPassword?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={t('Repeat your password')}/><KeyRound size={18}/></label>}
        {error && <div className="form-error"><AlertCircle size={16}/>{t(error)}</div>}
        {notice && <div className="form-success"><Check size={16}/>{t(notice)}</div>}
        <button className="primary wide" type="submit" disabled={submitting}>{t(submitting?'Please wait...':setup ? 'Create account' : 'Log in')} <ChevronRight size={18}/></button>
        <small><KeyRound size={13}/> {t('Your password is securely managed by Supabase.')}</small>
      </form>
    </section>
  </main>;
}

function LandingPreviewModal({ mode, copy, onClose }) {
  const [sent,setSent]=useState(false);
  const bookingEmail=import.meta.env.VITE_BOOKING_EMAIL?.trim()||'hello@rentrealm.app';
  const submit=e=>{
    e.preventDefault();
    const form=new FormData(e.currentTarget);
    const subject=`Rent Realm virtual meeting — ${form.get('platform')}`;
    const body=[`Name: ${form.get('name')}`,`Email: ${form.get('email')}`,`Preferred date: ${form.get('date')}`,`Preferred time: ${form.get('time')} (Bahrain time)`,`Platform: ${form.get('platform')}`,`Notes: ${form.get('notes')||'—'}`].join('\n');
    window.location.href=`mailto:${bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  if(mode==='demo')return <Modal title={copy.demoTitle} subtitle={copy.demoModalBody} onClose={onClose}><div className="demo-coming-soon"><span><PlayCircle size={34}/></span><strong>{copy.demoSoon}</strong><p>{copy.demoSoonBody}</p><button className="landing-primary" onClick={onClose}>{copy.gotIt}</button></div></Modal>;
  return <Modal title={copy.bookTitle} subtitle={copy.bookModalBody} onClose={onClose}><form className="modal-form booking-form" onSubmit={submit}><label>{copy.name}<input required name="name" autoComplete="name"/></label><label>{copy.email}<input required name="email" type="email" autoComplete="email" placeholder="name@example.com"/></label><div className="form-row"><label>{copy.date}<input required name="date" type="date" min={localDate()}/></label><label>{copy.time}<input required name="time" type="time"/></label></div><label>{copy.platform}<select required name="platform" defaultValue="Google Meet"><option>Google Meet</option><option>Microsoft Teams</option><option>Zoom</option></select></label><label>{copy.notes}<textarea name="notes" rows="3" placeholder={copy.notesPlaceholder}/></label>{sent&&<p className="booking-notice"><CheckCircle2 size={16}/>{copy.emailOpened}</p>}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>{copy.cancel}</button><button className="landing-primary" type="submit"><CalendarDays size={17}/>{copy.requestMeeting}</button></div></form></Modal>;
}

function LandingPage({ onAccess, lang, setLang }) {
  const [preview,setPreview]=useState(null);
  const copy = lang==='ar' ? {
    nav:['المزايا','كيف يعمل','لماذا رنت ريلم'], login:'تسجيل الدخول', start:'ابدأ الآن',
    eyebrow:'ودّع مطاردة الإيجارات',
    title:<>كل عقار. كل دفعة.<br/><em>في مكان واحد.</em></>,
    body:'رنت ريلم يحوّل فوضى إدارة العقارات إلى نظام واضح — دفعات وعقود ومستأجرون وإيصالات، كلها تحت سيطرتك.',
    cta:'أنشئ حسابك', secondary:'شاهد كيف يعمل', note:'ابدأ خلال دقائق • لا تحتاج بطاقة دفع',
    trusted:'مصمم لأصحاب العقارات ومديريها',
    benefits:[['اعرف من دفع — فوراً','تابع التحصيل والمتأخرات لكل شهر دون جداول مبعثرة.'],['احتفظ بكل شيء منظماً','العقارات والمستأجرون والعقود وسجل الدفعات في مكان واحد.'],['حوّل الدفعات إلى إثبات','سجّل الدفعة وأنشئ إيصال PDF جاهزاً للتنزيل والمشاركة.'],['ملف كامل لكل مستأجر','احتفظ ببيانات التواصل والوحدة وقيمة الإيجار وتاريخ السكن معاً.'],['لا تفوّت مبلغاً مستحقاً','شاهد الأرصدة المتبقية والدفعات الجزئية التي تحتاج إلى متابعة.'],['اعمل بلغتك وطريقتك','بدّل بين العربية والإنجليزية والوضع الفاتح والداكن بسهولة.']],
    howTitle:'من عقار جديد إلى تحصيل واضح', howBody:'سير عمل بسيط يساعدك على إنجاز العمل الإداري بسرعة.',
    steps:[['01','أضف عقاراتك','سجّل الوحدات والعناوين ونظّم محفظتك.'],['02','اربط المستأجرين','احفظ بيانات التواصل والإيجار والعقود.'],['03','تابع كل دفعة','سجّل التحصيل وشاهد المستحق وأصدر الإيصالات.']],
    close:'عقارات أقل تعقيداً. وقت أكثر لك.', closeBody:'ابدأ بتنظيم محفظتك اليوم واجعل متابعة الإيجار مهمة بسيطة وواضحة.',
    dashboard:'لوحة المحفظة', collected:'المحصّل هذا الشهر', outstanding:'المتبقي', tenants:'المستأجرون', ontrack:'معدل التحصيل', attention:'يحتاج للمتابعة', paid:'مدفوع', due:'مستحق',
    previewKicker:'تريد أن تتأكد أولاً؟', previewTitle:'تعرّف على رنت ريلم بطريقتك', previewBody:'شاهد جولة سريعة في المنتج أو احجز لقاءً افتراضياً مع المالك لمناقشة احتياجاتك.', demoTitle:'شاهد العرض التوضيحي', demoBody:'جولة قصيرة توضّح لك إدارة العقارات والمستأجرين والدفعات.', demoSoon:'الفيديو قريباً', demoSoonBody:'نعمل على إعداد جولة واضحة ومختصرة للمنتج. ستتوفر هنا قريباً.', watchDemo:'شاهد العرض', comingSoon:'قريباً', bookTitle:'احجز لقاءً افتراضياً', bookBody:'اختر الوقت والمنصة المناسبة لك وتحدث مباشرة مع المالك.', bookMeeting:'اختر موعداً', bookModalBody:'اختر موعدك المفضل. سيؤكد المالك الموعد ويرسل رابط الاجتماع.', name:'الاسم الكامل', email:'البريد الإلكتروني', date:'التاريخ المفضل', time:'الوقت المفضل', platform:'منصة الاجتماع', notes:'ملاحظات (اختياري)', notesPlaceholder:'ما الذي تود مناقشته؟', requestMeeting:'اطلب الموعد', cancel:'إلغاء', emailOpened:'تم فتح تطبيق البريد لإرسال طلبك.', gotIt:'حسناً'
  } : {
    nav:['Features','How it works','Why Rent Realm'], login:'Log in', start:'Get started',
    eyebrow:'STOP CHASING RENT. START RUNNING IT.',
    title:<>All your properties.<br/><em>In one place.</em></>,
    body:'Rent Realm turns property-management chaos into one clear system—payments, contracts, tenants, and receipts, all under control.',
    cta:'Create your account', secondary:'See how it works', note:'Set up in minutes • No payment card needed',
    trusted:'Built for property owners and managers',
    benefits:[['Know who paid—instantly','Track collected and outstanding rent month by month, without scattered spreadsheets.'],['Keep every detail organized','Properties, tenants, contracts, and payment history stay together in one reliable place.'],['Turn payments into proof','Record a payment and create a downloadable, shareable PDF receipt in moments.'],['Give every tenant one home','Keep contact details, units, rent, and move-in records in one complete profile.'],['Never lose sight of a balance','Spot outstanding amounts and partial payments that still need your attention.'],['Work your way','Switch between English and Arabic, light and dark mode, on any screen.']],
    howTitle:'From new property to clear collection', howBody:'A simple workflow that gets the admin out of your way.',
    steps:[['01','Add your properties','Record units and addresses, then organize your portfolio.'],['02','Connect your tenants','Keep contact details, rent amounts, and contracts close.'],['03','Track every payment','Record collections, see balances, and issue receipts.']],
    close:'Less property admin. More time for you.', closeBody:'Start organizing your portfolio today and make rent follow-up feel refreshingly simple.',
    dashboard:'Portfolio overview', collected:'Collected this month', outstanding:'Outstanding', tenants:'Active tenants', ontrack:'Collection rate', attention:'Needs attention', paid:'Paid', due:'Due',
    previewKicker:'NOT READY TO COMMIT?', previewTitle:'Get to know Rent Realm your way', previewBody:'Watch a quick product tour or book a virtual conversation with the owner to discuss what you need.', demoTitle:'Watch the demo', demoBody:'A short walkthrough of properties, tenants, payments, and receipts.', demoSoon:'Demo video coming soon', demoSoonBody:'We are preparing a clear, concise product tour. It will be available right here soon.', watchDemo:'Watch demo', comingSoon:'Coming soon', bookTitle:'Book a virtual meeting', bookBody:'Choose a time and platform that suit you, then speak directly with the owner.', bookMeeting:'Choose a time', bookModalBody:'Choose your preferred slot. The owner will confirm it and send the meeting link.', name:'Full name', email:'Email address', date:'Preferred date', time:'Preferred time', platform:'Meeting platform', notes:'Notes (optional)', notesPlaceholder:'What would you like to discuss?', requestMeeting:'Request meeting', cancel:'Cancel', emailOpened:'Your email app has opened so you can send the request.', gotIt:'Got it'
  };
  useEffect(()=>{
    const elements=[...document.querySelectorAll('.landing-page .reveal')];
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target)}}),{threshold:.14});
    elements.forEach(element=>observer.observe(element));
    return()=>observer.disconnect();
  },[lang]);
  const scrollTo=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  return <main className="landing-page">
    <nav className="landing-nav"><button className="landing-logo" onClick={()=>scrollTo('top')}><span><Building2 size={21}/></span>Rent Realm</button><div className="landing-links"><button onClick={()=>scrollTo('features')}>{copy.nav[0]}</button><button onClick={()=>scrollTo('how')}>{copy.nav[1]}</button><button onClick={()=>scrollTo('why')}>{copy.nav[2]}</button></div><div className="landing-actions"><button className="landing-language" onClick={()=>setLang(lang==='en'?'ar':'en')}><Globe2 size={16}/>{lang==='en'?'العربية':'English'}</button><button className="landing-login" onClick={()=>onAccess('login')}>{copy.login}</button><button className="landing-primary small" onClick={()=>onAccess('register')}>{copy.start}<ArrowRight size={16}/></button></div></nav>
    <section className="landing-hero" id="top"><div className="hero-copy"><span className="landing-eyebrow"><Sparkles size={15}/>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.body}</p><div className="hero-actions"><button className="landing-primary" onClick={()=>onAccess('register')}>{copy.cta}<ArrowRight size={18}/></button><button className="landing-secondary" onClick={()=>scrollTo('how')}>{copy.secondary}<ChevronDown size={18}/></button></div><small><CheckCircle2 size={15}/>{copy.note}</small></div>
      <div className="product-stage" aria-label={copy.dashboard}><div className="stage-glow"/><div className="product-window"><div className="window-top"><div className="mini-logo"><Building2 size={16}/></div><span>{copy.dashboard}</span><div className="window-dots"><i/><i/><i/></div></div><div className="window-body"><div className="mock-sidebar"><b><Building2 size={15}/></b>{[Home,Building2,Users,Wallet].map((Icon,i)=><i className={i===0?'active':''} key={i}><Icon size={15}/></i>)}</div><div className="mock-content"><div className="mock-heading"><div><span>SEPTEMBER 2026</span><strong>{copy.dashboard}</strong></div><button>+ {copy.tenants}</button></div><div className="mock-stats"><article><span>{copy.collected}</span><b>BHD 4,850</b><small>12 {copy.paid}</small></article><article><span>{copy.outstanding}</span><b>BHD 650</b><small>2 {copy.due}</small></article><article><span>{copy.tenants}</span><b>14</b><small>4 properties</small></article></div><div className="mock-lower"><div className="mock-chart"><span>{copy.ontrack}</span><div className="chart-row"><div className="mock-donut"><b>88%</b></div><div className="chart-bars"><i/><i/><i/><i/><i/><i/></div></div></div><div className="mock-list"><span>{copy.attention}</span><div><i>AK</i><p><b>Ahmed K.</b><small>Seef · 4A</small></p><strong>BHD 350</strong></div><div><i>LM</i><p><b>Layla M.</b><small>Amwaj · 2C</small></p><strong>BHD 300</strong></div></div></div></div></div></div><div className="floating-proof proof-one"><CheckCircle2 size={18}/><span><b>{copy.paid}</b>Receipt ready</span></div><div className="floating-proof proof-two"><BellRing size={18}/><span><b>{copy.attention}</b>2 payments</span></div></div>
    </section>
    <div className="trust-strip"><ShieldCheck size={18}/><span>{copy.trusted}</span><i/><span>Clear monthly tracking</span><i/><span>Secure account access</span></div>
    <section className="preview-section reveal" id="preview"><div className="preview-heading"><span className="section-kicker">{copy.previewKicker}</span><h2>{copy.previewTitle}</h2><p>{copy.previewBody}</p></div><div className="preview-options"><article><span className="preview-icon"><PlayCircle size={26}/></span><span className="soon-badge">{copy.comingSoon}</span><h3>{copy.demoTitle}</h3><p>{copy.demoBody}</p><button className="landing-secondary" onClick={()=>setPreview('demo')}>{copy.watchDemo}<PlayCircle size={17}/></button></article><article><span className="preview-icon"><Video size={26}/></span><h3>{copy.bookTitle}</h3><p>{copy.bookBody}</p><button className="landing-primary" onClick={()=>setPreview('booking')}>{copy.bookMeeting}<Clock size={17}/></button></article></div></section>
    <section className="landing-section benefits reveal" id="features"><div className="section-kicker">WHY RENT REALM</div><h2>{copy.howTitle}</h2><p className="section-lead">{copy.howBody}</p><div className="benefit-grid">{copy.benefits.map(([title,body],i)=>{const Icon=[TrendingUp,FileText,CheckCircle2,Users,BellRing,Globe2][i];return <article style={{'--delay':`${i*70}ms`}} key={title}><span><Icon size={23}/></span><h3>{title}</h3><p>{body}</p></article>})}</div></section>
    <section className="how-section reveal" id="how"><div className="how-copy"><span className="section-kicker">HOW IT WORKS</span><h2>{copy.howTitle}</h2><p>{copy.howBody}</p><button className="landing-primary" onClick={()=>onAccess('register')}>{copy.cta}<ArrowRight size={18}/></button></div><div className="steps">{copy.steps.map(([number,title,body],i)=><article style={{'--delay':`${i*110}ms`}} key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
    <section className="closing-cta reveal" id="why"><div><span className="section-kicker">READY WHEN YOU ARE</span><h2>{copy.close}</h2><p>{copy.closeBody}</p></div><button className="landing-primary light" onClick={()=>onAccess('register')}>{copy.cta}<ArrowRight size={18}/></button></section>
    <footer className="landing-footer"><div className="landing-logo"><span><Building2 size={19}/></span>Rent Realm</div><p>© {new Date().getFullYear()} Rent Realm</p><button onClick={()=>onAccess('login')}>{copy.login}</button></footer>
    {preview&&<LandingPreviewModal mode={preview} copy={copy} onClose={()=>setPreview(null)}/>}
  </main>;
}

function AuthConfigurationError() {
  return <main className="auth-page auth-config-page">
    <section className="auth-form-wrap">
      <div className="auth-form" role="alert">
        <span className="eyebrow">CONFIGURATION REQUIRED</span>
        <h2>Authentication is temporarily unavailable</h2>
        <p>The deployment is missing its Supabase environment variables. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in Vercel, then redeploy.</p>
      </div>
    </section>
  </main>;
}

function Sidebar({ page, setPage, onLogout, open, setOpen, lang, setLang, theme, setTheme, user, onSettings }) {
  const links = [
    ['dashboard', LayoutDashboard, 'Overview'], ['properties', Building2, 'Properties'],
    ['tenants', Users, 'Tenants'], ['payments', Wallet, 'Payments']
  ];
  const t=s=>tx(lang,s); return <><aside className={`sidebar ${open?'open':''}`}>
    <div className="brand"><span className="brand-mark"><Building2 size={21}/></span>Rent Realm</div>
    <button className="close-menu" onClick={()=>setOpen(false)}><X/></button>
    <nav>{links.map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>{setPage(id);setOpen(false)}}><Icon size={19}/>{t(label)}</button>)}</nav>
    <div className="side-bottom"><button onClick={()=>setLang(lang==='en'?'ar':'en')}><Globe2 size={19}/>{lang==='en'?'العربية':'English'}</button><button onClick={()=>setTheme(theme==='light'?'dark':'light')}>{theme==='light'?<Moon size={19}/>:<Sun size={19}/>} {t(theme==='light'?'Dark mode':'Light mode')}</button><button onClick={onSettings}><Settings size={19}/> {t('Settings')}</button><button onClick={onLogout}><LogOut size={19}/> {t('Log out')}</button><div className="side-card"><div className="avatar">{initials(user?.username||'RM')}</div><div><strong>{user?.username||t('Property Manager')}</strong><span>{t(user?.role==='tenant'?'Tenant':'Property Owner')}</span><span>{user?.email||t('Owner account')}</span></div></div></div>
  </aside>{open&&<div className="side-overlay" onClick={()=>setOpen(false)}/>}</>;
}

function Header({ page, setMenu, onAdd, lang, username }) {
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer)},[]);
  const titles = { dashboard:['Good evening','Here’s what’s happening with your properties.'], properties:['Properties','Manage your rental portfolio.'], tenants:['Tenants','Everyone who calls your properties home.'], payments:['Payments','Track monthly rent collection.'] };
  const hour=now.getHours()%12||12;
  const clock=[hour,now.getMinutes(),now.getSeconds()].map(value=>String(value).padStart(2,'0')).join(':');
  const period=now.getHours()>=12?'PM':'AM';
  const t=s=>tx(lang,s); return <header className="topbar"><button className="menu-btn" onClick={()=>setMenu(true)}><Menu/></button><div><span className="date">{now.toLocaleDateString(lang==='ar'?'ar-BH-u-nu-latn':'en-US',{weekday:'long',month:'long',day:'numeric'})}<i>·</i><time dateTime={now.toISOString()}>{clock} {period}</time></span><h1>{t(titles[page][0])}{page==='dashboard'&&username?`, ${username}`:''}</h1><p>{t(titles[page][1])}</p></div><button className="primary" onClick={onAdd}><Plus size={18}/>{t(page==='properties'?'Add property':'Add tenant')}</button></header>;
}

function Stat({ icon:Icon, label, value, meta, tone }) { return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={21}/></div><span>{label}</span><strong>{value}</strong><small>{meta}</small></article> }

function Dashboard({ data, month, setMonth, setPage, togglePaid, lang }) {
  const t = text => tx(lang, text);
  const paidMap = data.payments[month] || {};
  const paid = data.tenants.filter(tenant=>paymentStatus(tenant.rent,paidMap[tenant.id])==='paid');
  const unpaid = data.tenants.filter(tenant=>paymentStatus(tenant.rent,paidMap[tenant.id])!=='paid');
  const total = data.tenants.reduce((s,tenant)=>s+tenant.rent,0), collected=data.tenants.reduce((s,tenant)=>s+Math.min(Number(tenant.rent),amountCollected(paidMap[tenant.id])),0);
  const moveMonth = d => { const x=new Date(`${month}-02`); x.setMonth(x.getMonth()+d); setMonth(monthKey(x)); };
  return <>
    <div className="month-row"><button className="month-nav" onClick={()=>moveMonth(-1)}><ChevronLeft/></button><div><CalendarDays size={18}/><strong>{monthLabel(month)}</strong></div><button className="month-nav" onClick={()=>moveMonth(1)}><ChevronRight/></button></div>
    <section className="stats"><Stat icon={Building2} label={t('Properties')} value={data.properties.length} meta={`${data.properties.reduce((s,p)=>s+p.units,0)} ${t('total units')}`} tone="sage"/><Stat icon={Users} label={t('Active tenants')} value={data.tenants.length} meta={t('Across all properties')} tone="blue"/><Stat icon={CircleDollarSign} label={t('Collected this month')} value={money(collected)} meta={`${paid.length} ${t('of')} ${data.tenants.length} ${t('payments')}`} tone="gold"/><Stat icon={TrendingUp} label={t('Collection rate')} value={`${total?Math.round(collected/total*100):0}%`} meta={`${money(total-collected)} ${t('outstanding')}`} tone="rose"/></section>
    <section className="dash-grid">
      <div className="panel"><div className="panel-head"><div><span className="eyebrow">{t('MONTHLY PROGRESS')}</span><h2>{t('Rent collection')}</h2></div><button className="text-btn" onClick={()=>setPage('payments')}>{t('View all')} <ChevronRight size={16}/></button></div><div className="collection"><div className="donut" style={{'--progress':`${total?collected/total*360:0}deg`}}><div><strong>{total?Math.round(collected/total*100):0}%</strong><span>{t('Collected').toLowerCase()}</span></div></div><div className="collection-info"><span>{t('Total expected')}</span><strong>{money(total)}</strong><div className="legend"><i className="dot green"/>{t('Collected')} <b>{money(collected)}</b></div><div className="legend"><i className="dot coral"/>{t('Outstanding')} <b>{money(total-collected)}</b></div></div></div></div>
      <div className="panel overdue"><div className="panel-head"><div><span className="eyebrow coral-text">{t('NEEDS ATTENTION')}</span><h2>{t('Outstanding rent')}</h2></div><span className="count-badge">{unpaid.length}</span></div>{unpaid.length===0?<div className="empty"><Check/><b>{t('All caught up!')}</b><span>{t('Everyone has paid for')} {monthLabel(month)}.</span></div>:<div className="unpaid-list">{unpaid.slice(0,4).map(tenant=><div className="person" key={tenant.id}><PersonAvatar tenant={tenant}/><div className="person-main"><strong>{tenant.name}</strong><span>{data.properties.find(p=>p.id===tenant.propertyId)?.name} · {t('Unit')} {tenant.unit}</span></div><b>{money(amountOutstanding(tenant.rent,paidMap[tenant.id]))}</b><button className="mark-btn" onClick={()=>togglePaid(tenant.id)}>{t(amountCollected(paidMap[tenant.id])?'Record another payment':'Record payment')}</button></div>)}</div>}</div>
    </section>
    <section className="panel recent"><div className="panel-head"><div><span className="eyebrow">{t('PORTFOLIO')}</span><h2>{t('Your properties')}</h2></div><button className="text-btn" onClick={()=>setPage('properties')}>{t('Manage properties')} <ChevronRight size={16}/></button></div><div className="property-preview">{data.properties.slice(0,3).map(p=>{const ts=data.tenants.filter(tenant=>tenant.propertyId===p.id);return <article key={p.id}><div className="property-art has-photo" style={{backgroundImage:`linear-gradient(#173e3038,#173e3038),url(${p.image||DEFAULT_PROPERTY_IMAGE})`}}><Building2/></div><div><strong>{p.name}</strong><span>{p.address}</span><small><Users size={14}/>{ts.length} {t('tenants')} <i/> {p.units} {t('units')}</small></div></article>})}</div></section>
  </>;
}

function Properties({ data, onDelete, onEdit }) { return <section className="content-panel"><div className="section-title"><div><span className="eyebrow">{t('YOUR PORTFOLIO')}</span><h2>{t('All properties')}</h2></div><span>{data.properties.length} {t('properties')}</span></div><div className="property-grid">{data.properties.map(p=>{const ts=data.tenants.filter(tenant=>tenant.propertyId===p.id);const income=ts.reduce((sum,tenant)=>sum+tenant.rent,0);return <article className="property-card" key={p.id}><div className="property-hero has-photo" style={{backgroundImage:`linear-gradient(#173e3028,#173e3028),url(${p.image||DEFAULT_PROPERTY_IMAGE})`}}><div className="property-actions"><button onClick={()=>onEdit(p)} title={t('Edit property')}><Pencil size={17}/></button><button onClick={()=>onDelete(p.id)} title={t('Delete property')}><Trash2 size={17}/></button></div></div><div className="property-body"><h3>{p.name}</h3><p>{p.address}</p><div className="property-metrics"><div><span>{t('Tenants')}</span><b>{ts.length}</b></div><div><span>{t('Units')}</span><b>{p.units}</b></div><div><span>{t('Empty flats')}</span><b>{p.emptyUnits??0}</b></div><div><span>{t('Monthly rent')}</span><b>{money(income)}</b></div></div></div></article>})}</div></section> }

function Tenants({ data, month, togglePaid, onDelete, onEdit, onViewContract }) {
  const [query,setQuery]=useState(''); const rows=data.tenants.filter(t=>t.name.toLowerCase().includes(query.toLowerCase())||t.unit.toLowerCase().includes(query.toLowerCase()));
  return <section className="content-panel"><div className="table-tools"><div className="search"><Search size={18}/><input placeholder={t('Search tenants or units')} value={query} onChange={e=>setQuery(e.target.value)}/></div><span>{rows.length} {t('active tenants')}</span></div><div className="table-wrap"><table><thead><tr><th>{t('Tenant')}</th><th>{t('Property')}</th><th>{t('Unit')}</th><th>{t('Monthly rent')}</th><th>{monthLabel(month)}</th><th>{t('Rent contract')}</th><th></th></tr></thead><tbody>{rows.map(tenant=>{const payment=data.payments[month]?.[tenant.id];const status=paymentStatus(tenant.rent,payment);return <tr key={tenant.id}><td><div className="person"><PersonAvatar tenant={tenant}/><div><strong>{tenant.name}</strong><span>{tenant.phone}</span></div></div></td><td>{data.properties.find(p=>p.id===tenant.propertyId)?.name}</td><td>{tenant.unit}</td><td><b>{money(tenant.rent)}</b></td><td><button className={`status ${status}`} onClick={()=>togglePaid(tenant.id)}>{status==='paid'?<Check size={14}/>:<AlertCircle size={14}/>} {t(status==='paid'?'Paid':status==='partial'?'Partially paid':'Unpaid')}</button></td><td>{tenant.contractPath?<button className="contract-btn" onClick={()=>onViewContract(tenant)}><FileText size={15}/>{t('View contract')}</button>:<span>—</span>}</td><td><div className="row-actions"><button className="icon-btn" title={t('Edit tenant')} onClick={()=>onEdit(tenant)}><Pencil size={17}/></button><button className="icon-btn danger" title={t('Delete tenant')} onClick={()=>onDelete(tenant.id)}><Trash2 size={17}/></button></div></td></tr>})}</tbody></table></div></section>;
}

function Payments({ data, month, setMonth, togglePaid, onReceipt }) {
 const [query,setQuery]=useState('');const [sort,setSort]=useState('month');const [direction,setDirection]=useState('asc');const [allMonths,setAllMonths]=useState(false);
 const rows=paymentRows(data,month,{query,sort,direction,allMonths});
 const total=rows.reduce((sum,{tenant})=>sum+Number(tenant.rent),0);const received=rows.reduce((sum,{tenant,payment})=>sum+Math.min(Number(tenant.rent),amountCollected(payment)),0);
 const label=allMonths?t('All recorded months'):monthLabel(month);
 const downloadReport=()=>{const doc=new jsPDF();doc.setTextColor(31,91,68);doc.setFontSize(20);doc.text('Rent Realm Payment Summary',14,18);doc.setTextColor(60,70,64);doc.setFontSize(11);doc.text(allMonths?'All recorded months':monthLabel(month),14,26);doc.setFontSize(10);doc.text(`Expected: BHD ${total.toFixed(3)}   Collected: BHD ${received.toFixed(3)}   Outstanding: BHD ${(total-received).toFixed(3)}`,14,35);autoTable(doc,{startY:43,head:[['Month','Tenant','Property / Unit','Rent Due','Collected','Outstanding','Status']],body:rows.map(({tenant,month:rowMonth,payment})=>{const status=paymentStatus(tenant.rent,payment);return [rowMonth,tenant.name,`${data.properties.find(p=>p.id===tenant.propertyId)?.name||'—'} / ${tenant.unit}`,`BHD ${Number(tenant.rent).toFixed(3)}`,`BHD ${amountCollected(payment).toFixed(3)}`,`BHD ${amountOutstanding(tenant.rent,payment).toFixed(3)}`,status==='paid'?'Paid':status==='partial'?'Partially paid':'Unpaid']}),styles:{fontSize:8},headStyles:{fillColor:[31,91,68]},alternateRowStyles:{fillColor:[242,246,243]}});doc.save(`rent-realm-payment-summary-${allMonths?'all-months':month}.pdf`)};
 return <><div className="payment-summary"><div><span>{t('Expected')}</span><b>{money(total)}</b></div><div><span>{t('Collected')}</span><b className="green-text">{money(received)}</b></div><div><span>{t('Outstanding')}</span><b className="coral-text">{money(total-received)}</b></div><label>{t('Viewing month')}<input type="month" value={month} onChange={e=>{if(e.target.value)setMonth(e.target.value)}}/></label></div><section className="content-panel"><div className="section-title"><div><span className="eyebrow">{t('PAYMENT REGISTER')}</span><h2>{label}</h2></div><button className="primary" onClick={downloadReport}><Download size={16}/>{t('Download PDF')}</button></div><div className="table-tools payment-tools"><div className="search"><Search size={18}/><input aria-label={t('Search tenants or units')} placeholder={t('Search tenants or units')} value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="payment-filters"><select aria-label={t('Viewing month')} value={allMonths?'all':'selected'} onChange={e=>setAllMonths(e.target.value==='all')}><option value="selected">{t('Selected month')}</option><option value="all">{t('All recorded months')}</option></select><label>{t('Sort by')}<select value={sort} onChange={e=>setSort(e.target.value)}>{[['month','By Month'],['tenant','By Tenant'],['unit','By Unit']].map(([value,label])=><option key={value} value={value}>{t(label)}</option>)}</select></label><select aria-label={t('Sort direction')} value={direction} onChange={e=>setDirection(e.target.value)}><option value="asc">{t('Ascending')}</option><option value="desc">{t('Descending')}</option></select></div></div><div className="table-wrap"><table><thead><tr><th>{t('Month')}</th><th>{t('Tenant')}</th><th>{t('Property & unit')}</th><th>{t('Rent due')}</th><th>{t('Collected')}</th><th>{t('Outstanding')}</th><th>{t('Status')}</th><th>{t('Receipt')}</th></tr></thead><tbody>{rows.map(({tenant,month:rowMonth,payment})=>{const status=paymentStatus(tenant.rent,payment);return <tr key={rowMonth+tenant.id}><td>{monthLabel(rowMonth)}</td><td><div className="person"><PersonAvatar tenant={tenant}/><strong>{tenant.name}</strong></div></td><td>{data.properties.find(p=>p.id===tenant.propertyId)?.name} · {tenant.unit}</td><td><b>{money(tenant.rent)}</b></td><td><b>{money(amountCollected(payment))}</b></td><td><b>{money(amountOutstanding(tenant.rent,payment))}</b></td><td><button className={`status ${status}`} onClick={()=>togglePaid(tenant.id,rowMonth)}>{status==='paid'?<Check size={14}/>:<AlertCircle size={14}/>} {t(status==='paid'?'Paid':status==='partial'?'Partially paid':'Record payment')}</button></td><td>{payment&&<button className="contract-btn" onClick={()=>onReceipt(tenant,rowMonth)}><FileText size={15}/>{t('View receipt')}</button>}</td></tr>})}{!rows.length&&<tr><td colSpan={8}>{t('No matching payments.')}</td></tr>}</tbody></table></div></section><OutstandingAmounts data={data} rows={rows} label={label} query={query} togglePaid={togglePaid}/></>;
}

function OutstandingAmounts({data,rows,label,query,togglePaid}) {
 const unpaid=rows.filter(({tenant,payment})=>amountOutstanding(tenant.rent,payment)>0);
 const total=unpaid.reduce((sum,{tenant,payment})=>sum+amountOutstanding(tenant.rent,payment),0);
 return <section className="content-panel outstanding-amounts"><div className="section-title"><div><span className="eyebrow">{label}</span><h2>{t('Outstanding amounts')}</h2></div><div className="outstanding-total"><span>{t('Total outstanding')}</span><strong className="coral-text">{money(total)}</strong></div></div>{unpaid.length?<div className="table-wrap"><table><thead><tr><th>{t('Month')}</th><th>{t('Tenant')}</th><th>{t('Property & unit')}</th><th>{t('Amount outstanding')}</th><th></th></tr></thead><tbody>{unpaid.map(({tenant,month,payment})=><tr key={month+tenant.id}><td>{monthLabel(month)}</td><td><div className="person"><PersonAvatar tenant={tenant}/><div><strong>{tenant.name}</strong><span>{tenant.phone}</span></div></div></td><td>{data.properties.find(property=>property.id===tenant.propertyId)?.name||'—'} · {tenant.unit}</td><td><b className="coral-text">{money(amountOutstanding(tenant.rent,payment))}</b></td><td><button className="status unpaid" onClick={()=>togglePaid(tenant.id,month)}><Check size={14}/>{t(amountCollected(payment)?'Record another payment':'Record payment')}</button></td></tr>)}</tbody></table></div>:<p className="outstanding-empty"><Check size={18}/>{t(query.trim()?'No matching outstanding amounts.':'No outstanding amounts for this month.')}</p>}</section>;
}

function AddTenant({ properties, onClose, onSave, initial, lang }) {
 const [form,setForm]=useState(initial||{name:'',propertyId:properties[0]?.id||'',unit:'',rent:'',phone:'',joined:new Date().toISOString().slice(0,10)}); const [contractFile,setContractFile]=useState(null);const [fileError,setFileError]=useState('');const set=(k,v)=>setForm({...form,[k]:v});
 const chooseContract=file=>{setFileError('');if(!file)return;const allowed=file.type==='application/pdf'||file.type.startsWith('image/');if(!allowed||file.size>10*1024*1024){setFileError('Contract file must be a PDF or image under 10 MB.');return}setContractFile(file)};
 const t=s=>tx(lang,s); return <Modal title={t(initial?'Edit tenant':'Add a new tenant')} subtitle={t(initial?'Update their personal, property, or rent details.':'Enter their lease and rent details.')} onClose={onClose}><form className="modal-form" onSubmit={e=>{e.preventDefault();onSave({...form,rent:Number(form.rent),contractFile})}}><ImageField value={form.image} onChange={v=>set('image',v)} lang={lang}/><label>{t('Full name')}<input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Ahmed Khalid"/></label><div className="form-row"><label>{t('Property')}<select required value={form.propertyId} onChange={e=>set('propertyId',e.target.value)}><option value="" disabled>{t('Select property')}</option>{properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>{t('Unit')}<input required value={form.unit} onChange={e=>set('unit',e.target.value)} placeholder="e.g. 4A"/></label></div><div className="form-row"><label>{t('Monthly rent (BHD)')}<input required min="0" type="number" value={form.rent} onChange={e=>set('rent',e.target.value)} placeholder="500"/></label><label>{t('Move-in date')}<input required type="date" value={form.joined} onChange={e=>set('joined',e.target.value)}/></label></div><label>{t('Mobile number')}<input type="tel" value={form.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="+973 0000 0000"/></label><label>{t('Email address')}<input type="email" value={form.email||''} onChange={e=>set('email',e.target.value)}/></label><label className="contract-field">{t('Rent contract')}<span className="contract-upload"><FileText size={17}/>{contractFile?.name||form.contractName||t(form.contractPath?'Replace contract':'Upload contract')}<input type="file" accept="application/pdf,image/*" onChange={e=>chooseContract(e.target.files[0])}/></span><small>{t('PDF or image, up to 10 MB')}</small></label>{fileError&&<div className="form-error"><AlertCircle size={16}/>{t(fileError)}</div>}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>{t('Cancel')}</button><button className="primary" type="submit">{initial?<Pencil size={17}/>:<UserPlus size={17}/>} {t(initial?'Save changes':'Add tenant')}</button></div></form></Modal>;
}

function AccountSettings({user,onClose,onSave,onChangePassword}) {
 const [name,setName]=useState(user.username);const [phone,setPhone]=useState(user.phone);const [error,setError]=useState('');const [saving,setSaving]=useState(false);
 const [password,setPassword]=useState('');const [confirmation,setConfirmation]=useState('');const [passwordError,setPasswordError]=useState('');const [passwordNotice,setPasswordNotice]=useState('');const [showPassword,setShowPassword]=useState(false);
 const changePassword=async e=>{
  e.preventDefault();setPasswordError('');setPasswordNotice('');
  if(password.length<6){setPasswordError('Password must be at least 6 characters.');return}
  if(password!==confirmation){setPasswordError('Passwords do not match.');return}
  setSaving(true);
  try{const error=await onChangePassword(password);if(error){setPasswordError(error);return}setPassword('');setConfirmation('');setPasswordNotice('Password changed successfully.')}
  catch(error){setPasswordError(error.message)}finally{setSaving(false)}
 };
 return <Modal title={t('Account settings')} onClose={onClose}><div className="account-settings-body"><form className="modal-form" onSubmit={async e=>{e.preventDefault();setSaving(true);setError('');try{const error=await onSave({name:name.trim(),phone:phone.trim()});if(error)setError(error)}catch(error){setError(error.message)}finally{setSaving(false)}}}><label>{t('Display name')}<input required minLength={2} value={name} onChange={e=>setName(e.target.value)}/></label><label>{t('Email address')}<input type="email" readOnly value={user.email||''} autoComplete="email"/></label><label>{t('Mobile number (optional)')}<input type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+973 0000 0000"/></label>{error&&<p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>{t('Cancel')}</button><button className="primary" disabled={saving}>{t('Save changes')}</button></div></form><form className="modal-form account-password-form" onSubmit={changePassword}><h3>{t('Change password')}</h3><label>{t('New password')}<input required minLength={6} type={showPassword?'text':'password'} autoComplete="new-password" value={password} onChange={e=>{setPassword(e.target.value);setPasswordNotice('')}}/></label><label>{t('Confirm new password')}<input required minLength={6} type={showPassword?'text':'password'} autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label><button type="button" className="text-btn" aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)}>{t(showPassword?'Hide password':'Show password')}</button>{passwordError&&<p className="form-error" role="alert">{t(passwordError)}</p>}{passwordNotice&&<p className="form-success" role="status"><Check size={16}/>{t(passwordNotice)}</p>}<div className="modal-actions"><button className="primary" disabled={saving}>{t('Change password')}</button></div></form></div></Modal>;
}

function ReceiptPreview({receipt,onClose}) {
 const [pdf,setPdf]=useState({url:'',file:null});const [shareNotice,setShareNotice]=useState('');
 useEffect(()=>{const blob=receiptDocument(receipt).output('blob');const objectUrl=URL.createObjectURL(blob);const file=new File([blob],`receipt-${receipt.number.replace(/\//g,'-')}.pdf`,{type:'application/pdf'});setPdf({url:objectUrl,file});return ()=>URL.revokeObjectURL(objectUrl)},[receipt]);
 const shareToWhatsApp=async()=>{setShareNotice('');const result=await shareReceipt(receipt,pdf.file);if(result==='shared')setShareNotice('Receipt passed to your chosen app. Check the chat before sending.');else if(result==='unsupported'){const whatsappUrl=paymentWhatsAppUrl(receipt);downloadReceipt(receipt);if(whatsappUrl)window.open(whatsappUrl,'_blank','noopener,noreferrer');setShareNotice(whatsappUrl?'To attach the receipt, download the PDF, open WhatsApp confirmation, and attach it as a document before sending.':'Add a valid mobile number with country code to enable WhatsApp confirmation.')}else if(result==='failed')setShareNotice('Sharing could not start. Download the PDF and attach it in WhatsApp instead.')};
 return <div className="modal-backdrop receipt-backdrop" onMouseDown={onClose}><div className="modal receipt-modal" role="dialog" aria-modal="true" aria-label={t('Receipt voucher')} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h2>{t('Receipt voucher')}</h2><p>{receipt.number} · {receipt.tenant.name}</p></div><button className="icon-btn" aria-label={t('Close')} onClick={onClose}><X size={20}/></button></div><div className="receipt-toolbar"><button className="whatsapp-share" disabled={!pdf.file} onClick={shareToWhatsApp}><MessageCircle size={17}/>{t('Share receipt & message')}</button>{pdf.url&&<a className="secondary" href={pdf.url} target="_blank" rel="noopener noreferrer">{t('Open PDF')}</a>}<button className="primary" onClick={()=>downloadReceipt(receipt)}><Download size={16}/>{t('Download receipt')}</button></div>{shareNotice&&<p className="receipt-hint" role="status">{t(shareNotice)}</p>}{pdf.url&&<iframe className="receipt-preview" src={pdf.url} title={t('Receipt voucher')}/>}</div></div>;
}

function RecordPayment({tenant,legacy,onClose,onSave}) {
 const collected=tenant._collected||0;const remaining=Math.max(0,Number(tenant.rent)-collected);const [amount,setAmount]=useState('');const [date,setDate]=useState(localDate);const [method,setMethod]=useState('Cash');const [phone,setPhone]=useState(tenant.phone||'');const [email,setEmail]=useState(tenant.email||'');const [error,setError]=useState('');
 const submit=e=>{e.preventDefault();const value=Number(amount);if(!Number.isFinite(value)||value<=0||value>remaining){setError('Amount must be greater than zero and no more than the remaining balance.');return}onSave({amount:value,date,method,phone,email})};
 return <Modal title={t(legacy?'Receipt details':'Record payment')} subtitle={`${tenant.name} · ${t('Remaining balance')}: ${money(remaining)}`} onClose={onClose}><form className="modal-form" onSubmit={submit}>{legacy&&<p>{t('Enter the original payment date and method to create this receipt.')}</p>}<div className="form-row"><label>{t('Previously collected')}<input readOnly value={money(collected)}/></label><label>{t('Amount paid')}<input required autoFocus min="0.001" max={remaining} step="0.001" type="number" value={amount} onChange={e=>{setAmount(e.target.value);setError('')}}/></label></div><div className="form-row"><label>{t('Mobile number')}<input type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+973 0000 0000"/></label><label>{t('Email address')}<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label></div><label>{t('Payment date')}<input required type="date" max={localDate()} value={date} onChange={e=>setDate(e.target.value)}/></label><label>{t('Payment method')}<select value={method} onChange={e=>setMethod(e.target.value)}>{['Cash','Cheque','Debit Card','Credit Card','BenefitPay','ApplePay'].map(value=><option key={value} value={value}>{t(value)}</option>)}</select></label>{error&&<p className="form-error" role="alert">{t(error)}</p>}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>{t('Cancel')}</button><button className="primary" type="submit"><Check size={16}/>{t('Save payment')}</button></div></form></Modal>;
}

function AddProperty({ onClose,onSave,initial,lang }) { const [f,setF]=useState(initial?{...initial,emptyUnits:initial.emptyUnits??0}:{name:'',address:'',units:'',emptyUnits:0,image:''});const [error,setError]=useState('');const t=s=>tx(lang,s);const submit=e=>{e.preventDefault();const units=Number(f.units),emptyUnits=Number(f.emptyUnits);if(emptyUnits>units){setError('Empty flats cannot exceed the total number of units.');return}onSave({...f,units,emptyUnits})};return <Modal title={t(initial?'Edit property':'Add a property')} subtitle={t(initial?'Update the property information below.':'Create a new property in your portfolio.')} onClose={onClose}><form className="modal-form" onSubmit={submit}><ImageField property value={f.image} onChange={image=>setF({...f,image})} lang={lang}/><label>{t('Property name')}<input required autoFocus value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="e.g. Bay View Residence"/></label><label>{t('Location or address')}<input required value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="e.g. Amwaj Islands"/></label><div className="form-row"><label>{t('Number of units')}<input required min="1" step="1" type="number" value={f.units} onChange={e=>{setF({...f,units:e.target.value});setError('')}} placeholder="10"/></label><label>{t('Empty flats')}<input required min="0" max={f.units||undefined} step="1" type="number" value={f.emptyUnits} onChange={e=>{setF({...f,emptyUnits:e.target.value});setError('')}} placeholder="0"/></label></div>{error&&<p className="form-error" role="alert"><AlertCircle size={16}/>{t(error)}</p>}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>{t('Cancel')}</button><button className="primary">{initial?<Pencil size={17}/>:<Building2 size={17}/>} {t(initial?'Save changes':'Add property')}</button></div></form></Modal> }

function App({ authMode='login', onBack }) {
 if(!supabaseConfigured)return <AuthConfigurationError/>;
 const [session,setSession]=useState(null);
 const [authLoading,setAuthLoading]=useState(true);
 const [data,setData]=useState(emptyData);
 const [portfolioLoading,setPortfolioLoading]=useState(true);
 const [loadedUserId,setLoadedUserId]=useState('');
 const [syncError,setSyncError]=useState('');
 const [lang,setLang]=useState(()=>localStorage.getItem('rentora-lang')||'en');
 const [theme,setTheme]=useState(()=>localStorage.getItem('rentora-theme')||'light');
 activeLanguage=lang;
 document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr'; document.documentElement.dataset.theme=theme;
 const [page,setPage]=useState('dashboard'); const [month,setMonth]=useState(monthKey(new Date())); const [modal,setModal]=useState(null); const [menu,setMenu]=useState(false);
 useEffect(()=>{
  supabase.auth.getSession().then(({data:{session:currentSession}})=>{setSession(currentSession);setAuthLoading(false)});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,nextSession)=>{setSession(nextSession);setAuthLoading(false)});
  return ()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{
  if(!session?.user?.id){setPortfolioLoading(true);setLoadedUserId('');return}
  let active=true;
  const userId=session.user.id;const userStorageKey=`${STORAGE_KEY}:${userId}`;
  const loadPortfolio=async()=>{
   setPortfolioLoading(true);setLoadedUserId('');setSyncError('');
   let localData=emptyData();
   try{localData=JSON.parse(localStorage.getItem(userStorageKey))||emptyData()}catch{}
   const {data:remote,error}=await supabase.from('portfolios').select('data').eq('user_id',userId).maybeSingle();
   if(!active)return;
   if(error){setData(localData);setSyncError('Portfolio sync is unavailable. Apply the Supabase portfolio migration, then reload.');setLoadedUserId(userId);setPortfolioLoading(false);return}
   if(remote?.data && (hasPortfolioData(remote.data)||!hasPortfolioData(localData))){setData(remote.data);localStorage.setItem(userStorageKey,JSON.stringify(remote.data))}
   else {
    setData(localData);
    const {error:saveError}=await supabase.from('portfolios').upsert({user_id:userId,data:localData,updated_at:new Date().toISOString()});
    if(saveError)setSyncError('Your portfolio could not be saved to the database. Please reload and try again.');
   }
   if(active){setLoadedUserId(userId);setPortfolioLoading(false)}
  };
  loadPortfolio();
  return()=>{active=false};
 },[session?.user?.id]);
 useEffect(()=>{
  if(!session?.user?.id||portfolioLoading||loadedUserId!==session.user.id)return;
  const userId=session.user.id;const userStorageKey=`${STORAGE_KEY}:${userId}`;
  localStorage.setItem(userStorageKey,JSON.stringify(data));
  let active=true;
  supabase.from('portfolios').upsert({user_id:userId,data,updated_at:new Date().toISOString()}).then(({error})=>{if(active)setSyncError(error?'Your latest changes could not be saved. Check your connection and try again.':'')});
  return()=>{active=false};
 },[data,session?.user?.id,portfolioLoading,loadedUserId]);
 useEffect(()=>{localStorage.setItem('rentora-lang',lang);document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr'},[lang]);
 useEffect(()=>{localStorage.setItem('rentora-theme',theme);document.documentElement.dataset.theme=theme},[theme]);
 const togglePaid=(id,paymentMonth=month)=>{
  const tenant=data.tenants.find(item=>item.id===id);const payment=data.payments[paymentMonth]?.[id];
  if(paymentStatus(tenant.rent,payment)==='paid'){setData(d=>({...d,payments:{...d.payments,[paymentMonth]:{...(d.payments[paymentMonth]||{}),[id]:false}}}));return}
  setModal({type:'payment',tenant:{...tenant,_collected:amountCollected(payment)},month:paymentMonth,collected:amountCollected(payment)});
 };
 const savePayment=({amount,date,method,phone,email})=>{
  const receipt=createReceipt({tenant:{...modal.tenant,phone:phone.trim(),email:email.trim()},property:data.properties.find(p=>p.id===modal.tenant.propertyId),month:modal.month,date,method,amount,rentDue:Number(modal.tenant.rent),previouslyPaid:modal.collected||0,balance:Math.max(0,Number(modal.tenant.rent)-(modal.collected||0)-amount),issuer:{username:session.user.user_metadata?.username||'Rent Realm',email:session.user.email}});
  setData(d=>({...d,tenants:d.tenants.map(tenant=>tenant.id===modal.tenant.id?{...tenant,phone:phone.trim(),email:email.trim()}:tenant),payments:{...d.payments,[modal.month]:{...(d.payments[modal.month]||{}),[modal.tenant.id]:addPaymentTransaction(d.payments[modal.month]?.[modal.tenant.id],receipt)}}}));setModal({type:'receipt',receipt});
 };
 const onReceipt=(tenant,paymentMonth=month)=>{const receipt=latestReceipt(data.payments[paymentMonth]?.[tenant.id]);if(receipt?.number)setModal({type:'receipt',receipt:{...receipt,propertyAddress:receipt.propertyAddress??data.properties.find(property=>property.id===tenant.propertyId)?.address??''}});else setModal({type:'payment',tenant,month:paymentMonth,legacy:true,collected:0})};
 const saveTenant=async f=>{const {contractFile,...fields}=f;const tenantId=fields.id||crypto.randomUUID();let contractPath=fields.contractPath;let contractName=fields.contractName;if(contractFile){const safeName=contractFile.name.replace(/[^a-zA-Z0-9._-]/g,'_');const nextPath=`${session.user.id}/${tenantId}/${crypto.randomUUID()}-${safeName}`;const {error}=await supabase.storage.from('tenant-contracts').upload(nextPath,contractFile,{contentType:contractFile.type});if(error){alert(`Contract upload failed: ${error.message}`);return}if(contractPath)await supabase.storage.from('tenant-contracts').remove([contractPath]);contractPath=nextPath;contractName=contractFile.name}const saved={...fields,id:tenantId,contractPath,contractName};setData(d=>({...d,tenants:fields.id?d.tenants.map(t=>t.id===fields.id?saved:t):[...d.tenants,saved]}));setModal(null)};
 const saveProperty=f=>{setData(d=>({...d,properties:f.id?d.properties.map(p=>p.id===f.id?f:p):[...d.properties,{...f,id:crypto.randomUUID()}]}));setModal(null)};
 const viewContract=async tenant=>{const {data:signed,error}=await supabase.storage.from('tenant-contracts').createSignedUrl(tenant.contractPath,60,{download:tenant.contractName||'rent-contract'});if(error){alert(`Could not open contract: ${error.message}`);return}const link=document.createElement('a');link.href=signed.signedUrl;link.download=tenant.contractName||'rent-contract';link.rel='noopener';link.click()};
 const register = async ({ displayName, phone, email, password }) => {
  let metadata;try{metadata=registrationMetadata({displayName,phone})}catch(error){return {error:error.message}}
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: window.location.origin
    }
  });

  if (error) {
    if (/already (registered|exists)|user already/i.test(error.message)) {
      return {error:'An account with this email already exists.'};
    }
    return {error:error.message};
  }
  // With email confirmation enabled, Supabase can obscure duplicate signups by
  // returning a user with no identities instead of an explicit error.
  if(data.user && Array.isArray(data.user.identities) && data.user.identities.length===0){
    return {error:'An account with this email already exists.'};
  }
  if(!data.session)return {message:'Check your email to confirm your account, then log in.'};
  return {};
};
 const login=async({email,password})=>{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)return {error:error.message==='Email not confirmed'?'Please confirm your email before logging in.':'Email or password is incorrect.'};return {}};
 if(authLoading)return null;
 if(!session) return <Auth lang={lang} setLang={setLang} hasAccounts initialMode={authMode} onBack={onBack} onRegister={register} onLogin={login}/>;
 if(portfolioLoading||loadedUserId!==session.user.id)return <main className="portfolio-loading"><div className="brand"><span className="brand-mark"><Building2 size={20}/></span>Rent Realm</div><p>{t('Loading your portfolio…')}</p></main>;
 const currentUser={username:session.user.user_metadata?.full_name||session.user.user_metadata?.username||'Property Manager',email:session.user.email,phone:session.user.user_metadata?.phone||'',role:session.user.user_metadata?.role||'property_owner'};
 const add=()=>setModal(page==='properties'?'property':'tenant');
 return <div className="app"><Sidebar page={page} setPage={setPage} open={menu} setOpen={setMenu} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} user={currentUser} onSettings={()=>setModal({type:'account'})} onLogout={()=>supabase.auth.signOut()}/><main className="main"><Header page={page} setMenu={setMenu} onAdd={add} lang={lang} username={currentUser.username}/>{syncError&&<div className="sync-error" role="alert"><AlertCircle size={17}/>{t(syncError)}</div>}<div className="content">{page==='dashboard'&&<Dashboard lang={lang} data={data} month={month} setMonth={setMonth} setPage={setPage} togglePaid={togglePaid}/>} {page==='properties'&&<Properties data={data} onEdit={p=>setModal({type:'property',item:p})} onDelete={id=>{if(confirm(tx(lang,'Delete this property and all of its tenants?')))setData(d=>({...d,properties:d.properties.filter(p=>p.id!==id),tenants:d.tenants.filter(t=>t.propertyId!==id)}))}}/>} {page==='tenants'&&<Tenants data={data} month={month} togglePaid={togglePaid} onViewContract={viewContract} onEdit={tenant=>setModal({type:'tenant',item:tenant})} onDelete={id=>{if(confirm(tx(lang,'Remove this tenant?')))setData(d=>({...d,tenants:d.tenants.filter(tenant=>tenant.id!==id)}))}}/>} {page==='payments'&&<Payments data={data} month={month} setMonth={setMonth} togglePaid={togglePaid} onReceipt={onReceipt}/>}</div></main>{modal?.type==='account'&&<AccountSettings user={currentUser} onClose={()=>setModal(null)} onChangePassword={async password=>{const {data:updated,error}=await supabase.auth.updateUser({password});if(error)return error.message;setSession(previous=>({...previous,user:updated.user}))}} onSave={async fields=>{const {data:updated,error}=await supabase.auth.updateUser({data:{full_name:fields.name,username:fields.name,phone:fields.phone}});if(error)return error.message;setSession(previous=>({...previous,user:updated.user}));setModal(null)}}/>} {modal?.type==='receipt'&&<ReceiptPreview receipt={modal.receipt} onClose={()=>setModal(null)}/>} {modal?.type==='payment'&&<RecordPayment key={modal.tenant.id+modal.month} tenant={modal.tenant} legacy={modal.legacy} onClose={()=>setModal(null)} onSave={savePayment}/>} {(modal==='tenant'||modal?.type==='tenant')&&<AddTenant lang={lang} properties={data.properties} initial={modal?.item} onClose={()=>setModal(null)} onSave={saveTenant}/>} {(modal==='property'||modal?.type==='property')&&<AddProperty lang={lang} initial={modal?.item} onClose={()=>setModal(null)} onSave={saveProperty}/>}</div>;
}

function Root() {
 const [access,setAccess]=useState(null);
 const [sessionChecking,setSessionChecking]=useState(supabaseConfigured);
 const [lang,setLang]=useState(()=>localStorage.getItem('rentora-lang')||'en');
 useEffect(()=>{localStorage.setItem('rentora-lang',lang);document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr'},[lang]);
 useEffect(()=>{
  if(!supabaseConfigured){setSessionChecking(false);return}
  let active=true;
  supabase.auth.getSession().then(({data:{session}})=>{if(active&&session)setAccess('login')}).finally(()=>{if(active)setSessionChecking(false)});
  return()=>{active=false};
 },[]);
 if(sessionChecking)return <main className="portfolio-loading"><div className="brand"><span className="brand-mark"><Building2 size={20}/></span>Rent Realm</div></main>;
 if(!access)return <LandingPage lang={lang} setLang={setLang} onAccess={setAccess}/>;
 return <App authMode={access} onBack={()=>setAccess(null)}/>;
}

createRoot(document.getElementById('root')).render(<Root/>);
