---
title: Sales Pipeline Board
type: interactive
status: running
pinned: true
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sales Pipeline Board</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Premium glassmorphic scrollbars */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-[#181a1c] text-[#e7e6e1] h-screen overflow-hidden flex flex-col p-4">

  <!-- Header -->
  <div class="flex justify-between items-center mb-4 shrink-0">
    <div>
      <h1 class="text-xl font-bold tracking-tight text-[#e7e6e1]">Workspace Pipeline</h1>
      <p class="text-xs text-[#7d8085]">Drag & drop cards to move stages. Click any card to operate.</p>
    </div>
    <div class="flex gap-2">
      <button onclick="toggleNewLeadPanel()" class="bg-[#e0a23c] text-[#181a1c] font-bold text-xs px-3 py-1.5 rounded hover:bg-[#e0a23c]/90 transition">
        + Add Lead
      </button>
      <button onclick="window.location.reload()" class="bg-white/5 border border-white/10 text-xs px-3 py-1.5 rounded hover:bg-white/10 transition">
        ↺ Refresh
      </button>
    </div>
  </div>

  <!-- Main Board Area -->
  <div class="flex-1 overflow-x-auto flex gap-4 pb-4 items-start relative select-none">
    
    <!-- columns will be dynamically injected here -->
    <div id="board-columns" class="flex gap-4 h-full w-full"></div>

    <!-- Slide Over Drawer (Details & Tools) -->
    <div id="lead-drawer" class="fixed right-0 top-0 bottom-0 w-[450px] bg-[#202326] border-l border-white/10 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col">
      <!-- Drawer contents dynamic -->
    </div>

    <!-- Add Lead Dialog / Panel -->
    <div id="new-lead-panel" class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-[#202326] border border-white/15 rounded-lg shadow-2xl p-5 z-50 hidden">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-sm font-bold text-[#e7e6e1]">Add New Lead to Pipeline</h2>
        <button onclick="toggleNewLeadPanel()" class="text-slate-400 hover:text-white text-lg">×</button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Lead Name *</label>
          <input id="new-lead-name" type="text" placeholder="e.g. Oakwood Electric" class="w-full bg-[#181a1c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#e0a23c]">
        </div>
        <div>
          <label class="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Category / Vertical</label>
          <input id="new-lead-category" type="text" placeholder="e.g. Electrician, Plumbing" class="w-full bg-[#181a1c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#e0a23c]">
        </div>
        <div>
          <label class="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Raw Lead Info / Input Data (for Operator)</label>
          <textarea id="new-lead-input" placeholder="Paste scraped details, website status, reviews count, address..." class="w-full h-32 bg-[#181a1c] border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#e0a23c] resize-none"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button onclick="toggleNewLeadPanel()" class="bg-white/5 px-4 py-2 rounded text-xs hover:bg-white/10">Cancel</button>
          <button onclick="submitNewLead()" class="bg-[#e0a23c] text-black font-bold px-4 py-2 rounded text-xs hover:bg-[#e0a23c]/90">Add & Route</button>
        </div>
      </div>
    </div>

  </div>

  <script>
    // State of screens and active leads
    let screensData = {};
    let selectedLeadId = null;
    let selectedLeadScreen = null;
    let activeTab = "summary"; // summary | scores | dialer | composer | scheduler

    const COLUMNS = [
      { id: "01-new", title: "New" },
      { id: "02-contacted", title: "Contacted" },
      { id: "03-replied", title: "Replied" },
      { id: "04-qualifier", title: "Qualifier" },
      { id: "05-diagnostic", title: "Diagnostic" },
      { id: "06-proposal", title: "Proposal" },
      { id: "07-won", title: "Won / Signed" },
      { id: "08-lost", title: "Lost" }
    ];

    // Grade coloring function matching the CRM styles
    function gradeBadgeStyles(grade) {
      if (!grade) return 'bg-slate-700 text-slate-300';
      const clean = grade.replace('+', 'plus').toUpperCase();
      if (clean.startsWith('A')) return 'bg-indigo-600 text-white';
      if (clean.startsWith('B')) return 'bg-blue-600 text-white';
      if (clean.startsWith('C')) return 'bg-yellow-600 text-white';
      if (clean.startsWith('D')) return 'bg-orange-600 text-white';
      return 'bg-slate-600 text-white';
    }

    // Connect to Web Socket message triggers
    window.addEventListener("message", (e) => {
      const d = e.data;
      if (!d || d.__icm !== "state") return;
      screensData = d.screens;
      renderBoard();
      if (selectedLeadId) {
        updateDrawer();
      }
    });

    function renderBoard() {
      const container = document.getElementById("board-columns");
      container.innerHTML = "";

      COLUMNS.forEach(col => {
        const cards = screensData[col.id] || [];
        
        // Sum deal value
        let totalValue = 0;
        cards.forEach(c => {
          if (c.frontmatter && c.frontmatter.deal_value) {
            totalValue += Number(c.frontmatter.deal_value);
          }
        });

        const colEl = document.createElement("div");
        colEl.className = "flex-1 flex flex-col h-full bg-[#202326]/40 border border-white/5 rounded-lg p-2 min-w-[240px] max-w-[320px] overflow-hidden";
        colEl.setAttribute("ondragover", "onDragOver(event)");
        colEl.setAttribute("ondrop", `onDrop(event, '${col.id}')`);

        // Column Header
        colEl.innerHTML = `
          <div class="flex justify-between items-center mb-2 px-1 shrink-0">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-xs text-[#e7e6e1]">${col.title}</span>
              <span class="bg-white/10 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">${cards.length}</span>
            </div>
            ${totalValue > 0 ? `<span class="text-[10px] text-[#e0a23c] font-mono font-medium">$${totalValue.toLocaleString()}</span>` : ''}
          </div>
          <div class="flex-1 overflow-y-auto space-y-2 pb-2 pr-1" id="cards-container-${col.id}"></div>
        `;

        const cardsContainer = colEl.querySelector(`#cards-container-${col.id}`);
        cards.forEach(card => {
          const cardEl = document.createElement("div");
          cardEl.className = "bg-[#202326] border border-white/5 rounded p-2.5 hover:border-white/15 transition cursor-pointer select-none";
          cardEl.setAttribute("draggable", "true");
          cardEl.setAttribute("ondragstart", `onDragStart(event, '${card.id}', '${col.id}')`);
          cardEl.onclick = () => openLead(card.id, col.id);

          const fm = card.frontmatter || {};
          const grade = fm.grade || 'N/A';
          const dealValue = fm.deal_value ? `$${Number(fm.deal_value).toLocaleString()}` : '';
          const nextAct = fm.next_action || 'No action set';

          cardEl.innerHTML = `
            <div class="flex justify-between items-start gap-1 mb-1.5">
              <span class="font-medium text-xs text-white line-clamp-1">${card.title}</span>
              <span class="text-[9px] px-1 py-0.5 font-bold rounded shrink-0 ${gradeBadgeStyles(grade)}">${grade}</span>
            </div>
            <div class="text-[10px] text-slate-400 line-clamp-1 mb-2">${fm.category || 'Lead'}</div>
            <div class="flex justify-between items-center text-[10px] border-t border-white/5 pt-1.5 mt-1 text-slate-500 font-mono">
              <span class="truncate max-w-[130px]" title="${nextAct}">${nextAct}</span>
              <span class="text-[#e0a23c] shrink-0">${dealValue}</span>
            </div>
          `;
          cardsContainer.appendChild(cardEl);
        });

        container.appendChild(colEl);
      });
    }

    // Drag-and-Drop Implementations
    function onDragStart(e, id, fromStage) {
      e.dataTransfer.setData("text/plain", JSON.stringify({ id, fromStage }));
    }

    function onDragOver(e) {
      e.preventDefault();
    }

    async function onDrop(e, toStage) {
      e.preventDefault();
      try {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (data.fromStage === toStage) return;
        
        window.parent.postMessage({
          __icm: "move-card",
          fromScreen: data.fromStage,
          toScreen: toStage,
          id: data.id
        }, "*");

        // Optimistically update tracking
        if (selectedLeadId === data.id) {
          selectedLeadScreen = toStage;
        }
      } catch (err) {
        console.error("Drop failed:", err);
      }
    }

    // Lead drawer panel actions
    function openLead(id, screen) {
      selectedLeadId = id;
      selectedLeadScreen = screen;
      activeTab = "summary";
      const drawer = document.getElementById("lead-drawer");
      drawer.classList.remove("translate-x-full");
      updateDrawer();
    }

    function closeLead() {
      selectedLeadId = null;
      selectedLeadScreen = null;
      const drawer = document.getElementById("lead-drawer");
      drawer.classList.add("translate-x-full");
    }

    function changeTab(tabName) {
      activeTab = tabName;
      updateDrawer();
    }

    function findLead(id, screen) {
      const cards = screensData[screen] || [];
      return cards.find(c => c.id === id);
    }

    // Update detailed drawer content
    function updateDrawer() {
      const card = findLead(selectedLeadId, selectedLeadScreen);
      const drawer = document.getElementById("lead-drawer");
      if (!card) {
        drawer.innerHTML = `<div class="p-4 text-xs text-slate-400">Lead not found.</div>`;
        return;
      }

      const fm = card.frontmatter || {};
      
      const emailText = fm.email || 'No email';
      const phoneText = fm.phone || 'No phone';
      const webText = fm.website || 'No website';
      const locationText = fm.address || 'Unknown';
      const grade = fm.grade || 'N/A';
      const score = fm.fit_score || 0;

      // Dynamic Tabs Headers
      const tabs = [
        { id: "summary", label: "Summary" },
        { id: "scores", label: "Scores" },
        { id: "dialer", label: "Dialer" },
        { id: "composer", label: "Email" },
        { id: "scheduler", label: "Scheduler" }
      ];

      const tabsHtml = tabs.map(t => {
        const active = t.id === activeTab;
        return `
          <button onclick="changeTab('${t.id}')" class="flex-1 text-[10px] uppercase font-bold py-2 border-b-2 transition ${active ? 'border-[#e0a23c] text-white' : 'border-transparent text-slate-400 hover:text-white'}">
            ${t.label}
          </button>
        `;
      }).join('');

      let contentHtml = "";

      if (activeTab === "summary") {
        const activitiesHtml = (fm.activities || []).map(act => {
          let outcomeColor = "text-slate-300";
          if (act.outcome === "won") outcomeColor = "text-green-500";
          if (act.outcome === "declined" || act.outcome === "lost") outcomeColor = "text-red-500";
          if (act.outcome === "sent") outcomeColor = "text-blue-400";
          
          return `
            <div class="border-b border-white/5 py-1.5 last:border-0">
              <div class="flex justify-between items-center text-[10px] text-slate-400">
                <span class="${outcomeColor} font-bold">${act.outcome.toUpperCase()} (${act.channel} ${act.direction})</span>
                <span class="font-mono text-[9px] text-slate-500">${new Date(act.created_at).toLocaleString()}</span>
              </div>
              <p class="text-[11px] text-slate-300 mt-0.5 leading-relaxed">${act.notes}</p>
            </div>
          `;
        }).join('') || '<div class="text-[11px] text-slate-500">No activities logged yet.</div>';

        contentHtml = `
          <div class="space-y-4 overflow-y-auto flex-1 px-4 py-2">
            
            <!-- Contact grid -->
            <div class="grid grid-cols-2 gap-2 bg-[#181a1c]/60 p-3 rounded border border-white/5 text-[11px]">
              <div>
                <span class="text-slate-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Phone</span>
                <span class="text-white font-mono select-all">${phoneText}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Email</span>
                <span class="text-white select-all">${emailText}</span>
              </div>
              <div class="col-span-2 mt-1 pt-1 border-t border-white/5">
                <span class="text-slate-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Website</span>
                ${fm.website ? `<a href="https://${fm.website}" target="_blank" class="text-blue-400 hover:underline truncate block">${fm.website}</a>` : '<span class="text-slate-500">None</span>'}
              </div>
            </div>

            <!-- Description -->
            <div>
              <h3 class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Lead Context</h3>
              <p class="text-xs text-slate-300 leading-relaxed bg-[#181a1c]/20 p-2 rounded border border-white/5">${fm.description || 'No description provided.'}</p>
            </div>

            <!-- Modifiers & Deal Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-slate-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Deal Value</span>
                <span class="text-white font-mono text-sm font-semibold">${fm.deal_value ? `$${Number(fm.deal_value).toLocaleString()}` : '$0'}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Modifier Notes</span>
                <span class="text-xs text-white block truncate" title="${fm.modifiers || 'None'}">${fm.modifiers || 'None'}</span>
              </div>
            </div>

            <!-- Timeline -->
            <div>
              <h3 class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Activity Timeline</h3>
              <div class="bg-[#181a1c]/40 border border-white/5 rounded p-3 max-h-[220px] overflow-y-auto space-y-2">
                ${activitiesHtml}
              </div>
            </div>

          </div>
        `;
      } 
      
      else if (activeTab === "scores") {
        const ev = fm.score_evidence || {};
        contentHtml = `
          <div class="space-y-4 overflow-y-auto flex-1 px-4 py-2 text-xs">
            
            <div class="bg-[#181a1c]/60 border border-white/5 rounded p-3 flex justify-between items-center mb-2">
              <div>
                <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Overall Grade</span>
                <span class="text-2xl font-bold text-white">${grade} <span class="text-xs text-[#e0a23c] font-normal">(${score}/100)</span></span>
              </div>
              <span class="w-10 h-10 rounded flex items-center justify-center font-bold text-lg ${gradeBadgeStyles(grade)}">${grade[0] || '?'}</span>
            </div>

            <div class="space-y-3">
              <h3 class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">5-Dimension Score Evidence</h3>

              <div class="border-b border-white/5 pb-2">
                <div class="flex justify-between items-center text-[11px] font-semibold text-white mb-0.5">
                  <span>Need Scale</span>
                  <span class="font-mono text-[#e0a23c]">${fm.need_score ?? 'N/A'}/10</span>
                </div>
                <p class="text-[10.5px] text-slate-400 leading-relaxed">${ev.need || 'No evidence.'}</p>
              </div>

              <div class="border-b border-white/5 pb-2">
                <div class="flex justify-between items-center text-[11px] font-semibold text-white mb-0.5">
                  <span>Fit Scale</span>
                  <span class="font-mono text-[#e0a23c]">${fm.fit_dim_score ?? 'N/A'}/10</span>
                </div>
                <p class="text-[10.5px] text-slate-400 leading-relaxed">${ev.fit || 'No evidence.'}</p>
              </div>

              <div class="border-b border-white/5 pb-2">
                <div class="flex justify-between items-center text-[11px] font-semibold text-white mb-0.5">
                  <span>Reach Scale</span>
                  <span class="font-mono text-[#e0a23c]">${fm.reach_score ?? 'N/A'}/10</span>
                </div>
                <p class="text-[10.5px] text-slate-400 leading-relaxed">${ev.reach || 'No evidence.'}</p>
              </div>

              <div class="border-b border-white/5 pb-2">
                <div class="flex justify-between items-center text-[11px] font-semibold text-white mb-0.5">
                  <span>Pay Scale</span>
                  <span class="font-mono text-[#e0a23c]">${fm.pay_score ?? 'N/A'}/10</span>
                </div>
                <p class="text-[10.5px] text-slate-400 leading-relaxed">${ev.pay || 'No evidence.'}</p>
              </div>

              <div class="pb-1">
                <div class="flex justify-between items-center text-[11px] font-semibold text-white mb-0.5">
                  <span>Intent Scale</span>
                  <span class="font-mono text-[#e0a23c]">${fm.intent_score ?? 'N/A'}/10</span>
                </div>
                <p class="text-[10.5px] text-slate-400 leading-relaxed">${ev.intent || 'No evidence.'}</p>
              </div>
            </div>

          </div>
        `;
      } 
      
      else if (activeTab === "dialer") {
        contentHtml = `
          <div class="space-y-4 flex-1 px-4 py-2 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="bg-[#181a1c] p-4 rounded-lg border border-white/5 text-center shrink-0">
                <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Active Line</div>
                <div class="text-sm font-bold text-[#e0a23c] font-mono tracking-tight">${phoneText}</div>
                <div class="text-[10px] text-slate-400 mt-1">${fm.owner_name || 'Owner'} (${fm.owner_role || 'No Role'})</div>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Call Outcome</label>
                  <select id="dial-outcome" class="w-full bg-[#181a1c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none">
                    <option value="connected">Connected & Conversed</option>
                    <option value="voicemail">Left Voicemail</option>
                    <option value="no-answer">No Answer / Rang Out</option>
                    <option value="busy">Line Busy</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Call Notes / Summary</label>
                  <textarea id="dial-notes" placeholder="Summarize call highlights, owner reactions, timeline alignment..." class="w-full h-32 bg-[#181a1c] border border-white/10 rounded p-2 text-xs text-white focus:outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            <button onclick="logCall()" class="bg-[#e0a23c] text-[#181a1c] py-2 rounded text-xs font-bold hover:bg-[#e0a23c]/90 transition shrink-0 mt-4">
              Log Completed Call
            </button>
          </div>
        `;
      } 
      
      else if (activeTab === "composer") {
        contentHtml = `
          <div class="space-y-4 flex-1 px-4 py-2 flex flex-col justify-between overflow-y-auto">
            <div class="space-y-3">
              <div>
                <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Choose Template</label>
                <select id="email-template" onchange="applyEmailTemplate()" class="w-full bg-[#181a1c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none">
                  <option value="custom">-- Custom Freeform Email --</option>
                  <option value="cold_web">Cold Outreach - Missing Website</option>
                  <option value="cold_season">Cold Outreach - Seasonal Booking</option>
                  <option value="qual_follow">Qualifier Call Follow-up</option>
                  <option value="prop_follow">Proposal Sent Follow-up</option>
                  <option value="decline_vendor">Warm Decline - Scope/Cheapest Bid</option>
                  <option value="referral">Warm Referral - Sub-$750 Floor</option>
                </select>
              </div>
              
              <div>
                <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Recipient</label>
                <input id="email-to" type="text" value="${fm.email || ''}" class="w-full bg-[#181a1c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none">
              </div>

              <div>
                <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Email Subject</label>
                <input id="email-subject" type="text" placeholder="Subject" class="w-full bg-[#181a1c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none">
              </div>

              <div>
                <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Message Body</label>
                <textarea id="email-body" class="w-full h-44 bg-[#181a1c] border border-white/10 rounded p-2 text-xs text-white font-mono focus:outline-none resize-none"></textarea>
              </div>
            </div>

            <button onclick="logEmail()" class="bg-[#e0a23c] text-[#181a1c] py-2 rounded text-xs font-bold hover:bg-[#e0a23c]/90 transition shrink-0 mt-3">
              Send & Log Email
            </button>
          </div>
        `;
        // Apply initial template if custom isn't forced
        setTimeout(applyEmailTemplate, 0);
      } 
      
      else if (activeTab === "scheduler") {
        contentHtml = `
          <div class="space-y-4 flex-1 px-4 py-2 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="bg-white/5 border border-white/10 rounded p-3 text-xs">
                <span class="text-slate-400 uppercase tracking-widest text-[9px] block mb-1">Meeting Status</span>
                <span class="font-bold text-[#e0a23c] font-mono text-xs">
                  ${fm.appointment_status ? fm.appointment_status.toUpperCase() : "NO APPOINTMENT SCHEDULED"}
                </span>
                ${fm.appointment_at ? `<div class="text-slate-300 mt-1 font-mono text-[10px]">Date: ${new Date(fm.appointment_at).toLocaleString()}</div>` : ''}
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Select Date & Time</label>
                  <input id="appt-date" type="datetime-local" class="w-full bg-[#181a1c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none">
                </div>
                <div>
                  <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Scoping / Meeting Room URL</label>
                  <input id="appt-url" type="text" value="${fm.meeting_url || 'https://meet.example/scoping'}" class="w-full bg-[#181a1c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none">
                </div>
              </div>
            </div>

            <button onclick="logAppointment()" class="bg-[#e0a23c] text-[#181a1c] py-2 rounded text-xs font-bold hover:bg-[#e0a23c]/90 transition shrink-0 mt-4">
              Schedule & Log Meeting
            </button>
          </div>
        `;
      }

      drawer.innerHTML = `
        <!-- Drawer Header -->
        <div class="flex justify-between items-start p-4 border-b border-white/10 shrink-0">
          <div>
            <h2 class="text-sm font-bold text-white line-clamp-1">${card.title}</h2>
            <p class="text-[10px] text-slate-400 mt-0.5">${fm.category || 'Lead'} · ${locationText}</p>
          </div>
          <button onclick="closeLead()" class="text-slate-400 hover:text-white text-lg">×</button>
        </div>

        <!-- Dynamic Tabs -->
        <div class="flex border-b border-white/10 bg-[#181a1c]/25 shrink-0 px-2">
          ${tabsHtml}
        </div>

        <!-- Tab Body Content -->
        ${contentHtml}
      `;
    }

    // Apply template values
    function applyEmailTemplate() {
      const select = document.getElementById("email-template");
      if (!select) return;
      const t = select.value;
      const card = findLead(selectedLeadId, selectedLeadScreen);
      if (!card) return;

      const fm = card.frontmatter || {};
      const owner = fm.owner_name || "Owner";
      const name = card.title;
      const meetingUrl = fm.meeting_url || "https://meet.example/book";

      let subject = "";
      let body = "";

      if (t === "cold_web") {
        subject = `Scoping website intake for ${name}`;
        body = `Hey ${owner},\n\nJayden here. I was checking out your business ${name} and noticed you don't have a website listed, just the Google Business profile.\n\n38 reviews is a great rank, but you are likely losing the after-hours clicks. Is a dedicated quote + booking site something you've been meaning to set up?\n\nBest,\nJayden`;
      } else if (t === "cold_season") {
        subject = `Spring booking setup for ${name}`;
        body = `Hey ${owner},\n\nJayden here. Saw you guys have fantastic reviews in the area. I noticed your site doesn't have an instant quote form or seasonal booking widget.\n\nLet's get this set up before the spring rush runs you off your feet. Are you free to take a look Tuesday morning?\n\nBest,\nJayden`;
      } else if (t === "qual_follow") {
        subject = `Scoping call agenda for ${name}`;
        body = `Hi ${owner},\n\nGreat chatting today. I've noted down your scoping specs.\n\nLet's schedule our 60-minute diagnostic session next week to map the milestones.\n\nBook your time slot here: ${meetingUrl}\n\nTalk soon,\nJayden`;
      } else if (t === "prop_follow") {
        subject = `Proposal follow-up: ${name} rebuild`;
        body = `Hi ${owner},\n\nJust following up on the proposal and demo preview we sent over for ${name}.\n\nLet me know if the scope and pricing tiers align with your expectations so we can get you on the schedule.\n\nBest,\nJayden`;
      } else if (t === "decline_vendor") {
        subject = `Scoping request: ${name}`;
        body = `Hi ${owner},\n\nAppreciate you reaching out. We scope and run diagnostics before pricing work, so we aren't the right fit for the cheapest-bid search.\n\nWe wish you the best of luck in finding the right vendor!\n\nBest,\nJayden`;
      } else if (t === "referral") {
        subject = `Website scoping: ${name}`;
        body = `Hi ${owner},\n\nThanks for reaching out. At that budget level ($400), we'd do you a disservice.\n\nI recommend checking out a template designer on Wix or a local designer at [Referral Link]. They should be able to get a simple landing page set up.\n\nBest,\nJayden`;
      }

      const subjInput = document.getElementById("email-subject");
      const bodyInput = document.getElementById("email-body");
      if (subjInput && bodyInput) {
        subjInput.value = subject;
        bodyInput.value = body;
      }
    }

    // Call Logger Action
    async function logCall() {
      const outcome = document.getElementById("dial-outcome").value;
      const notes = document.getElementById("dial-notes").value;
      
      const card = findLead(selectedLeadId, selectedLeadScreen);
      if (!card) return;
      
      const fm = { ...card.frontmatter };
      const acts = [...(fm.activities || [])];
      
      acts.push({
        id: `dial-${Date.now()}`,
        channel: "call",
        direction: "out",
        outcome: outcome,
        notes: notes || `Call logged with outcome: ${outcome}`,
        created_at: new Date().toISOString()
      });

      fm.activities = acts;
      
      // Compute next actions based on call outcome
      if (outcome === "voicemail" || outcome === "no-answer") {
        fm.next_action = "Retry call in 48 hours / send SMS follow-up";
      } else if (outcome === "connected") {
        fm.next_action = "Advance to qualifier stage / book meeting";
      }

      await updateLeadOnServer(card.title, card.body, fm);
      activeTab = "summary";
      updateDrawer();
    }

    // Email Logger Action
    async function logEmail() {
      const to = document.getElementById("email-to").value;
      const subject = document.getElementById("email-subject").value;
      const body = document.getElementById("email-body").value;
      
      const card = findLead(selectedLeadId, selectedLeadScreen);
      if (!card) return;
      
      const fm = { ...card.frontmatter };
      const acts = [...(fm.activities || [])];
      
      acts.push({
        id: `email-${Date.now()}`,
        channel: "email",
        direction: "out",
        outcome: "sent",
        notes: `Subject: ${subject}\n\n${body}`,
        created_at: new Date().toISOString()
      });

      fm.activities = acts;
      fm.next_action = "Await client reply / check status";
      fm.email = to;

      await updateLeadOnServer(card.title, card.body, fm);
      activeTab = "summary";
      updateDrawer();
    }

    // Appointment Logger Action
    async function logAppointment() {
      const date = document.getElementById("appt-date").value;
      const url = document.getElementById("appt-url").value;
      
      if (!date) {
        alert("Please select a date and time");
        return;
      }

      const card = findLead(selectedLeadId, selectedLeadScreen);
      if (!card) return;
      
      const fm = { ...card.frontmatter };
      const acts = [...(fm.activities || [])];
      
      const apptTime = new Date(date).toISOString();
      acts.push({
        id: `appt-${Date.now()}`,
        channel: "system",
        direction: "out",
        outcome: "scheduled",
        notes: `Meeting scheduled at ${new Date(date).toLocaleString()}. Meet room: ${url}`,
        created_at: new Date().toISOString()
      });

      fm.activities = acts;
      fm.appointment_at = apptTime;
      fm.appointment_status = "booked";
      fm.meeting_url = url;
      fm.next_action = "Conduct meeting / qualifier questions";

      await updateLeadOnServer(card.title, card.body, fm);
      activeTab = "summary";
      updateDrawer();
    }

    // Master API call to update card
    async function updateLeadOnServer(title, body, frontmatter) {
      window.parent.postMessage({
        __icm: "update-lead",
        screen: selectedLeadScreen,
        id: selectedLeadId,
        title: title,
        body: body,
        frontmatter: frontmatter
      }, "*");
    }

    // Toggle panels
    function toggleNewLeadPanel() {
      const panel = document.getElementById("new-lead-panel");
      panel.classList.toggle("hidden");
      if (!panel.classList.contains("hidden")) {
        document.getElementById("new-lead-name").value = "";
        document.getElementById("new-lead-category").value = "";
        document.getElementById("new-lead-input").value = "";
        document.getElementById("new-lead-name").focus();
      }
    }

    // Submit new lead to the pipeline (lands in stage 1: 01-new)
    async function submitNewLead() {
      const name = document.getElementById("new-lead-name").value.trim();
      const cat = document.getElementById("new-lead-category").value.trim();
      const rawInput = document.getElementById("new-lead-input").value.trim();

      if (!name) {
        alert("Lead name is required");
        return;
      }

      // Convert name to slug id
      const id = "ld-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Initial empty frontmatter
      const fm = {
        title: name,
        type: "card",
        status: null,
        stage: 1,
        place_id: id,
        category: cat || "General",
        phone: null,
        email: null,
        website: null,
        rating: null,
        review_count: null,
        pain_signals: [],
        description: rawInput || "New lead created from board.",
        opener: "",
        deal_value: null,
        next_action: "Operator triage required",
        next_action_due: new Date().toISOString(),
        discovered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        activities: [
          {
            id: `sys-${Date.now()}`,
            channel: "system",
            direction: "in",
            outcome: "created",
            notes: `Lead added manually to workspace board. Input: ${rawInput || 'None'}`,
            created_at: new Date().toISOString()
          }
        ]
      };

      window.parent.postMessage({
        __icm: "create-card",
        screen: "01-new",
        id: id,
        title: name,
        body: `# ${name}\n\n${rawInput || 'No details provided.'}`,
        status: null,
        type: "card",
        frontmatter: fm
      }, "*");

      toggleNewLeadPanel();
    }

    // Request initial state on load
    window.parent.postMessage({ __icm: "ready" }, "*");
  </script>
</body>
</html>
