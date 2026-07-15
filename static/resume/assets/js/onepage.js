// Renderer for the generated one-page resume.
// Variant is selected via the URL hash (#se / #rt); defaults to rt.
// When opened with ?print=1 it auto-opens the print dialog after rendering.

const VARIANTS = ['se', 'rt'];
const DEFAULT_VARIANT = 'rt';

function esc(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getVariant() {
    const hash = (window.location.hash || '').substring(1);
    return VARIANTS.includes(hash) ? hash : DEFAULT_VARIANT;
}

function renderContact(basics) {
    const parts = [];
    if (basics.location) parts.push(esc(basics.location));
    if (basics.phone) parts.push(esc(basics.phone));
    if (basics.email) parts.push(`<a href="mailto:${esc(basics.email)}">${esc(basics.email)}</a>`);
    (basics.profiles || []).forEach(p => {
        parts.push(`<a href="${esc(p.url)}">${esc(p.text)}</a>`);
    });
    if (basics.onlineUrl) {
        const label = basics.onlineLabel || 'Online version';
        parts.push(`<a class="online-link" href="${esc(basics.onlineUrl)}">${esc(label)}</a>`);
    }
    return parts.join(' &nbsp;|&nbsp; ');
}

function renderExperience(work) {
    return (work || []).map(job => {
        const bullets = (job.highlights || []).map(h => `<li>${esc(h)}</li>`).join('');
        const loc = job.location ? `, ${esc(job.location)}` : '';
        return `<div class="job">
      <div class="job-header">
        <span class="title-line"><strong>${esc(job.name)}</strong> &mdash; ${esc(job.position)}${loc}</span>
        <span class="dates">${esc(job.dates)}</span>
      </div>
      <ul class="bullets">${bullets}</ul>
    </div>`;
    }).join('');
}

function renderEarlierCareer(ec) {
    if (!ec || !ec.items || !ec.items.length) return '';
    const heading = esc(ec.heading || 'Earlier Career');
    const items = ec.items.map(esc).join(' &middot; ');
    return `<strong>${heading}:</strong> ${items}`;
}

function renderSkills(skills) {
    return (skills || []).map(s => {
        const kw = Array.isArray(s.keywords) ? s.keywords.join(', ') : (s.keywords || '');
        return `<tr><td class="skill-label">${esc(s.label)}</td><td>${esc(kw)}</td></tr>`;
    }).join('');
}

function render(data) {
    const basics = data.basics || {};
    document.title = `${basics.name || 'Resume'} - Resume`;
    document.getElementById('name').textContent = basics.name || '';
    document.getElementById('label').textContent = basics.label || '';
    document.getElementById('contact').innerHTML = renderContact(basics);
    document.getElementById('summary').textContent = data.summary || '';
    document.getElementById('experience').innerHTML = renderExperience(data.work);
    document.getElementById('earlier-career').innerHTML = renderEarlierCareer(data.earlierCareer);
    document.getElementById('skills').innerHTML = renderSkills(data.skills);
    document.getElementById('education').innerHTML = (data.education || []).map(esc).join('<br>');
}

function showError(message) {
    const el = document.getElementById('error');
    el.textContent = `Error loading resume: ${message}`;
    el.style.display = 'block';
}

async function load() {
    const variant = getVariant();
    try {
        const response = await fetch(`../data/onepage-${variant}.resume.json`);
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        render(data);
        if (new URLSearchParams(window.location.search).get('print') === '1') {
            // Give layout/fonts a moment before invoking the print dialog.
            setTimeout(() => window.print(), 400);
        }
    } catch (err) {
        showError(err.message);
    }
}

document.addEventListener('DOMContentLoaded', load);
// Re-render when switching variants via hash.
window.addEventListener('hashchange', () => window.location.reload());
