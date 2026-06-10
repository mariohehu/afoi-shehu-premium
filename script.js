/* ΑΦΟΙ SHEHU — Premium Edition interactions */
(function () {
    'use strict';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    /* ---- Preloader ---- */
    window.addEventListener('load', () => {
        const pre = $('#preloader');
        if (pre) setTimeout(() => pre.classList.add('done'), 450);
    });

    document.addEventListener('DOMContentLoaded', () => {

        /* ---- Scroll progress + navbar ---- */
        const nav = $('#nav');
        const progress = $('#progress');
        const onScroll = () => {
            const st = window.scrollY || document.documentElement.scrollTop;
            if (nav) nav.classList.toggle('scrolled', st > 30);
            if (progress) {
                const h = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        /* ---- Smooth anchor scroll ---- */
        $$('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                const id = a.getAttribute('href');
                if (id === '#') return;
                const el = $(id);
                if (!el) return;
                e.preventDefault();
                const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
            });
        });

        /* ---- Mobile drawer ---- */
        const burger = $('#burger');
        const drawer = $('#drawer');
        const overlay = $('#drawerOverlay');
        const setDrawer = (open) => {
            if (!drawer) return;
            drawer.classList.toggle('open', open);
            overlay.classList.toggle('open', open);
            burger.setAttribute('aria-expanded', String(open));
            burger.querySelector('i').className = open ? 'ph ph-x' : 'ph ph-list';
            document.body.style.overflow = open ? 'hidden' : '';
        };
        if (burger) {
            burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
            overlay.addEventListener('click', () => setDrawer(false));
            $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));
        }

        /* ---- Reveal on scroll ---- */
        const revealEls = $$('[data-reveal]');
        if (reduce) {
            revealEls.forEach(el => el.classList.add('in'));
        } else {
            const ro = new IntersectionObserver((entries, obs) => {
                entries.forEach(en => {
                    if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            revealEls.forEach(el => ro.observe(el));
        }

        /* ---- Animated counters ---- */
        const counters = $$('[data-count]');
        const runCounter = (el) => {
            const target = parseInt(el.getAttribute('data-count'), 10) || 0;
            if (reduce) { el.textContent = target; return; }
            const dur = 1500;
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased);
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        if (counters.length) {
            const co = new IntersectionObserver((entries, obs) => {
                entries.forEach(en => {
                    if (en.isIntersecting) { runCounter(en.target); obs.unobserve(en.target); }
                });
            }, { threshold: 0.6 });
            counters.forEach(c => co.observe(c));
        }

        /* ---- Hero parallax (orbs + card tilt) ---- */
        if (!reduce && window.matchMedia('(pointer:fine)').matches) {
            const orbs = $$('[data-orb]');
            const card = $('#heroCard');
            const hero = $('.hero');
            if (hero) {
                hero.addEventListener('mousemove', (e) => {
                    const cx = (e.clientX / window.innerWidth - 0.5);
                    const cy = (e.clientY / window.innerHeight - 0.5);
                    orbs.forEach(o => {
                        const f = parseFloat(o.getAttribute('data-orb')) * 100;
                        o.style.transform = `translate(${cx * f}px, ${cy * f}px)`;
                    });
                    if (card) card.style.transform = `perspective(900px) rotateY(${cx * 6}deg) rotateX(${-cy * 6}deg)`;
                });
                hero.addEventListener('mouseleave', () => {
                    orbs.forEach(o => o.style.transform = '');
                    if (card) card.style.transform = '';
                });
            }
        }

        /* ---- Portfolio: dynamic gallery from projects.json (CMS) ---- */
        const gallery = $('#gallery');
        const CATS = {
            renovations: { label: 'Ανακαινίσεις', icon: 'ph-house' },
            drywall:     { label: 'Γυψοσανίδες', icon: 'ph-wall' },
            ironworks:   { label: 'Σιδηροκατασκευές', icon: 'ph-hammer' },
            churches:    { label: 'Εκκλησίες', icon: 'ph-church' },
            insulations: { label: 'Μονώσεις & Σκεπές', icon: 'ph-drop' }
        };

        const renderGallery = (data) => {
            const frag = document.createDocumentFragment();
            (data.projects || []).forEach(project => {
                const cat = CATS[project.category] || { label: project.title, icon: 'ph-image' };
                (project.images || []).forEach(src => {
                    const fig = document.createElement('figure');
                    fig.className = 'shot';
                    fig.setAttribute('data-cat', project.category);
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = project.title;
                    img.loading = 'lazy';
                    const cap = document.createElement('figcaption');
                    cap.className = 'cap';
                    cap.innerHTML = `<i class="ph-fill ${cat.icon}"></i> `;
                    cap.append(project.title);
                    fig.append(img, cap);
                    frag.append(fig);
                });
            });
            gallery.innerHTML = '';
            gallery.append(frag);
        };

        const applyFilter = (f) => {
            $$('.shot', gallery).forEach((s, i) => {
                const show = f === 'all' || s.getAttribute('data-cat') === f;
                s.hidden = !show;
                if (show && !reduce) {
                    s.style.animation = 'none';
                    void s.offsetWidth;
                    s.style.animation = `popIn 0.5s var(--ease) both`;
                    s.style.animationDelay = (i % 6) * 0.05 + 's';
                }
            });
        };

        const filters = $$('.filter');
        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilter(btn.getAttribute('data-filter'));
            });
        });

        if (gallery) {
            fetch('projects.json', { cache: 'no-cache' })
                .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
                .then(renderGallery)
                .catch(() => {
                    gallery.innerHTML = '<p class="load-note">Δεν ήταν δυνατή η φόρτωση των έργων. Δοκιμάστε ξανά αργότερα.</p>';
                });
        }

        /* ---- Lightbox (event delegation — works for dynamic shots) ---- */
        const lb = $('#lb'), lbImg = $('#lbImg'), lbClose = $('#lbClose');
        const openLb = (src, alt) => {
            lbImg.src = src; lbImg.alt = alt || '';
            lb.classList.add('open');
            document.body.style.overflow = 'hidden';
            lbClose.focus();
        };
        const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
        document.addEventListener('click', e => {
            const img = e.target.closest('.shot img');
            if (img) openLb(img.src, img.alt);
        });
        lbClose.addEventListener('click', closeLb);
        lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

        /* ---- Esc key ---- */
        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            if (lb.classList.contains('open')) closeLb();
            else if (drawer && drawer.classList.contains('open')) setDrawer(false);
        });

        /* ---- Floating-label support for <select> ---- */
        $$('.field select').forEach(sel => {
            const sync = () => sel.classList.toggle('filled', !!sel.value);
            sel.addEventListener('change', sync);
            sync();
        });

    });
})();
