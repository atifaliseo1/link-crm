document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let activeView = 'dashboard';
  let allLeads = [];
  let currentJobId = null;
  let jobPollInterval = null;
  let selectedLeadForEmail = null;

  const API_BASE = ''; // Same host

  // DOM Elements
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const viewPanes = document.querySelectorAll('.view-pane');
  const pageTitle = document.getElementById('page-title');
  const toast = document.getElementById('notification-toast');
  const toastMessage = document.getElementById('toast-message');

  // Dashboard Inputs & Forms
  const searchForm = document.getElementById('search-leads-form');
  const cityInput = document.getElementById('city-input');
  const countryInput = document.getElementById('country-input');
  const categoryInput = document.getElementById('category-input');
  const limitInput = document.getElementById('limit-input');
  const startSearchBtn = document.getElementById('start-search-btn');

  // Job Status Card Elements
  const jobStatusCard = document.getElementById('job-status-card');
  const quickTipsCard = document.getElementById('quick-tips-card');
  const jobIdDisplay = document.getElementById('job-id-display');
  const jobStatusLabel = document.getElementById('job-status-label');
  const jobProgressFill = document.getElementById('job-progress-fill');
  const jobProgressText = document.getElementById('job-progress-text');
  const jobConsoleLogs = document.getElementById('job-console-logs');
  const stepFinder = document.getElementById('step-finder');
  const stepVerifier = document.getElementById('step-verifier');
  const stepAnalyzer = document.getElementById('step-analyzer');
  const stepWriter = document.getElementById('step-writer');

  // Stats Elements
  const statLeadsFound = document.getElementById('stat-leads-found');
  const statLeadsVerified = document.getElementById('stat-leads-verified');
  const statAvgScore = document.getElementById('stat-avg-score');
  const statCitiesCount = document.getElementById('stat-cities-count');

  // Lead Results Elements
  const leadsSearchInput = document.getElementById('leads-search-input');
  const scoreFilterSelect = document.getElementById('score-filter-select');
  const leadsTableBody = document.getElementById('leads-table-body');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const exportTxtBtn = document.getElementById('export-txt-btn');
  const quickClearBtn = document.getElementById('quick-clear-btn');

  // Email Generator Elements
  const emailLeadsCount = document.getElementById('email-leads-count');
  const emailLeadsContainer = document.getElementById('email-leads-container');
  const emailEditorCardEmpty = document.getElementById('email-editor-card-empty');
  const emailEditorCardActive = document.getElementById('email-editor-card-active');
  const editorLeadName = document.getElementById('editor-lead-name');
  const editorLeadRating = document.getElementById('editor-lead-rating');
  const editorLeadScore = document.getElementById('editor-lead-score');
  const editorLeadUrl = document.getElementById('editor-lead-url');
  const editorWeaknessesList = document.getElementById('editor-weaknesses-list');
  const emailSubjectInput = document.getElementById('email-subject-input');
  const emailBodyInput = document.getElementById('email-body-input');
  const emailProviderDisplay = document.getElementById('email-provider-display');
  const regenerateEmailBtn = document.getElementById('regenerate-email-btn');
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const saveEmailChangesBtn = document.getElementById('save-email-changes-btn');

  // Settings Elements
  const settingsForm = document.getElementById('api-settings-form');
  const geminiKeyInput = document.getElementById('gemini-key-input');
  const openrouterKeyInput = document.getElementById('openrouter-key-input');
  const ollamaHostInput = document.getElementById('ollama-host-input');
  const ollamaModelInput = document.getElementById('ollama-model-input');
  const toggleScraper = document.getElementById('toggle-scraper');

  // Modals
  const leadDetailsModal = document.getElementById('lead-details-modal');
  const modalCloseBtn = document.querySelector('.close-modal-btn');
  const modalLeadName = document.getElementById('modal-lead-name');
  const modalLeadWeb = document.getElementById('modal-lead-web');
  const modalLeadPhone = document.getElementById('modal-lead-phone');
  const modalLeadAddress = document.getElementById('modal-lead-address');
  const modalLeadRating = document.getElementById('modal-lead-rating');
  const modalLeadScore = document.getElementById('modal-lead-score');
  const modalWeaknessesList = document.getElementById('modal-weaknesses-list');

  /* ==========================================================================
     INITIALIZATION & VIEW SWITCHING
     ========================================================================== */

  // Load baseline statistics and leads
  fetchLeads();
  fetchSettings();

  // Sidebar navigation click
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      switchView(view);
    });
  });

  function switchView(viewName) {
    activeView = viewName;
    
    // Toggle active link
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Toggle active pane
    viewPanes.forEach(pane => {
      if (pane.id === `${viewName}-view`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Update Header title
    const titles = {
      'dashboard': 'Lead Search Dashboard',
      'results': 'Qualified Lead Results',
      'emails': 'Personalized Email Workspace',
      'settings': 'Application Settings'
    };
    pageTitle.textContent = titles[viewName] || 'Dashboard';

    // Trigger action when navigating to a specific view
    if (viewName === 'results' || viewName === 'emails') {
      fetchLeads();
    }
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */

  function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  /* ==========================================================================
     LEADS API HANDLING
     ========================================================================== */

  async function fetchLeads() {
    try {
      const response = await fetch(`${API_BASE}/api/leads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      const leads = await response.json();
      allLeads = leads;
      
      updateStats();
      renderLeadsTable();
      renderEmailsSidebar();
    } catch (err) {
      console.error(err);
      showToast('Error loading leads database.');
    }
  }

  function updateStats() {
    const verified = allLeads.filter(l => l.status !== 'rejected');
    
    statLeadsFound.textContent = allLeads.length;
    statLeadsVerified.textContent = verified.length;

    // Avg score
    if (verified.length > 0) {
      const sum = verified.reduce((acc, lead) => acc + (lead.lead_score || 0), 0);
      statAvgScore.textContent = Math.round(sum / verified.length);
    } else {
      statAvgScore.textContent = '0';
    }

    // Cities scanned
    const citiesSet = new Set(verified.map(l => l.city.toLowerCase()));
    statCitiesCount.textContent = citiesSet.size;
  }

  /* ==========================================================================
     LEAD RESULTS TABLE RENDER
     ========================================================================== */

  function renderLeadsTable() {
    const searchVal = leadsSearchInput.value.toLowerCase().trim();
    const scoreFilter = scoreFilterSelect.value;
    
    const filtered = allLeads.filter(lead => {
      // Search matches
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchVal) || 
        (lead.city && lead.city.toLowerCase().includes(searchVal)) ||
        (lead.website && lead.website.toLowerCase().includes(searchVal)) ||
        (lead.category && lead.category.toLowerCase().includes(searchVal));

      // Score filter matches
      let matchesScore = true;
      if (scoreFilter === 'high') matchesScore = lead.lead_score >= 75;
      else if (scoreFilter === 'mid') matchesScore = lead.lead_score >= 50 && lead.lead_score < 75;
      else if (scoreFilter === 'low') matchesScore = lead.lead_score < 50;

      return matchesSearch && matchesScore;
    });

    if (filtered.length === 0) {
      leadsTableBody.innerHTML = `<tr><td colspan="8" class="text-center">No matching leads found.</td></tr>`;
      return;
    }

    leadsTableBody.innerHTML = '';
    filtered.forEach(lead => {
      const tr = document.createElement('tr');
      
      // Score badge color
      let scoreClass = 'low';
      if (lead.lead_score >= 75) scoreClass = 'high';
      else if (lead.lead_score >= 50) scoreClass = 'mid';

      // Status badge color
      let statusClass = 'badge-warning';
      if (lead.status === 'completed' || lead.status === 'analyzed') statusClass = 'badge-success';
      if (lead.status === 'rejected') statusClass = 'badge-danger';

      const websiteLink = lead.website 
        ? `<a href="${lead.website}" target="_blank" class="lead-link-btn">${lead.website.substring(0, 25)}${lead.website.length > 25 ? '...' : ''}</a>` 
        : '<span class="text-muted">None</span>';

      tr.innerHTML = `
        <td><strong>${lead.name}</strong></td>
        <td>${lead.city}, ${lead.country}</td>
        <td>${websiteLink}</td>
        <td>${lead.phone || '<span class="text-muted">None</span>'}</td>
        <td>â˜… ${lead.rating || '0.0'} (${lead.reviews_count || 0})</td>
        <td><span class="score-badge ${scoreClass}">${lead.lead_score}</span></td>
        <td><span class="badge ${statusClass}">${lead.status.toUpperCase()}</span></td>
        <td>
          <div class="editor-actions">
            <button class="btn btn-secondary btn-sm btn-view-lead" data-id="${lead.id}">Details</button>
            ${lead.status !== 'rejected' ? `<button class="btn btn-primary btn-sm btn-view-email" data-id="${lead.id}">Email</button>` : ''}
            <button class="btn btn-secondary btn-sm btn-delete-lead" data-id="${lead.id}" style="color: var(--danger)">ðŸ—‘</button>
          </div>
        </td>
      `;

      leadsTableBody.appendChild(tr);
    });

    // Wire up actions
    document.querySelectorAll('.btn-view-lead').forEach(btn => {
      btn.addEventListener('click', () => showLeadModal(btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.btn-view-email').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        switchView('emails');
        selectLeadForEmailWorkspace(id);
      });
    });

    document.querySelectorAll('.btn-delete-lead').forEach(btn => {
      btn.addEventListener('click', () => deleteLead(btn.getAttribute('data-id')));
    });
  }

  // Filter triggers
  leadsSearchInput.addEventListener('input', renderLeadsTable);
  scoreFilterSelect.addEventListener('change', renderLeadsTable);

  // Delete lead call
  async function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/leads/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showToast('Lead deleted successfully.');
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
      showToast('Error deleting lead.');
    }
  }

  // Clear all leads
  quickClearBtn.addEventListener('click', async () => {
    if (!confirm('WARNING: Are you sure you want to delete ALL leads in the database? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/api/leads`, { method: 'DELETE' });
      if (response.ok) {
        showToast('Database cleared successfully.');
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
      showToast('Error resetting database.');
    }
  });

  // Modal display helpers
  function showLeadModal(id) {
    const lead = allLeads.find(l => l.id === id);
    if (!lead) return;

    modalLeadName.textContent = lead.name;
    
    if (lead.website) {
      modalLeadWeb.href = lead.website;
      modalLeadWeb.textContent = lead.website;
      modalLeadWeb.classList.remove('hidden');
    } else {
      modalLeadWeb.textContent = '-';
    }
    
    modalLeadPhone.textContent = lead.phone || 'N/A';
    modalLeadAddress.textContent = lead.address || 'N/A';
    modalLeadRating.textContent = `â˜… ${lead.rating || '0.0'} (${lead.reviews_count || 0} reviews)`;
    modalLeadScore.textContent = `${lead.lead_score} / 100`;

    modalWeaknessesList.innerHTML = '';
    if (lead.weaknesses && lead.weaknesses.length > 0) {
      lead.weaknesses.forEach(w => {
        const li = document.createElement('li');
        li.textContent = w;
        modalWeaknessesList.appendChild(li);
      });
    } else {
      modalWeaknessesList.innerHTML = '<li>None identified.</li>';
    }

    leadDetailsModal.classList.remove('hidden');
  }

  modalCloseBtn.addEventListener('click', () => {
    leadDetailsModal.classList.add('hidden');
  });

  window.addEventListener('click', (e) => {
    if (e.target === leadDetailsModal) {
      leadDetailsModal.classList.add('hidden');
    }
  });

  /* ==========================================================================
     EMAIL WORKSPACE HANDLERS
     ========================================================================== */

  function renderEmailsSidebar() {
    const qualified = allLeads.filter(l => l.status !== 'rejected');
    emailLeadsCount.textContent = qualified.length;

    if (qualified.length === 0) {
      emailLeadsContainer.innerHTML = `<div class="text-center p-4 text-muted">No qualified leads.</div>`;
      return;
    }

    emailLeadsContainer.innerHTML = '';
    qualified.forEach(lead => {
      const div = document.createElement('div');
      div.className = `list-item ${selectedLeadForEmail && selectedLeadForEmail.id === lead.id ? 'active' : ''}`;
      div.setAttribute('data-id', lead.id);

      div.innerHTML = `
        <h4>${lead.name}</h4>
        <p>${lead.city}, ${lead.country}</p>
        <div class="list-item-meta">
          <span class="badge badge-success">Score: ${lead.lead_score}</span>
          <span class="text-muted" style="font-size: 0.7rem;">â˜… ${lead.rating}</span>
        </div>
      `;

      div.addEventListener('click', () => {
        selectLeadForEmailWorkspace(lead.id);
      });

      emailLeadsContainer.appendChild(div);
    });
  }

  function selectLeadForEmailWorkspace(id) {
    const lead = allLeads.find(l => l.id === id);
    if (!lead) return;

    selectedLeadForEmail = lead;
    
    // Highlight list active item
    document.querySelectorAll('.email-leads-list-card .list-item').forEach(item => {
      if (item.getAttribute('data-id') === id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Populate Editor fields
    editorLeadName.textContent = lead.name;
    editorLeadRating.textContent = `â˜… ${lead.rating || '0.0'} (${lead.reviews_count || 0} reviews)`;
    editorLeadScore.textContent = `Lead Score: ${lead.lead_score}`;
    
    if (lead.website) {
      editorLeadUrl.href = lead.website;
      editorLeadUrl.classList.remove('hidden');
    } else {
      editorLeadUrl.classList.add('hidden');
    }

    // Populate weaknesses tags
    editorWeaknessesList.innerHTML = '';
    if (lead.weaknesses && lead.weaknesses.length > 0) {
      lead.weaknesses.forEach(w => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = w;
        editorWeaknessesList.appendChild(span);
      });
    } else {
      const span = document.createElement('span');
      span.className = 'tag';
      span.style.background = 'var(--bg-tertiary)';
      span.style.color = 'var(--text-secondary)';
      span.textContent = 'None identified';
      editorWeaknessesList.appendChild(span);
    }

    // Populate email textareas
    if (lead.email) {
      emailSubjectInput.value = lead.email.subject || '';
      emailBodyInput.value = lead.email.body || '';
      emailProviderDisplay.textContent = `AI Provider: ${lead.email.provider_used.toUpperCase()}`;
    } else {
      emailSubjectInput.value = '';
      emailBodyInput.value = '';
      emailProviderDisplay.textContent = 'AI Provider: NOT GENERATED';
    }

    // Switch panels
    emailEditorCardEmpty.classList.add('hidden');
    emailEditorCardActive.classList.remove('hidden');
  }

  // Copy Email Button
  copyEmailBtn.addEventListener('click', () => {
    if (!selectedLeadForEmail) return;
    
    const subject = emailSubjectInput.value;
    const body = emailBodyInput.value;
    const textToCopy = `Subject: ${subject}\n\n${body}`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast('Email copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy to clipboard.');
      });
  });

  // Save changes button
  saveEmailChangesBtn.addEventListener('click', async () => {
    if (!selectedLeadForEmail) return;

    try {
      const response = await fetch(`${API_BASE}/api/leads/${selectedLeadForEmail.id}/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubjectInput.value,
          body: emailBodyInput.value
        })
      });

      if (response.ok) {
        showToast('Edits saved successfully.');
        fetchLeads(); // refresh cache
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving changes.');
    }
  });

  // Regenerate email button
  regenerateEmailBtn.addEventListener('click', async () => {
    if (!selectedLeadForEmail) return;
    
    regenerateEmailBtn.disabled = true;
    const originalText = regenerateEmailBtn.innerHTML;
    regenerateEmailBtn.innerHTML = `<span>Regenerating...</span>`;

    try {
      const response = await fetch(`${API_BASE}/api/leads/${selectedLeadForEmail.id}/regenerate-email`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Regeneration failed');
      const data = await response.json();
      
      if (data.success && data.email) {
        emailSubjectInput.value = data.email.subject;
        emailBodyInput.value = data.email.body;
        emailProviderDisplay.textContent = `AI Provider: ${data.email.provider.toUpperCase()}`;
        showToast('Email regenerated with AI!');
        fetchLeads(); // Refresh leads array in background
      }
    } catch (err) {
      console.error(err);
      showToast('Error regenerating email.');
    } finally {
      regenerateEmailBtn.disabled = false;
      regenerateEmailBtn.innerHTML = originalText;
    }
  });

  /* ==========================================================================
     SETTINGS VIEW HANDLERS
     ========================================================================== */

  async function fetchSettings() {
    try {
      const response = await fetch(`${API_BASE}/api/settings`);
      if (!response.ok) throw new Error('Failed to load settings');
      const data = await response.json();
      
      geminiKeyInput.value = data.gemini_api_key || '';
      openrouterKeyInput.value = data.openrouter_api_key || '';
      ollamaHostInput.value = data.ollama_host || '';
      ollamaModelInput.value = data.ollama_model || '';
      toggleScraper.checked = data.use_scraper;
    } catch (err) {
      console.error(err);
    }
  }

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const settings = {
      gemini_api_key: geminiKeyInput.value,
      openrouter_api_key: openrouterKeyInput.value,
      ollama_host: ollamaHostInput.value,
      ollama_model: ollamaModelInput.value,
      use_scraper: toggleScraper.checked
    };

    try {
      const response = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        showToast('Settings saved successfully.');
        fetchSettings(); // Refresh masked keys
      } else {
        throw new Error('Save settings failed');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings.');
    }
  });

  // Handle scraper toggle change
  toggleScraper.addEventListener('change', async () => {
    try {
      await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ use_scraper: toggleScraper.checked })
      });
      showToast(`Scraper ${toggleScraper.checked ? 'Enabled (Google Maps)' : 'Disabled (Fallback to OSM Only)'}`);
    } catch (e) {
      console.error(e);
    }
  });

  /* ==========================================================================
     EXPORTS HANDLERS
     ========================================================================== */

  exportCsvBtn.addEventListener('click', () => {
    window.location.href = `${API_BASE}/api/export/csv`;
  });

  exportJsonBtn.addEventListener('click', () => {
    window.location.href = `${API_BASE}/api/export/json`;
  });

  exportTxtBtn.addEventListener('click', () => {
    window.location.href = `${API_BASE}/api/export/txt`;
  });

  /* ==========================================================================
     PIPELINE SEARCH JOB RUNNER
     ========================================================================== */

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cities = cityInput.value;
    const country = countryInput.value;
    const category = categoryInput.value;
    const limit = limitInput.value;

    startSearchBtn.disabled = true;
    startSearchBtn.innerHTML = `<span>Hunting...</span>`;
    
    // Clean logs
    jobConsoleLogs.innerHTML = `<p class="console-line info">[System] Submitting search request...</p>`;
    
    // Reset steps
    stepFinder.className = 'pipeline-step active';
    stepVerifier.className = 'pipeline-step';
    stepAnalyzer.className = 'pipeline-step';
    stepWriter.className = 'pipeline-step';

    // Show status panel, hide tips
    jobStatusCard.classList.remove('hidden');
    quickTipsCard.classList.add('hidden');

    try {
      const response = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cities, country, category, limit })
      });

      if (!response.ok) throw new Error('Search failed to submit');
      
      const data = await response.json();
      currentJobId = data.jobId;
      jobIdDisplay.textContent = `Job ID: ${currentJobId}`;
      
      // Start polling
      startPollingJob(currentJobId);

    } catch (err) {
      console.error(err);
      showToast('Error starting lead hunter.');
      startSearchBtn.disabled = false;
      startSearchBtn.innerHTML = `Start Lead Hunter`;
    }
  });

  function startPollingJob(jobId) {
    if (jobPollInterval) clearInterval(jobPollInterval);
    
    jobStatusLabel.className = 'job-badge pulse';
    jobStatusLabel.textContent = 'RUNNING';

    jobPollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/jobs/${jobId}`);
        if (!response.ok) throw new Error('Job not found');
        const job = await response.json();

        // Update progress bar
        jobProgressFill.style.width = `${job.progress}%`;
        jobProgressText.textContent = `${job.progress}%`;

        // Update status text
        addConsoleLog(job.message, 'info');

        // Manage pipeline steps CSS
        updatePipelineStepStyles(job.message, job.progress);

        if (job.status === 'completed') {
          clearInterval(jobPollInterval);
          jobStatusLabel.className = 'job-badge';
          jobStatusLabel.style.backgroundColor = 'var(--success)';
          jobStatusLabel.textContent = 'COMPLETED';
          addConsoleLog(`[Pipeline] Job finished! Found ${job.results.length} total qualified leads.`, 'success');
          
          showToast('Search completed successfully!');
          startSearchBtn.disabled = false;
          startSearchBtn.innerHTML = `Start Lead Hunter`;
          fetchLeads(); // Refresh results table

        } else if (job.status === 'failed') {
          clearInterval(jobPollInterval);
          jobStatusLabel.className = 'job-badge';
          jobStatusLabel.style.backgroundColor = 'var(--danger)';
          jobStatusLabel.textContent = 'FAILED';
          addConsoleLog(`[Error] ${job.message}`, 'error');
          
          showToast('Search job failed.');
          startSearchBtn.disabled = false;
          startSearchBtn.innerHTML = `Start Lead Hunter`;
        }
      } catch (err) {
        clearInterval(jobPollInterval);
        console.error(err);
        jobStatusLabel.className = 'job-badge';
        jobStatusLabel.style.backgroundColor = 'var(--danger)';
        jobStatusLabel.textContent = 'ERROR';
        startSearchBtn.disabled = false;
        startSearchBtn.innerHTML = `Start Lead Hunter`;
      }
    }, 2000);
  }

  function updatePipelineStepStyles(msg, progress) {
    const text = msg.toLowerCase();
    
    if (text.includes('searching') || text.includes('found')) {
      stepFinder.className = 'pipeline-step active';
      stepVerifier.className = 'pipeline-step';
      stepAnalyzer.className = 'pipeline-step';
      stepWriter.className = 'pipeline-step';
    } 
    else if (text.includes('verifying') || text.includes('verified')) {
      stepFinder.className = 'pipeline-step completed';
      stepVerifier.className = 'pipeline-step active';
      stepAnalyzer.className = 'pipeline-step';
      stepWriter.className = 'pipeline-step';
    } 
    else if (text.includes('extracting') || text.includes('analyzing') || text.includes('analyzed')) {
      stepFinder.className = 'pipeline-step completed';
      stepVerifier.className = 'pipeline-step completed';
      stepAnalyzer.className = 'pipeline-step active';
      stepWriter.className = 'pipeline-step';
    } 
    else if (text.includes('drafting') || text.includes('email') || text.includes('personalized')) {
      stepFinder.className = 'pipeline-step completed';
      stepVerifier.className = 'pipeline-step completed';
      stepAnalyzer.className = 'pipeline-step completed';
      stepWriter.className = 'pipeline-step active';
    }

    if (progress === 100) {
      stepFinder.className = 'pipeline-step completed';
      stepVerifier.className = 'pipeline-step completed';
      stepAnalyzer.className = 'pipeline-step completed';
      stepWriter.className = 'pipeline-step completed';
    }
  }

  function addConsoleLog(text, type = 'info') {
    // Check if the last log is identical to save console spam
    const lastLine = jobConsoleLogs.lastElementChild;
    if (lastLine && lastLine.textContent === text) return;

    const p = document.createElement('p');
    p.className = `console-line ${type}`;
    p.textContent = text;
    jobConsoleLogs.appendChild(p);
    
    // Auto scroll to bottom
    jobConsoleLogs.scrollTop = jobConsoleLogs.scrollHeight;
  }
});
