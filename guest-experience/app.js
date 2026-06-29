const STORAGE_HISTORY_KEY = 'nandos_ged_review_history_v1';
const SESSION_KEY = 'nandos_ged_active_session_v1';
const app = document.getElementById('app');

const categoryMeta = {
  Complaints: { className: 'complaint', short: 'Complaint' },
  Refunds: { className: 'refund', short: 'Refund' },
  'Delivery Issues': { className: 'delivery', short: 'Delivery' },
  'Missing Items': { className: 'delivery', short: 'Missing Item' },
  Bookings: { className: 'booking', short: 'Booking' },
  'Vouchers & App': { className: 'general', short: 'Voucher/App' },
  'General Enquiries': { className: 'general', short: 'General' },
  'Positive Feedback': { className: 'feedback', short: 'Feedback' },
};

const macroLibrary = [
  {
    id: 'apology_request_order',
    title: 'Apology + request order details',
    categories: ['Complaints', 'Refunds', 'Delivery Issues', 'Missing Items'],
    description: 'Acknowledges the issue and asks for an order number before investigation.',
    body: (name) => `Hi ${name},\n\nThank you for getting in touch. I’m sorry to hear about your recent experience.\n\nPlease reply with your order number and the restaurant or delivery location linked to the order so we can review this in more detail.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Pending',
    qualityWeight: 1
  },
  {
    id: 'refund_approved',
    title: 'Refund approved',
    categories: ['Refunds', 'Delivery Issues', 'Missing Items'],
    description: 'Confirms a refund where enough information is already available.',
    body: (name) => `Hi ${name},\n\nThank you for your email. We’ve reviewed the information provided and can confirm a refund has been arranged for the affected items.\n\nPlease allow a few working days for this to appear back in the original payment method.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Resolved',
    qualityWeight: 2
  },
  {
    id: 'investigation_underway',
    title: 'Investigation under way',
    categories: ['Complaints', 'Refunds', 'Delivery Issues'],
    description: 'Acknowledges the issue and confirms it is being reviewed.',
    body: (name) => `Hi ${name},\n\nThank you for your email. We’re reviewing the concerns you’ve raised and have passed the details on for further investigation.\n\nWe’ll update you again as soon as possible.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Pending',
    qualityWeight: 1
  },
  {
    id: 'restaurant_escalation',
    title: 'Escalation to restaurant',
    categories: ['Complaints', 'Bookings', 'General Enquiries'],
    description: 'Routes the matter to the relevant restaurant management team.',
    body: (name) => `Hi ${name},\n\nThank you for getting in touch. We’re sorry to hear about the experience you’ve described.\n\nWe’ve escalated this to the relevant restaurant management team so they can review the matter directly and follow up where appropriate.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Escalated',
    qualityWeight: 2
  },
  {
    id: 'regional_escalation',
    title: 'Escalation to regional manager',
    categories: ['Complaints'],
    description: 'For sensitive or serious complaints requiring higher-level review.',
    body: (name) => `Hi ${name},\n\nThank you for your email. We’re sorry to hear about the concerns you’ve raised.\n\nGiven the nature of this issue, we’ve escalated the case for senior review. A member of the relevant management team will assess the details and respond accordingly.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Escalated',
    qualityWeight: 2
  },
  {
    id: 'missing_item_resolution',
    title: 'Missing item acknowledgement',
    categories: ['Missing Items', 'Delivery Issues'],
    description: 'Addresses a missing item and confirms a refund or replacement review.',
    body: (name) => `Hi ${name},\n\nThank you for your email. I’m sorry to hear that part of your order was missing.\n\nWe’ve logged the issue and arranged for the missing item value to be reviewed for refund. If any further information is needed, we’ll be back in touch.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Resolved',
    qualityWeight: 2
  },
  {
    id: 'delivery_delay_apology',
    title: 'Delivery delay apology',
    categories: ['Delivery Issues', 'Refunds'],
    description: 'Acknowledges a delayed delivery and confirms review or goodwill action.',
    body: (name) => `Hi ${name},\n\nThank you for your email. We’re sorry your order arrived later than expected.\n\nWe’ve logged the delay and reviewed the details. We apologise for the inconvenience caused and will use this feedback as part of our follow-up with the delivery and restaurant teams.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Resolved',
    qualityWeight: 2
  },
  {
    id: 'booking_redirect',
    title: 'Booking / event redirect',
    categories: ['Bookings'],
    description: 'Directs booking and event queries to the correct route.',
    body: (name) => `Hi ${name},\n\nThank you for your enquiry. Booking and group reservation requests are handled directly by the restaurant team.\n\nPlease reply with your preferred restaurant, date and approximate party size and we’ll make sure this is directed to the correct team.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Pending',
    qualityWeight: 2
  },
  {
    id: 'allergy_policy',
    title: 'Allergy information response',
    categories: ['General Enquiries'],
    description: 'Provides a careful policy-led response to allergy enquiries.',
    body: (name) => `Hi ${name},\n\nThank you for your email. We take allergy enquiries seriously. Our latest allergen information is available via the menu guidance provided by our teams and online channels.\n\nIf you let us know the specific restaurant you plan to visit, we can ask the team to support you further before your visit.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Resolved',
    qualityWeight: 2
  },
  {
    id: 'voucher_app_support',
    title: 'Voucher / app troubleshooting',
    categories: ['Vouchers & App'],
    description: 'For loyalty, app and voucher redemption issues.',
    body: (name) => `Hi ${name},\n\nThank you for contacting us. We’re sorry to hear you’ve had trouble with the app or voucher process.\n\nPlease reply with a screenshot of the message you’re seeing, together with the email address linked to your account, and we’ll review this further.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Pending',
    qualityWeight: 2
  },
  {
    id: 'positive_feedback_reply',
    title: 'Positive feedback acknowledgement',
    categories: ['Positive Feedback'],
    description: 'Thanks the customer and confirms their feedback will be shared.',
    body: (name) => `Hi ${name},\n\nThank you for taking the time to get in touch. We’re pleased to hear about your recent experience.\n\nWe’ve shared your comments with the relevant team. We appreciate you taking the time to let us know.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Resolved',
    qualityWeight: 2
  },
  {
    id: 'general_info_reply',
    title: 'General information reply',
    categories: ['General Enquiries'],
    description: 'For menu, opening hours or broad information requests.',
    body: (name) => `Hi ${name},\n\nThank you for getting in touch.\n\nWe can help with that request. Please reply with the restaurant location or service area you’re referring to so we can provide the most accurate information.\n\nKind regards,\nGuest Experience Team`,
    nextStatus: 'Pending',
    qualityWeight: 1
  }
];

const names = ['James Walker', 'Sarah Ahmed', 'Priya Shah', 'Liam Carter', 'Ava Jackson', 'Noah Evans', 'Freya Khan', 'Daniel Green', 'Ruby Smith', 'Ella Cooper', 'Benjamin Hall', 'Olivia Moore', 'Amelia Hughes', 'Jack Turner', 'Mia Patel', 'Charlie Robinson', 'Grace Wood', 'Arthur Phillips', 'Sophia Brooks', 'Mason Reed'];
const restaurants = ['Leeds Trinity', 'Manchester Printworks', 'Birmingham Bullring', 'Liverpool ONE', 'Sheffield Meadowhall', 'York Vangarde'];
const issues = {
  coldFood: [
    { subject: 'Order arrived cold', body: 'Hi, my order arrived this evening and the food was cold by the time it reached me. I’d like this looked into please.' },
    { subject: 'Disappointed with cold delivery', body: 'Hello, the food I received was cold and not up to standard. Please can somebody review this order.' },
    { subject: 'Food not hot on arrival', body: 'My delivery turned up late and the meal was cold when I opened it. I’m not happy with the quality.' }
  ],
  missingItem: [
    { subject: 'Missing item from order', body: 'Hi, one of the sides I paid for was missing from my order. Please can you advise what happens next.' },
    { subject: 'Part of my order was not included', body: 'Hello, I received my delivery but there was an item missing from the bag. I have been charged for it.' },
    { subject: 'Order incomplete', body: 'Just got my food and one item is missing. Please look into this as soon as possible.' }
  ],
  lateDelivery: [
    { subject: 'Delivery took far too long', body: 'Hi, my order took much longer than expected and arrived very late. This wasn’t acceptable for a weekday lunch order.' },
    { subject: 'Late order today', body: 'Hello, I waited much longer than the app suggested and the delivery was badly delayed.' },
    { subject: 'Order delay complaint', body: 'Please can someone review a delayed order from today. It took far too long to arrive.' }
  ],
  rudeStaff: [
    { subject: 'Complaint about staff conduct', body: 'Hi, I need to raise a concern about the way I was spoken to in restaurant today. The tone from a team member was not acceptable.' },
    { subject: 'Poor interaction with staff member', body: 'I visited earlier and was disappointed by the attitude of a member of staff. I’d like this escalated.' },
    { subject: 'Service complaint', body: 'The service I received in restaurant today was poor and the staff member I dealt with was dismissive.' }
  ],
  duplicateCharge: [
    { subject: 'Charged twice for one order', body: 'Hi, I think I have been charged twice for the same order. Please could this be reviewed urgently.' },
    { subject: 'Possible duplicate payment', body: 'Hello, my bank shows two payments for one order. I need someone to confirm what has happened.' },
    { subject: 'Double charge issue', body: 'I can see two pending charges for the same purchase. Please investigate this.' }
  ],
  booking: [
    { subject: 'Large booking enquiry', body: 'Hi, I’m looking to arrange a booking for a larger group next week and wanted to know the process.' },
    { subject: 'Table request for group visit', body: 'Please can you advise whether a restaurant can take a booking for a group dinner next Friday.' },
    { subject: 'Reservation question', body: 'I’m trying to organise a meal for a group and need to know how best to arrange this.' }
  ],
  allergy: [
    { subject: 'Allergy information request', body: 'Hi, I’m planning to visit soon and need information about allergy procedures before I order.' },
    { subject: 'Question about allergens', body: 'Please can you tell me how allergen information is provided in restaurant.' },
    { subject: 'Need allergy advice before visit', body: 'I have a food allergy and wanted to check how this is handled before coming in.' }
  ],
  voucher: [
    { subject: 'Voucher code not working', body: 'Hi, I tried to use a voucher in the app and it would not apply at checkout. Please can this be checked.' },
    { subject: 'App reward issue', body: 'My reward would not redeem in the app and I’m not sure why. Please advise.' },
    { subject: 'Problem using offer code', body: 'The code I entered in the app would not work and I missed the offer. Can someone look into this.' }
  ],
  positive: [
    { subject: 'Great experience today', body: 'Hi, I just wanted to say thank you for the excellent service I received today. The team were friendly and efficient.' },
    { subject: 'Positive feedback for restaurant team', body: 'I had a very good visit today and wanted to pass on positive feedback to the team involved.' },
    { subject: 'Excellent service', body: 'Just emailing to say the restaurant team were brilliant during my visit this evening.' }
  ],
  general: [
    { subject: 'Question about halal options', body: 'Hi, please can you advise how I can find out whether my local restaurant offers halal chicken.' },
    { subject: 'Opening hours query', body: 'Please can you confirm how I should check restaurant opening hours for a specific location.' },
    { subject: 'Menu information request', body: 'I wanted to ask where I can find the latest menu information for a restaurant near me.' }
  ]
};

const caseBlueprints = [
  { pool: 'coldFood', category: 'Complaints', priority: 'High', expectedInitial: ['apology_request_order'], followUpNeeded: true, followUpExpected: ['refund_approved', 'investigation_underway'], outcome: 'refund', type: 'quality' },
  { pool: 'lateDelivery', category: 'Delivery Issues', priority: 'High', expectedInitial: ['delivery_delay_apology', 'apology_request_order'], followUpNeeded: false, outcome: 'delay', type: 'delivery' },
  { pool: 'missingItem', category: 'Missing Items', priority: 'Normal', expectedInitial: ['missing_item_resolution', 'apology_request_order'], followUpNeeded: false, outcome: 'missing', type: 'missing' },
  { pool: 'rudeStaff', category: 'Complaints', priority: 'Urgent', expectedInitial: ['regional_escalation', 'restaurant_escalation'], followUpNeeded: false, outcome: 'escalation', type: 'conduct' },
  { pool: 'duplicateCharge', category: 'Refunds', priority: 'Urgent', expectedInitial: ['apology_request_order', 'investigation_underway'], followUpNeeded: true, followUpExpected: ['refund_approved'], outcome: 'finance', type: 'billing' },
  { pool: 'booking', category: 'Bookings', priority: 'Normal', expectedInitial: ['booking_redirect'], followUpNeeded: false, outcome: 'booking', type: 'booking' },
  { pool: 'allergy', category: 'General Enquiries', priority: 'High', expectedInitial: ['allergy_policy'], followUpNeeded: false, outcome: 'allergy', type: 'information' },
  { pool: 'voucher', category: 'Vouchers & App', priority: 'Normal', expectedInitial: ['voucher_app_support'], followUpNeeded: true, followUpExpected: ['investigation_underway'], outcome: 'app', type: 'support' },
  { pool: 'positive', category: 'Positive Feedback', priority: 'Normal', expectedInitial: ['positive_feedback_reply'], followUpNeeded: false, outcome: 'feedback', type: 'positive' },
  { pool: 'general', category: 'General Enquiries', priority: 'Normal', expectedInitial: ['general_info_reply'], followUpNeeded: false, outcome: 'general', type: 'info' },
];

function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(num, min, max) { return Math.max(min, Math.min(max, num)); }
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function uid(prefix='id') {
  return `${prefix}_${Math.random().toString(36).slice(2,10)}`;
}

function generateCase(index) {
  const blueprint = randFrom(caseBlueprints);
  const variant = randFrom(issues[blueprint.pool]);
  const customerName = randFrom(names);
  const restaurant = randFrom(restaurants);
  const orderNumber = String(Math.floor(100000 + Math.random() * 899999));
  const receivedAt = new Date(Date.now() - Math.floor(Math.random() * 3600 * 1000 * 6)).toISOString();

  return {
    id: uid('case'),
    customerName,
    customerEmail: customerName.toLowerCase().replace(/[^a-z]/g, '.') + '@email.com',
    restaurant,
    orderNumber,
    category: blueprint.category,
    priority: blueprint.priority,
    subject: variant.subject,
    preview: variant.body,
    status: 'Open',
    requiresFollowUp: blueprint.followUpNeeded,
    expectedInitial: blueprint.expectedInitial,
    expectedFollowUp: blueprint.followUpExpected || [],
    followUpSent: false,
    reopened: false,
    openedAt: null,
    firstResponseAt: null,
    closedAt: null,
    messages: [{
      id: uid('msg'),
      sender: 'customer',
      from: customerName,
      at: receivedAt,
      body: `${variant.body}\n\nRestaurant / order reference: ${restaurant}${Math.random() > 0.4 ? `\nOrder reference: ${orderNumber}` : ''}`
    }],
    evaluation: {
      qualityPoints: 0,
      tagsCorrect: false,
      macroCorrect: false,
      timingBucket: 'Pending',
      notes: []
    }
  };
}

function generateSession(username, location) {
  const volume = 18 + Math.floor(Math.random() * 9);
  const cases = Array.from({ length: volume }, (_, i) => generateCase(i + 1));
  return {
    id: uid('session'),
    username,
    location,
    startedAt: new Date().toISOString(),
    cases,
    selectedCaseId: cases[0]?.id || null,
    selectedMacroId: null,
    replyDraft: '',
    filter: 'Inbox',
    search: '',
    metrics: {
      actions: 0
    }
  };
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY) || '[]'); }
  catch { return []; }
}
function saveHistoryEntry(session) {
  const history = loadHistory();
  const slim = createReviewSnapshot(session);
  const existingIndex = history.findIndex((item) => item.id === slim.id);
  if (existingIndex >= 0) history[existingIndex] = slim;
  else history.unshift(slim);
  localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
}
function saveActiveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  saveHistoryEntry(session);
}
function loadActiveSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

function getFilteredCases(session) {
  const search = session.search.trim().toLowerCase();
  return session.cases.filter((item) => {
    const filter = session.filter;
    const inboxMatch = filter === 'Inbox' ? true
      : ['Open', 'Pending', 'Resolved', 'Escalated'].includes(filter) ? item.status === filter
      : filter === 'Reopened' ? item.reopened
      : item.category === filter;

    const textMatch = !search || [item.customerName, item.subject, item.preview, item.category, item.orderNumber].join(' ').toLowerCase().includes(search);
    return inboxMatch && textMatch;
  });
}

function getSelectedCase(session) {
  return session.cases.find((item) => item.id === session.selectedCaseId) || null;
}

function getMetrics(session) {
  const open = session.cases.filter((c) => c.status === 'Open').length;
  const pending = session.cases.filter((c) => c.status === 'Pending').length;
  const resolved = session.cases.filter((c) => c.status === 'Resolved').length;
  const escalated = session.cases.filter((c) => c.status === 'Escalated').length;
  const reopened = session.cases.filter((c) => c.reopened).length;
  const firstResponseTimes = session.cases.filter((c) => c.firstResponseAt && c.openedAt).map((c) => (new Date(c.firstResponseAt) - new Date(c.openedAt)) / 1000);
  const avgFirst = firstResponseTimes.length ? Math.round(firstResponseTimes.reduce((a,b)=>a+b,0) / firstResponseTimes.length) : 0;
  const handled = session.cases.filter((c) => c.firstResponseAt).length;
  return { open, pending, resolved, escalated, reopened, handled, avgFirst };
}

function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function availableMacros(caseItem) {
  return macroLibrary.filter((m) => m.categories.includes(caseItem.category));
}

function createReviewSnapshot(session) {
  const metrics = getMetrics(session);
  const reviewedCases = session.cases.map((c) => {
    const quality = c.evaluation.qualityPoints >= 4 ? 'Strong' : c.evaluation.qualityPoints >= 2 ? 'Review' : 'Poor';
    return {
      id: c.id,
      customerName: c.customerName,
      subject: c.subject,
      category: c.category,
      status: c.status,
      priority: c.priority,
      quality,
      responseTime: c.firstResponseAt && c.openedAt ? Math.round((new Date(c.firstResponseAt) - new Date(c.openedAt)) / 1000) : null,
      notes: c.evaluation.notes.join(' | '),
      reopened: c.reopened,
      messageCount: c.messages.length
    };
  });
  const qualityCases = reviewedCases.filter((item) => item.quality === 'Strong').length;
  return {
    id: session.id,
    username: session.username,
    location: session.location,
    startedAt: session.startedAt,
    metrics: {
      ...metrics,
      qualityRate: session.cases.length ? Math.round((qualityCases / session.cases.length) * 100) : 0
    },
    cases: reviewedCases
  };
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-shell">
      <div class="login-card">
        <div class="brand">
          <div class="brand-mark">N</div>
          <div class="brand-copy">
            <h1>Nando's Guest Experience Desk</h1>
            <p>Shared inbox workspace</p>
          </div>
        </div>
        <div class="form-row">
          <label for="username">Username</label>
          <input id="username" class="input" placeholder="Enter username" />
        </div>
        <div class="form-row">
          <label for="location">Site</label>
          <select id="location" class="select">
            <option>Leeds</option>
            <option>Manchester</option>
            <option>Birmingham</option>
            <option>Liverpool</option>
            <option>Sheffield</option>
            <option>York</option>
          </select>
        </div>
        <div class="small-note">Shift started on sign-in. A new queue is generated for each session.</div>
        <div class="button-row">
          <button id="signinBtn" class="btn btn-primary">Sign in</button>
          <button id="reviewBtn" class="btn btn-ghost">Review Console</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('signinBtn').onclick = () => {
    const username = document.getElementById('username').value.trim() || 'guest.experience';
    const location = document.getElementById('location').value;
    const session = generateSession(username, location);
    saveActiveSession(session);
    renderWorkspace(session);
  };
  document.getElementById('reviewBtn').onclick = renderReviewConsole;
}

function renderWorkspace(session) {
  const metrics = getMetrics(session);
  const selected = getSelectedCase(session);
  const filteredCases = getFilteredCases(session);
  const navItems = ['Inbox', 'Open', 'Pending', 'Resolved', 'Escalated'];
  const categoryItems = ['Complaints', 'Refunds', 'Delivery Issues', 'Missing Items', 'Bookings', 'Vouchers & App', 'General Enquiries', 'Positive Feedback'];

  app.innerHTML = `
    <div class="app-shell">
      <div class="topbar">
        <div class="brand">
          <div class="brand-mark">N</div>
          <div class="brand-copy">
            <h2>Nando's Guest Experience Desk</h2>
            <p>${session.location} · ${session.username}</p>
          </div>
        </div>
        <div class="topbar-centre">
          ${metricCard(metrics.open, 'Open')}
          ${metricCard(metrics.pending, 'Pending')}
          ${metricCard(metrics.resolved, 'Resolved')}
          ${metricCard(metrics.reopened, 'Reopened')}
        </div>
        <div class="topbar-right">
          ${metricCard(formatSeconds(metrics.avgFirst), 'Avg. first response')}
          ${metricCard(metrics.handled, 'Cases handled')}
          <button id="returnReview" class="btn btn-small">Review Console</button>
          <span class="suite-page-tools"><a href="../index.html">Return to home</a><button id="suiteTourBtn" type="button">Tour</button></span>
          <button id="signOut" class="btn btn-small">Sign out</button>
        </div>
      </div>
      <div class="workspace">
        <aside class="sidebar">
          ${navItems.map((item) => navButton(item, session.filter, countForFilter(session, item))).join('')}
          <div class="sidebar-group-title">Views</div>
          ${categoryItems.map((item) => navButton(item, session.filter, countForFilter(session, item))).join('')}
        </aside>
        <section class="list-panel">
          <div class="list-toolbar">
            <div class="toolbar-row">
              <div>
                <div class="panel-title">Queue</div>
                <div class="subtle">${filteredCases.length} visible cases</div>
              </div>
              <button id="clearSearch" class="btn btn-small">Clear</button>
            </div>
            <div class="search-row">
              <input id="searchInput" class="search-input" placeholder="Search keyword, subject, order reference" value="${escapeHtml(session.search)}" />
            </div>
          </div>
          <div class="list-toolbar">
            <div class="toolbar-row">
              <div class="subtle">Priority and status update automatically as cases are worked.</div>
            </div>
          </div>
          <div class="case-list">
            ${filteredCases.length ? filteredCases.map((item) => caseRow(item, session.selectedCaseId)).join('') : `<div class="empty-note">No cases match the current filter.</div>`}
          </div>
        </section>
        <section class="thread-panel">
          ${selected ? threadHeader(selected) : `<div class="thread-head"><div class="panel-title">Conversation</div></div>`}
          <div class="thread-body">
            ${selected ? selected.messages.map(messageCard).join('') : `<div class="empty-note">Select a case to view the conversation.</div>`}
          </div>
        </section>
        <aside class="action-panel">
          ${selected ? actionPanel(selected, session.selectedMacroId, session.replyDraft) : `<div class="empty-state"><div class="empty-note">Select a case to work the queue.</div></div>`}
        </aside>
      </div>
    </div>
  `;

  wireWorkspaceEvents(session);
}

function metricCard(value, label) {
  return `<div class="top-metric"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`;
}

function countForFilter(session, filter) {
  if (filter === 'Inbox') return session.cases.length;
  if (['Open','Pending','Resolved','Escalated'].includes(filter)) return session.cases.filter(c => c.status === filter).length;
  return session.cases.filter(c => c.category === filter).length;
}

function navButton(item, current, count) {
  return `<button class="nav-item ${item === current ? 'active' : ''}" data-nav="${escapeHtml(item)}"><span>${escapeHtml(item)}</span><span class="count-pill">${count}</span></button>`;
}

function caseRow(item, selectedCaseId) {
  const meta = categoryMeta[item.category] || categoryMeta['General Enquiries'];
  return `
    <button class="case-row ${item.id === selectedCaseId ? 'active' : ''}" data-case="${item.id}">
      <div class="row-top">
        <div>
          <div class="row-title">${escapeHtml(item.customerName)}</div>
          <div class="row-subject">${escapeHtml(item.subject)}</div>
        </div>
        <span class="priority-pill ${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</span>
      </div>
      <div class="preview">${escapeHtml(item.preview.slice(0, 105))}${item.preview.length > 105 ? '…' : ''}</div>
      <div class="row-meta" style="margin-top:10px;">
        <span class="tag ${meta.className}">${escapeHtml(meta.short)}</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <span class="status-pill ${item.status.toLowerCase()}">${escapeHtml(item.status)}</span>
          <span class="subtle">${formatTime(item.messages[item.messages.length - 1].at)}</span>
        </div>
      </div>
    </button>
  `;
}

function threadHeader(selected) {
  const meta = categoryMeta[selected.category] || categoryMeta['General Enquiries'];
  return `
    <div class="thread-head">
      <div class="row-top">
        <div>
          <div class="panel-title">${escapeHtml(selected.subject)}</div>
          <div class="subtle">${escapeHtml(selected.customerName)} · ${escapeHtml(selected.customerEmail)}</div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="tag ${meta.className}">${escapeHtml(meta.short)}</span>
          <span class="priority-pill ${selected.priority.toLowerCase()}">${escapeHtml(selected.priority)}</span>
          <span class="status-pill ${selected.status.toLowerCase()}">${escapeHtml(selected.status)}</span>
        </div>
      </div>
      <div class="thread-meta" style="margin-top:10px;">
        <div class="subtle">Restaurant: ${escapeHtml(selected.restaurant)}</div>
        <div class="subtle">Order reference: ${escapeHtml(selected.orderNumber)}</div>
      </div>
    </div>
  `;
}

function messageCard(msg) {
  const senderLabel = msg.sender === 'customer' ? msg.from : msg.sender === 'agent' ? 'Guest Experience Team' : 'System';
  const disposition = msg.statusLabel ? `<div class="message-foot"><span class="status-pill ${msg.statusClass || 'open'}">${escapeHtml(msg.statusLabel)}</span></div>` : '';
  return `
    <div class="message-card ${msg.sender}">
      <div class="message-head">
        <div class="row-top">
          <strong>${escapeHtml(senderLabel)}</strong>
          <span class="subtle">${formatDateTime(msg.at)}</span>
        </div>
      </div>
      <div class="message-body">${escapeHtml(msg.body)}</div>
      ${disposition}
    </div>
  `;
}

function actionPanel(selected, selectedMacroId, draft) {
  const macros = availableMacros(selected);
  return `
    <div class="action-head">
      <div class="panel-title">Case actions</div>
      <div class="subtle">Use a prepared response and update the status.</div>
    </div>
    <div class="action-scroll">
      <div class="section">
        <h3>Case details</h3>
        <div class="subtle">Category</div>
        <div style="margin:4px 0 10px; font-weight:700;">${escapeHtml(selected.category)}</div>
        <div class="subtle">Priority</div>
        <div style="margin:4px 0 10px; font-weight:700;">${escapeHtml(selected.priority)}</div>
        <div class="subtle">Status</div>
        <div style="margin:4px 0 0; font-weight:700;">${escapeHtml(selected.status)}</div>
      </div>
      <div class="section">
        <h3>Prepared replies</h3>
        <div class="macro-list">
          ${macros.map((macro) => `
            <button class="macro-card ${macro.id === selectedMacroId ? 'active' : ''}" data-macro="${macro.id}">
              <div class="macro-title">${escapeHtml(macro.title)}</div>
              <div class="macro-desc">${escapeHtml(macro.description)}</div>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="section">
        <h3>Reply</h3>
        <textarea id="replyBox" class="reply-box" placeholder="Select a prepared reply or draft a response.">${escapeHtml(draft || '')}</textarea>
      </div>
      <div class="section" style="border-bottom:none;">
        <div class="small-note">For sensitive complaints, escalation will usually be the expected route.</div>
      </div>
    </div>
    <div class="action-footer">
      <button id="pendingBtn" class="btn">Set Pending</button>
      <button id="resolveBtn" class="btn">Mark Resolved</button>
      <button id="escalateBtn" class="btn btn-danger">Escalate</button>
      <button id="sendBtn" class="btn btn-send-email">Send Email</button>
    </div>
  `;
}

function wireWorkspaceEvents(session) {
  document.getElementById('signOut').onclick = () => {
    sessionStorage.removeItem(SESSION_KEY);
    renderLogin();
  };
  document.getElementById('returnReview').onclick = renderReviewConsole;
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.onclick = () => {
      session.filter = btn.dataset.nav;
      const filtered = getFilteredCases(session);
      if (!filtered.find((item) => item.id === session.selectedCaseId)) {
        session.selectedCaseId = filtered[0]?.id || null;
      }
      saveActiveSession(session);
      renderWorkspace(session);
    };
  });
  document.querySelectorAll('[data-case]').forEach((btn) => {
    btn.onclick = () => {
      session.selectedCaseId = btn.dataset.case;
      session.selectedMacroId = null;
      session.replyDraft = '';
      const selected = getSelectedCase(session);
      if (selected && !selected.openedAt) selected.openedAt = new Date().toISOString();
      saveActiveSession(session);
      renderWorkspace(session);
    };
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const value = e.target.value;
      const cursor = e.target.selectionStart ?? value.length;
      session.search = value;
      saveActiveSession(session);
      renderWorkspace(session);
      const newInput = document.getElementById('searchInput');
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(cursor, cursor);
      }
    };
  }
  const clearSearch = document.getElementById('clearSearch');
  if (clearSearch) {
    clearSearch.onclick = () => {
      session.search = '';
      saveActiveSession(session);
      renderWorkspace(session);
    };
  }

  const selected = getSelectedCase(session);
  if (!selected) return;

  document.querySelectorAll('[data-macro]').forEach((btn) => {
    btn.onclick = () => {
      const macro = macroLibrary.find((item) => item.id === btn.dataset.macro);
      session.selectedMacroId = macro.id;
      session.replyDraft = macro.body(selected.customerName);
      saveActiveSession(session);
      renderWorkspace(session);
    };
  });

  const replyBox = document.getElementById('replyBox');
  if (replyBox) {
    replyBox.oninput = (e) => {
      session.replyDraft = e.target.value;
      saveActiveSession(session);
    };
  }

  document.getElementById('pendingBtn').onclick = () => {
    selected.status = 'Pending';
    addSystemMessage(selected, 'Status updated to Pending.');
    saveActiveSession(session);
    renderWorkspace(session);
  };
  document.getElementById('resolveBtn').onclick = () => {
    selected.status = 'Resolved';
    selected.closedAt = new Date().toISOString();
    addSystemMessage(selected, 'Case marked as Resolved.');
    scoreCase(selected, session.selectedMacroId, 'Resolved');
    saveActiveSession(session);
    renderWorkspace(session);
  };
  document.getElementById('escalateBtn').onclick = () => {
    selected.status = 'Escalated';
    selected.closedAt = new Date().toISOString();
    addSystemMessage(selected, 'Case escalated for further review.');
    scoreCase(selected, session.selectedMacroId || 'regional_escalation', 'Escalated');
    saveActiveSession(session);
    renderWorkspace(session);
  };
  document.getElementById('sendBtn').onclick = () => {
    const text = (session.replyDraft || '').trim();
    if (!text) return;
    sendReply(session, selected, text);
    saveActiveSession(session);
    renderWorkspace(session);
  };
}

function addSystemMessage(caseItem, text) {
  caseItem.messages.push({ id: uid('msg'), sender: 'system', from: 'System', at: new Date().toISOString(), body: text });
}

function scoreCase(caseItem, macroId, finalStatus) {
  if (!caseItem.firstResponseAt || !caseItem.openedAt) return;
  const responseSecs = Math.round((new Date(caseItem.firstResponseAt) - new Date(caseItem.openedAt)) / 1000);
  if (responseSecs <= 60) {
    caseItem.evaluation.qualityPoints += 2;
    caseItem.evaluation.timingBucket = 'Within target';
  } else if (responseSecs <= 180) {
    caseItem.evaluation.qualityPoints += 1;
    caseItem.evaluation.timingBucket = 'Acceptable';
  } else {
    caseItem.evaluation.notes.push('First response outside target window');
    caseItem.evaluation.timingBucket = 'Outside target';
  }

  if (macroId && caseItem.expectedInitial.includes(macroId)) {
    caseItem.evaluation.qualityPoints += 2;
    caseItem.evaluation.macroCorrect = true;
  } else if (macroId && caseItem.expectedFollowUp.includes(macroId)) {
    caseItem.evaluation.qualityPoints += 2;
  } else {
    caseItem.evaluation.notes.push('Reply route needs review');
  }

  if (caseItem.priority === 'Urgent' && finalStatus === 'Escalated') {
    caseItem.evaluation.qualityPoints += 1;
  }
  if (caseItem.priority === 'Urgent' && finalStatus !== 'Escalated' && caseItem.category === 'Complaints') {
    caseItem.evaluation.notes.push('Escalation expected');
  }
}

function sendReply(session, caseItem, replyText) {
  const now = new Date().toISOString();
  if (!caseItem.openedAt) caseItem.openedAt = now;
  if (!caseItem.firstResponseAt) caseItem.firstResponseAt = now;

  const sentMessage = { id: uid('msg'), sender: 'agent', from: 'Guest Experience Team', at: now, body: replyText };
  caseItem.messages.push(sentMessage);
  session.metrics.actions += 1;
  const macroId = session.selectedMacroId;
  const macro = macroLibrary.find((m) => m.id === macroId);
  if (macro) caseItem.status = macro.nextStatus;

  if (!caseItem.followUpSent && caseItem.requiresFollowUp && caseItem.expectedInitial.includes(macroId)) {
    caseItem.followUpSent = true;
    caseItem.status = 'Pending';
    const followUpText = generateFollowUp(caseItem);
    caseItem.messages.push({ id: uid('msg'), sender: 'customer', from: caseItem.customerName, at: new Date(Date.now() + 30000).toISOString(), body: followUpText });
    caseItem.reopened = true;
    caseItem.status = 'Open';
    caseItem.evaluation.notes.push('Customer replied with follow-up information');
  } else if (!caseItem.expectedInitial.includes(macroId) && caseItem.status !== 'Escalated') {
    caseItem.reopened = true;
    caseItem.status = 'Open';
    caseItem.messages.push({ id: uid('msg'), sender: 'customer', from: caseItem.customerName, at: new Date(Date.now() + 45000).toISOString(), body: 'Thanks. This does not fully address my original query. Please can this be reviewed again.' });
    caseItem.evaluation.notes.push('Case reopened following reply');
  }

  if (!caseItem.followUpSent && ['refund_approved','missing_item_resolution','delivery_delay_apology','positive_feedback_reply','allergy_policy'].includes(macroId)) {
    caseItem.status = 'Resolved';
    caseItem.closedAt = now;
    addSystemMessage(caseItem, 'Case marked as Resolved following reply.');
  }

  if (macroId === 'regional_escalation' || macroId === 'restaurant_escalation') {
    caseItem.status = 'Escalated';
    caseItem.closedAt = now;
    addSystemMessage(caseItem, 'Case escalated for further review.');
  }

  if (caseItem.followUpSent && caseItem.expectedFollowUp.includes(macroId)) {
    caseItem.status = 'Resolved';
    caseItem.closedAt = now;
    addSystemMessage(caseItem, 'Follow-up completed and case resolved.');
  }

  sentMessage.statusLabel = caseItem.status === 'Resolved'
    ? 'Marked Resolved'
    : caseItem.status === 'Escalated'
      ? 'Escalated'
      : caseItem.status === 'Pending'
        ? 'Set Pending'
        : caseItem.status === 'Open' && caseItem.reopened
          ? 'Reopened'
          : caseItem.status;
  sentMessage.statusClass = String(caseItem.status || 'open').toLowerCase();

  scoreCase(caseItem, macroId, caseItem.status);
  session.selectedMacroId = null;
  session.replyDraft = '';
}

function generateFollowUp(caseItem) {
  const options = [
    `Thanks. The order number is ${caseItem.orderNumber} and it was from ${caseItem.restaurant}.`,
    `Thanks for coming back to me. The order reference is ${caseItem.orderNumber} and the restaurant was ${caseItem.restaurant}.`,
    `Please see the details requested: order ${caseItem.orderNumber}, ${caseItem.restaurant}.`
  ];
  return randFrom(options);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderReviewConsole() {
  const history = loadHistory();
  app.innerHTML = `
    <div class="review-shell">
      <div class="review-card">
        <div class="toolbar-row">
          <div>
            <div class="brand" style="margin-bottom:0;">
              <div class="brand-mark">N</div>
              <div class="brand-copy">
                <h2>Review Console</h2>
                <p>Session performance and case quality review</p>
              </div>
            </div>
          </div>
          <div style="display:flex; gap:10px;">
            <button id="backToApp" class="btn">Return to sign-in</button>
            <button id="clearHistory" class="btn btn-danger">Clear review history</button>
          </div>
        </div>
        ${history.length ? history.map(reviewBlock).join('') : `<div class="empty-note" style="margin-top:18px;">No session history available yet. Start a session to generate review data.</div>`}
      </div>
    </div>
  `;
  document.getElementById('backToApp').onclick = renderLogin;
  document.getElementById('clearHistory').onclick = () => {
    localStorage.removeItem(STORAGE_HISTORY_KEY);
    renderReviewConsole();
  };
}

function reviewBlock(entry) {
  return `
    <div style="margin-top:22px; border-top:1px solid var(--line); padding-top:22px;">
      <div class="toolbar-row">
        <div>
          <div class="panel-title">${escapeHtml(entry.username)} · ${escapeHtml(entry.location)}</div>
          <div class="subtle">Started ${formatDateTime(entry.startedAt)}</div>
        </div>
      </div>
      <div class="summary-grid">
        ${summaryCard(entry.metrics.open, 'Open')}
        ${summaryCard(entry.metrics.pending, 'Pending')}
        ${summaryCard(entry.metrics.resolved, 'Resolved')}
        ${summaryCard(entry.metrics.reopened, 'Reopened')}
        ${summaryCard(formatSeconds(entry.metrics.avgFirst), 'Avg. first response')}
        ${summaryCard(`${entry.metrics.qualityRate}%`, 'Quality')}
      </div>
      <table class="review-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Subject</th>
            <th>Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Response</th>
            <th>Quality</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${entry.cases.map((c) => `
            <tr>
              <td>${escapeHtml(c.customerName)}</td>
              <td>${escapeHtml(c.subject)}</td>
              <td>${escapeHtml(c.category)}</td>
              <td>${escapeHtml(c.status)}${c.reopened ? ' · Reopened' : ''}</td>
              <td>${escapeHtml(c.priority)}</td>
              <td>${c.responseTime === null ? '—' : formatSeconds(c.responseTime)}</td>
              <td class="${c.quality === 'Strong' ? 'quality-good' : c.quality === 'Review' ? 'quality-review' : 'quality-poor'}">${escapeHtml(c.quality)}</td>
              <td>${escapeHtml(c.notes || '—')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function summaryCard(value, label) {
  return `<div class="summary-card"><strong>${escapeHtml(String(value))}</strong><span class="subtle">${escapeHtml(label)}</span></div>`;
}

(function boot() {
  const active = loadActiveSession();
  if (active) renderWorkspace(active);
  else renderLogin();
})();
