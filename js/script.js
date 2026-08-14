// Blog: list of all posts (add new filenames here as you write them)
const POST_SLUGS = ['building-jarvis'];
// Projects: list of all project slugs (add new filenames here as you add projects)
const PROJECT_SLUGS = ['jarvis'];

// Loads all projects (reuses the same frontmatter parser as blog posts)
async function loadAllProjects() {
  return Promise.all(PROJECT_SLUGS.map(async slug => {
    const res = await fetch(`content/projects/${slug}.md`, { cache: 'no-store' });
    const raw = await res.text();
    const { meta } = parseFrontmatter(raw);
    return { slug, ...meta };
  }));
}

// Renders project cards into #project-list
async function initProjectsSection() {
  const container = document.getElementById('project-list');
  if (!container) return;

  const projects = await loadAllProjects();

  container.innerHTML = projects.map((p, i) => {
    const tags = p.tags.split(',').map(t => t.trim());
    const blogLink = p.blog
      ? `<a href="blog-post.html?post=${p.blog}">Read the writeup →</a>`
      : '';

    return `
      <div class="project-card reveal reveal-delay-${i + 1}">
        <div class="project-top">
          <div class="project-top-left">
            <div class="project-thumb"><img src="${p.thumb}" alt="${p.name} logo"></div>
            <span class="project-name">${p.name}</span>
          </div>
          <span class="project-arrow">→</span>
        </div>
        <div class="project-detail">
          <p class="project-desc">${p.desc}</p>
          <div class="project-tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>
          <div class="project-links">
            <a href="${p.live}" target="_blank" rel="noopener">Live site ↗</a>
            <a href="${p.code}" target="_blank" rel="noopener">View code ↗</a>
            ${blogLink}
          </div>
        </div>
      </div>
    `;
  }).join('');

  initScrollReveals();
}

// Fetches and parses a single markdown post
async function loadPost(slug) {
 const res = await fetch(`content/posts/${slug}.md`, { cache: 'no-store' });
  const raw = await res.text();
  return parseFrontmatter(raw);
}

// Splits frontmatter (metadata) from the markdown body
// Splits frontmatter (metadata) from the markdown body
function parseFrontmatter(raw) {
  // Normalize Windows line endings (\r\n) to plain \n first
  raw = raw.replace(/\r\n/g, '\n');

  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key) meta[key.trim()] = rest.join(':').trim();
  });

  return { meta, body: match[2].trim() };
}

// Loads all posts, sorted newest first
async function loadAllPosts() {
  const posts = await Promise.all(POST_SLUGS.map(async slug => {
    const { meta } = await loadPost(slug);
    return { slug, ...meta };
  }));
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Renders the post list on writing.html
async function initWritingPage() {
  const container = document.getElementById('post-list');
  if (!container) return;

  const posts = await loadAllPosts();
  container.innerHTML = posts.map((post, i) => `
    <a href="blog-post.html?post=${post.slug}" class="post-row reveal ${i < 2 ? 'reveal-delay-' + (i + 1) : ''}">
      <div class="post-meta">
        <span class="post-date">${formatDate(post.date)}</span>
      </div>
      <h3 class="post-title">${post.title}</h3>
      <p class="post-excerpt">${post.excerpt}</p>
    </a>
  `).join('');

  initScrollReveals();
}

// Renders a single post on blog-post.html
async function initBlogPostPage() {
  const container = document.getElementById('post-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('post');

  if (!slug || !POST_SLUGS.includes(slug)) {
    container.innerHTML = '<p class="about-text">Post not found.</p>';
    return;
  }

  const { meta, body } = await loadPost(slug);
  document.title = `${meta.title} — Mohammad Ali`;

  container.innerHTML = `
    <div class="eyebrow reveal">${formatDate(meta.date)}</div>
    <h1 class="post-page-title reveal reveal-delay-1">${meta.title}</h1>
    <div class="post-page-body reveal reveal-delay-2">${marked.parse(body)}</div>
  `;
  initScrollReveals();
}
// Renders a short preview (max 2 posts) on the homepage
async function initHomePreview() {
  const container = document.getElementById('post-list-preview');
  if (!container) return;

  const posts = (await loadAllPosts()).slice(0, 2);
  container.innerHTML = posts.map((post, i) => `
    <a href="blog-post.html?post=${post.slug}" class="post-row reveal reveal-delay-${i + 1}">
      <div class="post-meta"><span class="post-date">${formatDate(post.date)}</span></div>
      <h3 class="post-title">${post.title}</h3>
      <p class="post-excerpt">${post.excerpt}</p>
    </a>
  `).join('');

  initScrollReveals();
}
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
}
// Load shared nav and footer into every page
async function loadPartials() {
  const navPlaceholder = document.getElementById('nav-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (navPlaceholder) {
    const res = await fetch('partials/nav.html');
    navPlaceholder.innerHTML = await res.text();
    highlightActiveNavLink();
  }
  if (footerPlaceholder) {
    const res = await fetch('partials/footer.html');
    footerPlaceholder.innerHTML = await res.text();
  }
}

// Adds a visual indicator to the current page's nav link
function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

// Custom cursor
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, .project-card, .skill, .post-row').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

// Kinetic hero text — letters react to cursor proximity
// Kinetic hero text — letters react to cursor proximity
function initKineticHero() {
  const heroName = document.getElementById('heroName');
  if (!heroName) return;

  const words = heroName.textContent.trim().split(' ');
  heroName.innerHTML = words.map(word => {
    const letters = word.split('').map(ch => `<span>${ch}</span>`).join('');
    return `<span class="word">${letters}</span>`;
  }).join(' ');

  const letters = heroName.querySelectorAll('.word > span');

  document.addEventListener('mousemove', (e) => {
    letters.forEach(letter => {
      const rect = letter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const maxDist = 160;
      if (dist < maxDist) {
        const strength = 1 - dist / maxDist;
        const dx = (cx - e.clientX) * strength * 0.25;
        const dy = (cy - e.clientY) * strength * 0.25;
        letter.style.transform = `translate(${dx}px, ${dy}px)`;
        letter.style.fontVariationSettings = `'wght' ${400 + strength * 400}`;
      } else {
        letter.style.transform = 'translate(0, 0)';
        letter.style.fontVariationSettings = `'wght' 700`;
      }
    });
  });
}

// Scroll-triggered reveals
function initScrollReveals() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));
}

// Magnetic buttons
function initMagneticButtons() {
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();
  initCustomCursor();
  initKineticHero();
  initScrollReveals();
  initMagneticButtons();
  await initWritingPage();
  await initBlogPostPage();
  await initHomePreview();
  await initProjectsSection();

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }
});