const app = document.getElementById('app');
const ACTIVE_KEY = 'nandos_email_triage_active_v1';
const HISTORY_KEY = 'nandos_email_triage_history_v1';

const categories = [
  'Complaints',
  'Refunds',
  'Delivery Issues',
  'Missing Items',
  'Bookings',
  'Vouchers & App',
  'General Enquiries',
  'Positive Feedback'
];

const categoryMeta = {
  Complaints: { className: 'complaint', clue: 'Unhappy about service, food, cleanliness or staff conduct.' },
  Refunds: { className: 'refund', clue: 'Customer is asking for money back or reporting a payment problem.' },
  'Delivery Issues': { className: 'delivery', clue: 'Late delivery, driver problem, tracking problem or delivery quality issue.' },
  'Missing Items': { className: 'missing', clue: 'Food, drink or side was missing from the bag/order.' },
  Bookings: { className: 'booking', clue: 'Table, group visit, birthday, party or event request.' },
  'Vouchers & App': { className: 'app', clue: 'Reward, voucher, login, app, points or offer code problem.' },
  'General Enquiries': { className: 'general', clue: 'Opening hours, menu, allergy, halal, job, location or general question.' },
  'Positive Feedback': { className: 'feedback', clue: 'Praise, thanks or positive comments about a visit.' }
};

const firstNames = ['James','Sarah','Priya','Liam','Ava','Noah','Freya','Daniel','Ruby','Ella','Benjamin','Olivia','Amelia','Jack','Mia','Charlie','Grace','Arthur','Sophia','Mason','Zara','Adam','Yasmin','George','Sienna','Kai','Imogen','Hannah','Mohammed','Leo','Isla','Ethan','Layla','Oscar','Niamh','Theo','Aisha','Holly','Reuben','Millie','Finley','Evie','Lucas','Maya','Ibrahim','Poppy','Archie','Erin','Harvey','Sofia'];
const lastNames = ['Walker','Ahmed','Shah','Carter','Jackson','Evans','Khan','Green','Smith','Cooper','Hall','Moore','Hughes','Turner','Patel','Robinson','Wood','Phillips','Brooks','Reed','Ali','Brown','Wilson','Davies','Thompson','Clarke','Morris','Singh','Baker','Kelly','Wright','Young','Powell','Begum','Ward','Price','Murphy','Bell','Cook','Morgan','Bailey','Parker','Foster','Stevens','Gibson','White','Harris','Collins','Gray','Mason'];
const restaurants = ['Leeds Trinity','Leeds Cardigan Fields','Manchester Printworks','Manchester Oxford Road','Birmingham Bullring','Birmingham Star City','Liverpool ONE','Sheffield Meadowhall','York Vangarde','Bradford Broadway','Wakefield Westgate','Nottingham Cornerhouse','Hull St Stephen\'s','Derby Intu','Newcastle Eldon Square','Coventry City Centre','Leicester Highcross','Huddersfield Kingsgate','Doncaster Lakeside','Warrington Riverside'];
const products = ['PERi-Salted Chips','Garlic Bread','Spicy Rice','Coleslaw','Halloumi Sticks','Rainbow Slaw','Chicken Butterfly','Half Chicken','Sunset Burger','Beanie Burger','Fino Pitta','Wing Roulette','Corn on the Cob','Macho Peas','Chocolate Brownie','Bottomless Drink','PERinaise Dip','Sweet Potato Wedges'];
const channels = ['Deliveroo','Uber Eats','Click & Collect','Nando\'s app','restaurant till','website','phone enquiry'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid(prefix = 'id') { return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`; }
function pad(n) { return String(n).padStart(2, '0'); }
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function captureScrollState() {
  return {
    sidebar: document.querySelector('.sidebar')?.scrollTop || 0,
    list: document.querySelector('.case-list')?.scrollTop || 0,
    email: document.querySelector('.email-body-wrap')?.scrollTop || 0,
    action: document.querySelector('.action-scroll')?.scrollTop || 0
  };
}
function restoreScrollState(state) {
  if (!state) return;
  requestAnimationFrame(() => {
    const pairs = [
      ['.sidebar', state.sidebar],
      ['.case-list', state.list],
      ['.email-body-wrap', state.email],
      ['.action-scroll', state.action]
    ];
    pairs.forEach(([selector, value]) => {
      const el = document.querySelector(selector);
      if (el) el.scrollTop = value || 0;
    });
  });
}
function rerenderWorkspacePreservingScroll(session) {
  const scrollState = captureScrollState();
  renderWorkspace(session, scrollState);
}

const scenarioBank = [
  ...makeScenarioSet('Complaints', 'High', [
    ['Complaint about cold food in restaurant', 'I ate in the restaurant today and my food was cold when it was served. I am unhappy with the visit and want this logged as a complaint.'],
    ['Poor service in restaurant', 'I visited today and the team member at the till was dismissive and unhelpful. I would like this logged as a complaint.'],
    ['Restaurant was not clean', 'The tables were messy and there were trays left near the bin area. I want to complain because the restaurant did not feel clean.'],
    ['Long wait and no apology', 'We waited over 40 minutes for food while eating in. Nobody explained the delay or apologised. I want to complain about the service.'],
    ['Wrong meal served in restaurant', 'I was given the wrong meal while eating in the restaurant and then felt rushed when I asked for it to be changed. Please log this as a complaint.'],
    ['Staff conduct concern', 'I want to raise a complaint about how a staff member spoke to my son during our visit today.'],
    ['Noise and poor restaurant experience', 'The restaurant was chaotic, orders were being shouted across the room and our meal was not enjoyable. I want to complain.'],
    ['Manager complaint', 'I asked to speak to the manager about our wait time, but I felt my concern was brushed off. Please log this as a complaint.'],
    ['Cold food at table', 'Our food was brought to the table cold and the team did not replace it when we asked. I am disappointed with the restaurant visit.'],
    ['Queue complaint', 'The queue was badly managed and people who arrived after us were served first. I want to raise a complaint about this visit.']
  ]),
  ...makeScenarioSet('Complaints', 'Urgent', [
    ['Food safety complaint', 'I am concerned because my chicken did not look properly cooked when I ate in the restaurant. Please investigate this urgently as a food safety complaint.'],
    ['Serious staff conduct complaint', 'I need to make a serious complaint about a staff member shouting at a customer in the restaurant today. This needs to be escalated.'],
    ['Safety concern in restaurant', 'There was a wet floor near the entrance with no warning sign and someone nearly slipped. I want this safety concern reviewed urgently.']
  ]),
  ...makeScenarioSet('Refunds', 'Urgent', [
    ['Charged twice for one order', 'My bank account shows two payments for the same order. Please arrange a refund for the duplicate payment.'],
    ['Refund request for cancelled order', 'I cancelled my order in the app but the payment has still left my account. I need this refunded.'],
    ['Money taken but no order confirmed', 'The payment went through but I never received an order confirmation or any food. Please refund the payment.'],
    ['Overcharged at till', 'I checked my receipt and I was charged for an extra side that I did not buy. Can this be refunded please?'],
    ['Refund not received yet', 'I was told a refund had been processed last week but nothing has appeared in my account yet. Please check the refund.'],
    ['Paid twice after app froze', 'The app froze and I ended up paying twice. Only one order arrived, so I need one payment refunded.'],
    ['Wrong amount charged', 'The receipt total is higher than the price shown on the menu board. Please refund the difference.'],
    ['Duplicate card payment', 'My card statement shows a duplicate card payment for one restaurant order. I need the extra payment refunded.'],
    ['Cancelled collection refund', 'The restaurant cancelled my collection order because the kitchen had closed, but my payment has not been returned.']
  ]),
  ...makeScenarioSet('Delivery Issues', 'High', [
    ['Delivery arrived very late', 'The tracker said 25 minutes but my delivery took well over an hour to arrive. Please review the delivery delay.'],
    ['Driver could not find address', 'The driver rang several times and said they could not find my address. The issue is about the delivery arriving very late.'],
    ['Delivery bag damaged', 'The delivery bag was split and sauce had leaked over the outside of the bag. Please review the delivery handling.'],
    ['Order delivered to wrong house', 'The app says delivered but it was not delivered to my house. This is a delivery issue.'],
    ['Tracking did not update', 'The order tracking stayed on preparing for ages and then the delivery arrived late. Please check the delivery tracking.'],
    ['Food spilled during delivery', 'The drinks spilled during delivery and soaked the food bag. Please review the delivery problem.'],
    ['Driver left food outside', 'The driver left the food outside the building without calling me. I only found it later. Please log this as a delivery issue.'],
    ['Delivery address problem', 'The delivery went to the wrong flat number even though the correct address was on the order.'],
    ['Delivery marked complete too early', 'The app marked my delivery as complete before any food arrived. The food came much later.']
  ]),
  ...makeScenarioSet('Missing Items', 'High', [
    ['Missing chips from order', 'My order arrived but the chips were not in the bag. I paid for them and want the missing item logged.'],
    ['Drink missing', 'The bottomless drink I paid for was missing from my collection order. Please log the missing drink.'],
    ['Side missing from takeaway', 'The spicy rice was missing from the takeaway bag. Please can this missing item be sorted.'],
    ['Missing dessert', 'We ordered a brownie but it was not included in the bag. The issue is the missing dessert.'],
    ['Missing dip', 'The PERinaise dip was missing even though it is on the receipt. Please log the missing dip.'],
    ['Missing vegetarian item', 'The vegetarian burger was missing from the bag and this left one person without a meal. Please log the missing item.'],
    ['Missing sauce bottle', 'I ordered a sauce bottle with my takeaway, but it was not included in the bag.'],
    ['Missing children’s meal', 'One children’s meal was missing from our family order. Please record the missing item.'],
    ['Missing garlic bread', 'The garlic bread is shown on my receipt but it was not in the takeaway bag.']
  ]),
  ...makeScenarioSet('Bookings', 'Normal', [
    ['Large group booking', 'Can I book a table for 14 people next Friday evening?'],
    ['Birthday meal enquiry', 'I am arranging a birthday meal and need to know if we can reserve a table.'],
    ['School group visit', 'We would like to bring a small group of students for lunch. Who should we speak to about a booking?'],
    ['Booking change request', 'I need to change the time of a booking I made for this weekend.'],
    ['Accessibility seating request', 'Can we reserve a table with wheelchair access near the entrance?'],
    ['Team meal booking', 'I am organising a work meal and need to check whether a large table is possible.'],
    ['Party enquiry', 'Do you allow balloons or decorations for a small birthday meal booking?'],
    ['Christmas meal booking', 'Can I make a booking for a staff Christmas meal in December?'],
    ['Cancel table booking', 'I need to cancel a table booking for Saturday evening.']
  ]),
  ...makeScenarioSet('Vouchers & App', 'Normal', [
    ['Voucher code not working', 'I tried to use a voucher code in the app but it would not apply at checkout.'],
    ['Reward missing from account', 'My reward has disappeared from my account even though I had not used it.'],
    ['App login problem', 'I cannot log into the app. It keeps saying my email is not recognised.'],
    ['Points not added', 'I scanned my card but the points from my visit have not been added.'],
    ['Offer ended too early', 'The app showed an offer this morning but it was gone when I tried to order.'],
    ['QR code issue', 'The QR code would not scan in restaurant and the team could not add my reward.'],
    ['App reward will not redeem', 'My app reward is showing in my account, but it will not redeem when I try to order.'],
    ['Password reset problem', 'I requested a password reset for the app, but the reset email has not arrived.'],
    ['Birthday reward question', 'My birthday reward has not appeared in the app. Can someone check my account?']
  ]),
  ...makeScenarioSet('General Enquiries', 'Normal', [
    ['Opening hours question', 'Please can you tell me how to check opening hours for my local restaurant?'],
    ['Halal options enquiry', 'How can I find out which restaurants offer halal chicken?'],
    ['Menu information request', 'Where can I find the latest menu and prices?'],
    ['Job enquiry', 'I am interested in working at a restaurant. Where do I apply?'],
    ['Lost property question', 'I think I left my coat in the restaurant yesterday. Who do I contact?'],
    ['Gift card question', 'Can gift cards be used for click and collect orders?'],
    ['Nutrition information', 'Where can I find nutritional information for your meals?'],
    ['Restaurant address question', 'Please can you tell me where to find the address for a specific restaurant?'],
    ['Parking question', 'Does the restaurant have customer parking, or where can I check this?']
  ]),
  ...makeScenarioSet('General Enquiries', 'High', [
    ['Allergy information request', 'I have a food allergy and need information about your allergen process before I visit. This is an allergy information enquiry, not a complaint or refund request.'],
    ['Allergen menu request', 'Please can you tell me where to find allergen information before I order? I need advice before visiting the restaurant.'],
    ['Check allergy process before visit', 'Before I visit, I need to understand how staff handle allergy information. Please send the correct guidance.']
  ]),
  ...makeScenarioSet('Positive Feedback', 'Normal', [
    ['Great service today', 'I wanted to say thank you. The team were friendly, quick and really helpful today.'],
    ['Positive feedback for team member', 'A member of staff went out of their way to help us and made the visit brilliant.'],
    ['Excellent restaurant visit', 'The food was lovely and the restaurant team were calm, professional and welcoming.'],
    ['Thank you to the manager', 'The manager helped sort a small problem quickly and kindly. Please pass on my thanks.'],
    ['Lovely meal', 'We had a lovely meal and the staff made my daughter feel very welcome.'],
    ['Brilliant allergy support', 'The team were careful and reassuring with my allergy information request. I really appreciated it.'],
    ['Quick and friendly service', 'Everything was clean, quick and friendly. A great visit.'],
    ['Kind staff member', 'One of your staff members was very patient with my elderly parent today. Please pass on my thanks.'],
    ['Thank you for helping us', 'The team helped us find a suitable table and made the whole visit easy. Thank you.']
  ])
];

function makeScenarioSet(category, priority, entries) {
  return entries.map(([subject, body]) => ({ category, priority, subject, body }));
}

function buildEmail(base, index) {
  const first = pick(firstNames);
  const last = pick(lastNames);
  const name = `${first} ${last}`;
  const restaurant = pick(restaurants);
  const product = pick(products);
  const channel = pick(channels);
  const order = `ND-${Math.floor(100000 + Math.random() * 899999)}`;
  const caseRef = `GED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 8999)}`;
  const minutesAgo = 4 + Math.floor(Math.random() * 350);
  const receivedAt = new Date(Date.now() - minutesAgo * 60000).toISOString();
  const emailUser = `${first}.${last}${Math.floor(10 + Math.random() * 89)}`.toLowerCase();
  const subjectPrefix = Math.random() > 0.72 ? ['Re:', 'Fwd:', 'Help needed:', 'Question:'][Math.floor(Math.random()*4)] + ' ' : '';
  const extraDetails = [
    `Restaurant: ${restaurant}`,
    `Order reference: ${order}`,
    `Contact channel: customer email`,
    `Case reference: ${caseRef}`
  ];
  const signoffs = ['Thanks', 'Kind regards', 'Please advise', 'Regards', 'Thank you'];
  const greetings = ['Hi team', 'Hello', 'Good afternoon', 'Hi customer care', 'To Guest Experience'];
  const body = `${pick(greetings)},\n\n${base.body}\n\n${extraDetails.sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random()*2)).join('\n')}\n\n${pick(signoffs)},\n${name}`;

  return {
    id: uid('mail'),
    inboxNumber: index,
    customerName: name,
    from: `${name} <${emailUser}@examplemail.co.uk>`,
    subject: subjectPrefix + base.subject,
    body,
    receivedAt,
    expectedCategory: base.category,
    expectedPriority: base.priority,
    selectedCategory: '',
    selectedPriority: '',
    submittedCategory: '',
    submittedPriority: '',
    status: 'Unsorted',
    attempts: 0,
    result: null,
    restaurant,
    order,
    channel
  };
}

function generateSession(username, site) {
  const volume = 28 + Math.floor(Math.random() * 13);
  const shuffled = [...scenarioBank].sort(() => Math.random() - 0.5);
  const emails = [];
  for (let i = 0; i < volume; i += 1) {
    emails.push(buildEmail(shuffled[i % shuffled.length], i + 1));
  }
  emails.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
  return {
    id: uid('shift'),
    username,
    site,
    startedAt: new Date().toISOString(),
    emails,
    selectedEmailId: emails[0]?.id || null,
    filter: 'Inbox',
    showHints: false,
    reviewMode: false
  };
}

function loadActive() {
  try { return JSON.parse(sessionStorage.getItem(ACTIVE_KEY) || 'null'); } catch { return null; }
}
function saveActive(session) {
  sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
  saveHistory(session);
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(session) {
  const history = loadHistory();
  const snap = makeSnapshot(session);
  const index = history.findIndex(item => item.id === snap.id);
  if (index >= 0) history[index] = snap;
  else history.unshift(snap);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 40)));
}
function makeSnapshot(session) {
  const m = metrics(session);
  return {
    id: session.id,
    username: session.username,
    site: session.site,
    startedAt: session.startedAt,
    metrics: m,
    emails: session.emails.map(e => ({
      subject: e.subject,
      from: e.customerName,
      expectedCategory: e.expectedCategory,
      selectedCategory: e.submittedCategory || e.selectedCategory || 'Not sorted',
      expectedPriority: e.expectedPriority,
      selectedPriority: e.submittedPriority || e.selectedPriority || 'Not set',
      status: e.status,
      attempts: e.attempts,
      result: e.result
    }))
  };
}

function metrics(session) {
  const total = session.emails.length;
  const sorted = session.emails.filter(e => e.status !== 'Unsorted').length;
  const correct = session.emails.filter(e => e.result === 'Correct').length;
  const categoryCorrect = session.emails.filter(e => (e.submittedCategory || e.selectedCategory) === e.expectedCategory).length;
  const priorityCorrect = session.emails.filter(e => (e.submittedPriority || e.selectedPriority) === e.expectedPriority).length;
  const needsReview = session.emails.filter(e => e.result === 'Review').length;
  const accuracy = sorted ? Math.round((correct / sorted) * 100) : 0;
  return { total, sorted, correct, categoryCorrect, priorityCorrect, needsReview, accuracy, remaining: total - sorted };
}

function selectedEmail(session) {
  return session.emails.find(e => e.id === session.selectedEmailId) || null;
}
function filteredEmails(session) {
  return session.emails.filter(email => {
    if (session.filter === 'Inbox') return true;
    if (session.filter === 'Unsorted') return email.status === 'Unsorted';
    if (session.filter === 'Sorted') return email.status !== 'Unsorted';
    if (session.filter === 'Needs Review') return email.result === 'Review';
    return email.selectedCategory === session.filter;
  });
}
function countFor(session, filter) {
  if (filter === 'Inbox') return session.emails.length;
  if (filter === 'Unsorted') return session.emails.filter(e => e.status === 'Unsorted').length;
  if (filter === 'Sorted') return session.emails.filter(e => e.status !== 'Unsorted').length;
  if (filter === 'Needs Review') return session.emails.filter(e => e.result === 'Review').length;
  return session.emails.filter(e => e.selectedCategory === filter).length;
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-card hero-card">
        <div class="brand">
          <div class="brand-mark">N</div>
          <div class="brand-copy">
            <h1>Nando's Inbox Triage Desk</h1>
            <p>Shared inbox sorting task</p>
          </div>
        </div>
        <div class="hero-panel">
          <strong>Student task</strong>
          <p>Read each raw email and sort it into the correct CRM category. A new inbox is generated every sign-in.</p>
        </div>
        <div class="form-row">
          <label for="username">Username</label>
          <input id="username" class="input" placeholder="e.g. guest.agent01" autocomplete="off" />
        </div>
        <div class="form-row">
          <label for="site">Training site</label>
          <select id="site" class="select">
            <option>Leeds Head Office</option>
            <option>Manchester Head Office</option>
            <option>Birmingham Head Office</option>
            <option>Liverpool Head Office</option>
            <option>York Head Office</option>
          </select>
        </div>
        <div class="small-note">This is a training simulation. No real customer data is used.</div>
        <div class="button-row">
          <button id="startBtn" class="btn btn-primary">Start new inbox</button>
          <button id="reviewBtn" class="btn btn-ghost">Manager review</button>
        </div>
      </section>
    </main>`;

  document.getElementById('startBtn').onclick = () => {
    const username = document.getElementById('username').value.trim() || 'guest.agent01';
    const site = document.getElementById('site').value;
    const session = generateSession(username, site);
    saveActive(session);
    renderWorkspace(session);
  };
  document.getElementById('reviewBtn').onclick = renderReview;
}

function renderWorkspace(session, scrollState = null) {
  const m = metrics(session);
  const list = filteredEmails(session);
  const email = list.find(e => e.id === session.selectedEmailId) || null;
  const filters = ['Inbox', 'Unsorted', 'Sorted', 'Needs Review', ...categories];

  app.innerHTML = `
    <div class="app-shell triage-shell">
      <header class="topbar triage-topbar">
        <div class="brand compact-brand">
          <div class="brand-mark">N</div>
          <div class="brand-copy">
            <h2>Inbox Triage Desk</h2>
            <p>${escapeHtml(session.site)} · ${escapeHtml(session.username)}</p>
          </div>
        </div>
        <div class="topbar-centre">
          ${metricCard(m.remaining, 'Left to sort')}
          ${metricCard(m.sorted, 'Sorted')}
          ${metricCard(`${m.accuracy}%`, 'Accuracy')}
          ${metricCard(m.needsReview, 'Needs review')}
        </div>
        <div class="topbar-right">
          <button id="hintBtn" class="btn btn-small ${session.showHints ? 'btn-active' : ''}">${session.showHints ? 'Hints on' : 'Hints off'}</button>
          <button id="newInboxBtn" class="btn btn-small">New inbox</button>
          <button id="reviewBtn" class="btn btn-small">Manager review</button>
          <span class="suite-page-tools"><a href="../index.html">Return to home</a><button id="suiteTourBtn" type="button">Tour</button></span>
          <button id="signOutBtn" class="btn btn-small">Sign out</button>
        </div>
      </header>
      <div class="workspace triage-workspace">
        <aside class="sidebar">
          <div class="sidebar-group-title">Mailbox</div>
          ${filters.map(f => navButton(f, session.filter, countFor(session, f))).join('')}
        </aside>
        <section class="list-panel">
          <div class="list-toolbar">
            <div class="panel-title">Raw inbox</div>
            <div class="subtle">${list.length} emails visible</div>
          </div>
          <div class="case-list">
            ${list.length ? list.map(e => emailRow(e, session.selectedEmailId)).join('') : '<div class="empty-note">No emails in this view.</div>'}
          </div>
        </section>
        <section class="email-panel">
          ${email ? emailView(email, session.showHints) : '<div class="empty-state"><div class="empty-note">No email selected.</div></div>'}
        </section>
        <aside class="action-panel">
          ${email ? triagePanel(email) : ''}
        </aside>
      </div>
    </div>`;
  wireWorkspace(session);
  restoreScrollState(scrollState);
}

function metricCard(value, label) {
  return `<div class="top-metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
}
function navButton(label, current, count) {
  return `<button class="nav-item ${label === current ? 'active' : ''}" data-filter="${escapeHtml(label)}"><span>${escapeHtml(label)}</span><span class="count-pill">${count}</span></button>`;
}
function emailRow(email, selectedId) {
  const displayCategory = email.submittedCategory || email.selectedCategory || '';
  const displayPriority = email.submittedPriority || email.selectedPriority || '';
  const meta = displayCategory ? categoryMeta[displayCategory] : null;
  const resultBadge = email.result
    ? `<span class="status-pill ${email.result === 'Correct' ? 'resolved' : 'pending'}">${escapeHtml(email.result)}</span>`
    : displayCategory
      ? '<span class="status-pill pending">Chosen</span>'
      : '<span class="status-pill open">Unsorted</span>';
  const categoryLabel = displayCategory || 'Not sorted';
  const priorityLabel = displayPriority || 'No priority';
  return `
    <button class="case-row email-row ${email.id === selectedId ? 'active' : ''}" data-email="${email.id}">
      <div class="row-top">
        <div>
          <div class="row-title">${escapeHtml(email.customerName)}</div>
          <div class="row-subject">${escapeHtml(email.subject)}</div>
        </div>
        <span class="priority-pill ${email.selectedPriority ? email.selectedPriority.toLowerCase() : 'normal'}">${escapeHtml(priorityLabel)}</span>
      </div>
      <div class="preview">${escapeHtml(email.body.split('\n').filter(Boolean)[1] || email.body).slice(0, 128)}...</div>
      <div class="row-meta" style="margin-top:10px;">
        <span class="tag ${meta ? meta.className : ''}">${escapeHtml(categoryLabel)}</span>
        <span class="subtle">${formatTime(email.receivedAt)}</span>
        ${resultBadge}
      </div>
    </button>`;
}
function emailView(email, showHints) {
  const result = email.result ? resultBox(email) : '';
  const hints = showHints ? `<div class="hint-strip"><strong>Hint:</strong> Look for the main reason the customer emailed. Do not be distracted by extra details like order number or restaurant name.</div>` : '';
  return `
    <div class="email-head">
      <div class="toolbar-row">
        <div>
          <div class="panel-title">${escapeHtml(email.subject)}</div>
          <div class="subtle">From: ${escapeHtml(email.from)}</div>
        </div>
        <div class="email-date">${formatDate(email.receivedAt)}</div>
      </div>
    </div>
    <div class="email-body-wrap">
      ${hints}
      ${result}
      <article class="raw-email-card">
        <div class="raw-email-meta">
          <span>To: guestexperience@nandos-training.co.uk</span>
          <span>Inbox: Unassigned</span>
        </div>
        <pre>${escapeHtml(email.body)}</pre>
      </article>
    </div>`;
}
function resultBox(email) {
  const submittedCategory = email.submittedCategory || email.selectedCategory;
  const submittedPriority = email.submittedPriority || email.selectedPriority;
  const categoryOk = submittedCategory === email.expectedCategory;
  const priorityOk = submittedPriority === email.expectedPriority;
  const cls = email.result === 'Correct' ? 'good' : 'review';
  return `<div class="result-box ${cls}">
    <strong>${email.result === 'Correct' ? 'Correctly sorted' : 'Check this one again'}</strong>
    <p>Submitted category: ${escapeHtml(submittedCategory || 'Not chosen')} (${categoryOk ? 'correct' : `should be ${escapeHtml(email.expectedCategory)}`}). Submitted priority: ${escapeHtml(submittedPriority || 'Not chosen')} (${priorityOk ? 'correct' : `should be ${escapeHtml(email.expectedPriority)}`}).</p>
  </div>`;
}
function triagePanel(email) {
  return `
    <div class="action-head">
      <div class="panel-title">Sort this email</div>
      <div class="subtle">Choose the CRM category and priority.</div>
    </div>
    <div class="action-scroll">
      <div class="section">
        <h3>1. Category</h3>
        <div class="category-grid">
          ${categories.map(c => `<button class="category-choice ${email.selectedCategory === c ? 'active' : ''}" data-category="${escapeHtml(c)}"><span>${escapeHtml(c)}</span><small>${escapeHtml(categoryMeta[c].clue)}</small></button>`).join('')}
        </div>
      </div>
      <div class="section">
        <h3>2. Priority</h3>
        <div class="priority-grid">
          ${['Normal','High','Urgent'].map(p => `<button class="priority-choice ${email.selectedPriority === p ? 'active' : ''}" data-priority="${p}">${p}<small>${priorityHelp(p)}</small></button>`).join('')}
        </div>
      </div>
      <div class="section">
        <h3>Current decision</h3>
        <div class="decision-card">
          <div><span>Category</span><strong>${escapeHtml(email.selectedCategory || 'Not chosen')}</strong></div>
          <div><span>Priority</span><strong>${escapeHtml(email.selectedPriority || 'Not chosen')}</strong></div>
        </div>
      </div>
    </div>
    <div class="action-footer triage-footer">
      <button id="clearChoiceBtn" class="btn">Clear choice</button>
      <button id="skipBtn" class="btn">Skip</button>
      <button id="submitTriageBtn" class="btn btn-send-email">Submit triage decision</button>
    </div>`;
}
function priorityHelp(priority) {
  if (priority === 'Urgent') return 'Refund/payment, food safety, serious safety or serious conduct';
  if (priority === 'High') return 'Complaint, delivery problem, missing item or allergy information';
  return 'Booking, app/voucher, general question or praise';
}

function wireWorkspace(session) {
  document.getElementById('signOutBtn').onclick = () => { sessionStorage.removeItem(ACTIVE_KEY); renderLogin(); };
  document.getElementById('reviewBtn').onclick = renderReview;
  document.getElementById('newInboxBtn').onclick = () => {
    const fresh = generateSession(session.username, session.site);
    saveActive(fresh);
    renderWorkspace(fresh);
  };
  document.getElementById('hintBtn').onclick = () => {
    session.showHints = !session.showHints;
    saveActive(session);
    rerenderWorkspacePreservingScroll(session);
  };
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.onclick = () => {
      session.filter = btn.dataset.filter;
      const list = filteredEmails(session);
      if (!list.some(e => e.id === session.selectedEmailId)) session.selectedEmailId = list[0]?.id || null;
      saveActive(session);
      rerenderWorkspacePreservingScroll(session);
    };
  });
  document.querySelectorAll('[data-email]').forEach(btn => {
    btn.onclick = () => {
      session.selectedEmailId = btn.dataset.email;
      saveActive(session);
      rerenderWorkspacePreservingScroll(session);
    };
  });
  const visibleEmails = filteredEmails(session);
  const email = visibleEmails.find(e => e.id === session.selectedEmailId) || null;
  if (!email) return;
  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.onclick = () => {
      email.selectedCategory = btn.dataset.category;
      saveActive(session);
      rerenderWorkspacePreservingScroll(session);
    };
  });
  document.querySelectorAll('[data-priority]').forEach(btn => {
    btn.onclick = () => {
      email.selectedPriority = btn.dataset.priority;
      saveActive(session);
      rerenderWorkspacePreservingScroll(session);
    };
  });
  document.getElementById('clearChoiceBtn').onclick = () => {
    email.selectedCategory = '';
    email.selectedPriority = '';
    email.submittedCategory = '';
    email.submittedPriority = '';
    email.status = 'Unsorted';
    email.result = null;
    saveActive(session);
    rerenderWorkspacePreservingScroll(session);
  };
  document.getElementById('skipBtn').onclick = () => moveNext(session);
  document.getElementById('submitTriageBtn').onclick = () => {
    if (!email.selectedCategory || !email.selectedPriority) return;
    email.attempts += 1;
    email.submittedCategory = email.selectedCategory;
    email.submittedPriority = email.selectedPriority;
    email.status = 'Sorted';
    email.result = (email.submittedCategory === email.expectedCategory && email.submittedPriority === email.expectedPriority) ? 'Correct' : 'Review';
    saveActive(session);
    moveNext(session, true);
  };
}

function moveNext(session, preferUnsorted = false) {
  const scrollState = captureScrollState();
  const currentIndex = session.emails.findIndex(e => e.id === session.selectedEmailId);
  const nextUnsorted = session.emails.find((e, index) => preferUnsorted && index > currentIndex && e.status === 'Unsorted') || session.emails.find(e => preferUnsorted && e.status === 'Unsorted');
  const next = nextUnsorted || session.emails[currentIndex + 1] || session.emails[0] || null;
  session.selectedEmailId = next ? next.id : null;
  saveActive(session);
  renderWorkspace(session, scrollState);
}

function renderReview() {
  const history = loadHistory();
  app.innerHTML = `
    <main class="review-shell">
      <section class="review-card">
        <div class="toolbar-row">
          <div class="brand compact-brand">
            <div class="brand-mark">N</div>
            <div class="brand-copy">
              <h2>Manager Review</h2>
              <p>Inbox triage performance</p>
            </div>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button id="backSignInBtn" class="btn">Return to sign-in</button>
            <button id="clearHistoryBtn" class="btn btn-danger">Clear history</button>
          </div>
        </div>
        ${history.length ? history.map(reviewBlock).join('') : '<div class="empty-note" style="margin-top:20px;">No completed or active sessions yet.</div>'}
      </section>
    </main>`;
  document.getElementById('backSignInBtn').onclick = (event) => { event.preventDefault(); renderLogin(); };
  document.getElementById('clearHistoryBtn').onclick = (event) => { event.preventDefault(); localStorage.removeItem(HISTORY_KEY); renderReview(); };
}
function reviewBlock(item) {
  return `
    <div class="review-block">
      <div class="toolbar-row">
        <div>
          <div class="panel-title">${escapeHtml(item.username)} · ${escapeHtml(item.site)}</div>
          <div class="subtle">Started ${formatDate(item.startedAt)}</div>
        </div>
        <div class="summary-grid mini-summary">
          ${summaryCard(item.metrics.sorted, 'Sorted')}
          ${summaryCard(item.metrics.remaining, 'Remaining')}
          ${summaryCard(`${item.metrics.accuracy}%`, 'Accuracy')}
          ${summaryCard(item.metrics.needsReview, 'Needs Review')}
        </div>
      </div>
      <table class="review-table">
        <thead><tr><th>Customer</th><th>Subject</th><th>Student category</th><th>Correct category</th><th>Student priority</th><th>Correct priority</th><th>Result</th></tr></thead>
        <tbody>
          ${item.emails.map(e => `<tr>
            <td>${escapeHtml(e.from)}</td>
            <td>${escapeHtml(e.subject)}</td>
            <td>${escapeHtml(e.selectedCategory)}</td>
            <td>${escapeHtml(e.expectedCategory)}</td>
            <td>${escapeHtml(e.selectedPriority)}</td>
            <td>${escapeHtml(e.expectedPriority)}</td>
            <td class="${e.result === 'Correct' ? 'quality-good' : e.result === 'Review' ? 'quality-review' : 'quality-poor'}">${escapeHtml(e.result || 'Not sorted')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}
function summaryCard(value, label) {
  return `<div class="summary-card"><strong>${escapeHtml(value)}</strong><span class="subtle">${escapeHtml(label)}</span></div>`;
}

(function boot() {
  const active = loadActive();
  if (active) renderWorkspace(active);
  else renderLogin();
})();
