// Content script for Google Forms auto-fill
(function() {
  // Field matching keywords for Google Forms
  const FIELD_MATCHERS = {
    name: ['name', 'full name', 'your name', 'applicant name', 'candidate name', 'student name', 'नाम'],
    fatherName: ["father", "father's name", "father name", "guardian", "parent", "पिता"],
    dateOfBirth: ['date of birth', 'dob', 'birth date', 'birthday', 'जन्म तिथि', 'birth'],
    gender: ['gender', 'sex', 'लिंग'],
    email: ['email', 'e-mail', 'email address', 'mail', 'ईमेल'],
    phone: ['phone', 'mobile', 'contact number', 'phone number', 'mobile number', 'cell', 'फोन', 'मोबाइल'],
    address: ['address', 'residential address', 'permanent address', 'पता', 'full address'],
    district: ['district', 'city', 'जिला'],
    state: ['state', 'province', 'राज्य'],
    pincode: ['pincode', 'pin code', 'zip', 'zip code', 'postal code', 'पिनकोड'],
    aadhaarNumber: ['aadhaar', 'aadhar', 'uidai', 'uid', 'aadhaar number', 'आधार'],
    panNumber: ['pan', 'pan number', 'pan card', 'पैन'],
    voterIdNumber: ['voter', 'voter id', 'epic', 'election', 'मतदाता'],
    drivingLicenseNumber: ['driving license', 'dl number', 'license number', 'dl no', 'ड्राइविंग'],
    marks10th: ['10th', 'ssc', 'class 10', 'class x', 'x marks', '10th marks', '10th percentage', 'ssc marks', 'matriculation'],
    marks12th: ['12th', 'hsc', 'class 12', 'class xii', 'xii marks', '12th marks', '12th percentage', 'hsc marks', 'intermediate'],
    sgpa: ['sgpa', 'gpa', 'cgpa', 'engineering marks', 'semester gpa'],
    codechefLink: ['codechef', 'coding profile', 'competitive programming'],
    leetcodeLink: ['leetcode', 'leet code'],
    githubLink: ['github', 'git hub', 'git profile'],
    gfgLink: ['geeksforgeeks', 'gfg', 'geeks for geeks'],
    hackerrankLink: ['hackerrank', 'hacker rank'],
    linkedinLink: ['linkedin', 'linked in'],
  };

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillForm') {
      chrome.storage.local.get(['docfillCustomFields', 'docfillDebug'], (result) => {
        fillGoogleForm(message.data, result.docfillCustomFields || [], !!result.docfillDebug);
      });
      sendResponse({ success: true });
    }
    if (message.action === 'setDebug') {
      chrome.storage.local.set({ docfillDebug: !!message.enabled });
      sendResponse({ success: true });
    }
  });

  // ---------- Fuzzy matching helpers ----------
  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'of', 'to', 'in', 'on', 'for', 'and', 'or', 'your',
    'my', 'is', 'are', 'please', 'enter', 'provide', 'kindly',
    'with', 'at', 'by', 'from', 'as', 'be', 'do', 'you', 'us', 'our'
  ]);

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(text) {
    return normalize(text).split(' ').filter(t => t.length > 1);
  }

  function meaningfulTokens(text) {
    return tokenize(text).filter(t => !STOP_WORDS.has(t));
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[a.length][b.length];
  }

  function similarity(a, b) {
    if (!a || !b) return 0;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
  }

  // Score how well a custom field label matches a question text (0-1)
  function customFieldScore(labelTokens, questionText) {
    const qTokens = meaningfulTokens(questionText);
    if (!labelTokens.length || !qTokens.length) return 0;
    let matched = 0;
    for (const lt of labelTokens) {
      for (const qt of qTokens) {
        if (
          lt === qt ||
          (lt.length >= 4 && qt.length >= 4 &&
            (qt.includes(lt) || lt.includes(qt) || similarity(lt, qt) >= 0.82))
        ) {
          matched++;
          break;
        }
      }
    }
    return matched / labelTokens.length;
  }

  // ---------- Option selection helpers (radio / dropdown) ----------
  function selectRadioOption(container, value) {
    if (!value) return false;
    const target = normalize(String(value));
    const radios = container.querySelectorAll('[role="radio"]');
    if (!radios.length) return false;

    let best = { score: 0, el: null };
    radios.forEach(r => {
      const rText = normalize(r.getAttribute('data-value') || r.getAttribute('aria-label') || r.textContent || '');
      if (!rText) return;
      let score = 0;
      if (rText === target) score = 1;
      else if (rText.includes(target) || target.includes(rText)) score = 0.9;
      else score = similarity(rText, target);
      if (score > best.score) best = { score, el: r };
    });
    if (best.el && best.score >= 0.7) {
      best.el.click();
      return true;
    }
    return false;
  }

  function selectDropdownOption(container, value) {
    if (!value) return false;
    const target = normalize(String(value));
    const trigger = container.querySelector('[role="listbox"]');
    if (!trigger) return false;

    // Open the dropdown
    trigger.click();

    // Options render in a popup; poll briefly
    let attempts = 0;
    const tryPick = () => {
      const options = document.querySelectorAll('[role="option"]');
      if (!options.length && attempts < 10) {
        attempts++;
        return setTimeout(tryPick, 60);
      }
      let best = { score: 0, el: null };
      options.forEach(opt => {
        const txt = normalize(opt.getAttribute('data-value') || opt.textContent || '');
        if (!txt || txt === 'choose') return;
        let score = 0;
        if (txt === target) score = 1;
        else if (txt.includes(target) || target.includes(txt)) score = 0.9;
        else score = similarity(txt, target);
        if (score > best.score) best = { score, el: opt };
      });
      if (best.el && best.score >= 0.6) {
        best.el.click();
      } else {
        // Close dropdown if no match
        document.body.click();
      }
    };
    setTimeout(tryPick, 80);
    return true;
  }

  function fillContainer(container, value) {
    const input = container.querySelector('input[type="text"], textarea');
    if (input) {
      setInputValue(input, value);
      return { type: 'input', el: input };
    }
    if (container.querySelector('[role="radio"]')) {
      return selectRadioOption(container, value) ? { type: 'radio' } : null;
    }
    if (container.querySelector('[role="listbox"]')) {
      return selectDropdownOption(container, value) ? { type: 'dropdown' } : null;
    }
    return null;
  }

  function fillGoogleForm(data, customFields, debug) {
    if (!data || Object.keys(data).length === 0) return;

    // Clear previous debug overlays
    document.querySelectorAll('.docfill-debug-overlay, .docfill-debug-badge').forEach(n => n.remove());
    if (debug) {
      console.group('%c[DocFill Debug]', 'color:#7c3aed;font-weight:bold;font-size:13px;');
      console.log('Available data keys:', Object.keys(data));
      console.log('Custom fields:', customFields);
    }

    const customFieldTokens = (customFields || [])
      .filter(cf => data[cf.key])
      .map(cf => ({ key: cf.key, label: cf.label, tokens: meaningfulTokens(cf.label) }))
      .filter(cf => cf.tokens.length > 0);

    // Find all unique question containers, then derive their label text.
    // Google Forms uses role="listitem" for each question; older markup uses the
    // freebird class names; our test form uses [data-params] / .question.
    const containerSelector = [
      '[role="listitem"]',
      '[data-params]',
      '.freebirdFormviewerComponentsQuestionBaseRoot',
      '.question',
    ].join(',');
    const rawContainers = Array.from(document.querySelectorAll(containerSelector));
    // Deduplicate: keep only the innermost matching container per question
    const containers = rawContainers.filter(c =>
      !rawContainers.some(other => other !== c && c.contains(other))
    );

    if (debug) console.log(`Found ${containers.length} question container(s).`);

    function getLabelText(container) {
      const labelEl =
        container.querySelector('[class*="QuestionBaseTitle"]') ||
        container.querySelector('[role="heading"]') ||
        container.querySelector('label');
      let text = (labelEl ? labelEl.textContent : '').trim();
      if (!text) {
        // Fallback: use first input's aria-label
        const inp = container.querySelector('input, textarea, [role="listbox"]');
        text = (inp && inp.getAttribute('aria-label')) || '';
      }
      return text.replace(/\*+$/, '').replace(/\s+/g, ' ').trim();
    }

    let filledCount = 0;
    const filledContainers = new WeakSet();
    const filledInputs = new WeakSet();

    // Strategy 1+2 combined: pick the BEST matching field per container.
    containers.forEach((container, idx) => {
      if (filledContainers.has(container)) return;
      const labelText = getLabelText(container);
      if (!labelText) {
        if (debug) {
          console.warn(`[Q${idx}] No label found`, container);
          highlightContainer(container, '#9ca3af', `Q${idx}: no label`);
        }
        return;
      }
      const lower = labelText.toLowerCase();

      // Score predefined fields: count keyword hits, prefer longest match
      let best = { score: 0, value: null, source: null };
      const allScores = [];
      for (const [fieldKey, keywords] of Object.entries(FIELD_MATCHERS)) {
        if (!data[fieldKey]) continue;
        for (const kw of keywords) {
          if (lower.includes(kw.toLowerCase())) {
            // Score is keyword length / label length — longer keywords win
            const s = 0.7 + Math.min(0.29, kw.length / Math.max(lower.length, 10) * 0.3);
            allScores.push({ source: fieldKey, kw, score: +s.toFixed(3) });
            if (s > best.score) best = { score: s, value: data[fieldKey], source: fieldKey };
          }
        }
      }

      // Score custom fields by token overlap
      for (const cf of customFieldTokens) {
        const s = customFieldScore(cf.tokens, labelText);
        if (s > 0) allScores.push({ source: 'custom:' + cf.key, label: cf.label, score: +s.toFixed(3) });
        if (s >= 0.6 && s > best.score) {
          best = { score: s, value: data[cf.key], source: cf.key };
        }
      }

      if (best.value != null) {
        const result = fillContainer(container, best.value);
        if (result) {
          filledContainers.add(container);
          if (result.el) filledInputs.add(result.el);
          filledCount++;
          if (debug) {
            console.log(`%c[Q${idx}] ✅ "${labelText}" → ${best.source} = "${best.value}" (score ${best.score.toFixed(3)}, ${result.type})`, 'color:#16a34a');
            if (allScores.length) console.table(allScores.sort((a,b) => b.score - a.score));
            highlightContainer(container, '#16a34a', `Q${idx}: ${best.source} = ${truncate(best.value, 40)}`);
          }
        } else if (debug) {
          console.warn(`[Q${idx}] ⚠️ "${labelText}" matched ${best.source} but fillContainer failed`);
          highlightContainer(container, '#f59e0b', `Q${idx}: matched ${best.source} but couldn't fill`);
        }
      } else if (debug) {
        console.log(`%c[Q${idx}] ❌ "${labelText}" — no match`, 'color:#dc2626');
        if (allScores.length) console.table(allScores.sort((a,b) => b.score - a.score));
        highlightContainer(container, '#dc2626', `Q${idx}: no match — "${truncate(labelText, 40)}"`);
      }
    });

    // Strategy 3: Match remaining text inputs by aria-label (fallback)
    const allInputs = document.querySelectorAll('input[type="text"], textarea');
    allInputs.forEach(input => {
      if (filledInputs.has(input)) return;
      const container = input.closest(containerSelector);
      if (container && filledContainers.has(container)) return;
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      if (!ariaLabel) return;

      let best = { score: 0, value: null };
      for (const [fieldKey, keywords] of Object.entries(FIELD_MATCHERS)) {
        if (!data[fieldKey]) continue;
        for (const kw of keywords) {
          if (ariaLabel.includes(kw.toLowerCase())) {
            const s = 0.7 + kw.length / 100;
            if (s > best.score) best = { score: s, value: data[fieldKey] };
          }
        }
      }
      for (const cf of customFieldTokens) {
        const s = customFieldScore(cf.tokens, ariaLabel);
        if (s >= 0.6 && s > best.score) best = { score: s, value: data[cf.key] };
      }
      if (best.value != null) {
        setInputValue(input, best.value);
        filledInputs.add(input);
        if (container) filledContainers.add(container);
        filledCount++;
      }
    });

    showNotification(filledCount > 0
      ? `✅ DocFill: Filled ${filledCount} field(s). Please verify the data.`
      : '⚠️ DocFill: No matching fields found. Try filling manually from the extension.');

    if (debug) {
      console.log(`%c[DocFill] Filled ${filledCount} of ${containers.length} questions.`, 'color:#7c3aed;font-weight:bold');
      console.groupEnd();
    }
  }

  function truncate(s, n) {
    s = String(s);
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  function highlightContainer(container, color, badgeText) {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    const overlay = document.createElement('div');
    overlay.className = 'docfill-debug-overlay';
    overlay.style.cssText = `
      position: absolute;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid ${color};
      background: ${color}1a;
      border-radius: 6px;
      pointer-events: none;
      z-index: 999990;
    `;
    const badge = document.createElement('div');
    badge.className = 'docfill-debug-badge';
    badge.textContent = badgeText;
    badge.style.cssText = `
      position: absolute;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY - 22}px;
      background: ${color};
      color: white;
      font: 600 11px system-ui;
      padding: 3px 8px;
      border-radius: 4px 4px 0 0;
      z-index: 999991;
      pointer-events: none;
      max-width: ${Math.max(rect.width, 200)}px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(badge);
    setTimeout(() => { overlay.remove(); badge.remove(); }, 15000);
  }

  function setInputValue(input, value) {
    // Use native input setter to trigger React/Angular change detection
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set 
      || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, value);
    } else {
      input.value = value;
    }
    
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function showNotification(message) {
    const existing = document.getElementById('docfill-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'docfill-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 999999;
      background: #1e293b; color: white; padding: 14px 20px;
      border-radius: 10px; font-family: system-ui; font-size: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;
      max-width: 350px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  }

  // Note: No floating button. The extension only fills forms when the user
  // clicks "Fill Current Google Form" from the popup.
})();
