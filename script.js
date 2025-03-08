// Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.nav-menu.mobile');
const closeBtn = document.querySelector('.nav-menu.mobile .close-btn');
const ctaButtons = document.querySelectorAll('.cta-button');

hamburger.addEventListener('click', () => {
    mobileNav.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    mobileNav.classList.remove('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            mobileNav.classList.remove('active');
        }
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    });
});

// CTA Button Redirect
ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = 'https://wa.me/919270017264?text=Hi%20It%20Is%20Unique%20Official%2C%0A%0AI%20would%20like%20to%20monetize%20our%20website%20using%20your%20popup%20ads.%20I%20have%20read%20and%20agree%20to%20your%20policy%2C%20terms%2C%20and%20conditions.%20Please%20let%20me%20know%20how%20we%20can%20proceed.%0A%0ALooking%20forward%20to%20your%20response.';
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Header Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    const header = document.querySelector('header');
    if (currentScroll > 50) {
        header.classList.add('scrolled');
        if (currentScroll > lastScroll) {
            header.style.transform = 'translateZ(-15px) rotateX(2deg) translateY(-100%)';
        } else {
            header.style.transform = 'translateZ(-15px) rotateX(2deg) translateY(0)';
        }
    } else {
        header.classList.remove('scrolled');
        header.style.transform = 'translateZ(0)';
    }
    lastScroll = currentScroll;
});

// Intersection Observer for Animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.25 });

document.querySelectorAll('.feature-card, .contact-employee').forEach(el => observer.observe(el));

// Page Load Animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Optimize Animation Performance
let rafId = null;
window.addEventListener('scroll', () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        document.querySelectorAll('.feature-card, .hero h1, .hero p, .contact-employee h2').forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                element.style.willChange = 'transform, opacity';
            } else {
                element.style.willChange = 'auto';
            }
        });
    });
});
