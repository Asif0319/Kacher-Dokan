/** Kacher Dokan v24 UX & reliability upgrade */
(function(){
  const t=(en,bn)=>state.lang==='bn'?bn:en;
  const esc = window.escapeHtml || (s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));

  function paymentLabel(status){
    const key=String(status||'PENDING').toUpperCase();
    const map={PENDING:['Payment pending','পেমেন্ট অপেক্ষমাণ'],INITIATED:['Payment pending','পেমেন্ট অপেক্ষমাণ'],UNPAID:['Payment pending','পেমেন্ট অপেক্ষমাণ'],PAID:['Paid','পেমেন্ট সম্পন্ন'],REFUND_PENDING:['Refund requested','রিফান্ড অনুরোধ করা হয়েছে'],REFUND_REQUESTED:['Refund requested','রিফান্ড অনুরোধ করা হয়েছে'],REFUNDED:['Refunded','রিফান্ড সম্পন্ন'],CANCELLED:['Cancelled','বাতিল']};
    const v=map[key]||[key,key]; return state.lang==='bn'?v[1]:v[0];
  }
  window.kdPaymentLabel=paymentLabel;

  window.kdCompleteRefund=async function(orderId){
    if(!confirm(t('Mark this demo refund as completed?','এই ডেমো রিফান্ড সম্পন্ন হিসেবে চিহ্নিত করবেন?'))) return;
    try{const r=await apiFetch(`/api/orders/${orderId}/refund`,{method:'POST'});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.message||'Refund failed');showToast(t('Refund marked completed.','রিফান্ড সম্পন্ন হিসেবে চিহ্নিত হয়েছে।'));await loadOwnerOrders();}
    catch(e){showToast(e.message||t('Unable to update refund.','রিফান্ড আপডেট করা যায়নি।'));}
  };

  async function validateCartBeforeCheckout(){
    const items=(state.activeCart?.items||[]).map(i=>({productId:i.productId||i._id,quantity:i.quantity||1}));
    if(!items.length) return true;
    try{
      const r=await apiFetch('/api/cart/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
      const d=await r.json();
      if(d.success && !d.valid){
        const names=(d.issues||[]).map(x=>`${x.productName||x.productId}: ${x.reason==='UNAVAILABLE'?t('unavailable','অনুপলব্ধ'):t(`only ${x.availableStock||0} left`, `মাত্র ${x.availableStock||0}টি আছে`)}`).join('\n');
        showToast(t('Some cart items changed. Please review your cart.','কার্টের কিছু পণ্যের স্টক পরিবর্তন হয়েছে। কার্টটি আবার দেখুন।'));
        alert(t('Cart update needed:\n','কার্ট আপডেট প্রয়োজন:\n')+names);
        return false;
      }
    }catch(_){ /* final checkout endpoint still revalidates atomically */ }
    return true;
  }
  if(typeof window.placeOrder==='function' || typeof placeOrder==='function'){
    const base=window.placeOrder||placeOrder;
    const wrapped=async function(...args){if(!(await validateCartBeforeCheckout()))return;return base.apply(this,args);};
    window.placeOrder=wrapped; try{placeOrder=wrapped;}catch(_){}
  }

  // Improve tracking summary: clearer payment/refund state and timestamps.
  if(typeof window.showOrderTrackingWithoutTimer==='function' || typeof showOrderTrackingWithoutTimer==='function'){
    const base=window.showOrderTrackingWithoutTimer||showOrderTrackingWithoutTimer;
    const wrapped=function(order){
      const r=base(order);
      const box=document.getElementById('trackItemsSummary');
      if(box){
        const hist=(order.statusHistory||[]).slice(-6).map(h=>`<span class="v24-history-chip"><b>${esc(h.status)}</b>${h.at?` · ${new Date(h.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`:''}</span>`).join('');
        box.insertAdjacentHTML('beforeend',`<div class="v24-payment-row"><span>${t('Payment status','পেমেন্ট অবস্থা')}</span><strong>${esc(paymentLabel(order.paymentStatus))}</strong></div>${hist?`<div class="v24-history-wrap">${hist}</div>`:''}`);
      }
      return r;
    };
    window.showOrderTrackingWithoutTimer=wrapped; try{showOrderTrackingWithoutTimer=wrapped;}catch(_){}
  }

  async function refreshChatUnread(){
    if(!state.authToken||!state.user) return;
    try{const r=await apiFetch('/api/chat/unread');const d=await r.json();if(!d.success)return;state.unreadChat=Number(d.unread||0);state.chatUnreadByOrder=d.byOrder||{};if(document.getElementById('customerOrdersModal')?.style.display==='flex'&&state.activeOrders?.length)try{renderCustomerOrdersList(state.activeOrders)}catch(_){};if(typeof kdUpdateNotificationBadges==='function')kdUpdateNotificationBadges();}
    catch(_){}
  }

  // Profile view/edit mode: cleaner default presentation, edit only when requested.
  function setProfileEditing(editing){
    const form=document.getElementById('profileForm'); if(!form)return;
    form.classList.toggle('v24-profile-editing',!!editing);
    form.classList.toggle('v24-profile-viewing',!editing);
    form.querySelectorAll('input:not([type="hidden"]),textarea,select').forEach(el=>{
      if(['profileEmail','profileRole'].includes(el.id)) return;
      el.disabled=!editing;
    });
    const save=form.querySelector('button[type="submit"]');if(save)save.style.display=editing?'':'none';
    document.getElementById('v24EditProfileBtn')?.remove();
    if(!editing){
      const btn=document.createElement('button');btn.type='button';btn.id='v24EditProfileBtn';btn.className='btn btn-primary v24-edit-profile';btn.innerHTML=`<i class="fa-solid fa-pen"></i> ${t('Edit Profile','প্রোফাইল সম্পাদনা')}`;btn.onclick=()=>setProfileEditing(true);form.prepend(btn);
    }
  }
  const oldOpen=window.kdOpenProfile;
  if(typeof oldOpen==='function'){
    window.kdOpenProfile=function(){oldOpen();setTimeout(()=>setProfileEditing(false),0)};
    try{kdOpenProfile=window.kdOpenProfile;}catch(_){}
  }

  function setupVoiceControls(){
    const select=document.getElementById('voiceLanguageSelect');if(!select)return;
    select.disabled=false; select.value=state.voiceAlertLanguage||localStorage.getItem('kd_voice_language')||'bn';
    const hint=document.getElementById('voiceLanguageHint'); if(hint) hint.textContent=t('Voice language is independent from interface language.','ভয়েস ভাষা ইন্টারফেসের ভাষা থেকে আলাদা।');
    if(!document.getElementById('btnTestVoice')){
      const b=document.createElement('button');b.id='btnTestVoice';b.className='btn btn-outline';b.type='button';b.innerHTML=`<i class="fa-solid fa-volume-high"></i> <span>${t('Test Voice','ভয়েস পরীক্ষা')}</span>`;select.parentElement?.insertBefore(b,document.getElementById('btnReplayGreeting'));
      b.onclick=()=>{const lang=state.voiceAlertLanguage||'bn';const text=lang==='bn'?'আপনার ভয়েস নোটিফিকেশন বাংলা ভাষায় সেট করা হয়েছে।':'Your voice notification language is set to English.';if(typeof kdSpeak==='function')kdSpeak(text,lang);};
    }
  }

  function enhanceAnalytics(){
    const toolbar=document.querySelector('#ownerTabAnalytics .analytics-toolbar'); if(!toolbar||document.getElementById('analyticsFrom'))return;
    const controls=document.createElement('div');controls.className='v24-analytics-controls';controls.innerHTML=`<label>${t('From','শুরু')} <input type="date" id="analyticsFrom"></label><label>${t('To','শেষ')} <input type="date" id="analyticsTo"></label><button class="btn btn-sm btn-outline" id="btnApplyAnalytics">${t('Apply','প্রয়োগ')}</button><button class="btn btn-sm btn-outline" id="btnExportAnalytics"><i class="fa-solid fa-file-csv"></i> CSV</button>`;toolbar.appendChild(controls);
    const oldLoad=window.loadSellerAnalytics;
    if(typeof oldLoad==='function'){
      window.loadSellerAnalytics=async function(){
        const from=document.getElementById('analyticsFrom')?.value||'',to=document.getElementById('analyticsTo')?.value||'';
        const loading=document.getElementById('analyticsLoading'),content=document.getElementById('analyticsContent');if(loading)loading.style.display='';
        try{const q=new URLSearchParams({shopId:state.ownerShopId});if(from)q.set('from',from);if(to)q.set('to',to);const r=await apiFetch(`/api/seller/analytics?${q}`);const d=await r.json();if(!r.ok||!d.success)throw new Error(d.message||'Analytics failed');
          // Reuse standard renderer by temporarily feeding data through a tiny local render.
          const a=d.data||{},s=a.summary||{};const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};const money=v=>`৳${Number(v||0).toLocaleString()}`;
          set('analyticsTodayRevenue',money(s.todayRevenue));set('analyticsWeekRevenue',money(s.weekRevenue));set('analyticsMonthRevenue',money(s.monthRevenue));set('analyticsAov',money(s.averageOrderValue));set('analyticsCompleted',s.completedOrders||0);set('analyticsCancelled',s.cancelledOrders||0);set('analyticsFulfillment',`${s.fulfillmentRate||0}%`);set('analyticsLowStock',a.lowStockCount||0);
          let compare=document.getElementById('v24SalesCompare');if(!compare){compare=document.createElement('div');compare.id='v24SalesCompare';compare.className='v24-sales-compare';document.querySelector('#analyticsContent .analytics-kpi-grid')?.insertAdjacentElement('afterend',compare);} compare.innerHTML=`<div><span>${t('Week vs previous week','গত সপ্তাহের তুলনায়')}</span><strong>${Number(s.weekChangePercent||0)>=0?'+':''}${Number(s.weekChangePercent||0)}%</strong><small>${money(s.previousWeekRevenue||0)} ${t('previous','আগে')}</small></div><div><span>${t('Month vs previous month','গত মাসের তুলনায়')}</span><strong>${Number(s.monthChangePercent||0)>=0?'+':''}${Number(s.monthChangePercent||0)}%</strong><small>${money(s.previousMonthRevenue||0)} ${t('previous','আগে')}</small></div>`;
          const bars=document.getElementById('analyticsRevenueBars');if(bars){const rows=a.dailyRevenue||[];const max=Math.max(1,...rows.map(x=>Number(x.revenue||0)));bars.innerHTML=rows.map(x=>`<div class="analytics-bar-col"><div class="analytics-bar-value">${money(x.revenue)}</div><div class="analytics-bar-track"><div class="analytics-bar-fill" style="height:${Math.max(3,(Number(x.revenue||0)/max)*100)}%"></div></div><div class="analytics-bar-label">${esc(x.label)}</div></div>`).join('');}
          const status=document.getElementById('analyticsStatusSummary');if(status){const b=a.statusBreakdown||{};status.innerHTML=[[t('New','নতুন'),b.PLACED||0],[t('Preparing','প্রস্তুত হচ্ছে'),b.PREPARING||0],[t('Completed','সম্পন্ন'),b.COMPLETED||0],[t('Cancelled','বাতিল'),b.CANCELLED||0]].map(([label,val])=>`<div class="analytics-status-chip"><span>${label}</span><strong>${val}</strong></div>`).join('');}
          const top=document.getElementById('analyticsTopProducts');if(top)top.innerHTML=(a.topProducts||[]).map((p,i)=>`<div class="analytics-product-row"><span class="analytics-rank">${i+1}</span><span class="analytics-product-name">${esc(p.nameBn||p.name)}</span><span class="analytics-product-meta">${p.quantity} ${t('sold','বিক্রি')}<br>${money(p.revenue)}</span></div>`).join('')||`<div class="empty-state-small">${t('No completed sales in this period.','এই সময়ে কোনো সম্পন্ন বিক্রি নেই।')}</div>`;
          let reasons=document.getElementById('v24CancelReasons');if(!reasons){reasons=document.createElement('div');reasons.id='v24CancelReasons';reasons.className='card analytics-card-v9 v24-cancel-reasons';document.getElementById('analyticsContent')?.appendChild(reasons);}reasons.innerHTML=`<h3 class="card-title">${t('Cancellation Reasons','বাতিলের কারণ')}</h3>${Object.entries(a.cancellationReasons||{}).map(([k,v])=>`<div class="v24-reason-row"><span>${esc(k)}</span><strong>${v}</strong></div>`).join('')||`<div class="empty-state-small">${t('No cancellations in this period.','এই সময়ে কোনো বাতিল অর্ডার নেই।')}</div>`}`;
          if(content)content.style.display='';if(loading)loading.style.display='none';
        }catch(e){if(loading){loading.style.display='';loading.textContent=e.message;}}
      };
      try{loadSellerAnalytics=window.loadSellerAnalytics;}catch(_){}
    }
    document.getElementById('btnApplyAnalytics').onclick=()=>window.loadSellerAnalytics?.();
    document.getElementById('btnExportAnalytics').onclick=async()=>{try{const r=await apiFetch(`/api/seller/analytics.csv?shopId=${encodeURIComponent(state.ownerShopId)}`);const b=await r.blob();const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='kacher-dokan-analytics.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}catch(_){showToast(t('CSV export failed.','CSV এক্সপোর্ট করা যায়নি।'));}};
  }

  // Sync server preference after authentication without changing UI language.
  const oldApply=window.applyAuthenticatedUser;
  if(typeof oldApply==='function'){
    window.applyAuthenticatedUser=function(user,shops){const r=oldApply(user,shops);if(localStorage.getItem('kd_voice_language')){state.voiceAlertLanguage=localStorage.getItem('kd_voice_language');}else if(user?.voiceLanguage){state.voiceAlertLanguage=user.voiceLanguage;}setTimeout(()=>{setupVoiceControls();refreshChatUnread();},0);return r;};
    try{applyAuthenticatedUser=window.applyAuthenticatedUser;}catch(_){}
  }

  document.addEventListener('DOMContentLoaded',()=>{
    setupVoiceControls();enhanceAnalytics();refreshChatUnread();document.getElementById('btnOpenProfile')?.addEventListener('click',()=>setTimeout(()=>setProfileEditing(false),0));
    setInterval(refreshChatUnread,15000);
    document.getElementById('orderChatModal')?.addEventListener('click',()=>setTimeout(refreshChatUnread,300));
  });
})();
