import React, { useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard, Laptop, Users, ArrowLeftRight, Wrench, FileText, Settings,
  Search, Plus, Bell, ChevronDown, Monitor, Keyboard, Mouse, Package,
  CircleCheck, Clock3, AlertTriangle, ShieldCheck, MoreHorizontal, MoreVertical, X,
  Upload, Download, Pencil, Trash2, ArrowUpRight, ArrowDownLeft, Recycle,
  Banknote, CalendarDays, Filter, Menu, Eye, FileCheck2, CircleHelp
} from 'lucide-react';
import { initialAssets, initialEmployees, initialAssignments, emptyAsset, currency, dateLabel, localDateString, readSaved, ASSET_STATUSES, ASSET_CATEGORIES, ASSET_CONDITIONS } from './data/seedData.js';


const nav = [
  {label:'Dashboard', icon:LayoutDashboard},
  {label:'Assets', icon:Laptop},
  {label:'Bulk Stock', icon:Package},
  {label:'Employees', icon:Users},
  {label:'Assignments', icon:ArrowLeftRight},
  {label:'Repairs', icon:Wrench},
  {label:'Reports', icon:FileText}
];


function Badge({value}) {
  const cls = value.toLowerCase().replaceAll(' ','-');
  return <span className={`badge badge-${cls} ${cls}`}>{value}</span>;
}
function StatCard({title,value,sub,icon:Icon,tone,onClick}) {
  return <button className="stat-card" onClick={onClick} type="button">
    <div className={`stat-icon ${tone}`}><Icon size={19}/></div>
    <div className="stat-title">{title}</div><div className="stat-value">{value}</div>
    <div className="stat-sub">{sub}</div>
  </button>;
}
function Modal({title,children,onClose,wide=false,confirmClose=true}) {
  const requestClose=()=>{if(!confirmClose||window.confirm('Close this window? Any unsaved changes will be lost.'))onClose();};
  return <div className="modal-backdrop">
    <section className={`modal ${wide?'wide':''}`} onMouseDown={e=>e.stopPropagation()}>
      <header className="modal-head"><div><h2>{title}</h2><p>Fields marked with * are required.</p></div><button className="icon-button" aria-label="Close dialog" onClick={requestClose}><X size={19}/></button></header>
      {children}
    </section>
  </div>;
}
function App() {
  const [assets,setAssets] = useState(()=>readSaved('itam-assets',initialAssets).filter(a=>!a.quantityTracked));
  const [bulkItems,setBulkItems] = useState(()=>{
    const saved=localStorage.getItem('itam-bulk-items');
    if(saved){try{return JSON.parse(saved)}catch{}}
    return readSaved('itam-assets',initialAssets).filter(a=>a.quantityTracked).map(a=>({id:a.id,tag:a.tag,name:a.name,category:a.category,brand:a.brand||'',model:a.model||'',totalQuantity:Number(a.quantity??a.availableQuantity??0),availableQuantity:Number(a.availableQuantity??a.quantity??0),damagedQuantity:Number(a.damagedQuantity||0),repairQuantity:Number(a.repairQuantity||0),minimumStock:Number(a.minimumStock??5),location:a.location||'IT Store Room',unitCost:Number(a.purchasePrice||0),notes:a.notes||''}));
  });
  const [bulkTransactions,setBulkTransactions] = useState(()=>readSaved('itam-bulk-transactions',[]));
  const [employees,setEmployees] = useState(()=>readSaved('itam-employees',initialEmployees));
  const [assignments,setAssignments] = useState(()=>readSaved('itam-assignments',initialAssignments).map(a=>{
    // Older mockup records may have a stale isTemporary flag. The explicit allocation type is authoritative.
    const type=a.temporaryType || (a.isTemporary ? (a.companyName ? 'Sister Company' : a.originalAssetId ? 'Repair Replacement' : 'Temporary') : 'Regular');
    return {...a,temporaryType:type,isTemporary:type!=='Regular'};
  }));
  const [activity,setActivity] = useState(()=>readSaved('itam-activity',[]));
  const [page,setPage] = useState('Dashboard');
  const [query,setQuery] = useState('');
  const [statusFilter,setStatusFilter] = useState([]);
  const [categoryFilter,setCategoryFilter] = useState([]);
  const [assetDatePeriod,setAssetDatePeriod] = useState('All time');
  const [assetDateFrom,setAssetDateFrom] = useState('');
  const [assetDateTo,setAssetDateTo] = useState('');
  const [categories,setCategories] = useState(()=>readSaved('itam-categories',ASSET_CATEGORIES));
  const [isAdmin,setIsAdmin] = useState(()=>sessionStorage.getItem('itam-admin-session')==='true');
  const [adminForm,setAdminForm] = useState({username:'',password:''});
  const [categoryDraft,setCategoryDraft] = useState('');
  const [recentDocuments,setRecentDocuments] = useState(()=>readSaved('itam-recent-documents',[...assets.flatMap(a=>[{name:a.invoice,kind:'invoice',uploadedAt:a.purchaseDate||''},{name:a.warrantyDoc,kind:'warrantyDoc',uploadedAt:a.purchaseDate||''}].filter(x=>x.name)).map((x,i)=>({...x,id:`seed-${i}`}))].sort((a,b)=>(b.uploadedAt||'').localeCompare(a.uploadedAt||'')).slice(0,20)));
  const [modal,setModal] = useState(null);
  const [editingAsset,setEditingAsset] = useState(null);
  const [assetForm,setAssetForm] = useState(emptyAsset);
  const [employeeForm,setEmployeeForm] = useState({employeeId:'',name:'',department:'',email:'',active:true,recipientType:'Internal',organization:''});
  const [editingEmployeeId,setEditingEmployeeId] = useState(null);
  const [assignmentForm,setAssignmentForm] = useState({assetId:'',employeeId:'',assignedDate:localDateString(),issuedByEmployeeId:'',notes:'',isTemporary:false,temporaryType:'Regular',originalAssetId:'',temporaryReason:'Original laptop under repair',recipientName:'',companyName:'',temporaryDescription:''});
  const [completionForm,setCompletionForm] = useState({assetId:'',cost:'',completedDate:localDateString(),disposition:'available',employeeId:'',issuedByEmployeeId:'',assignedDate:localDateString()});
  const [bulkItemForm,setBulkItemForm] = useState({name:'',category:'Mouse',brand:'',model:'',quantity:'',minimumStock:'5',location:'IT Store Room',unitCost:'',notes:''});
  const [bulkRestockForm,setBulkRestockForm] = useState({itemId:'',quantity:'',date:localDateString(),notes:''});
  const [bulkIssueForm,setBulkIssueForm] = useState({itemId:'',employeeId:'',quantity:'1',issuedDate:localDateString(),issuedBy:'IT Administrator',notes:''});
  const [bulkReturnForm,setBulkReturnForm] = useState({transactionId:'',quantity:'1',returnedDate:localDateString(),condition:'Available',notes:''});
  const [bulkSearch,setBulkSearch] = useState('');
  const [repairForm,setRepairForm] = useState({description:'',reportedDate:localDateString(),sentDate:localDateString(),estimatedCompletionDate:'',vendor:'',cost:'',repairStatus:'Under Repair'});
  const [returnForm,setReturnForm] = useState({returnedDate:localDateString(),nextStatus:'Available',notes:'',repairDescription:'',repairVendor:'',repairCost:'',estimatedCompletionDate:''});
  const [returningAssignment,setReturningAssignment] = useState(null);
  const [selectedAsset,setSelectedAsset] = useState(null);
  const [toast,setToast] = useState('');
  const invoiceRef = useRef(null);
  const warrantyRef = useRef(null);

  const persistAssets = next => { setAssets(next); localStorage.setItem('itam-assets',JSON.stringify(next)); };
  const persistEmployees = next => { setEmployees(next); localStorage.setItem('itam-employees',JSON.stringify(next)); };
  const persistAssignments = next => { setAssignments(next); localStorage.setItem('itam-assignments',JSON.stringify(next)); };
  const persistBulkItems = next => { setBulkItems(next); localStorage.setItem('itam-bulk-items',JSON.stringify(next)); };
  const persistBulkTransactions = next => { setBulkTransactions(next); localStorage.setItem('itam-bulk-transactions',JSON.stringify(next)); };
  const notify = msg => { setToast(msg); setTimeout(()=>setToast(''),2800); };
  const closeModal = () => {if(window.confirm('Close this window? Any unsaved changes will be lost.'))setModal(null);};
  const logActivity = (type,title,detail='') => { const entry={id:Date.now(),type,title,detail,date:new Date().toISOString()}; const next=[entry,...activity].slice(0,30); setActivity(next); localStorage.setItem('itam-activity',JSON.stringify(next)); };
  const today = new Date(); today.setHours(0,0,0,0);
  const inThirtyDays = new Date(today); inThirtyDays.setDate(today.getDate()+30);
  const warrantyStatus = asset => {
    if(!asset.warrantyExpiry) return 'Not recorded';
    const expiry=new Date(asset.warrantyExpiry+'T00:00:00');
    if(expiry<today) return 'Expired';
    if(expiry<=inThirtyDays) return 'Expiring soon';
    return 'Active';
  };
  const expiring = assets.filter(a=>!['Sold','Scrapped','Retired'].includes(a.status)&&warrantyStatus(a)==='Expiring soon');
  const expired = assets.filter(a=>!['Sold','Scrapped','Retired'].includes(a.status)&&warrantyStatus(a)==='Expired');
  const warrantyUnrecorded = assets.filter(a=>!['Sold','Scrapped','Retired'].includes(a.status)&&warrantyStatus(a)==='Not recorded');
  const currentEmployee = asset => (['Assigned','Needs Repair','Under Repair'].includes(asset.status) && asset.employeeId) ? employees.find(e=>e.id===asset.employeeId) : undefined;
  const activeAssignment = assetId => assignments.find(a=>a.assetId===assetId&&!a.returnedDate);
  const vendorOptions = ['Dell India','HP India','Lenovo','Acer','Apple','ASUS','Logitech','Tech World','ReTech Systems','Amazon Business','Local IT Supplier','Other'];
  const internalEmployees = employees.filter(e=>e.active&&(e.recipientType||'Internal')==='Internal');
  const filteredAssets = useMemo(()=>assets.filter(a=>{
    const q=query.toLowerCase();
    const matches = [a.tag,a.name,a.brand,a.model,a.serial,currentEmployee(a)?.name].some(v=>(v||'').toLowerCase().includes(q));
    let dateOk=true; const purchaseDate=a.purchaseDate||'';
    if(assetDatePeriod!=='All time'&&assetDatePeriod!=='Custom range'){const days=assetDatePeriod==='Last 2 days'?2:assetDatePeriod==='Last week'?7:30;const from=new Date();from.setHours(0,0,0,0);from.setDate(from.getDate()-(days-1));dateOk=Boolean(purchaseDate)&&new Date(purchaseDate+'T00:00:00')>=from;}
    if(assetDatePeriod==='Custom range')dateOk=(!assetDateFrom||purchaseDate>=assetDateFrom)&&(!assetDateTo||purchaseDate<=assetDateTo);
    return matches && (!statusFilter.length||statusFilter.includes(a.status)) && (!categoryFilter.length||categoryFilter.includes(a.category)) && dateOk;
  }),[assets,query,statusFilter,categoryFilter,employees,assetDatePeriod,assetDateFrom,assetDateTo]);
  const counts = {
    total:assets.filter(a=>!['Sold','Scrapped','Retired'].includes(a.status)).length,
    available:assets.filter(a=>a.status==='Available').length,
    assigned:assets.filter(a=>a.status==='Assigned').length,
    repair:assets.filter(a=>['Needs Repair','Under Repair'].includes(a.status)).length,
    missing:assets.filter(a=>a.status==='Missing').length,
  };
  const loginAdmin = e => {e.preventDefault();if(adminForm.username==='admin'&&adminForm.password==='Admin@123'){setIsAdmin(true);sessionStorage.setItem('itam-admin-session','true');setAdminForm({username:'',password:''});setModal(null);notify('Administrator access enabled for this session.');}else notify('Incorrect administrator credentials.');};
  const saveCategories = next => {setCategories(next);localStorage.setItem('itam-categories',JSON.stringify(next));};
  const addCategory = () => {const name=categoryDraft.trim();if(!name)return;if(categories.some(c=>c.toLowerCase()===name.toLowerCase())){notify('That category already exists.');return;}saveCategories([...categories,name]);setCategoryDraft('');notify('Category added.');};
  const renameCategory = oldName => {const nextName=window.prompt('Enter the new category name:',oldName)?.trim();if(!nextName||nextName===oldName)return;if(categories.some(c=>c.toLowerCase()===nextName.toLowerCase())){notify('That category already exists.');return;}saveCategories(categories.map(c=>c===oldName?nextName:c));persistAssets(assets.map(a=>a.category===oldName?{...a,category:nextName}:a));persistBulkItems(bulkItems.map(a=>a.category===oldName?{...a,category:nextName}:a));notify('Category updated.');};
  const deleteCategory = name => {if(assets.some(a=>a.category===name)||bulkItems.some(a=>a.category===name)){notify('This category is in use. Reassign its assets and stock items before deleting it.');return;}if(window.confirm(`Delete category \"${name}\"?`))saveCategories(categories.filter(c=>c!==name));};
  const resetAssetForm = () => { setEditingAsset(null); setAssetForm({...emptyAsset,tag:`AST-${String(Math.max(0,...assets.map(a=>a.id))+1).padStart(3,'0')}`}); setModal('asset'); };
  const editAsset = asset => {
    setEditingAsset(asset.id);
    setAssetForm({...emptyAsset,...asset,employeeId:asset.employeeId||'',purchasePrice:String(asset.purchasePrice??''),maintenanceCost:String(asset.maintenanceCost??''),customVendor:vendorOptions.includes(asset.vendor)?'':(asset.vendor||''),customWarrantyProvider:vendorOptions.includes(asset.warrantyProvider)?'':(asset.warrantyProvider||'')});
    setModal('asset');
  };
  const saveAsset = e => {
    e.preventDefault();
    const tag=assetForm.tag.trim();
    const name=assetForm.name.trim();
    if(!tag||!name){notify('Asset tag and asset name are required.');return;}
    if(assets.some(a=>a.tag.toLowerCase()===tag.toLowerCase()&&a.id!==editingAsset)){
      notify('That asset tag is already in use.');return;
    }
    const old=assets.find(a=>a.id===editingAsset);
    const employeeId=assetForm.status==='Assigned' ? (Number(assetForm.employeeId)||null) : (['Needs Repair','Under Repair'].includes(assetForm.status) ? (old?.employeeId||Number(assetForm.employeeId)||null) : null);
    if(assetForm.status==='Assigned'&&!employeeId){notify('Choose an employee before assigning this asset.');return;}
    if(assetForm.status==='Assigned'&&!employees.some(emp=>emp.id===employeeId&&emp.active)){notify('Only active employees can receive assets.');return;}
    const existingActive=activeAssignment(editingAsset);
    if(assetForm.status==='Assigned' && assignments.some(a=>a.assetId===(editingAsset||-1)&&!a.returnedDate&&a.id!==existingActive?.id)){
      notify('This asset already has an active assignment. Return it before assigning again.');return;
    }
    const nextAsset={...assetForm,id:editingAsset||Math.max(0,...assets.map(a=>a.id))+1,tag,name,purchasePrice:Number(assetForm.purchasePrice||0),maintenanceCost:Number(assetForm.maintenanceCost||0),vendor:assetForm.vendor==='Other'?(assetForm.customVendor||'Other'):assetForm.vendor,warrantyProvider:assetForm.warrantyProvider==='Other'?(assetForm.customWarrantyProvider||'Other'):assetForm.warrantyProvider,employeeId,statusHistory:[...(old?.statusHistory||[]),...(!old||old.status!==assetForm.status?[{date:localDateString(),status:assetForm.status,note:old?`Status changed from ${old.status}`:'Asset registered'}]:[])],repairReportedDate:assetForm.status==='Under Repair'?(old?.repairReportedDate||localDateString()):old?.repairReportedDate||'',repairCompletedDate:assetForm.status==='Under Repair'?'':(old?.status==='Under Repair'?localDateString():(old?.repairCompletedDate||''))};
    let nextAssignments=[...assignments];
    const active=nextAssignments.find(a=>a.assetId===nextAsset.id&&!a.returnedDate);
    const todayString=localDateString();
    if(active && (nextAsset.status!=='Assigned'||active.employeeId!==nextAsset.employeeId)){
      nextAssignments=nextAssignments.map(a=>a.id===active.id?{...a,returnedDate:todayString,notes:[a.notes,'Closed after asset details/status change'].filter(Boolean).join(' · ')}:a);
    }
    if(nextAsset.status==='Assigned'&&nextAsset.employeeId&&(!active||active.employeeId!==nextAsset.employeeId)){
      nextAssignments=[{id:Math.max(0,...nextAssignments.map(a=>a.id))+1,assetId:nextAsset.id,employeeId:nextAsset.employeeId,assignedDate:todayString,returnedDate:'',notes:'Assignment created from asset details',isTemporary:false},...nextAssignments];
    }
    persistAssets(editingAsset?assets.map(a=>a.id===editingAsset?nextAsset:a):[nextAsset,...assets]);
    logActivity('asset',editingAsset?'Asset updated':'Asset added',`${nextAsset.tag} · ${nextAsset.name}`);
    if(nextAssignments.some((a,i)=>a!==assignments[i])||nextAssignments.length!==assignments.length)persistAssignments(nextAssignments);
    setModal(null);notify(editingAsset?'Asset updated.':'Asset added.');
  };
  const markStatus = (asset,status) => {
    if(status===asset.status)return;
    // Any status change from an assigned asset must first close its assignment
    // through the return workflow, where IT confirms the asset's next status.
    if(asset.status==='Assigned'){
      const active=activeAssignment(asset.id);
      if(active){openReturnDialog(active,status);return;}
    }
    if(status==='Assigned'){
      if(asset.status!=='Available'){notify('Only available assets can be assigned.');return;}
      setAssignmentForm({assetId:String(asset.id),employeeId:'',assignedDate:localDateString(),issuedByEmployeeId:'',notes:'',isTemporary:false,temporaryType:'Regular',originalAssetId:'',temporaryReason:'Original laptop under repair',recipientName:'',companyName:'',temporaryDescription:''});
      setModal('assign');return;
    }
    if(status==='Needs Repair'||status==='Under Repair'){
      setSelectedAsset(asset);setRepairForm({description:asset.notes||'',reportedDate:asset.repairReportedDate||localDateString(),sentDate:status==='Under Repair'?localDateString():'',estimatedCompletionDate:asset.estimatedRepairCompletionDate||'',vendor:asset.repairVendor||asset.vendor||'',cost:String(asset.currentRepairCost??(asset.repairHistory||[]).find(r=>!r.completedDate)?.cost??''),repairStatus:status});setModal('repair');return;
    }
    if(status==='Available'&&asset.status==='Under Repair'){
      completeRepair(asset);return;
    }
    const todayString=localDateString();
    const next=assets.map(a=>a.id===asset.id?{...a,status,employeeId:null,statusHistory:[...(a.statusHistory||[]),{date:todayString,status,note:`Status changed to ${status}`}]}:a);
    const nextAssignments=assignments.map(a=>a.assetId===asset.id&&!a.returnedDate?{...a,returnedDate:todayString,notes:[a.notes,({Sold:'Closed on sale',Scrapped:'Closed on scrap',Retired:'Closed on retirement',Missing:'Asset marked missing',Available:'Asset returned'}[status]||`Closed after status changed to ${status}`)].filter(Boolean).join(' · ')}:a);
    persistAssets(next);persistAssignments(nextAssignments);
    logActivity('status',`Asset marked ${status.toLowerCase()}`,`${asset.tag} · ${asset.name}`);
    notify(`${asset.tag} marked ${status.toLowerCase()}.`);
  };
  const submitAssignment = e => {
    e.preventDefault();
    const assetId=Number(assignmentForm.assetId);
    const allocationType=assignmentForm.temporaryType||'Regular';
    const isSisterCompany=allocationType==='Sister Company';
    const employee=isSisterCompany?null:employees.find(a=>a.id===Number(assignmentForm.employeeId));
    const asset=assets.find(a=>a.id===assetId);
    const originalAsset=assets.find(a=>a.id===Number(assignmentForm.originalAssetId));
    if(!asset){notify('Select an asset to assign.');return;}
    if(!isSisterCompany&&(!employee||!employee.active)){notify('Select an active employee or recipient.');return;}
    if(isSisterCompany&&(!assignmentForm.recipientName.trim()||!assignmentForm.companyName.trim()||!assignmentForm.temporaryDescription.trim())){notify('Enter the recipient name, sister company name, and allocation purpose.');return;}
    const issuedBy=employees.find(a=>a.id===Number(assignmentForm.issuedByEmployeeId));
    if(!issuedBy||!issuedBy.active||(issuedBy.recipientType||'Internal')!=='Internal'){notify('Select the internal company employee responsible for issuing this asset.');return;}
    if(asset.status!=='Available'){notify('Only available assets can be assigned.');return;}
    if(activeAssignment(assetId)){notify('This asset already has an active assignment. Record its return before creating another assignment.');return;}
    const isTemporary=allocationType!=='Regular';
    if(allocationType==='Repair Replacement'){
      if(!originalAsset||!['Needs Repair','Under Repair'].includes(originalAsset.status)){notify("Select the employee's original laptop that is awaiting or undergoing repair.");return;}
      if(!originalAsset.employeeId||originalAsset.employeeId!==Number(assignmentForm.employeeId)){notify('Select the employee currently associated with the original laptop.');return;}
    }
    const recipientName=isSisterCompany?assignmentForm.recipientName.trim():employee.name;
    const companyName=isSisterCompany?assignmentForm.companyName.trim():'';
    const assignment={
      id:Math.max(0,...assignments.map(a=>a.id))+1,
      assetId, employeeId:employee?.id||null, recipientName, companyName,
      issuedByEmployeeId:issuedBy.id, issuedByName:issuedBy.name, assignedDate:assignmentForm.assignedDate, returnedDate:'',
      notes:assignmentForm.notes, isTemporary, temporaryType:allocationType,
      originalAssetId:allocationType==='Repair Replacement'?Number(assignmentForm.originalAssetId):null,
      temporaryReason:isSisterCompany?assignmentForm.temporaryDescription.trim():(isTemporary?assignmentForm.temporaryReason.trim():'')
    };
    persistAssignments([assignment,...assignments]);
    persistAssets(assets.map(a=>a.id===assetId?{...a,status:'Assigned',employeeId:employee?.id||null,statusHistory:[...(a.statusHistory||[]),{date:assignmentForm.assignedDate,status:'Assigned',note:`Assigned to ${recipientName}${companyName?` (${companyName})`:''} by ${issuedBy.name}`}]}:a));
    logActivity('assignment',isSisterCompany?'Temporary intercompany allocation recorded':(assignment.isTemporary?'Temporary asset assigned':'Asset assigned'),`${asset.tag} → ${recipientName}${companyName?` · ${companyName}`:''}`);
    setModal(null);setPage('Assignments');notify(isSisterCompany?'Temporary intercompany allocation recorded.':assignment.isTemporary?'Temporary asset allocation recorded.':'Asset assignment recorded.');
  };
  const openBulkItemDialog = () => {
    setBulkItemForm({name:'',category:'Mouse',brand:'',model:'',quantity:'',minimumStock:'5',location:'IT Store Room',unitCost:'',notes:''});
    setModal('bulk-item');
  };
  const submitBulkItem = e => {
    e.preventDefault();
    const quantity=Number(bulkItemForm.quantity), minimumStock=Number(bulkItemForm.minimumStock||0);
    if(!bulkItemForm.name.trim()||!Number.isInteger(quantity)||quantity<0||!Number.isInteger(minimumStock)||minimumStock<0){notify('Enter a valid item name and whole-number quantities.');return;}
    const id=Math.max(0,...bulkItems.map(item=>item.id))+1;
    const item={id,tag:`BULK-${String(id).padStart(3,'0')}`,name:bulkItemForm.name.trim(),category:bulkItemForm.category,brand:bulkItemForm.brand.trim(),model:bulkItemForm.model.trim(),totalQuantity:quantity,availableQuantity:quantity,damagedQuantity:0,repairQuantity:0,minimumStock,location:bulkItemForm.location.trim()||'Not specified',unitCost:Number(bulkItemForm.unitCost||0),notes:bulkItemForm.notes.trim()};
    persistBulkItems([item,...bulkItems]);
    logActivity('asset','Bulk stock item added',`${item.name} · ${quantity} units`);
    setModal(null);notify('Bulk stock item added.');
  };
  const submitBulkRestock = e => {
    e.preventDefault();
    const item=bulkItems.find(x=>x.id===Number(bulkRestockForm.itemId));
    const quantity=Number(bulkRestockForm.quantity);
    if(!item||!Number.isInteger(quantity)||quantity<=0){notify('Choose an item and enter a positive whole-number quantity.');return;}
    persistBulkItems(bulkItems.map(x=>x.id===item.id?{...x,totalQuantity:x.totalQuantity+quantity,availableQuantity:x.availableQuantity+quantity}:x));
    logActivity('asset','Bulk stock restocked',`${item.name} · +${quantity} units · received ${bulkRestockForm.date||localDateString()}${bulkRestockForm.notes.trim()?` · ${bulkRestockForm.notes.trim()}`:''}`);
    setModal(null);notify(`${quantity} ${item.name} unit(s) added to available stock.`);
  };
  const submitBulkIssue = e => {
    e.preventDefault();
    const item=bulkItems.find(x=>x.id===Number(bulkIssueForm.itemId));
    const employee=employees.find(x=>x.id===Number(bulkIssueForm.employeeId));
    const quantity=Number(bulkIssueForm.quantity);
    if(!item||!employee||!employee.active){notify('Choose a bulk item and an active employee.');return;}
    if(!Number.isInteger(quantity)||quantity<=0){notify('Quantity must be a positive whole number.');return;}
    if(quantity>item.availableQuantity){notify(`Only ${item.availableQuantity} unit(s) are available.`);return;}
    const transaction={id:Math.max(0,...bulkTransactions.map(t=>t.id))+1,itemId:item.id,employeeId:employee.id,quantityIssued:quantity,quantityReturned:0,issuedDate:bulkIssueForm.issuedDate||localDateString(),issuedBy:bulkIssueForm.issuedBy.trim()||'IT Administrator',notes:bulkIssueForm.notes.trim(),returnEvents:[]};
    persistBulkItems(bulkItems.map(x=>x.id===item.id?{...x,availableQuantity:x.availableQuantity-quantity}:x));
    persistBulkTransactions([transaction,...bulkTransactions]);
    logActivity('assignment','Bulk stock issued',`${item.name} · ${quantity} unit(s) → ${employee.name}`);
    setModal(null);setPage('Bulk Stock');notify(`${quantity} ${item.name} unit(s) issued to ${employee.name}.`);
  };
  const openBulkReturn = transaction => {
    const outstanding=transaction.quantityIssued-transaction.quantityReturned;
    setBulkReturnForm({transactionId:String(transaction.id),quantity:String(outstanding),returnedDate:localDateString(),condition:'Available',notes:''});
    setModal('bulk-return');
  };
  const submitBulkReturn = e => {
    e.preventDefault();
    const transaction=bulkTransactions.find(x=>x.id===Number(bulkReturnForm.transactionId));
    if(!transaction){notify('Could not find the issue record.');return;}
    const outstanding=transaction.quantityIssued-transaction.quantityReturned;
    const quantity=Number(bulkReturnForm.quantity);
    if(!Number.isInteger(quantity)||quantity<=0||quantity>outstanding){notify(`Enter a return quantity between 1 and ${outstanding}.`);return;}
    const item=bulkItems.find(x=>x.id===transaction.itemId);
    if(!item){notify('Could not find the bulk stock item.');return;}
    const event={id:Date.now(),date:bulkReturnForm.returnedDate||localDateString(),quantity,condition:bulkReturnForm.condition,notes:bulkReturnForm.notes.trim()};
    const updatedItem={...item};
    if(event.condition==='Available')updatedItem.availableQuantity+=quantity;
    else if(event.condition==='Damaged')updatedItem.damagedQuantity+=quantity;
    else updatedItem.repairQuantity+=quantity;
    const nextTransactions=bulkTransactions.map(x=>x.id===transaction.id?{...x,quantityReturned:x.quantityReturned+quantity,returnEvents:[event,...(x.returnEvents||[])]}:x);
    persistBulkItems(bulkItems.map(x=>x.id===item.id?updatedItem:x));
    persistBulkTransactions(nextTransactions);
    const employee=employees.find(x=>x.id===transaction.employeeId);
    logActivity('return','Bulk stock returned',`${item.name} · ${quantity} unit(s) from ${employee?.name||'employee'} · ${event.condition}`);
    setModal(null);notify(`${quantity} unit(s) recorded as returned (${event.condition.toLowerCase()}).`);
  };
  const openReturnDialog = (assignment, suggestedStatus='Available') => {
    setReturningAssignment(assignment);
    setReturnForm({returnedDate:localDateString(),nextStatus:suggestedStatus,notes:'',repairDescription:'',repairVendor:'',repairCost:'',estimatedCompletionDate:''});
    setModal('return');
  };
  const returnAssignment = e => {
    e.preventDefault();
    if(!returningAssignment) return;
    const assignment=returningAssignment;
    const asset=assets.find(a=>a.id===assignment.assetId);
    if(!asset) { notify('Could not find the asset for this assignment.'); return; }
    const nextStatus=returnForm.nextStatus;
    const returnedDate=returnForm.returnedDate||localDateString();
    if(assignment.assignedDate && returnedDate < assignment.assignedDate){
      notify('Return date cannot be earlier than the assignment date.');
      return;
    }
    if(['Needs Repair','Under Repair'].includes(nextStatus)&&!returnForm.repairDescription.trim()){
      notify('Enter the repair issue before sending the asset for repair.');
      return;
    }
    const closeNote=`Returned · next status: ${nextStatus}${returnForm.notes.trim()?` · ${returnForm.notes.trim()}`:''}`;
    persistAssignments(assignments.map(a=>a.id===assignment.id?{...a,returnedDate,notes:[a.notes,closeNote].filter(Boolean).join(' · ')}:a));
    // Preserve the original employee as the repair owner only for their regular
    // asset. A temporary replacement should not be automatically reassigned
    // to the same employee when its own repair is completed.
    const keepRepairOwner=['Needs Repair','Under Repair'].includes(nextStatus) && !assignment.isTemporary
      ? (asset.employeeId||assignment.employeeId)
      : null;
    let repairHistory=asset.repairHistory||[];
    if(['Needs Repair','Under Repair'].includes(nextStatus)) {
      const openIndex=repairHistory.findIndex(r=>!r.completedDate);
      const record={id:openIndex>=0?repairHistory[openIndex].id:Date.now(),reportedDate:returnedDate,sentDate:nextStatus==='Under Repair'?returnedDate:'',estimatedCompletionDate:nextStatus==='Under Repair'?(returnForm.estimatedCompletionDate||''):'',description:returnForm.repairDescription.trim()||returnForm.notes.trim()||'Repair required after return',vendor:returnForm.repairVendor.trim(),cost:Number(returnForm.repairCost||0),completedDate:''};
      repairHistory=openIndex>=0?repairHistory.map((r,i)=>i===openIndex?{...r,...record}:r):[record,...repairHistory];
    }
    persistAssets(assets.map(a=>a.id===asset.id?{...a,status:nextStatus,employeeId:keepRepairOwner,statusHistory:[...(a.statusHistory||[]),{date:returnedDate,status:nextStatus,note:`Returned from assignment; status set to ${nextStatus}`}], ...(['Needs Repair','Under Repair'].includes(nextStatus)?{notes:returnForm.repairDescription.trim()||returnForm.notes.trim()||a.notes, repairVendor:returnForm.repairVendor.trim()||a.repairVendor||a.vendor,repairReportedDate:returnedDate,sentForRepairDate:nextStatus==='Under Repair'?returnedDate:'',estimatedRepairCompletionDate:nextStatus==='Under Repair'?(returnForm.estimatedCompletionDate||''):'',currentRepairCost:Number(returnForm.repairCost||0),repairHistory,repairCompletedDate:'',statusHistory:[...(a.statusHistory||[]),{date:returnedDate,status:nextStatus,note:returnForm.repairDescription.trim()}]}:{})}:a));
    const returnedEmployee=employees.find(e=>e.id===assignment.employeeId);
    logActivity('return','Asset returned',`${asset.tag} · ${returnedEmployee?.name||assignment.recipientName||'Recipient'}${assignment.companyName?` · ${assignment.companyName}`:''} · ${nextStatus}`);
    if(['Needs Repair','Under Repair'].includes(nextStatus)) logActivity('repair',nextStatus==='Under Repair'?'Asset sent for repair':'Repair need recorded',`${asset.tag} · ${returnForm.repairDescription.trim()||returnForm.notes.trim()||'Repair required'}`);
    setModal(null);setReturningAssignment(null);
    notify(`${asset.tag} returned. Status set to ${nextStatus}.`);
  };
  const submitEmployee = e => {
    e.preventDefault();
    const employeeCode=employeeForm.employeeId.trim();
    const employeeName=employeeForm.name.trim();
    if(!employeeCode||!employeeName){notify('Employee ID and name are required.');return;}
    if(employees.some(x=>x.employeeId.toLowerCase()===employeeCode.toLowerCase()&&x.id!==editingEmployeeId)){notify('Employee ID already exists.');return;}
    if(!employeeForm.active&&assignments.some(a=>a.employeeId===editingEmployeeId&&!a.returnedDate)){notify('Return the employee’s active assets before deactivating this employee.');return;}
    if(editingEmployeeId){
      persistEmployees(employees.map(x=>x.id===editingEmployeeId?{...x,...employeeForm,employeeId:employeeCode,name:employeeName}:x));
      notify('Employee updated.');
    } else {
      persistEmployees([{...employeeForm,employeeId:employeeCode,name:employeeName,id:Math.max(0,...employees.map(x=>x.id))+1},...employees]);
      logActivity('employee','Employee added',`${employeeCode} · ${employeeName}`);
      notify('Employee added.');
    }
    setModal(null);setEditingEmployeeId(null);setEmployeeForm({employeeId:'',name:'',department:'',email:'',active:true,recipientType:'Internal',organization:''});
  };
  const editEmployee = employee => {
    setEditingEmployeeId(employee.id);
    setEmployeeForm({...employee});
    setSelectedAsset(employee);
    setModal('employee');
  };
  const submitRepair = e => {
    e.preventDefault();
    const todayString=localDateString();
    const old=assets.find(a=>a.id===selectedAsset.id)||selectedAsset;
    const status=repairForm.repairStatus||'Under Repair';
    const history=[...(old.repairHistory||[])];
    const activeIndex=history.findIndex(r=>!r.completedDate);
    const record={id:activeIndex>=0?history[activeIndex].id:Date.now(),reportedDate:repairForm.reportedDate||todayString,sentDate:status==='Under Repair'?(repairForm.sentDate||todayString):'',estimatedCompletionDate:status==='Under Repair'?(repairForm.estimatedCompletionDate||''):'',description:repairForm.description.trim(),vendor:repairForm.vendor.trim(),cost:Number(repairForm.cost||0),completedDate:''};
    if(!record.description){notify('Describe the issue before saving the repair record.');return;}
    if(activeIndex>=0)history[activeIndex]={...history[activeIndex],...record}; else history.unshift(record);
    const wasAssigned=old.status==='Assigned'&&old.employeeId;
    const statusEvent={date:status==='Under Repair'?(record.sentDate||todayString):(record.reportedDate||todayString),status,note:status==='Needs Repair'?'Repair needed; not yet sent to service':`Sent for repair: ${record.description}`};
    persistAssets(assets.map(a=>a.id===old.id?{...a,status,employeeId:wasAssigned?old.employeeId:old.employeeId,notes:record.description,repairVendor:record.vendor,repairReportedDate:record.reportedDate,sentForRepairDate:record.sentDate,estimatedRepairCompletionDate:record.estimatedCompletionDate,currentRepairCost:Number(repairForm.cost||0),repairHistory:history,statusHistory:[...(a.statusHistory||[]),statusEvent]}:a));
    logActivity('repair',status==='Needs Repair'?'Repair needed recorded':'Device sent for repair',`${old.tag} · ${record.description}`);
    if(wasAssigned){persistAssignments(assignments.map(a=>a.assetId===old.id&&!a.returnedDate?{...a,returnedDate:todayString,notes:(a.notes?a.notes+' · ':'')+(status==='Needs Repair'?'Assignment closed because device needs repair':'Closed because asset was sent for repair')}:a));}
    setModal(null);notify(status==='Needs Repair'?'Repair need recorded. Device has not been marked as sent to service.':'Repair started; estimated completion date saved.');
  };
  const completeRepair = asset => {
    const linkedTemporary = assignments.find(a => a.assetId !== asset.id && a.isTemporary && a.temporaryType === 'Repair Replacement' && Number(a.originalAssetId) === Number(asset.id) && !a.returnedDate);
    const previousRecipientId = asset.employeeId || linkedTemporary?.employeeId || '';
    setCompletionForm({
      assetId:String(asset.id), cost:'', completedDate:localDateString(),
      disposition: linkedTemporary ? 'assign-original' : (previousRecipientId ? 'assign-original' : 'available'),
      employeeId:String(previousRecipientId || ''), issuedByEmployeeId:'', assignedDate:localDateString()
    });
    setSelectedAsset(asset);
    setModal('complete-repair');
  };
  const submitRepairCompletion = e => {
    e.preventDefault();
    const asset=assets.find(a=>a.id===Number(completionForm.assetId));
    if(!asset){notify('Asset not found.');return;}
    if(completionForm.cost===''||!Number.isFinite(Number(completionForm.cost))||Number(completionForm.cost)<0){notify('Enter the final repair cost.');return;}
    const linkedTemporary = assignments.find(a => a.assetId !== asset.id && a.isTemporary && a.temporaryType === 'Repair Replacement' && Number(a.originalAssetId) === Number(asset.id) && !a.returnedDate);
    const shouldAssign = ['assign-original','assign-other'].includes(completionForm.disposition);
    const recipientId = completionForm.disposition === 'assign-original'
      ? Number(completionForm.employeeId || asset.employeeId || linkedTemporary?.employeeId)
      : Number(completionForm.employeeId);
    const employee = employees.find(x=>x.id===recipientId && x.active);
    const issuedBy = employees.find(x=>x.id===Number(completionForm.issuedByEmployeeId) && x.active && (x.recipientType||'Internal')==='Internal');
    if(shouldAssign && !employee){notify('Select an active recipient for the repaired device.');return;}
    if(shouldAssign && !issuedBy){notify('Select the internal employee issuing the repaired device.');return;}
    if(shouldAssign && activeAssignment(asset.id)){notify('This asset already has an active assignment. Return it before creating another.');return;}
    if(completionForm.disposition==='keep-temporary' && !linkedTemporary){notify('There is no active temporary replacement linked to this repair.');return;}

    const cost=Number(completionForm.cost), completedDate=completionForm.completedDate||localDateString();
    const history=[...(asset.repairHistory||[])], activeIndex=history.findIndex(r=>!r.completedDate);
    if(activeIndex>=0) history[activeIndex]={...history[activeIndex],cost,completedDate};
    else history.unshift({id:Date.now(),reportedDate:asset.repairReportedDate||completedDate,sentDate:asset.sentForRepairDate||completedDate,estimatedCompletionDate:asset.estimatedRepairCompletionDate||'',description:asset.notes||'Repair completed',vendor:asset.repairVendor||'',cost,completedDate});

    let nextAssets=[...assets];
    let nextAssignments=[...assignments];
    // If a temporary replacement was issued for this repair, close it automatically unless the user chooses to keep it permanently.
    if(linkedTemporary && completionForm.disposition !== 'keep-temporary') {
      const tempAsset=nextAssets.find(a=>a.id===linkedTemporary.assetId);
      nextAssignments=nextAssignments.map(a=>a.id===linkedTemporary.id?{...a,returnedDate:completedDate,notes:[a.notes,'Temporary replacement returned when the original device repair was completed'].filter(Boolean).join(' · ')}:a);
      if(tempAsset) nextAssets=nextAssets.map(a=>a.id===tempAsset.id?{...a,status:'Available',employeeId:null,statusHistory:[...(a.statusHistory||[]),{date:completedDate,status:'Available',note:`Temporary replacement returned after ${asset.tag} repair was completed`}]}:a);
    }
    // Keeping the temporary device means converting the existing temporary record into a normal, permanent assignment.
    if(linkedTemporary && completionForm.disposition === 'keep-temporary') {
      nextAssignments=nextAssignments.map(a=>a.id===linkedTemporary.id?{...a,isTemporary:false,temporaryType:'Regular',originalAssetId:null,temporaryReason:'',notes:[a.notes,'Converted to a standard assignment after the original device repair was completed'].filter(Boolean).join(' · ')}:a);
    }

    const newAssignment=shouldAssign?{
      id:Math.max(0,...nextAssignments.map(a=>a.id))+1,assetId:asset.id,employeeId:employee.id,
      issuedByEmployeeId:issuedBy.id,issuedByName:issuedBy.name,assignedDate:completionForm.assignedDate||completedDate,
      returnedDate:'',notes:'New assignment created after repair completion',isTemporary:false,temporaryType:'Regular',originalAssetId:null,temporaryReason:''
    }:null;
    nextAssets=nextAssets.map(a=>{
      if(a.id===asset.id) return {...a,status:newAssignment?'Assigned':'Available',employeeId:newAssignment?employee.id:null,maintenanceCost:Number(a.maintenanceCost||0)+cost,currentRepairCost:0,repairHistory:history,repairCompletedDate:completedDate,estimatedRepairCompletionDate:'',statusHistory:[...(a.statusHistory||[]),{date:completedDate,status:'Available',note:`Repair completed; final repair cost ${currency(cost)}`},...(newAssignment?[{date:completionForm.assignedDate||completedDate,status:'Assigned',note:`Assigned to ${employee.name} by ${issuedBy.name} after repair`}]:[])]};
      return a;
    });
    if(newAssignment) nextAssignments=[newAssignment,...nextAssignments];
    persistAssets(nextAssets);
    if(nextAssignments!==assignments) persistAssignments(nextAssignments);
    logActivity('repair','Repair completed',`${asset.tag} · ${asset.name} · ${currency(cost)}`);
    if(linkedTemporary && completionForm.disposition==='keep-temporary') logActivity('assignment','Temporary replacement converted to standard assignment',`${linkedTemporary.assetId} remains assigned to ${employees.find(x=>x.id===linkedTemporary.employeeId)?.name||'recipient'}`);
    if(newAssignment) logActivity('assignment','Asset assigned after repair',`${asset.tag} → ${employee.name}`);
    setModal(null);
    const result=completionForm.disposition==='keep-temporary'?'Temporary device retained as the permanent assignment.':newAssignment?`Repaired device assigned to ${employee.name}.`: 'Repaired device is now available.';
    notify(`Repair completed. Final cost ${currency(cost)} recorded. ${result}`);
  };
  const uploadName = (field,file) => { if(file){const item={id:`${Date.now()}-${file.name}`,name:file.name,kind:field,uploadedAt:new Date().toISOString()};const next=[item,...recentDocuments].slice(0,30);setRecentDocuments(next);localStorage.setItem('itam-recent-documents',JSON.stringify(next));setAssetForm(f=>({...f,[field]:file.name,[field==='invoice'?'invoiceFileId':'warrantyFileId']:item.id}));notify(`${file.name} added to recent files. The mockup stores the filename only.`);} };
  const selectRecentDocument = (field,document) => setAssetForm(f=>({...f,[field]:document.name,[field==='invoice'?'invoiceFileId':'warrantyFileId']:document.id}));
  const navTo = label => {setPage(label);setQuery('');setStatusFilter([]);setCategoryFilter([]);setAssetDateFrom('');setAssetDateTo('');};
  const activeAssets = assets.filter(a=>!['Sold','Scrapped','Retired'].includes(a.status));
  const recentAssets = [...assets].sort((a,b)=>b.id-a.id).slice(0,5);
  const employeeAssets = employee => assets.filter(a=>a.employeeId===employee.id&&a.status==='Assigned').length;

  return <div className="app-shell"><style>{`.temporary-toggle{display:flex;align-items:flex-start;gap:10px;padding:13px;border:1px solid #dfe6f7;border-radius:8px;background:#f7f9ff;cursor:pointer}
.temporary-toggle input{margin-top:3px;accent-color:#4169e1;width:15px;height:15px;flex-shrink:0}
.temporary-toggle span{display:flex;flex-direction:column;gap:4px}
.temporary-toggle strong{font-size:11px;color:#303747}
.temporary-toggle small,.temporary-detail{display:block;font-size:9px;color:#858c9a;line-height:1.5;white-space:normal;margin-top:4px}
.assignment-status-select{max-width:150px;min-width:120px;border:1px solid #e1e5eb;border-radius:6px;background:#fff;color:#555d6b;padding:7px 8px;font-size:10px}
.search-select{position:relative;width:100%}
.search-select input{width:100%;box-sizing:border-box;padding-right:34px}
.asset-repair-history{margin-top:20px}.asset-repair-history .table-wrap{margin-top:12px}.asset-repair-history table{min-width:650px}.asset-repair-history td{vertical-align:top}.asset-repair-history td strong{display:block}.asset-repair-history td small{display:block;color:#8991a1;margin-top:3px}.badge-needs-repair{background:#fff0e3;color:#b86b27}
.search-select-trigger{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#858c9a;pointer-events:none;display:flex}
.search-select-menu{position:absolute;z-index:40;top:calc(100% + 4px);left:0;right:0;max-height:220px;overflow-y:auto;background:#fff;border:1px solid #dfe4ec;border-radius:8px;box-shadow:0 10px 28px rgba(25,35,55,.13);padding:4px}
.search-select-option{display:flex;width:100%;text-align:left;border:0;background:#fff;border-radius:5px;padding:9px 10px;font-size:12px;color:#303747;cursor:pointer}
.search-select-option:hover,.search-select-option:focus{background:#f1f5ff;outline:none}
.search-select-empty{padding:10px;color:#858c9a;font-size:11px}
.badge-temporary{background:#fff1e4;color:#bd762f}
.badge-regular{background:#edf1ff;color:#4969cf}
.badge-retired{background:#f0f1f4;color:#757b87}
.bulk-stats{grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:18px}
.bulk-stats .stat-card{min-height:116px}
.bulk-stats .stat-title{margin-top:10px}
.bulk-stats .stat-sub{font-size:9px}
.subtabs{margin:0 18px 15px}
.table-wrap td small{display:block;font-size:9px;color:#8d95a5;margin-top:4px;line-height:1.4;white-space:normal}
.row-actions .btn{padding:6px 8px}
.btn:disabled{opacity:.45;cursor:not-allowed}
@media(max-width:760px){.bulk-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}

@media(max-width:760px){.assignment-status-select{min-width:105px;max-width:120px}}`}</style>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Package size={21}/></div><div><strong>assetwise</strong><span>IT ASSET MANAGEMENT</span></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav><div className="nav-group"><p>OVERVIEW</p>{nav.filter(item=>item.label==='Dashboard').map(item=><button key={item.label} className={`nav-item ${page===item.label?'active':''}`} onClick={()=>navTo(item.label)}><item.icon size={18}/><span>{item.label}</span></button>)}</div><div className="nav-group"><p>ASSET MANAGEMENT</p>{nav.filter(item=>['Assets','Bulk Stock','Employees','Assignments'].includes(item.label)).map(item=><button key={item.label} className={`nav-item ${page===item.label?'active':''}`} onClick={()=>navTo(item.label)}><item.icon size={18}/><span>{item.label}</span>{item.label==='Assets'&&<span className="nav-count">{activeAssets.length}</span>}</button>)}</div><div className="nav-group"><p>OPERATIONS</p>{nav.filter(item=>item.label==='Repairs').map(item=><button key={item.label} className={`nav-item ${page===item.label?'active':''}`} onClick={()=>navTo(item.label)}><item.icon size={18}/><span>{item.label}</span></button>)}</div><div className="nav-group"><p>REPORTING</p>{nav.filter(item=>item.label==='Reports').map(item=><button key={item.label} className={`nav-item ${page===item.label?'active':''}`} onClick={()=>navTo(item.label)}><item.icon size={18}/><span>{item.label}</span></button>)}</div></nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>Manage assets, assignments and repairs from one place.</p></div>
        <button className={`nav-item ${page==='Settings'?'active':''}`} onClick={()=>navTo('Settings')}><Settings size={18}/><span>Settings</span></button>
        <div className="profile"><div className="avatar">IT</div><div className="profile-copy"><strong>IT Administrator</strong><span>Admin workspace</span></div><MoreHorizontal size={18}/></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div>
        <div className="top-actions"><button className="icon-button notification" onClick={()=>notify(`${expiring.length} warranty item(s) expiring in the next 30 days.`)}><Bell size={18}/>{expiring.length>0&&<i/>}</button><div className="top-avatar">IT</div></div>
      </header>
      <div className="content">
        {page==='Dashboard'&&<DashboardPage counts={counts} expiring={expiring} expired={expired} recentAssets={recentAssets} assets={assets} employees={employees} activity={activity} onAdd={resetAssetForm} onNavigate={navTo} onFilterStatus={status=>{setPage('Assets');setQuery('');setStatusFilter([status]);setCategoryFilter([]);setAssetDatePeriod('All time');setAssetDateFrom('');setAssetDateTo('')}} onFilterCategory={category=>{setPage('Assets');setQuery('');setStatusFilter([]);setCategoryFilter([category]);setAssetDatePeriod('All time');setAssetDateFrom('');setAssetDateTo('')}} onView={a=>{setSelectedAsset(a);setModal('details')}} currency={currency} dateLabel={dateLabel}/>}
        {page==='Bulk Stock'&&<BulkStockPage items={bulkItems} transactions={bulkTransactions} employees={employees} search={bulkSearch} setSearch={setBulkSearch} onAdd={openBulkItemDialog} onRestock={item=>{setBulkRestockForm({itemId:String(item.id),quantity:'',date:localDateString(),notes:''});setModal('bulk-restock')}} onIssue={item=>{setBulkIssueForm({itemId:String(item?.id||''),employeeId:'',quantity:'1',issuedDate:localDateString(),issuedBy:'IT Administrator',notes:''});setModal('bulk-issue')}} onReturn={openBulkReturn} currency={currency} dateLabel={dateLabel}/>}
        {page==='Assets'&&<AssetsPage assets={filteredAssets} allAssets={assets} employees={employees} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} categories={categories} datePeriod={assetDatePeriod} setDatePeriod={setAssetDatePeriod} dateFrom={assetDateFrom} setDateFrom={setAssetDateFrom} dateTo={assetDateTo} setDateTo={setAssetDateTo} onAdd={resetAssetForm} onEdit={editAsset} onView={a=>{setSelectedAsset(a);setModal('details')}} onStatus={markStatus} currentEmployee={currentEmployee} currency={currency} dateLabel={dateLabel} warrantyStatus={warrantyStatus}/>}
        {page==='Employees'&&<EmployeesPage employees={employees} assets={assets} onAdd={()=>{setEditingEmployeeId(null);setEmployeeForm({employeeId:'',name:'',department:'',email:'',active:true,recipientType:'Internal',organization:''});setModal('employee')}} onView={e=>{setSelectedAsset(e);setModal('employeeDetails')}} onEdit={editEmployee}/>}
        {page==='Assignments'&&<AssignmentsPage assignments={assignments} assets={assets} employees={employees} onAdd={()=>{setAssignmentForm({assetId:'',employeeId:'',assignedDate:localDateString(),issuedByEmployeeId:'',notes:'',isTemporary:false,temporaryType:'Regular',originalAssetId:'',temporaryReason:'',recipientName:'',companyName:'',temporaryDescription:''});setModal('assign')}} onReturn={openReturnDialog} onStatusChange={markStatus} dateLabel={dateLabel}/>}
        {page==='Repairs'&&<RepairsPage assets={assets} onComplete={completeRepair} onOpen={a=>{setSelectedAsset(a);setRepairForm({description:a.notes||'',reportedDate:a.repairReportedDate||localDateString(),sentDate:a.sentForRepairDate||localDateString(),estimatedCompletionDate:a.estimatedRepairCompletionDate||'',vendor:a.repairVendor||a.vendor||'',cost:String(a.currentRepairCost??(a.repairHistory||[]).find(r=>!r.completedDate)?.cost??''),repairStatus:a.status==='Needs Repair'?'Needs Repair':'Under Repair'});setModal('repair')}} currency={currency} dateLabel={dateLabel}/>}
        {page==='Reports'&&<ReportsPage assets={assets} assignments={assignments} employees={employees} currency={currency}/>}
        {page==='Settings'&&<SettingsPage isAdmin={isAdmin} categories={categories} categoryDraft={categoryDraft} setCategoryDraft={setCategoryDraft} onAddCategory={addCategory} onEditCategory={renameCategory} onDeleteCategory={deleteCategory} onLogin={()=>{setModal('admin-login')}} onLogout={()=>{setIsAdmin(false);sessionStorage.removeItem('itam-admin-session');notify('Administrator session ended.')}} onReset={()=>{if(confirm('Restore the initial records? This clears saved changes in this browser.')){localStorage.removeItem('itam-assets');localStorage.removeItem('itam-employees');localStorage.removeItem('itam-assignments');localStorage.removeItem('itam-activity');localStorage.removeItem('itam-bulk-items');localStorage.removeItem('itam-bulk-transactions');localStorage.removeItem('itam-categories');location.reload();}}}/>}
      </div>
    </main>
    {modal==='admin-login'&&<Modal title="Administrator sign in" onClose={()=>setModal(null)} confirmClose={false}><form className="form-body" onSubmit={loginAdmin}><div className="info-note"><strong>Mockup administrator access</strong><br/>Demo username: <b>admin</b> · Password: <b>Admin@123</b><br/>This is client-side demonstration authentication, not production security.</div><Field label="Username"><input required autoComplete="username" value={adminForm.username} onChange={e=>setAdminForm({...adminForm,username:e.target.value})}/></Field><Field label="Password"><input required type="password" autoComplete="current-password" value={adminForm.password} onChange={e=>setAdminForm({...adminForm,password:e.target.value})}/></Field><div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn primary" type="submit">Sign in</button></div></form></Modal>}
    {modal==='asset'&&<Modal title={editingAsset?'Edit asset':'Add new asset'} onClose={()=>setModal(null)} wide>
      <form onSubmit={saveAsset} className="form-body">
        <div className="form-section-title">Asset information</div>
        <div className="form-grid">
          <Field label="Asset tag *"><input required value={assetForm.tag} onChange={e=>setAssetForm({...assetForm,tag:e.target.value})} placeholder="AST-010"/></Field>
          <Field label="Asset name *"><input required value={assetForm.name} onChange={e=>setAssetForm({...assetForm,name:e.target.value})} placeholder="e.g. Dell Latitude 5450"/></Field>
          <Field label="Category"><select value={assetForm.category} onChange={e=>setAssetForm({...assetForm,category:e.target.value})}>{categories.map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Condition"><select value={assetForm.condition} onChange={e=>setAssetForm({...assetForm,condition:e.target.value})}><option>New</option><option>Refurbished</option></select></Field>
          <Field label="Brand"><input value={assetForm.brand} onChange={e=>setAssetForm({...assetForm,brand:e.target.value})} placeholder="e.g. Dell"/></Field>
          <Field label="Model"><input value={assetForm.model} onChange={e=>setAssetForm({...assetForm,model:e.target.value})} placeholder="Model number"/></Field>
          <Field label="Serial number"><input value={assetForm.serial} onChange={e=>setAssetForm({...assetForm,serial:e.target.value})} placeholder="Serial number"/></Field>
          <Field label="Status"><select className={`status-select status-${assetForm.status.toLowerCase().replaceAll(' ','-')}`} value={assetForm.status} onChange={e=>setAssetForm({...assetForm,status:e.target.value})}>{ASSET_STATUSES.map(x=><option key={x}>{x}</option>)}</select></Field>
          {assetForm.status==='Assigned'&&<Field label="Assigned employee *"><select required value={assetForm.employeeId} onChange={e=>setAssetForm({...assetForm,employeeId:e.target.value})}><option value="">Select employee</option>{employees.filter(e=>e.active).map(e=><option key={e.id} value={e.id}>{e.employeeId} · {e.name}</option>)}</select></Field>}
        </div>
        <div className="form-section-title">Purchase & costs</div>
        <div className="form-grid">
          <Field label="Purchase price (₹)"><input type="number" min="0" value={assetForm.purchasePrice} onChange={e=>setAssetForm({...assetForm,purchasePrice:e.target.value})} placeholder="0"/></Field>
          <Field label="Completed repair cost to date (₹)"><input type="number" min="0" value={assetForm.maintenanceCost} onChange={e=>setAssetForm({...assetForm,maintenanceCost:e.target.value})} placeholder="0"/></Field>
          <Field label="Purchase date"><input type="date" value={assetForm.purchaseDate} onChange={e=>setAssetForm({...assetForm,purchaseDate:e.target.value})}/></Field>
          <Field label="Purchase vendor / supplier"><select value={vendorOptions.includes(assetForm.vendor)?assetForm.vendor:(assetForm.vendor?'Other':'')} onChange={e=>setAssetForm({...assetForm,vendor:e.target.value==='Other'?'Other':e.target.value})}><option value="">Select purchase vendor</option>{vendorOptions.map(v=><option key={v}>{v}</option>)}</select></Field>{assetForm.vendor==='Other'&&<Field label="Other purchase vendor name"><input value={assetForm.customVendor||''} onChange={e=>setAssetForm({...assetForm,customVendor:e.target.value})} placeholder="Enter vendor name"/></Field>}
          <Field label="Warranty start date"><input type="date" value={assetForm.warrantyStart||''} onChange={e=>setAssetForm({...assetForm,warrantyStart:e.target.value})}/></Field>
          <Field label="Warranty expiry date"><input type="date" min={assetForm.warrantyStart||assetForm.purchaseDate||undefined} value={assetForm.warrantyExpiry} onChange={e=>setAssetForm({...assetForm,warrantyExpiry:e.target.value})}/></Field>
          <Field label="Warranty provider"><select value={vendorOptions.includes(assetForm.warrantyProvider)?assetForm.warrantyProvider:(assetForm.warrantyProvider?'Other':'')} onChange={e=>setAssetForm({...assetForm,warrantyProvider:e.target.value==='Other'?'Other':e.target.value})}><option value="">Select warranty provider</option>{vendorOptions.map(v=><option key={v}>{v}</option>)}</select></Field>{assetForm.warrantyProvider==='Other'&&<Field label="Other warranty provider name"><input value={assetForm.customWarrantyProvider||''} onChange={e=>setAssetForm({...assetForm,customWarrantyProvider:e.target.value})} placeholder="Enter warranty provider"/></Field>}
          <Field label="Warranty coverage / terms"><input value={assetForm.warrantyCoverage||''} onChange={e=>setAssetForm({...assetForm,warrantyCoverage:e.target.value})} placeholder="e.g. parts and labour, onsite support"/></Field>
        </div>
        <p className="form-note">Warranty is calculated from the expiry date: Active, Expiring soon (within 30 days), Expired, or Not recorded. Add the warranty document for reference.</p>
        <div className="form-section-title">Documents</div>
        <div className="document-upload-grid">
          <div><DocumentUpload title="Invoice / purchase bill" filename={assetForm.invoice} inputRef={invoiceRef} onChange={file=>uploadName('invoice',file)}/></div>
          <div><DocumentUpload title="Warranty document" filename={assetForm.warrantyDoc} inputRef={warrantyRef} onChange={file=>uploadName('warrantyDoc',file)}/></div>
        </div>
        <div className="recent-document-groups">
          <details className="recent-files-box">
            <summary><span><FileCheck2 size={16}/> Recently uploaded invoice files</span><small>{recentDocuments.filter(file=>file.kind==='invoice').length} invoice file(s) · Select to reuse</small></summary>
            <RecentDocumentLinks documents={recentDocuments} kind="invoice" onSelect={selectRecentDocument}/>
          </details>
          <details className="recent-files-box">
            <summary><span><FileCheck2 size={16}/> Recently uploaded warranty files</span><small>{recentDocuments.filter(file=>file.kind==='warrantyDoc').length} warranty file(s) · Select to reuse</small></summary>
            <RecentDocumentLinks documents={recentDocuments} kind="warrantyDoc" onSelect={selectRecentDocument}/>
          </details>
        </div>
        <p className="form-note">This frontend mockup keeps recent file names for reuse. Actual file storage and secure access will be handled by the Django backend.</p>
        <Field label="Notes"><textarea rows="3" value={assetForm.notes} onChange={e=>setAssetForm({...assetForm,notes:e.target.value})} placeholder="Condition, accessories, disposal notes…"/></Field>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button className="btn primary" type="submit"><Plus size={16}/>{editingAsset?'Save changes':'Add asset'}</button></div>
      </form>
    </Modal>}
    {modal==='assign'&&<Modal title="Create asset assignment" onClose={()=>setModal(null)} wide>
      <form className="form-body" onSubmit={submitAssignment}>
        <div className="info-callout"><ArrowLeftRight size={17}/><span>Record the recipient, issuing employee, assignment date, and any temporary allocation details.</span></div>
        <div className="form-section-title">Assignment information</div>
        <Field label="Asset *"><SearchableSelect required value={assignmentForm.assetId} placeholder="Search by asset tag or name…" emptyText="No available assets match your search" options={assets.filter(a=>a.status==='Available').map(a=>({value:String(a.id),label:`${a.tag} · ${a.name}`}))} onChange={value=>setAssignmentForm({...assignmentForm,assetId:value})}/></Field>
        <Field label="Allocation type *"><select value={assignmentForm.temporaryType||'Regular'} onChange={e=>setAssignmentForm({...assignmentForm,temporaryType:e.target.value,isTemporary:e.target.value!=='Regular',originalAssetId:e.target.value==='Repair Replacement'?assignmentForm.originalAssetId:''})}><option value="Regular">Standard assignment</option><option value="Repair Replacement">Temporary replacement — recipient's device under repair</option><option value="Sister Company">Temporary intercompany allocation — sister company request</option></select></Field>
        {assignmentForm.temporaryType==='Sister Company'?<>
          <div className="form-section-title">Temporary intercompany allocation details</div>
          <Field label="Recipient name *"><input required value={assignmentForm.recipientName||''} onChange={e=>setAssignmentForm({...assignmentForm,recipientName:e.target.value})} placeholder="Full name of the person receiving the device"/></Field>
          <Field label="Sister company name *"><input required value={assignmentForm.companyName||''} onChange={e=>setAssignmentForm({...assignmentForm,companyName:e.target.value})} placeholder="Legal or registered company name"/></Field>
          <Field label="Purpose / description *"><textarea required rows="3" value={assignmentForm.temporaryDescription||''} onChange={e=>setAssignmentForm({...assignmentForm,temporaryDescription:e.target.value})} placeholder="Describe the request and why the device is being provided temporarily"/></Field>
        </>:<>
          <Field label="Recipient *"><SearchableSelect required value={assignmentForm.employeeId} placeholder="Search by employee ID or name…" emptyText="No active recipients match your search" options={employees.filter(e=>e.active&&(e.recipientType||'Internal')!=='Sister Company').map(e=>({value:String(e.id),label:`${e.employeeId} · ${e.name}${e.organization?` · ${e.organization}`:''}`}))} onChange={value=>setAssignmentForm({...assignmentForm,employeeId:value,originalAssetId:''})}/></Field>
          {assignmentForm.temporaryType==='Repair Replacement'&&<><div className="form-section-title">Temporary replacement details</div><Field label="Recipient's original device under repair *"><SearchableSelect required value={assignmentForm.originalAssetId} placeholder="Search device tag or name…" emptyText="No matching device awaiting or undergoing repair" options={assets.filter(a=>['Needs Repair','Under Repair'].includes(a.status)&&a.category==='Laptop'&&a.employeeId===Number(assignmentForm.employeeId)).map(a=>({value:String(a.id),label:`${a.tag} · ${a.name}`}))} onChange={value=>setAssignmentForm({...assignmentForm,originalAssetId:value})}/></Field><Field label="Temporary allocation purpose *"><textarea required rows="2" value={assignmentForm.temporaryReason||''} onChange={e=>setAssignmentForm({...assignmentForm,temporaryReason:e.target.value})} placeholder="Explain why a temporary replacement is required"/></Field>{!assets.some(a=>['Needs Repair','Under Repair'].includes(a.status)&&a.category==='Laptop'&&a.employeeId===Number(assignmentForm.employeeId))&&<p className="form-note">No laptop awaiting or undergoing repair is linked to this recipient.</p>}</>}
        </>}
        <Field label="Assignment date *"><input required type="date" value={assignmentForm.assignedDate} onChange={e=>setAssignmentForm({...assignmentForm,assignedDate:e.target.value})}/></Field>
        <Field label="Issued by (internal employee) *"><SearchableSelect required value={assignmentForm.issuedByEmployeeId} placeholder="Search internal employee…" emptyText="No active internal employees" options={internalEmployees.map(e=>({value:String(e.id),label:`${e.employeeId} · ${e.name}`}))} onChange={value=>setAssignmentForm({...assignmentForm,issuedByEmployeeId:value})}/></Field>
        <div className="form-section-title">Additional information</div>
        <Field label="Handover notes"><textarea rows="3" value={assignmentForm.notes} onChange={e=>setAssignmentForm({...assignmentForm,notes:e.target.value})} placeholder="Accessories provided, condition, or other relevant notes"/></Field>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary">{assignmentForm.temporaryType==='Sister Company'?'Record intercompany allocation':assignmentForm.temporaryType==='Repair Replacement'?'Record temporary allocation':'Create assignment'}</button></div>
      </form>
    </Modal>}
    {modal==='employee'&&<Modal title={editingEmployeeId?'Edit employee':'Add employee'} onClose={()=>{setModal(null);setEditingEmployeeId(null)}} wide>
      <form className="form-body" onSubmit={submitEmployee}>
        <div className="form-section-title">Employee information</div>
        <Field label="Employee ID *"><input required value={employeeForm.employeeId} onChange={e=>setEmployeeForm({...employeeForm,employeeId:e.target.value})} placeholder="EMP-105"/></Field>
        <Field label="Full name *"><input required value={employeeForm.name} onChange={e=>setEmployeeForm({...employeeForm,name:e.target.value})} placeholder="Employee name"/></Field>
        <Field label="Recipient type *"><select value={employeeForm.recipientType||'Internal'} onChange={e=>setEmployeeForm({...employeeForm,recipientType:e.target.value})}><option value="Internal">Our company employee</option><option value="External">External recipient (contractor / client / partner)</option><option value="Sister Company">Sister company recipient</option></select></Field>
        {employeeForm.recipientType==='External'||employeeForm.recipientType==='Sister Company'?<Field label={employeeForm.recipientType==='Sister Company'?'Sister company name':'External company / organization'}><input value={employeeForm.organization||''} onChange={e=>setEmployeeForm({...employeeForm,organization:e.target.value})} placeholder="Company or organization"/></Field>:<Field label="Department"><input value={employeeForm.department} onChange={e=>setEmployeeForm({...employeeForm,department:e.target.value})} placeholder="Department"/></Field>}
        <Field label={employeeForm.recipientType==='Internal'?'Work email':'Contact email'}><input type="email" value={employeeForm.email} onChange={e=>setEmployeeForm({...employeeForm,email:e.target.value})} placeholder={employeeForm.recipientType==='External'?'contact@example.com':'name@company.com'}/></Field>
        <div className="form-section-title">Employment status</div>
        <label className="temporary-toggle"><input type="checkbox" checked={Boolean(employeeForm.active)} onChange={e=>setEmployeeForm({...employeeForm,active:e.target.checked})}/><span><strong>Active employee</strong><small>Inactive employees cannot receive new assignments.</small></span></label>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary">{editingEmployeeId?'Save changes':'Add employee'}</button></div>
      </form>
    </Modal>}
    {modal==='bulk-item'&&<Modal title="Add bulk stock item" onClose={()=>setModal(null)} wide>
      <form className="form-body" onSubmit={submitBulkItem}>
        <div className="info-callout"><Package size={17}/><span>Use bulk stock for accessories issued by quantity. Individual units do not need unique asset tags.</span></div>
        <Field label="Item name *"><input required value={bulkItemForm.name} onChange={e=>setBulkItemForm({...bulkItemForm,name:e.target.value})} placeholder="e.g. Logitech Wireless Mouse"/></Field>
        <div className="form-grid"><Field label="Category *"><select value={bulkItemForm.category} onChange={e=>setBulkItemForm({...bulkItemForm,category:e.target.value})}>{[...new Set([...categories,'Charger','Cable','Adapter','Headset'])].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Starting quantity *"><input type="number" min="0" step="1" required value={bulkItemForm.quantity} onChange={e=>setBulkItemForm({...bulkItemForm,quantity:e.target.value})} placeholder="e.g. 100"/></Field><Field label="Minimum stock level"><input type="number" min="0" step="1" value={bulkItemForm.minimumStock} onChange={e=>setBulkItemForm({...bulkItemForm,minimumStock:e.target.value})}/></Field><Field label="Unit cost (₹)"><input type="number" min="0" step="0.01" value={bulkItemForm.unitCost} onChange={e=>setBulkItemForm({...bulkItemForm,unitCost:e.target.value})} placeholder="Optional"/></Field><Field label="Brand"><input value={bulkItemForm.brand} onChange={e=>setBulkItemForm({...bulkItemForm,brand:e.target.value})} placeholder="Optional"/></Field><Field label="Model"><input value={bulkItemForm.model} onChange={e=>setBulkItemForm({...bulkItemForm,model:e.target.value})} placeholder="Optional"/></Field></div>
        <Field label="Storage location"><input value={bulkItemForm.location} onChange={e=>setBulkItemForm({...bulkItemForm,location:e.target.value})} placeholder="IT Store Room"/></Field>
        <Field label="Notes"><textarea rows="2" value={bulkItemForm.notes} onChange={e=>setBulkItemForm({...bulkItemForm,notes:e.target.value})} placeholder="Optional stock notes"/></Field>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary">Add stock item</button></div>
      </form>
    </Modal>}
    {modal==='bulk-restock'&&<Modal title="Add stock quantity" onClose={()=>setModal(null)}>
      <form className="form-body" onSubmit={submitBulkRestock}>
        <Field label="Bulk item *"><SearchableSelect required value={bulkRestockForm.itemId} placeholder="Search stock item…" options={bulkItems.map(x=>({value:String(x.id),label:`${x.tag} · ${x.name}`}))} onChange={value=>setBulkRestockForm({...bulkRestockForm,itemId:value})}/></Field>
        <Field label="Quantity received *"><input type="number" min="1" step="1" required value={bulkRestockForm.quantity} onChange={e=>setBulkRestockForm({...bulkRestockForm,quantity:e.target.value})}/></Field>
        <Field label="Received date *"><input type="date" required value={bulkRestockForm.date} onChange={e=>setBulkRestockForm({...bulkRestockForm,date:e.target.value})}/></Field>
        <Field label="Notes / purchase reference"><textarea rows="2" value={bulkRestockForm.notes} onChange={e=>setBulkRestockForm({...bulkRestockForm,notes:e.target.value})} placeholder="Optional reference"/></Field>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary">Add quantity</button></div>
      </form>
    </Modal>}
    {modal==='bulk-issue'&&<Modal title="Issue bulk stock" onClose={()=>setModal(null)}>
      <form className="form-body" onSubmit={submitBulkIssue}>
        <div className="form-section-title">Issue details</div>
        <Field label="Bulk item *"><SearchableSelect required value={bulkIssueForm.itemId} placeholder="Search stock item…" emptyText="No bulk stock items found" options={bulkItems.filter(x=>x.availableQuantity>0).map(x=>({value:String(x.id),label:`${x.tag} · ${x.name} (${x.availableQuantity} available)`}))} onChange={value=>setBulkIssueForm({...bulkIssueForm,itemId:value})}/></Field>
        <Field label="Employee receiving items *"><SearchableSelect required value={bulkIssueForm.employeeId} placeholder="Search employee ID or name…" emptyText="No active employees found" options={employees.filter(x=>x.active).map(x=>({value:String(x.id),label:`${x.employeeId} · ${x.name}`}))} onChange={value=>setBulkIssueForm({...bulkIssueForm,employeeId:value})}/></Field>
        <div className="form-grid"><Field label="Quantity issued *"><input type="number" min="1" step="1" required value={bulkIssueForm.quantity} onChange={e=>setBulkIssueForm({...bulkIssueForm,quantity:e.target.value})}/></Field><Field label="Issue date *"><input type="date" required value={bulkIssueForm.issuedDate} onChange={e=>setBulkIssueForm({...bulkIssueForm,issuedDate:e.target.value})}/></Field></div>
        <Field label="Issued by *"><input required value={bulkIssueForm.issuedBy} onChange={e=>setBulkIssueForm({...bulkIssueForm,issuedBy:e.target.value})} placeholder="IT staff member"/></Field>
        <Field label="Notes"><textarea rows="2" value={bulkIssueForm.notes} onChange={e=>setBulkIssueForm({...bulkIssueForm,notes:e.target.value})} placeholder="Purpose, department, or handover notes"/></Field>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary">Confirm issue</button></div>
      </form>
    </Modal>}
    {modal==='bulk-return'&&<Modal title="Record bulk stock return" onClose={()=>setModal(null)}>
      <form className="form-body" onSubmit={submitBulkReturn}>
        {(()=>{const t=bulkTransactions.find(x=>x.id===Number(bulkReturnForm.transactionId));const item=bulkItems.find(x=>x.id===t?.itemId);const employee=employees.find(x=>x.id===t?.employeeId);return <div className="info-callout"><ArrowDownLeft size={17}/><span><strong>{item?.name||'Bulk item'}</strong><br/>{employee?.name||'Employee'} · {Math.max(0,(t?.quantityIssued||0)-(t?.quantityReturned||0))} unit(s) still outstanding.</span></div>})()}
        <Field label="Quantity returned *"><input type="number" min="1" step="1" required value={bulkReturnForm.quantity} onChange={e=>setBulkReturnForm({...bulkReturnForm,quantity:e.target.value})}/></Field>
        <Field label="Return date *"><input type="date" required value={bulkReturnForm.returnedDate} onChange={e=>setBulkReturnForm({...bulkReturnForm,returnedDate:e.target.value})}/></Field>
        <Field label="Condition of returned items *"><select value={bulkReturnForm.condition} onChange={e=>setBulkReturnForm({...bulkReturnForm,condition:e.target.value})}><option value="Available">Good — return to available stock</option><option value="Damaged">Damaged — not available to issue</option><option value="Under Repair">Needs repair — not available to issue</option></select></Field>
        <Field label="Return notes"><textarea rows="2" value={bulkReturnForm.notes} onChange={e=>setBulkReturnForm({...bulkReturnForm,notes:e.target.value})} placeholder="Optional condition / handover notes"/></Field>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary">Record return</button></div>
      </form>
    </Modal>}
    {modal==='return'&&returningAssignment&&<Modal title="Return asset" onClose={()=>{setModal(null);setReturningAssignment(null)}}>
      <form className="form-body" onSubmit={returnAssignment}>
        {(()=>{const asset=assets.find(a=>a.id===returningAssignment.assetId);return <div className="info-callout"><ArrowDownLeft size={17}/><span><strong>{asset?.name||'Asset'}</strong><br/>{asset?.tag||''} · Select the asset's condition after return.</span></div>})()}
        <Field label="Return date *"><input type="date" required value={returnForm.returnedDate} onChange={e=>setReturnForm({...returnForm,returnedDate:e.target.value})}/></Field>
        <Field label="Next asset status *"><select value={returnForm.nextStatus} onChange={e=>setReturnForm({...returnForm,nextStatus:e.target.value})}><option>Available</option><option>Needs Repair</option><option>Under Repair</option><option>Missing</option><option>Retired</option><option>Sold</option><option>Scrapped</option></select></Field>
        {['Needs Repair','Under Repair'].includes(returnForm.nextStatus)&&<><div className="form-section-title">Repair details</div><Field label="Issue / repair note *"><textarea required rows="3" value={returnForm.repairDescription} onChange={e=>setReturnForm({...returnForm,repairDescription:e.target.value})} placeholder="Describe the fault found during return"/></Field>{returnForm.nextStatus==='Under Repair'&&<Field label="Estimated repair completion"><input type="date" min={returnForm.returnedDate||undefined} value={returnForm.estimatedCompletionDate||''} onChange={e=>setReturnForm({...returnForm,estimatedCompletionDate:e.target.value})}/></Field>}<Field label="Service vendor"><select value={vendorOptions.includes(returnForm.repairVendor)?returnForm.repairVendor:(returnForm.repairVendor?'Other':'')} onChange={e=>setReturnForm({...returnForm,repairVendor:e.target.value})}><option value="">Select repair vendor</option>{vendorOptions.map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Current repair cost (₹)"><input type="number" min="0" value={returnForm.repairCost} onChange={e=>setReturnForm({...returnForm,repairCost:e.target.value})} placeholder="0 if not yet known"/></Field></>}
        <Field label="Return notes"><textarea rows="2" value={returnForm.notes} onChange={e=>setReturnForm({...returnForm,notes:e.target.value})} placeholder="Condition, missing accessories, or handover notes"/></Field>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary">Confirm return</button></div>
      </form>
    </Modal>}
    {modal==='complete-repair'&&selectedAsset&&<Modal title={`Complete repair · ${selectedAsset.tag}`} onClose={()=>setModal(null)}>
      {(()=>{const linkedTemporary=assignments.find(a=>a.assetId!==selectedAsset.id&&a.isTemporary&&a.temporaryType==='Repair Replacement'&&Number(a.originalAssetId)===Number(selectedAsset.id)&&!a.returnedDate);const previousRecipient=employees.find(x=>x.id===Number(selectedAsset.employeeId||linkedTemporary?.employeeId));return <form className="form-body" onSubmit={submitRepairCompletion}>
        <div className="info-callout"><CircleCheck size={17}/><span>Record the actual repair cost, then choose what should happen to the repaired device and any temporary replacement.</span></div>
        <Field label="Final repair cost (₹) *"><input type="number" min="0" step="0.01" required value={completionForm.cost} onChange={e=>setCompletionForm({...completionForm,cost:e.target.value})} placeholder="Enter actual amount paid"/></Field>
        <Field label="Repair completion date *"><input type="date" required value={completionForm.completedDate} onChange={e=>setCompletionForm({...completionForm,completedDate:e.target.value})}/></Field>
        <div className="form-section-title">After repair — choose the next step</div>
        <Field label="Device allocation *"><select value={completionForm.disposition} onChange={e=>setCompletionForm({...completionForm,disposition:e.target.value,employeeId:e.target.value==='assign-original'?String(selectedAsset.employeeId||linkedTemporary?.employeeId||''):''})}>
          <option value="available">Make repaired device available in inventory</option>
          <option value="assign-original">Assign repaired device to the original recipient</option>
          <option value="assign-other">Assign repaired device to another recipient</option>
          {linkedTemporary&&<option value="keep-temporary">Keep the temporary device with the recipient permanently</option>}
        </select></Field>
        {completionForm.disposition==='keep-temporary'&&linkedTemporary&&<div className="info-callout"><CircleCheck size={17}/><span>The temporary device will remain with the recipient and its temporary allocation will be converted into a standard assignment. The repaired device will become available.</span></div>}
        {completionForm.disposition==='assign-original'&&<><Field label="Recipient *"><SearchableSelect required value={completionForm.employeeId||String(previousRecipient?.id||'')} placeholder="Select original recipient…" options={employees.filter(x=>x.active).map(x=>({value:String(x.id),label:`${x.employeeId} · ${x.name}`}))} onChange={value=>setCompletionForm({...completionForm,employeeId:value})}/></Field><p className="form-note">The linked temporary replacement, if any, will automatically be returned to available inventory.</p></>}
        {completionForm.disposition==='assign-other'&&<Field label="New recipient *"><SearchableSelect required value={completionForm.employeeId} placeholder="Search recipient…" options={employees.filter(x=>x.active).map(x=>({value:String(x.id),label:`${x.employeeId} · ${x.name}${x.organization?` · ${x.organization}`:''}`}))} onChange={value=>setCompletionForm({...completionForm,employeeId:value})}/></Field>}
        {['assign-original','assign-other'].includes(completionForm.disposition)&&<><Field label="Issued by (internal employee) *"><SearchableSelect required value={completionForm.issuedByEmployeeId} placeholder="Search internal employee…" options={internalEmployees.map(x=>({value:String(x.id),label:`${x.employeeId} · ${x.name}`}))} onChange={value=>setCompletionForm({...completionForm,issuedByEmployeeId:value})}/></Field><Field label="Assignment date *"><input required type="date" value={completionForm.assignedDate} onChange={e=>setCompletionForm({...completionForm,assignedDate:e.target.value})}/></Field></>}
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary"><CircleCheck size={15}/> Complete repair</button></div>
      </form>})()}
    </Modal>}
    {modal==='repair'&&selectedAsset&&<Modal title={`Repair · ${selectedAsset.tag}`} onClose={()=>setModal(null)}>
      <form className="form-body" onSubmit={submitRepair}>
        <div className="info-callout"><Wrench size={17}/><span>{selectedAsset.name}</span></div>
        <div className="form-section-title">Repair record</div>
        <Field label="Issue / repair description"><textarea rows="3" value={repairForm.description} onChange={e=>setRepairForm({...repairForm,description:e.target.value})} placeholder="Describe the issue…"/></Field>
        <Field label="Repair stage *"><select value={repairForm.repairStatus||'Under Repair'} onChange={e=>setRepairForm({...repairForm,repairStatus:e.target.value})}><option value="Needs Repair">Needs repair — not yet sent</option><option value="Under Repair">Under repair — sent to service</option></select></Field>
        <Field label="Issue reported date *"><input required type="date" value={repairForm.reportedDate} onChange={e=>setRepairForm({...repairForm,reportedDate:e.target.value})}/></Field>
        {repairForm.repairStatus==='Under Repair'&&<><Field label="Date sent for repair *"><input required type="date" value={repairForm.sentDate||''} onChange={e=>setRepairForm({...repairForm,sentDate:e.target.value})}/></Field><Field label="Estimated repair completion"><input type="date" min={repairForm.sentDate||repairForm.reportedDate||undefined} value={repairForm.estimatedCompletionDate||''} onChange={e=>setRepairForm({...repairForm,estimatedCompletionDate:e.target.value})}/></Field></>}
        <Field label="Service vendor"><select value={vendorOptions.includes(repairForm.vendor)?repairForm.vendor:(repairForm.vendor?'Other':'')} onChange={e=>setRepairForm({...repairForm,vendor:e.target.value})}><option value="">Select repair vendor</option>{vendorOptions.map(v=><option key={v}>{v}</option>)}</select></Field>
        <Field label="Current repair cost (₹)"><input type="number" min="0" value={repairForm.cost} onChange={e=>setRepairForm({...repairForm,cost:e.target.value})} placeholder="0"/></Field>
        <div className="modal-actions"><button type="button" className="btn secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn primary">Save repair details</button></div>
      </form>
    </Modal>}
    {modal==='details'&&selectedAsset&&<Modal title="Asset details" onClose={()=>setModal(null)} wide confirmClose={false}>
      <div className="detail-body">
        <div className="detail-heading"><div className="asset-icon large"><Laptop size={24}/></div><div><h3>{selectedAsset.name}</h3><p>{selectedAsset.tag} · {selectedAsset.brand||selectedAsset.category}</p></div><Badge value={selectedAsset.status}/></div>
        <div className="detail-grid">
          <Detail label="Category" value={selectedAsset.category}/><Detail label="Condition" value={selectedAsset.condition}/><Detail label="Serial number" value={selectedAsset.serial||'—'}/><Detail label="Assigned employee / repair owner" value={currentEmployee(selectedAsset)?.name||'Not assigned'}/>
          <Detail label="Purchase price" value={currency(selectedAsset.purchasePrice)}/><Detail label="Lifetime repair cost" value={currency(Number(selectedAsset.maintenanceCost||0)+Number(selectedAsset.currentRepairCost||0))}/><Detail label="Purchase date" value={dateLabel(selectedAsset.purchaseDate)}/><Detail label="Warranty status" value={warrantyStatus(selectedAsset)}/><Detail label="Warranty start" value={dateLabel(selectedAsset.warrantyStart)}/><Detail label="Warranty expiry" value={dateLabel(selectedAsset.warrantyExpiry)}/><Detail label="Warranty provider" value={selectedAsset.warrantyProvider||selectedAsset.vendor||'—'}/><Detail label="Warranty coverage" value={selectedAsset.warrantyCoverage||'Not specified'}/><Detail label="Estimated repair completion" value={dateLabel(selectedAsset.estimatedRepairCompletionDate)}/><Detail label="Sent for repair" value={dateLabel(selectedAsset.sentForRepairDate)}/>
          <Detail label="Vendor" value={selectedAsset.vendor||'—'}/><Detail label="Invoice / purchase bill" value={selectedAsset.invoice||'No document selected'}/><Detail label="Warranty document" value={selectedAsset.warrantyDoc||'No document selected'}/><Detail label="Model" value={selectedAsset.model||'—'}/>
        </div>
        <div className="asset-repair-history"><div className="repair-history-heading"><strong>Repair history</strong><span>Lifetime cost: {currency(Number(selectedAsset.maintenanceCost||0)+Number(selectedAsset.currentRepairCost||0))}</span></div>{(selectedAsset.repairHistory||[]).length===0?<p className="muted repair-history-empty">No repair history recorded for this asset.</p>:<div className="table-wrap"><table><thead><tr><th>REPORTED</th><th>SENT FOR REPAIR</th><th>EST. COMPLETION</th><th>ISSUE / NOTE</th><th>COST</th><th>COMPLETED</th></tr></thead><tbody>{selectedAsset.repairHistory.map((r,i)=><tr key={r.id||i}><td>{dateLabel(r.reportedDate)}</td><td>{dateLabel(r.sentDate)}</td><td>{dateLabel(r.estimatedCompletionDate)}</td><td>{r.description||'—'}{r.vendor&&<small>{r.vendor}</small>}</td><td>{currency(r.cost)}</td><td>{r.completedDate?dateLabel(r.completedDate):<Badge value={selectedAsset.status==='Needs Repair'?'Needs Repair':'Under Repair'}/>}</td></tr>)}</tbody></table></div>}</div>
        <div className="asset-repair-history"><div className="repair-history-heading"><strong>Full asset history</strong><span>Assignment, status and repair events</span></div>{(()=>{const timeline=[...(assignments.filter(x=>x.assetId===selectedAsset.id).flatMap(x=>[{date:x.assignedDate,type:'Assignment',title:`Assigned to ${employees.find(e=>e.id===x.employeeId)?.name||x.recipientName||'Unknown recipient'}`,detail:`Issued by: ${x.issuedByName||employees.find(e=>e.id===x.issuedByEmployeeId)?.name||'Not recorded'}${x.temporaryType==='Sister Company'?` · Sister company: ${x.companyName||'Not recorded'} · Purpose: ${x.temporaryReason||'Not recorded'}`:x.isTemporary?` · Temporary allocation purpose: ${x.temporaryReason||'Reason not recorded'}`:''}`,cost:null},{...(x.returnedDate?{date:x.returnedDate,type:'Return',title:`Returned by ${employees.find(e=>e.id===x.employeeId)?.name||x.recipientName||'Unknown recipient'}`,detail:x.notes||'',cost:null}: {})}].filter(e=>e.date))),...(selectedAsset.repairHistory||[]).flatMap(r=>[{date:r.reportedDate,type:'Repair',title:r.description||'Repair issue reported',detail:`${r.vendor||'Vendor not recorded'} · ${r.sentDate?'Sent '+dateLabel(r.sentDate):'Not yet sent to service'} · Estimated completion: ${dateLabel(r.estimatedCompletionDate)}`,cost:r.completedDate?null:r.cost},{...(r.completedDate?{date:r.completedDate,type:'Repair completed',title:'Repair completed',detail:r.description||'',cost:r.cost}: {})}].filter(e=>e.date)),...(selectedAsset.statusHistory||[]).map(h=>({date:h.date,type:'Status',title:h.status,detail:h.note||'',cost:null})),...(selectedAsset.purchaseDate?[{date:selectedAsset.purchaseDate,type:'Purchase',title:'Asset purchased',detail:selectedAsset.vendor||'Purchase vendor not recorded',cost:selectedAsset.purchasePrice}]:[])].sort((a,b)=>(b.date||'').localeCompare(a.date||''));return timeline.length?<div className="table-wrap"><table><thead><tr><th>DATE</th><th>EVENT</th><th>DETAILS</th><th>COST</th></tr></thead><tbody>{timeline.map((event,i)=><tr key={`${event.date}-${event.type}-${i}`}><td>{dateLabel(event.date)}</td><td><strong>{event.type}</strong><small>{event.title}</small></td><td>{event.detail||'—'}</td><td>{event.cost==null?'—':currency(event.cost)}</td></tr>)}</tbody></table></div>:<p className="muted repair-history-empty">No history recorded yet.</p>})()}</div>
        {selectedAsset.notes&&<div className="detail-notes"><strong>Notes</strong><p>{selectedAsset.notes}</p></div>}
        <div className="modal-actions"><button className="btn secondary" onClick={()=>setModal(null)}>Close</button><button className="btn primary" onClick={()=>{setModal(null);editAsset(selectedAsset)}}><Pencil size={15}/> Edit asset</button></div>
      </div>
    </Modal>}
    {modal==='employeeDetails'&&selectedAsset&&<Modal title="Employee details" onClose={()=>setModal(null)} confirmClose={false}>
      <div className="detail-body"><div className="employee-detail-avatar">{selectedAsset.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><h3>{selectedAsset.name}</h3><p className="muted">{selectedAsset.employeeId}</p><div className="detail-grid single"><Detail label="Recipient type" value={({Internal:'Company employee',External:'External recipient','Sister Company':'Sister company recipient'}[selectedAsset.recipientType||'Internal'])}/><Detail label="Organization" value={selectedAsset.organization||'—'}/><Detail label="Department" value={selectedAsset.department||'—'}/><Detail label="Email / contact" value={selectedAsset.email||'—'}/><Detail label="Assigned assets" value={assets.filter(a=>a.employeeId===selectedAsset.id&&a.status==='Assigned').map(a=>a.name).join(', ')||'None'}/></div><div className="modal-actions"><button className="btn secondary" onClick={()=>setModal(null)}>Close</button><button className="btn primary" onClick={()=>editEmployee(selectedAsset)}><Pencil size={15}/> Edit employee</button></div></div>
    </Modal>}
    {toast&&<div className="toast"><CircleCheck size={17}/>{toast}</div>}
  </div>;
}

function MultiSelectFilter({label,options,selected,onChange}) {const [open,setOpen]=useState(false);const toggle=value=>onChange(selected.includes(value)?selected.filter(x=>x!==value):[...selected,value]);return <div className="multi-filter"><button type="button" className="multi-filter-trigger" onClick={()=>setOpen(v=>!v)}><Filter size={14}/>{label}{selected.length>0&&<span>{selected.length}</span>}<ChevronDown size={13}/></button>{open&&<div className="multi-filter-menu"><div className="multi-filter-head"><strong>{label}</strong><button type="button" onClick={()=>onChange([])}>Clear</button></div>{options.map(value=><label key={value}><input type="checkbox" checked={selected.includes(value)} onChange={()=>toggle(value)}/>{ASSET_STATUSES.includes(value)&&<span className={`status-dot status-dot-${value.toLowerCase().replaceAll(' ','-')}`}/>}<span>{value}</span></label>)}{options.length===0&&<small>No options</small>}<button type="button" className="multi-filter-done" onClick={()=>setOpen(false)}>Done</button></div>}</div>}
function Field({label,children}) {return <label className="field"><span>{label}</span>{children}</label>}
function SearchableSelect({value,options,onChange,placeholder,emptyText='No matching options',required=false}) {
  const [open,setOpen] = useState(false);
  const [search,setSearch] = useState('');
  const selected = options.find(option=>String(option.value)===String(value));
  const visibleOptions = options.filter(option=>option.label.toLowerCase().includes(search.toLowerCase()));
  const displayValue = open ? search : (selected?.label || '');
  return <div className="search-select">
    <input type="text" role="combobox" aria-expanded={open} aria-autocomplete="list" placeholder={placeholder} value={displayValue} required={required && !value}
      onFocus={()=>{setSearch('');setOpen(true);}}
      onChange={event=>{setSearch(event.target.value);setOpen(true);if(value)onChange('');}}
      onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);setSearch('');}if(event.key==='Enter'&&open&&visibleOptions.length){event.preventDefault();const option=visibleOptions[0];onChange(String(option.value));setSearch('');setOpen(false);}}}
      onBlur={()=>setTimeout(()=>{setOpen(false);setSearch('');},120)} />
    <span className="search-select-trigger"><ChevronDown size={15}/></span>
    {open&&<div className="search-select-menu" role="listbox">{visibleOptions.length ? visibleOptions.map(option=><button type="button" role="option" aria-selected={String(option.value)===String(value)} className="search-select-option" key={option.value} onMouseDown={event=>event.preventDefault()} onClick={()=>{onChange(String(option.value));setSearch('');setOpen(false);}}>{option.label}</button>) : <div className="search-select-empty">{emptyText}</div>}</div>}
  </div>;
}
function Detail({label,value}) {return <div className="detail-item"><span>{label}</span><strong>{value||'—'}</strong></div>}
function DocumentUpload({title,filename,inputRef,onChange}) {return <div className="upload-card"><div className="upload-icon"><FileCheck2 size={19}/></div><div className="upload-copy"><strong>{title}</strong><span>{filename||'PDF, JPG or PNG'}</span></div><button type="button" className="btn small secondary" onClick={()=>inputRef.current?.click()}><Upload size={14}/> Choose</button><input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={e=>onChange(e.target.files?.[0])}/></div>}
function RecentDocumentLinks({documents,kind,onSelect}) {const files=[...documents].filter(file=>file.kind===kind).sort((a,b)=>(b.uploadedAt||'').localeCompare(a.uploadedAt||'')).slice(0,5);const label=kind==='invoice'?'invoice / purchase bill':'warranty';return <div className="recent-files-list">{files.length?files.map(file=><div className="recent-file-row" key={file.id}><span className="recent-file-icon"><FileCheck2 size={15}/></span><span className="recent-file-name"><strong>{file.name}</strong><small>{file.uploadedAt?new Date(file.uploadedAt).toLocaleDateString('en-IN'):'Previously added'}</small></span><button type="button" className="btn small secondary" onClick={()=>onSelect(kind,file)}>Use for this asset</button></div>):<div className="recent-files-empty">No {label} files have been uploaded yet. Choose a {label} file above to build this list.</div>}</div>}
function PageHeading({eyebrow,title,description,action}) {return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>}
function DashboardPage({counts,expiring,expired,recentAssets,assets,employees,activity,onAdd,onNavigate,onFilterStatus,onFilterCategory,onView,currency,dateLabel}) {
  const warrantyUnrecorded=assets.filter(a=>!['Sold','Scrapped','Retired'].includes(a.status)&&!a.warrantyExpiry);
  const activeAssets=assets.filter(a=>!['Sold','Scrapped','Retired'].includes(a.status));
  const totalSpend=activeAssets.reduce((sum,a)=>sum+Number(a.purchasePrice||0),0);
  const maintenance=assets.reduce((sum,a)=>sum+Number(a.maintenanceCost||0)+Number(a.currentRepairCost||0),0);
  const categories=[...new Set(assets.map(a=>a.category).filter(Boolean))].map(name=>({name,count:assets.filter(a=>a.category===name&&!['Sold','Scrapped','Retired'].includes(a.status)).length})).sort((a,b)=>b.count-a.count);
  const statuses=['Available','Assigned','Needs Repair','Under Repair','Missing','Retired','Sold','Scrapped'].map(status=>({status,count:assets.filter(a=>a.status===status).length}));
  const statusScale=Math.max(1,...statuses.map(item=>item.count));
  const statusIcon={Available:CircleCheck,Assigned:ArrowUpRight,'Needs Repair':Wrench,'Under Repair':Wrench,Missing:AlertTriangle};
  return <><PageHeading eyebrow="OVERVIEW" title="Dashboard" description="A quick, practical view of your IT inventory." action={<button className="btn primary" onClick={onAdd}><Plus size={16}/> Add asset</button>}/>
    <div className="stats-grid dashboard-status-cards">{['Available','Assigned','Needs Repair','Under Repair','Missing'].map(status=>{const Icon=statusIcon[status];const count=assets.filter(a=>a.status===status).length;const tone=status==='Available'?'green':status==='Assigned'?'blue':status==='Under Repair'||status==='Needs Repair'?'orange':'red';return <button type="button" className="stat-card clickable-stat" key={status} onClick={()=>onFilterStatus(status)}><div className={`stat-icon ${tone}`}><Icon size={18}/></div><div className="stat-title">{status}</div><div className="stat-value">{count}</div><div className="stat-foot">View matching assets →</div></button>})}</div>
    <div className="dashboard-grid inventory-dashboard-grid">
      <section className="panel"><div className="panel-heading"><div><h2>Inventory by category</h2><p>Active equipment, grouped by type</p></div><button className="text-button" onClick={()=>onNavigate('Assets')}>All assets →</button></div>
        {categories.length===0?<div className="empty-state"><strong>No inventory yet</strong><p>Add your first asset to see the breakdown.</p></div>:<div className="inventory-breakdown">{categories.map(item=><button type="button" className="category-row count-only" key={item.name} onClick={()=>onFilterCategory(item.name)}><span className="category-label">{item.name}</span><span className="category-count-label">{item.count}</span></button>)}</div>}
        <p className="dashboard-note">Counts include active inventory only. Select a category to view its assets.</p>
      </section>
      <section className="panel"><div className="panel-heading"><div><h2>Asset status</h2><p>Distribution by status · Select a bar to filter assets</p></div></div><div className="asset-status-chart">{statuses.map(item=>{const key=item.status.toLowerCase().replaceAll(' ','-');const width=statusScale?Math.max(item.count?3:0,(item.count/statusScale)*100):0;return <button type="button" className="asset-status-bar-row" key={item.status} onClick={()=>onFilterStatus(item.status)} title={`Show ${item.count} ${item.status.toLowerCase()} assets`}><span className="asset-status-bar-label"><i className={`status-dot status-dot-${key}`}/>{item.status}</span><span className="asset-status-track"><span className={`asset-status-fill status-fill-${key}`} style={{width:`${width}%`}}/></span><strong>{item.count}</strong></button>})}</div><p className="dashboard-note">Counts are based on saved asset records. Select any status to open the matching asset list.</p></section>
    </div>
    <div className="dashboard-grid dashboard-bottom-grid">
      <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest recorded changes</p></div></div>{activity.length===0?<div className="empty-state"><strong>No activity yet</strong><p>Asset changes, assignments, returns and repairs will appear here.</p></div>:<div className="recent-activity-list">{activity.slice(0,6).map(item=><div className="recent-activity-item" key={item.id}><span className={`activity-dot activity-${item.type}`}/><div><strong>{item.title}</strong><p>{item.detail}</p></div><time>{new Date(item.date).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</time></div>)}</div>}</section>
      <section className="panel warranty-panel"><div className="panel-heading"><div><h2>Needs attention</h2><p>Repairs and warranty alerts</p></div></div>
        {assets.filter(a=>a.status==='Under Repair').length>0&&<button className="attention-row dashboard-attention" onClick={()=>onNavigate('Repairs')}><span className="attention-symbol orange"><Wrench size={16}/></span><span className="attention-copy"><strong>{assets.filter(a=>a.status==='Under Repair').length} asset(s) under repair</strong><span>Review repair status and costs</span></span><ArrowUpRight size={15}/></button>}
        {expiring.length>0&&<div className="warranty-alert-list"><div className="warranty-alert-heading"><strong>Warranty expiring soon</strong><span>Within the next 30 days · {expiring.length} asset(s)</span></div>{expiring.map(asset=><button type="button" className="attention-row dashboard-attention warranty-asset-link" key={asset.id} onClick={()=>onView(asset)} title={`View details for ${asset.name} (${asset.tag})`}><span className="attention-symbol amber"><ShieldCheck size={16}/></span><span className="attention-copy"><strong>{asset.name}</strong><span>{asset.tag} · Expires {dateLabel(asset.warrantyExpiry)}</span></span><span className="warranty-view-link">View asset details <ArrowUpRight size={14}/></span></button>)}</div>}
        {expired.length>0&&<div className="warranty-alert-list"><div className="warranty-alert-heading"><strong>Warranty expired</strong><span>{expired.length} asset(s) · Coverage may no longer apply</span></div>{expired.map(asset=><button type="button" className="attention-row dashboard-attention warranty-asset-link" key={asset.id} onClick={()=>onView(asset)} title={`View details for ${asset.name} (${asset.tag})`}><span className="attention-symbol red-soft"><AlertTriangle size={16}/></span><span className="attention-copy"><strong>{asset.name}</strong><span>{asset.tag} · Expired {dateLabel(asset.warrantyExpiry)}</span></span><span className="warranty-view-link">View asset details <ArrowUpRight size={14}/></span></button>)}</div>}
        {warrantyUnrecorded.length>0&&<button className="attention-row dashboard-attention" onClick={()=>onNavigate('Assets')}><span className="attention-symbol red-soft"><ShieldCheck size={16}/></span><span className="attention-copy"><strong>{warrantyUnrecorded.length} asset(s) without warranty dates</strong><span>Update warranty details in asset records</span></span><ArrowUpRight size={15}/></button>}
        {assets.filter(a=>a.status==='Under Repair').length===0&&expiring.length===0&&expired.length===0&&warrantyUnrecorded.length===0&&<div className="empty-state"><strong>Nothing needs attention</strong><p>No current repair or warranty alerts.</p></div>}
      </section>
    </div>
    <div className="finance-grid"><div className="finance-card"><div className="finance-icon"><Banknote size={18}/></div><div><span>Purchase value of active assets</span><strong>{currency(totalSpend)}</strong><small>Excludes retired, sold and scrapped assets</small></div></div><div className="finance-card"><div className="finance-icon mint"><Wrench size={18}/></div><div><span>Recorded maintenance cost</span><strong>{currency(maintenance)}</strong><small>Across all listed assets</small></div></div></div>
  </>;
}
function AssetsPage({assets,allAssets,employees,query,setQuery,statusFilter,setStatusFilter,categoryFilter,setCategoryFilter,categories,datePeriod,setDatePeriod,dateFrom,setDateFrom,dateTo,setDateTo,onAdd,onEdit,onView,onStatus,currentEmployee,currency,dateLabel,warrantyStatus}) {
  const [actionId,setActionId]=useState(null);
  return <><PageHeading eyebrow="INVENTORY" title="Assets" description="Track devices, purchase details, costs and documents." action={<button className="btn primary" onClick={onAdd}><Plus size={16}/> Add asset</button>}/>
    <div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search tag, asset, serial or employee…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')}><X size={14}/></button>}</div><MultiSelectFilter label="Status" options={ASSET_STATUSES} selected={statusFilter} onChange={setStatusFilter}/><MultiSelectFilter label="Category" options={categories} selected={categoryFilter} onChange={setCategoryFilter}/><div className="filter-control"><select aria-label="Purchase date range" value={datePeriod} onChange={e=>setDatePeriod(e.target.value)}><option>All time</option><option>Last 2 days</option><option>Last week</option><option>Last month</option><option>Custom range</option></select></div>{datePeriod==='Custom range'&&<><label className="date-filter">Purchase from<input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></label><label className="date-filter">Purchase to<input type="date" min={dateFrom||undefined} value={dateTo} onChange={e=>setDateTo(e.target.value)}/></label></>}<button className="btn secondary small" onClick={()=>{setQuery('');setStatusFilter([]);setCategoryFilter([]);setDatePeriod('All time');setDateFrom('');setDateTo('')}}>Clear filters</button><span className="result-count">{assets.length} results</span></div>
    <section className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>ASSET</th><th>CATEGORY</th><th>STATUS</th><th>ASSIGNED TO</th><th>WARRANTY</th><th>ACTIONS</th></tr></thead><tbody>{assets.map(a=><tr key={a.id}><td><button type="button" className="asset-cell asset-button" title={`View details for ${a.name} (${a.tag})`} aria-label={`View asset details for ${a.name}, asset tag ${a.tag}`} onClick={()=>onView(a)}><div className="asset-icon"><Laptop size={17}/></div><div><strong>{a.name}</strong><span>{a.tag} · {a.brand||a.category}</span></div></button></td><td>{a.category}</td><td><Badge value={a.status}/></td><td>{currentEmployee(a)?.name||<span className="muted">—</span>}</td><td><span className={`warranty-state warranty-${warrantyStatus(a).toLowerCase().replaceAll(' ','-')}`}>{warrantyStatus(a)}</span><small className="warranty-date">{dateLabel(a.warrantyExpiry)}</small></td><td><div className="row-actions"><button className="icon-button tiny" title="Edit asset" onClick={()=>onEdit(a)}><Pencil size={15}/></button><button className="icon-button tiny" title="More actions" aria-expanded={actionId===a.id} onClick={()=>setActionId(actionId===a.id?null:a.id)}><MoreVertical size={16}/></button>{actionId===a.id&&<div className="action-menu">{a.status==='Available'&&<button onClick={()=>{onStatus(a,'Assigned');setActionId(null)}}><ArrowUpRight size={14}/> Assign</button>}{a.status==='Under Repair'?<button onClick={()=>{onStatus(a,'Available');setActionId(null)}}><CircleCheck size={14}/> Complete repair</button>:a.status!=='Available'&&!['Sold','Scrapped','Retired'].includes(a.status)&&<button onClick={()=>{onStatus(a,'Available');setActionId(null)}}><ArrowDownLeft size={14}/> Mark available / return</button>}{!['Needs Repair','Under Repair','Sold','Scrapped','Retired'].includes(a.status)&&<button onClick={()=>{onStatus(a,'Needs Repair');setActionId(null)}}><Wrench size={14}/> Mark as needing repair</button>}{a.status!=='Under Repair'&&a.status!=='Needs Repair'&&a.status!=='Sold'&&a.status!=='Scrapped'&&a.status!=='Retired'&&<button onClick={()=>{onStatus(a,'Under Repair');setActionId(null)}}><Wrench size={14}/> Send for repair</button>}{a.status!=='Missing'&&!['Sold','Scrapped','Retired'].includes(a.status)&&<button onClick={()=>{onStatus(a,'Missing');setActionId(null)}}><AlertTriangle size={14}/> Mark as missing</button>}{!['Sold','Scrapped','Retired'].includes(a.status)&&<><button onClick={()=>{onStatus(a,'Retired');setActionId(null)}}><Recycle size={14}/> Retire asset</button><button onClick={()=>{onStatus(a,'Sold');setActionId(null)}}><Banknote size={14}/> Mark as sold</button><button className="danger-option" onClick={()=>{if(confirm('Mark this asset as scrapped?'))onStatus(a,'Scrapped');setActionId(null)}}><Recycle size={14}/> Mark as scrapped</button></>}</div>}</div></td></tr>)}</tbody></table>
      {assets.length===0&&<div className="empty-state"><div className="empty-icon"><Search size={22}/></div><strong>No assets found</strong><span>Try changing your search or filters.</span><button className="btn secondary" onClick={()=>{setQuery('');setStatusFilter([]);setCategoryFilter([]);setDatePeriod('All time');setDateFrom('');setDateTo('')}}>Clear filters</button></div>}
    </div><div className="table-foot"><span>Showing <strong>{assets.length}</strong> of <strong>{allAssets.length}</strong> assets</span><span>Changes saved in this browser</span></div></section>
  </>;
}
function EmployeesPage({employees,assets,onAdd,onView,onEdit}) {
  return <><PageHeading eyebrow="PEOPLE" title="Employees" description="Manage employee records and see who has company equipment." action={<button className="btn primary" onClick={onAdd}><Plus size={16}/> Add employee</button>}/><div className="stats-strip"><div><span>Employees  </span><strong>{employees.length}</strong></div><div><span>Active employees  </span><strong>{employees.filter(e=>e.active).length}</strong></div><div><span>Assets assigned  </span><strong>{assets.filter(a=>a.status==='Assigned').length}</strong></div></div><section className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>EMAIL</th><th>ASSIGNED ASSETS</th><th>STATUS</th><th></th></tr></thead><tbody>{employees.map(e=><tr key={e.id}><td><button className="asset-cell asset-button" onClick={()=>onView(e)}><div className="person-avatar">{e.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{e.name}</strong><span>{e.employeeId}</span></div></button></td><td>{e.department||'—'}</td><td>{e.email||'—'}</td><td><span className="asset-count">{assets.filter(a=>a.employeeId===e.id&&a.status==='Assigned').length}</span></td><td><Badge value={e.active?'Active':'Inactive'}/></td><td><div className="row-actions"><button className="icon-button tiny" title="View employee" onClick={()=>onView(e)}><Eye size={15}/></button><button className="icon-button tiny" title="Edit employee" onClick={()=>onEdit(e)}><Pencil size={15}/></button></div></td></tr>)}</tbody></table></div></section></>;
}
function AssignmentsPage({assignments,assets,employees,onAdd,onReturn,onStatusChange,dateLabel}) {
  const [tab,setTab]=useState('All'); const [search,setSearch]=useState('');
  const [assetStatus,setAssetStatus]=useState([]); const [category,setCategory]=useState([]);
  const [period,setPeriod]=useState('All time'); const [customFrom,setCustomFrom]=useState(''); const [customTo,setCustomTo]=useState('');
  const rows=assignments.filter(a=>{
    const asset=assets.find(x=>x.id===a.assetId), employee=employees.find(x=>x.id===a.employeeId); if(!asset)return false;
    const q=search.toLowerCase(); const searchable=[asset.tag,asset.name,asset.serial,asset.brand,employee?.name,employee?.employeeId,a.recipientName,a.companyName].some(v=>(v||'').toLowerCase().includes(q));
    const tabOk=tab==='All'||(tab==='Active'&&!a.returnedDate)||(tab==='History'&&Boolean(a.returnedDate));
    const statusOk=!assetStatus.length||assetStatus.includes(asset.status); const categoryOk=!category.length||category.includes(asset.category);
    const assigned=a.assignedDate||''; let dateOk=true;
    if(period!=='All time'&&period!=='Custom range') {const days=period==='Last 2 days'?2:period==='Last week'?7:30;const from=new Date();from.setHours(0,0,0,0);from.setDate(from.getDate()-(days-1));dateOk=Boolean(assigned)&&new Date(assigned+'T00:00:00')>=from;}
    if(period==='Custom range')dateOk=(!customFrom||assigned>=customFrom)&&(!customTo||assigned<=customTo);
    return searchable&&tabOk&&statusOk&&categoryOk&&dateOk;
  }).sort((a,b)=>(b.assignedDate||'').localeCompare(a.assignedDate||''));
  const clear=()=>{setTab('All');setSearch('');setAssetStatus([]);setCategory([]);setPeriod('All time');setCustomFrom('');setCustomTo('')};
  return <><PageHeading eyebrow="ASSET HANDOVER" title="Assignments" description="Search current handovers and past returns in one place." action={<button className="btn primary" onClick={onAdd}><Plus size={16}/> Create assignment</button>}/>
    <div className="tabs"><button className={tab==='All'?'selected':''} onClick={()=>setTab('All')}>All assignments <span>{assignments.length}</span></button><button className={tab==='Active'?'selected':''} onClick={()=>setTab('Active')}>Currently assigned <span>{assignments.filter(a=>!a.returnedDate).length}</span></button><button className={tab==='History'?'selected':''} onClick={()=>setTab('History')}>Return history <span>{assignments.filter(a=>a.returnedDate).length}</span></button></div>
    <div className="toolbar assignment-filter-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search recipient, company, asset tag, name or serial…"/></div><MultiSelectFilter label="Asset status" options={ASSET_STATUSES} selected={assetStatus} onChange={setAssetStatus}/><MultiSelectFilter label="Category" options={[...new Set(assets.map(a=>a.category).filter(Boolean))]} selected={category} onChange={setCategory}/><div className="filter-control"><select value={period} onChange={e=>setPeriod(e.target.value)}><option>All time</option><option>Last 2 days</option><option>Last week</option><option>Last month</option><option>Custom range</option></select></div>{period==='Custom range'&&<><label className="date-filter">From<input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}/></label><label className="date-filter">To<input type="date" min={customFrom||undefined} value={customTo} onChange={e=>setCustomTo(e.target.value)}/></label></>}<button className="btn secondary small" onClick={clear}>Clear filters</button><span className="result-count">{rows.length} results</span></div>
    <section className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>ASSET</th><th>RECIPIENT</th><th>ISSUED BY</th><th>ASSIGNMENT TYPE</th><th>ASSIGNED DATE</th><th>RETURN DATE</th><th>ASSET STATUS</th><th>ACTIONS</th></tr></thead><tbody>{rows.map(a=>{const asset=assets.find(x=>x.id===a.assetId),employee=employees.find(x=>x.id===a.employeeId),original=assets.find(x=>x.id===a.originalAssetId);if(!asset)return null;return <tr key={a.id}><td><div className="asset-cell"><div className="asset-icon"><Laptop size={17}/></div><div><strong>{asset.name}</strong><span>{asset.tag}</span>{a.isTemporary&&<small className="temporary-detail">{a.temporaryType==='Sister Company'?`Sister company: ${a.companyName||'Not specified'}`:`For: ${original?.name||'device under repair'}`}</small>}</div></div></td><td><div className="employee-inline"><div className="person-avatar small-avatar">{employee?.name.split(' ').map(x=>x[0]).join('').slice(0,2)||'—'}</div><span>{employee?.name||a.recipientName||'Unknown recipient'}<small>{employee?.employeeId||a.companyName||''}</small></span></div></td><td>{a.issuedByName||employees.find(e=>e.id===a.issuedByEmployeeId)?.name||<span className="muted">Not recorded</span>}</td><td>{a.isTemporary?<div><Badge value={a.temporaryType==='Sister Company'?'Intercompany temporary':'Temporary'}/><small className="temporary-detail">{a.temporaryReason||'Temporary replacement'}</small></div>:<Badge value="Regular"/>}</td><td>{dateLabel(a.assignedDate)}</td><td>{dateLabel(a.returnedDate)}</td><td><Badge value={asset.status}/></td><td>{!a.returnedDate&&<button className="btn small secondary" onClick={()=>onReturn(a)}><ArrowDownLeft size={14}/>{a.isTemporary?'Return temporary':'Record return'}</button>}</td></tr>})}</tbody></table>{rows.length===0&&<div className="empty-state"><div className="empty-icon"><ArrowLeftRight size={22}/></div><strong>No matching assignments</strong><span>Try changing your search or filters.</span><button className="btn secondary" onClick={clear}>Clear filters</button></div>}</div><div className="table-foot"><span>Showing <strong>{rows.length}</strong> assignment records</span><span>Active and historical assignment records are retained</span></div></section>
  </>;
}
function RepairsPage({assets,onComplete,onOpen,currency,dateLabel}) {
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState(['Open repairs']);
  const openRepairs=assets.filter(a=>['Needs Repair','Under Repair'].includes(a.status));
  const filtered=assets.filter(a=>{
    const isOpen=['Needs Repair','Under Repair'].includes(a.status);
    const matchesStatus=!status.length||status.some(filter=>filter==='Open repairs'?isOpen:filter==='Needs Repair'?a.status==='Needs Repair':filter==='Under Repair'?a.status==='Under Repair':(a.repairHistory||[]).some(r=>r.completedDate));
    return matchesStatus && [a.tag,a.name,a.serial,a.notes,a.repairVendor].some(v=>(v||'').toLowerCase().includes(search.toLowerCase()));
  });
  const completedCount=assets.reduce((n,a)=>n+(a.repairHistory||[]).filter(r=>r.completedDate).length,0);
  const totalSpend=assets.reduce((n,a)=>n+Number(a.maintenanceCost||0),0);
  return <><PageHeading eyebrow="MAINTENANCE" title="Repair Management" description="View open repair issues, update service details, and close repairs when devices are returned." action={<span className="soft-count"><Wrench size={15}/>{openRepairs.length} open</span>}/>
    <div className="report-kpis repair-kpis"><div className="report-kpi"><span>Awaiting service  </span><strong>{assets.filter(a=>a.status==='Needs Repair').length}</strong><small>  Issue recorded, not yet sent</small></div><div className="report-kpi"><span>Under repair  </span><strong>{assets.filter(a=>a.status==='Under Repair').length}</strong><small>  Currently with service provider</small></div><div className="report-kpi"><span>Completed repairs  </span><strong>{completedCount}</strong><small>  Historical repair records</small></div><div className="report-kpi"><span>Total repair spend  </span><strong>{currency(totalSpend)}</strong><small>  Completed repair costs</small></div></div>
    <section className="panel table-panel"><div className="panel-head"><div><h2>Repair register</h2><p>One row per device. Select a device to update its repair details or complete the repair.</p></div></div>
      <div className="toolbar"><div className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search asset tag, device, issue or vendor…"/></div><MultiSelectFilter label="Repair status" options={['Open repairs','Needs Repair','Under Repair','Completed history']} selected={status} onChange={setStatus}/><span className="result-count">{filtered.length} records</span></div>
      <div className="table-wrap"><table><thead><tr><th>DEVICE</th><th>REPAIR STATUS</th><th>ISSUE</th><th>REPORTED</th><th>SENT TO SERVICE</th><th>EST. COMPLETION</th><th>VENDOR</th><th>ACTIONS</th></tr></thead><tbody>{filtered.map(a=>{const active=(a.repairHistory||[]).find(r=>!r.completedDate);return <tr key={a.id}><td><strong>{a.name}</strong><small>{a.tag} · {a.serial||'No serial number'}</small></td><td><Badge value={a.status}/></td><td>{active?.description||a.notes||'—'}</td><td>{dateLabel(active?.reportedDate||a.repairReportedDate)}</td><td>{dateLabel(active?.sentDate||a.sentForRepairDate)}</td><td>{dateLabel(active?.estimatedCompletionDate||a.estimatedRepairCompletionDate)}</td><td>{active?.vendor||a.repairVendor||'—'}</td><td><div className="row-actions"><button className="btn secondary small" onClick={()=>onOpen(a)}><Pencil size={13}/> Update</button>{a.status==='Under Repair'&&<button className="btn primary small" onClick={()=>onComplete(a)}><CircleCheck size={13}/> Complete</button>}</div></td></tr>})}{filtered.length===0&&<tr><td colSpan="8"><div className="empty-state"><div className="empty-icon"><CircleCheck size={22}/></div><strong>{status.length===1&&status[0]==='Open repairs'?'No open repairs':'No matching repair records'}</strong><span>{status.length===1&&status[0]==='Open repairs'?'All devices are available or assigned.':'Try another filter or search term.'}</span></div></td></tr>}</tbody></table></div>
      <div className="table-foot"><span>Repair records are maintained on each asset.</span><span>Repair cost is entered when the repair is completed.</span></div>
    </section>
  </>;
}
function ReportsPage({assets,assignments,employees,currency}) {
  const [reportType,setReportType]=useState('Asset summary');
  const totalValue=assets.filter(a=>!['Sold','Scrapped','Retired'].includes(a.status)).reduce((s,a)=>s+Number(a.purchasePrice||0),0);
  const repairSpend=assets.reduce((s,a)=>s+Number(a.maintenanceCost||0),0);
  const openRepairs=assets.filter(a=>['Needs Repair','Under Repair'].includes(a.status));
  const assigned=assets.filter(a=>a.status==='Assigned').length;
  const available=assets.filter(a=>a.status==='Available').length;
  const rows=reportType==='Asset summary'
    ? [['Asset Tag','Device','Category','Status','Purchase Vendor','Purchase Date','Purchase Cost','Warranty Provider','Warranty Expiry'],...assets.map(a=>[a.tag,a.name,a.category,a.status,a.vendor,a.purchaseDate,a.purchasePrice,a.warrantyProvider,a.warrantyExpiry])]
    : reportType==='Repair summary'
    ? [['Asset Tag','Device','Repair Status','Issue','Reported Date','Sent Date','Estimated Completion','Repair Vendor','Repair Cost','Completed Date'],...assets.flatMap(a=>(a.repairHistory||[]).map(r=>[a.tag,a.name,r.completedDate?'Completed':a.status,r.description,r.reportedDate,r.sentDate,r.estimatedCompletionDate,r.vendor,r.cost,r.completedDate]))]
    : [['Asset Tag','Device','Recipient','Company','Issued By','Allocation Type','Assigned Date','Returned Date','Status'],...assignments.map(a=>{const asset=assets.find(x=>x.id===a.assetId),person=employees.find(x=>x.id===a.employeeId);return [asset?.tag,asset?.name,person?.name||a.recipientName,a.companyName,a.issuedByName,a.isTemporary?(a.temporaryType==='Sister Company'?'Intercompany temporary':'Temporary'):'Standard',a.assignedDate,a.returnedDate,a.returnedDate?'Returned':'Active']})];
  const exportCsv=()=>{const csv=rows.map(row=>row.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`itam-${reportType.toLowerCase().replaceAll(' ','-')}.csv`;link.click();URL.revokeObjectURL(url)};
  return <><PageHeading eyebrow="REPORTING" title="Reports & Exports" description="A concise overview of inventory, repairs and employee assignments." action={<button className="btn primary" onClick={exportCsv}><Download size={16}/> Export selected report</button>}/>
    <div className="report-kpis"><div className="report-kpi"><span>Active inventory value  </span><strong>{currency(totalValue)}</strong><small>  Purchase value of active assets</small></div><div className="report-kpi"><span>Completed repair spend  </span><strong>{currency(repairSpend)}</strong><small>  Final costs recorded at completion</small></div><div className="report-kpi"><span>Open repair cases  </span><strong>{openRepairs.length}</strong><small>  Awaiting service or under repair</small></div><div className="report-kpi"><span>Active assignments  </span><strong>{assignments.filter(a=>!a.returnedDate).length}</strong><small>  Out with employees or recipients</small></div></div>
    <section className="panel report-panel"><div className="panel-head"><div><h2>Inventory at a glance</h2><p>Current asset availability and ownership.</p></div></div><div className="report-simple-grid"><div><span>Available</span><strong>{available}</strong></div><div><span>Assigned</span><strong>{assigned}</strong></div><div><span>Needs repair</span><strong>{assets.filter(a=>a.status==='Needs Repair').length}</strong></div><div><span>Under repair</span><strong>{assets.filter(a=>a.status==='Under Repair').length}</strong></div><div><span>Missing</span><strong>{assets.filter(a=>a.status==='Missing').length}</strong></div><div><span>Retired / disposed</span><strong>{assets.filter(a=>['Retired','Sold','Scrapped'].includes(a.status)).length}</strong></div></div></section>
    <section className="panel report-panel"><div className="panel-head"><div><h2>Export a report</h2><p>Choose the records you need, then export them as a CSV spreadsheet.</p></div></div><div className="report-export-row"><Field label="Report type"><select value={reportType} onChange={e=>setReportType(e.target.value)}><option>Asset summary</option><option>Repair summary</option><option>Assignment history</option></select></Field><div className="report-export-count"><strong>{Math.max(0,rows.length-1)}</strong><span>records included</span></div><button className="btn secondary" onClick={exportCsv}><Download size={15}/> Download CSV</button></div></section>
  </>;
}
function BulkStockPage({items,transactions,employees,search,setSearch,onAdd,onRestock,onIssue,onReturn,currency,dateLabel}) {
  const [tab,setTab]=useState('Stock');
  const [historySearch,setHistorySearch]=useState('');
  const issuedFor = item => transactions.filter(t=>t.itemId===item.id).reduce((sum,t)=>sum+Math.max(0,t.quantityIssued-t.quantityReturned),0);
  const filteredItems=items.filter(item=>[item.tag,item.name,item.category,item.brand,item.location].some(v=>(v||'').toLowerCase().includes(search.toLowerCase())));
  const filteredTransactions=transactions.filter(t=>{const item=items.find(x=>x.id===t.itemId);const employee=employees.find(x=>x.id===t.employeeId);return [item?.name,item?.tag,employee?.name,employee?.employeeId,t.issuedBy,t.notes].some(v=>(v||'').toLowerCase().includes(historySearch.toLowerCase()));});
  const totalAvailable=items.reduce((sum,item)=>sum+item.availableQuantity,0);
  const totalIssued=items.reduce((sum,item)=>sum+issuedFor(item),0);
  const lowStock=items.filter(item=>item.availableQuantity<=item.minimumStock).length;
  return <>
    <div className="page-heading"><div><div className="eyebrow">INVENTORY MANAGEMENT</div><h1>Bulk Stock</h1><p>Manage accessories by quantity and keep a complete employee issue and return history.</p></div><div className="heading-actions"><button className="btn secondary" onClick={()=>onIssue(null)}><ArrowUpRight size={15}/> Issue stock</button><button className="btn primary" onClick={onAdd}><Plus size={15}/> Add stock item</button></div></div>
    <div className="stats-grid bulk-stats"><StatCard title="Stock items" value={items.length} sub="Quantity-managed products" icon={Package} tone="blue" onClick={()=>setTab('Stock')}/><StatCard title="Available units" value={totalAvailable} sub="Ready to issue" icon={CircleCheck} tone="green" onClick={()=>setTab('Stock')}/><StatCard title="Issued units" value={totalIssued} sub="Currently with employees" icon={ArrowUpRight} tone="purple" onClick={()=>setTab('History')}/><StatCard title="Low stock" value={lowStock} sub="At or below minimum level" icon={AlertTriangle} tone="orange" onClick={()=>setTab('Stock')}/></div>
    <div className="panel section-gap"><div className="panel-head"><div><h2>Bulk inventory and issue history</h2><p>Stock quantities update automatically when items are issued or returned.</p></div></div><div className="subtabs"><button className={tab==='Stock'?'selected':''} onClick={()=>setTab('Stock')}>Stock levels <span>{items.length}</span></button><button className={tab==='History'?'selected':''} onClick={()=>setTab('History')}>Issue history <span>{transactions.length}</span></button></div>
      {tab==='Stock'?<><div className="toolbar"><div className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by item, category, or location…"/></div><span className="result-count">{filteredItems.length} item(s)</span></div><div className="table-wrap"><table><thead><tr><th>ITEM</th><th>TOTAL</th><th>AVAILABLE</th><th>ISSUED</th><th>DAMAGED</th><th>REPAIR</th><th>LOCATION</th><th>STOCK STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filteredItems.map(item=>{const issued=issuedFor(item);const low=item.availableQuantity<=item.minimumStock;return <tr key={item.id}><td><div className="asset-cell"><div className="asset-icon"><Package size={17}/></div><div><strong>{item.name}</strong><span>{item.tag} · {item.category}{item.brand?` · ${item.brand}`:''}</span></div></div></td><td>{item.totalQuantity}</td><td><strong>{item.availableQuantity}</strong></td><td>{issued}</td><td>{item.damagedQuantity}</td><td>{item.repairQuantity}</td><td>{item.location||'—'}</td><td><Badge value={item.availableQuantity===0?'Out of Stock':low?'Low Stock':'In Stock'}/><small className="warranty-date">Minimum: {item.minimumStock}</small></td><td><div className="row-actions"><button className="btn secondary small" onClick={()=>onRestock(item)} title="Add received stock"><Plus size={13}/> Stock</button><button className="btn primary small" disabled={item.availableQuantity<=0} onClick={()=>onIssue(item)} title="Issue quantity to employee">Issue</button></div></td></tr>})}{filteredItems.length===0&&<tr><td colSpan="9"><div className="empty-state"><div><Package size={22}/></div><strong>No bulk stock items found</strong><p>Add a stock item or change your search.</p></div></td></tr>}</tbody></table></div><div className="table-foot"><span>Issued quantity is calculated from each employee's outstanding issue records.</span><span>Low stock means available units are at or below the configured minimum.</span></div></>:<><div className="toolbar"><div className="search-box"><Search size={15}/><input value={historySearch} onChange={e=>setHistorySearch(e.target.value)} placeholder="Search item, employee, or issuer…"/></div><span className="result-count">{filteredTransactions.length} issue record(s)</span></div><div className="table-wrap"><table><thead><tr><th>ITEM / EMPLOYEE</th><th>ISSUED</th><th>QTY ISSUED</th><th>QTY RETURNED</th><th>OUTSTANDING</th><th>ISSUED BY</th><th>NOTES / RETURNS</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{filteredTransactions.map(t=>{const item=items.find(x=>x.id===t.itemId);const employee=employees.find(x=>x.id===t.employeeId);const outstanding=t.quantityIssued-t.quantityReturned;return <tr key={t.id}><td><strong>{item?.name||'Removed stock item'}</strong><small>{employee?.name||'Employee'} · {employee?.employeeId||'—'}</small></td><td>{dateLabel(t.issuedDate)}</td><td>{t.quantityIssued}</td><td>{t.quantityReturned}</td><td><strong>{outstanding}</strong></td><td>{t.issuedBy||'—'}</td><td><span>{t.notes||'—'}</span>{(t.returnEvents||[]).map(event=><small key={event.id}>Returned {event.quantity} · {dateLabel(event.date)} · {event.condition}{event.notes?` · ${event.notes}`:''}</small>)}</td><td><Badge value={outstanding===0?'Completed':'Active'}/></td><td>{outstanding>0?<button className="btn secondary small" onClick={()=>onReturn(t)}><ArrowDownLeft size={13}/> Return</button>:<span className="muted">Complete</span>}</td></tr>})}{filteredTransactions.length===0&&<tr><td colSpan="9"><div className="empty-state"><div><ArrowLeftRight size={22}/></div><strong>No issue history yet</strong><p>Issue stock to an employee to create the first history record.</p></div></td></tr>}</tbody></table></div></>}
    </div>
  </>;
}

function SettingsPage({onReset,isAdmin,categories,categoryDraft,setCategoryDraft,onAddCategory,onEditCategory,onDeleteCategory,onLogin,onLogout}) {return <><PageHeading eyebrow="PREFERENCES" title="Settings" description="Manage application data, categories and administrator access."/><section className="panel settings-panel"><div className="settings-row"><div><strong>Administrator access</strong><p>{isAdmin?'Administrator session is active. You can manage asset categories.':'Sign in as an administrator to add, edit or delete asset categories.'}</p></div>{isAdmin?<button className="btn secondary" onClick={onLogout}>Sign out</button>:<button className="btn primary" onClick={onLogin}>Admin login</button>}</div>{isAdmin&&<div className="category-admin"><div className="panel-heading"><div><h2>Manage asset categories</h2><p>Changes are saved in this browser and reflected in asset forms and filters.</p></div></div><div className="category-add-row"><input value={categoryDraft} onChange={e=>setCategoryDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();onAddCategory()}}} placeholder="New category name"/><button className="btn primary" onClick={onAddCategory}><Plus size={14}/> Add category</button></div><div className="category-admin-list">{categories.map(name=><div key={name}><span>{name}</span><div><button className="btn secondary small" onClick={()=>onEditCategory(name)}><Pencil size={13}/> Edit</button><button className="btn danger small" onClick={()=>onDeleteCategory(name)}><Trash2 size={13}/> Delete</button></div></div>)}</div></div>}<div className="settings-row"><div><strong>Restore initial records</strong><p>Restore the starting assets, employees and assignments. Saved changes in this browser will be cleared.</p></div><button className="btn secondary" onClick={onReset}><Trash2 size={15}/> Reset data</button></div><div className="settings-row"><div><strong>Data storage</strong><p>Changes are saved automatically on this device.</p></div><Badge value="Enabled"/></div></section></>}

export default App;
