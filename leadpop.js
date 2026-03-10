(function() {
  'use strict';

  var cfg = window.LeadPopConfig || {};

  var config = {
    sheetsUrl:    cfg.sheetsUrl    || '',
    supabaseUrl:  cfg.supabaseUrl  || 'https://shurydpxamkasgsyeupe.supabase.co',
    supabaseKey:  cfg.supabaseKey  || 'sb_publishable_8VEQPBuMuiVsrCch2ODP_Q_9gxUgulB',
    clientId:     cfg.clientId     || window.location.hostname,
    notifyEmail:  cfg.notifyEmail  || '',
    heading:      cfg.heading      || 'Ta kontakt med oss',
    subtext:      cfg.subtext      || 'Fyll ut skjemaet så tar vi kontakt med deg.',
    buttonText:   cfg.buttonText   || 'Send forespørsel',
    fields:       cfg.fields       || ['name', 'company', 'phone', 'email'],
    primaryColor: cfg.primaryColor || '#d0021b',
    bgColor:      cfg.bgColor      || '#2e3440',
    cookieDays:   cfg.cookieDays   != null ? cfg.cookieDays : 7,
    label:        cfg.label        || 'Ta kontakt',
    successTitle:       cfg.successTitle       || 'Takk for din henvendelse',
    successText:        cfg.successText        || 'Vi tar kontakt med deg innen kort tid.',
    successRedirectUrl: cfg.successRedirectUrl || '',
    zIndex:             cfg.zIndex             || 999999
  };

  var FIELD_DEFS = {
    name:    { placeholder: 'Navn',    type: 'text',  autocomplete: 'name',         required: true },
    company: { placeholder: 'Bedrift', type: 'text',  autocomplete: 'organization', required: false },
    phone:   { placeholder: 'Telefon', type: 'tel',   autocomplete: 'tel',          required: false },
    email:   { placeholder: 'E-post',  type: 'email', autocomplete: 'email',        required: true }
  };

  var COOKIE_KEY = 'leadpop_seen_' + btoa(window.location.hostname).replace(/=/g,'');

  function hasSeen() {
    return document.cookie.split(';').some(function(c) {
      return c.trim().indexOf(COOKIE_KEY + '=') === 0;
    });
  }

  function setSeen() {
    if (config.cookieDays === 0) return;
    var exp = new Date();
    exp.setTime(exp.getTime() + config.cookieDays * 24 * 60 * 60 * 1000);
    document.cookie = COOKIE_KEY + '=1; expires=' + exp.toUTCString() + '; path=/';
  }

  function isLight(hex) {
    try {
      var n = parseInt(hex.replace('#',''), 16);
      return ((n>>16)*299 + ((n>>8)&0xff)*587 + (n&0xff)*114) / 1000 > 128;
    } catch(e) { return false; }
  }

  function injectStyles() {
    if (document.getElementById('leadpop-styles')) return;
    var bg = config.bgColor, primary = config.primaryColor, light = isLight(bg);
    var textColor = light ? '#1a2030' : '#e8ecf0';
    var subColor = light ? '#64748b' : '#8a9099';
    var strongColor = light ? '#334155' : '#c0c8d4';
    var inputBg = light ? '#f1f5f9' : shadeColor(bg, -18);
    var borderCol = light ? '#cbd5e1' : shadeColor(bg, 30);
    var inputColor = light ? '#334155' : '#e8ecf0';
    var placeholderColor = light ? '#94a3b8' : '#4a5260';
    var privacyColor = light ? '#94a3b8' : '#4a5260';
    var closeColor = light ? '#64748b' : '#888';
    var successTextColor = light ? '#64748b' : '#8a9099';
    var css = [
      '#leadpop-overlay{display:none;position:fixed;inset:0;background:rgba(10,14,20,.82);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:' + config.zIndex + ';align-items:center;justify-content:center;padding:20px;box-sizing:border-box}',
      '#leadpop-overlay.lp-active{display:flex;animation:lp-fadein .35s ease}',
      '@keyframes lp-fadein{from{opacity:0}to{opacity:1}}',
      '.leadpop-box{background:' + bg + ';border:1px solid ' + borderCol + ';border-top:3px solid ' + primary + ';border-radius:0;max-width:500px;width:100%;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.7);animation:lp-slideup .4s cubic-bezier(.16,1,.3,1);overflow:hidden}',
      '@keyframes lp-slideup{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}',
      '.leadpop-inner{padding:44px 44px 40px}',
      '.leadpop-close{position:absolute;top:16px;right:16px;background:transparent;border:1px solid ' + borderCol + ';color:' + closeColor + ';font-size:18px;line-height:1;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:0;transition:all .2s;font-family:sans-serif}',
      '.leadpop-close:hover{border-color:' + primary + ';color:' + primary + '}',
      '.leadpop-label{font-family:Montserrat,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:' + primary + ';margin-bottom:16px}',
      '.leadpop-heading{font-family:Montserrat,Arial,sans-serif;font-size:26px;font-weight:800;text-transform:uppercase;letter-spacing:.01em;color:' + textColor + ';line-height:1.1;margin-bottom:10px}',
      '.leadpop-sub{font-family:Montserrat,Arial,sans-serif;font-size:13px;color:' + subColor + ';line-height:1.6;margin-bottom:28px}',
      '.leadpop-sub strong{color:' + strongColor + ';font-weight:600}',
      '.leadpop-field{margin-bottom:12px}',
      '.leadpop-input{width:100%;background:' + inputBg + ';border:1px solid ' + borderCol + ';border-radius:0;color:' + inputColor + ';font-family:Montserrat,Arial,sans-serif;font-size:13px;padding:12px 16px;box-sizing:border-box;outline:none;transition:border-color .2s;-webkit-appearance:none}',
      '.leadpop-input::placeholder{color:' + placeholderColor + '}',
      '.leadpop-input:focus{border-color:' + primary + '}',
      '.leadpop-input.lp-error{border-color:' + primary + '}',
      '.leadpop-submit{width:100%;background:' + primary + ';color:#fff;border:none;border-radius:0;font-family:Montserrat,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:14px 24px;cursor:pointer;margin-top:8px;transition:background .2s}',
      '.leadpop-submit:hover{filter:brightness(.88)}',
      '.leadpop-submit:disabled{opacity:.5;cursor:not-allowed}',
      '.leadpop-privacy{font-family:Montserrat,Arial,sans-serif;font-size:10px;color:' + privacyColor + ';margin-top:12px;line-height:1.5}',
      '.leadpop-success{display:none;text-align:center;padding:56px 44px}',
      '.leadpop-success.lp-active{display:block;animation:lp-fadein .4s ease}',
      '.leadpop-success-icon{width:52px;height:52px;border:2px solid ' + primary + ';border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:20px;color:' + primary + '}',
      '.leadpop-success h3{font-family:Montserrat,Arial,sans-serif;font-size:20px;font-weight:800;text-transform:uppercase;color:' + textColor + ';margin-bottom:10px}',
      '.leadpop-success p{font-family:Montserrat,Arial,sans-serif;font-size:13px;color:' + successTextColor + ';line-height:1.6}',
      '@media(max-width:600px){.leadpop-inner{padding:32px 20px 28px}.leadpop-success{padding:40px 20px}.leadpop-heading{font-size:22px}}'
    ].join('');
    var style = document.createElement('style'); style.id = 'leadpop-styles'; style.textContent = css; document.head.appendChild(style);
    if (!document.querySelector('link[href*="Montserrat"]')) {
      var link = document.createElement('link'); link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }

  function shadeColor(hex, pct) {
    try {
      var num = parseInt(hex.replace('#',''), 16);
      var r = Math.min(255, Math.max(0, (num >> 16) + pct));
      var g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
      var b = Math.min(255, Math.max(0, (num & 0xff) + pct));
      return '#' + ((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
    } catch(e) { return hex; }
  }
  function buildHTML() {
    if (document.getElementById('leadpop-overlay')) return;
    var fieldsHTML = config.fields.map(function(f) {
      var def = FIELD_DEFS[f]; if (!def) return '';
      return '<div class="leadpop-field"><input type="' + def.type + '" id="leadpop-field-' + f + '" class="leadpop-input" placeholder="' + def.placeholder + (def.required ? ' *' : '') + '" autocomplete="' + def.autocomplete + '"></div>';
    }).join('');
    var html = '<div id="leadpop-overlay"><div class="leadpop-box">' +
      '<button class="leadpop-close" id="leadpop-close-btn" aria-label="Lukk">&#x2715;</button>' +
      '<div id="leadpop-form-wrap"><div class="leadpop-inner">' +
        '<div class="leadpop-label">' + config.label + '</div>' +
        '<h2 class="leadpop-heading">' + config.heading + '</h2>' +
        '<p class="leadpop-sub">' + config.subtext + '</p>' +
        fieldsHTML +
        '<button class="leadpop-submit" id="leadpop-submit-btn">' + config.buttonText + ' &rarr;</button>' +
        '<p class="leadpop-privacy">Vi deler aldri informasjonen din med tredjeparter.</p>' +
      '</div></div>' +
      '<div class="leadpop-success" id="leadpop-success">' +
        '<div class="leadpop-success-icon">&#10003;</div>' +
        '<h3>' + config.successTitle + '</h3>' +
        '<p>' + config.successText + '</p>' +
      '</div></div></div>';
    var div = document.createElement('div'); div.innerHTML = html; document.body.appendChild(div.firstChild);
    document.getElementById('leadpop-close-btn').addEventListener('click', LeadPop.close);
    document.getElementById('leadpop-overlay').addEventListener('click', function(e) { if (e.target === this) LeadPop.close(); });
    document.getElementById('leadpop-submit-btn').addEventListener('click', submitForm);
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') LeadPop.close(); });
  }

  function submitForm() {
    var values = {}, valid = true;
    config.fields.forEach(function(f) {
      var el = document.getElementById('leadpop-field-' + f); if (!el) return;
      var val = el.value.trim(), def = FIELD_DEFS[f] || {};
      el.classList.remove('lp-error');
      if (def.required && !val) { el.classList.add('lp-error'); valid = false; }
      values[f] = val;
    });
    if (!valid) return;
    var btn = document.getElementById('leadpop-submit-btn');
    btn.disabled = true; btn.textContent = 'Sender...';
    var payload = Object.assign({}, values, { client_id: config.clientId, source: 'LeadPop', page: window.location.href, timestamp: new Date().toISOString() });
    if (config.supabaseUrl && config.supabaseKey) {
      fetch(config.supabaseUrl + '/rest/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': config.supabaseKey, 'Authorization': 'Bearer ' + config.supabaseKey, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ client_id: payload.client_id, name: payload.name||null, company: payload.company||null, phone: payload.phone||null, email: payload.email||null, page: payload.page, source: payload.source })
      }).catch(function(){});
    }
    if (config.sheetsUrl) {
      fetch(config.sheetsUrl, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) }).catch(function(){});
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: 'leadpop_submitted' }, payload));
    if (typeof window.plausible === 'function') window.plausible('leadpop_submitted');
    document.getElementById('leadpop-form-wrap').style.display = 'none';
    document.getElementById('leadpop-success').classList.add('lp-active');
    setSeen();
    if (config.successRedirectUrl) {
      setTimeout(function() { window.location.href = config.successRedirectUrl; }, 2000);
    } else {
      setTimeout(function() { LeadPop.close(); }, 4000);
    }
  }

  var LeadPop = window.LeadPop = {
    show: function() {
      if (hasSeen()) return;
      injectStyles(); buildHTML();
      document.getElementById('leadpop-overlay').classList.add('lp-active');
      document.body.style.overflow = 'hidden';
      track('opened');
    },
    close: function() {
      var overlay = document.getElementById('leadpop-overlay');
      if (overlay) overlay.classList.remove('lp-active');
      document.body.style.overflow = '';
      setSeen(); track('closed');
    },
    reset: function() {
      document.cookie = COOKIE_KEY + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      var overlay = document.getElementById('leadpop-overlay'); if (overlay) overlay.remove();
      var styles = document.getElementById('leadpop-styles'); if (styles) styles.remove();
    }
  };

  function track(eventType) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'leadpop_' + eventType });
    if (typeof window.plausible === 'function') window.plausible('leadpop_' + eventType);
    if (config.supabaseUrl && config.supabaseKey) {
      fetch(config.supabaseUrl + '/rest/v1/popup_events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': config.supabaseKey, 'Authorization': 'Bearer ' + config.supabaseKey, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ client_id: config.clientId, event_type: eventType, page: window.location.href })
      }).catch(function(){});
    }
  }

  if (cfg.init === 'auto') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { LeadPop.show(); });
    } else { LeadPop.show(); }
  }

})();
