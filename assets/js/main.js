
// Load Header and Footer Partials
async function loadPartials() {
	try {
		// Load Header
		const headerResponse = await fetch('/partials/header.html');
		const headerHTML = await headerResponse.text();
		document.getElementById('header').innerHTML = headerHTML;

		// Load Footer
		const footerResponse = await fetch('/partials/footer.html');
		const footerHTML = await footerResponse.text();
		document.getElementById('footer').innerHTML = footerHTML;


		initNavigation();
		setActiveNavLink();
		initHeaderScroll();
		setupThemeToggle();
		
		console.log('Header scroll initialized after loading partial');
	} catch (error) {
		console.error('Error loading partials:', error);
	}

}

// Mobile Navigation Toggle
function initNavigation() {
	const navToggle = document.getElementById('navToggle');
	const navMenu = document.getElementById('navMenu');

	if (navToggle && navMenu) {
		navToggle.addEventListener('click', () => {
			navMenu.classList.toggle('active');
			navToggle.classList.toggle('active');

			// Prevent body scroll when menu is open
			document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
		});

		// Close menu when clicking outside
		document.addEventListener('click', (e) => {
			if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
				navMenu.classList.remove('active');
				navToggle.classList.remove('active');
				document.body.style.overflow = '';
			}
		});

		// Close menu when clicking a link
		const navLinks = navMenu.querySelectorAll('.nav-link');
		
		navLinks.forEach((link) => {
			link.addEventListener('click', () => {
				navMenu.classList.remove('active');
				navToggle.classList.remove('active');
				document.body.style.overflow = '';

			});
		});
	}
}

// Set Active Navigation Link Based on Current Page
function setActiveNavLink() {
	const currentPath = window.location.pathname;
	const navLinks = document.querySelectorAll('.nav-link');

	navLinks.forEach((link) => {
		link.classList.remove('active');
		const linkPath = new URL(link.href).pathname;

		// Match exact path or root
		if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
			link.classList.add('active');
		}
	});
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener('click', function (e) {
			const href = this.getAttribute('href');

			// Skip if it's just "#" or empty
			if (!href || href === '#') return;

			e.preventDefault();
			const target = document.querySelector(href);

			if (target) {
				const headerOffset = 80;
				const elementPosition = target.getBoundingClientRect().top;
				const offsetPosition =
				elementPosition + window.pageYOffset - headerOffset;

				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth',
				});
			}

		});
	});
}

// Add Scroll Animation on Elements
function initScrollAnimations() {
	const observerOptions = {
		threshold: 0.1,
		rootMargin: '0px 0px -100px 0px',
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('animate-fadeIn');
				observer.unobserve(entry.target);
			}
		});

	}, observerOptions);

	// Observe elements with data-animate attribute
	document.querySelectorAll('[data-animate]').forEach((el) => {
		observer.observe(el);
	});
}

// Header Scroll Effect (hide on scroll down, show on scroll up)
function initHeaderScroll() {
	const header = document.querySelector('.header');
	console.log('Header element found:', header);

	if (header) {
		let lastScrollY = window.scrollY;

		window.addEventListener('scroll', () => {
			const currentScrollY = window.scrollY;
			console.log('Scrolling', { currentScrollY, lastScrollY }); 

			// Add shadow when scrolled
			if (currentScrollY > 0) {
				header.style.boxShadow = 'var(--shadow-md)';
			} else {
				header.style.boxShadow = 'none';
			}

			// Hide header when scrolling down, show when scrolling up
			if (currentScrollY > lastScrollY) {
				header.classList.add('header-hidden');
			} else {
				header.classList.remove('header-hidden');
			}

			lastScrollY = currentScrollY;
		});
	}
}

// Utility: Debounce Function
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

function initSkillBars(){
	const skillCategories = document.querySelectorAll('.skill-category');

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const category = entry.target;
					const progressBars = category.querySelectorAll('.skill-progress');

					progressBars.forEach((bar) => {
						const targetWidth = bar.style.width;
						bar.style.setProperty('--progress-width', targetWidth);
					});

					observer.unobserve(category);

				}
			});
		},
		{
			threshold: 0.3,
		}
	);

	skillCategories.forEach((category) => observer.observe(category));
};



//* =================================================
//* ============= IMAGE SLIDER FUNCTIONALITY ========
//* ==================================================

let currentSlide = 0;
let slides = [];
let totalSlides = 0;

const updateSlider = () => {
    slides = document.querySelectorAll(".slide");
    totalSlides = slides.length;
    
    const dots = document.querySelectorAll(".dot");

    if (!slides || slides.length === 0) {
        console.log('No slides found');
        return;
    }

    console.log(`Updating slider: ${totalSlides} slides, current: ${currentSlide}`);

    slides.forEach((slide, index) => {
        slide.classList.remove("active", "prev", "next");

        const diff = index - currentSlide;

        if (diff === 0) {
            slide.classList.add("active");
        } else if (diff === -1 || (currentSlide === 0 && index === totalSlides - 1)) {
            slide.classList.add("prev");
        } else if (diff === 1 || (currentSlide === totalSlides - 1 && index === 0)) {
            slide.classList.add("next");
        }
    });



    // Enhanced dots with smooth transitions
    dots.forEach((dot, index) => {
        const isActive = index === currentSlide;
        
        // Remove active class from all first
        dot.classList.remove("active");
        dot.setAttribute('aria-current', 'false');
        
        // Add active class to current
        if (isActive) {
            dot.classList.add("active");
            dot.setAttribute('aria-current', 'true');
        }
    });

    // Announce slide change
    const activeSlide = slides[currentSlide];
    const slideTitle = activeSlide?.querySelector('h3')?.textContent;
    if (slideTitle && window.announcer) {
        window.announcer.announce(`Slide ${currentSlide + 1} of ${totalSlides}: ${slideTitle}`);
    }
}

function nextSlide() {
    slides = document.querySelectorAll(".slide");
    totalSlides = slides.length;
    currentSlide = (currentSlide + 1) % totalSlides;
    console.log('Next slide:', currentSlide);
    updateSlider();
}

function previousSlide() {
    slides = document.querySelectorAll(".slide");
    totalSlides = slides.length;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    console.log('Previous slide:', currentSlide);
    updateSlider();
}

function goToSlide(n) {
    currentSlide = n;
    console.log('Go to slide:', currentSlide);
    updateSlider();
}

function initSlider() {
    slides = document.querySelectorAll(".slide");
    totalSlides = slides.length;
    
    console.log('Initializing slider with', totalSlides, 'slides');
    
    if (totalSlides === 0) {
        console.log('No slides found to initialize');
        return;
    }
    
    currentSlide = 0;
    updateSlider();
}

window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.goToSlide = goToSlide;
window.initSlider = initSlider;

document.addEventListener("keydown", (e) => {
    slides = document.querySelectorAll(".slide");
    if (slides.length === 0) return;
    
    if (e.key === "ArrowLeft") previousSlide();
    if (e.key === "ArrowRight") nextSlide();
});

let touchStartX = 0;
let touchEndX = 0;

const handleSwipe = () => {
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) previousSlide();
}

document.addEventListener('touchstart', (e) => {
    const sliderContent = document.querySelector('.slider-content');
    if (sliderContent && sliderContent.contains(e.target)) {
        touchStartX = e.changedTouches[0].screenX;
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const sliderContent = document.querySelector('.slider-content');
    if (sliderContent && sliderContent.contains(e.target)) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }
}, { passive: true });

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(initSlider, 500);
    });
} else {
    setTimeout(initSlider, 500);
}



//* =================================================
//* ============= THEME MANAGEMENT ==================
//* =================================================

function initTheme() {
	// Add no-transition class to prevent animation on page load
	document.documentElement.classList.add('no-transition');
	
	// Check for saved theme preference or default to system preference
	const savedTheme = localStorage.getItem('theme');
	const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	
	// Determine initial theme
	const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
	
	// Apply theme
	document.documentElement.setAttribute('data-theme', theme);
	
	// Remove no-transition class after a short delay
	setTimeout(() => {
		document.documentElement.classList.remove('no-transition');
	}, 100);
}


function toggleTheme() {
	const currentTheme = document.documentElement.getAttribute('data-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	
	document.documentElement.setAttribute('data-theme', newTheme);
	
	localStorage.setItem('theme', newTheme);
	
	//* to track theme change with analytics
	if (typeof gtag !== 'undefined') {
		gtag('event', 'theme_toggle', {
			'event_category': 'User Interaction',
			'event_label': newTheme
		});
	}
}


function setupThemeToggle() {
	const themeToggle = document.getElementById('themeToggle');
	
	if (themeToggle) {
		themeToggle.addEventListener('click', toggleTheme);
		
		// Add keyboard support
		themeToggle.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggleTheme();
			}
		});
	}
}


function listenToSystemThemeChanges() {
	const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	
	darkModeMediaQuery.addEventListener('change', (e) => {
		// Only auto-switch if user hasn't set a preference
		if (!localStorage.getItem('theme')) {
			const newTheme = e.matches ? 'dark' : 'light';
			document.documentElement.setAttribute('data-theme', newTheme);
		}
	});
}

initTheme();



//* ==============================================
//* ==== STARRY NIGHT EFFECT - Dark Mode Only ====
//* ==============================================

function generateStars(container, count, layerClass) {
	const layer = document.createElement('div');
	layer.className = `stars-layer ${layerClass}`;
	
	for (let i = 0; i < count; i++) {
		const star = document.createElement('div');
		star.className = 'star';
		
		// Random position
		star.style.left = `${Math.random() * 100}%`;
		star.style.top = `${Math.random() * 100}%`;
		
		// Random animation delay for more natural twinkling
		star.style.animationDelay = `${Math.random() * 3}s`;
		
		// Random opacity for depth
		star.style.opacity = `${0.5 + Math.random() * 0.5}`;
		
		layer.appendChild(star);
	}
	
	container.appendChild(layer);
}



function createShootingStars(container) {
	// Define shooting star positions and timing
	const shootingStarData = [
		{ top: '20%', left: '10%', delay: '0s', duration: '3s' },
		{ top: '40%', left: '60%', delay: '5s', duration: '4s' },
		{ top: '70%', left: '30%', delay: '8s', duration: '3.5s' },
		{ top: '15%', left: '80%', delay: '12s', duration: '3.2s' },
		{ top: '60%', left: '5%', delay: '15s', duration: '3.8s' }
	];
	
	shootingStarData.forEach((data, index) => {
		const shootingStar = document.createElement('div');
		shootingStar.className = 'shooting-star';
		
		// Apply position and timing
		shootingStar.style.top = data.top;
		shootingStar.style.left = data.left;
		shootingStar.style.animationDelay = data.delay;
		shootingStar.style.animationDuration = data.duration;
		
		container.appendChild(shootingStar);
	});
	
	console.log(`Created ${shootingStarData.length} shooting stars`);
}


function createConstellation(container) {
	const constellation = document.createElement('div');
	constellation.className = 'constellation';
	
	// Define constellation points (percentage positions)
	const points = [
		{ x: 20, y: 30 },
		{ x: 35, y: 25 },
		{ x: 45, y: 40 },
		{ x: 30, y: 50 },
		{ x: 20, y: 30 } // Close the shape
	];
	
	// Create lines between points
	for (let i = 0; i < points.length - 1; i++) {
		const line = document.createElement('div');
		line.className = 'constellation-line';
		
		const x1 = points[i].x;
		const y1 = points[i].y;
		const x2 = points[i + 1].x;
		const y2 = points[i + 1].y;
		
		// Calculate line length and angle
		const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
		
		line.style.left = `${x1}%`;
		line.style.top = `${y1}%`;
		line.style.width = `${length}%`;
		line.style.transform = `rotate(${angle}deg)`;
		line.style.animationDelay = `${i * 0.5}s`;
		
		constellation.appendChild(line);
	}
	
	container.appendChild(constellation);
}

/**
 * Create nebula glow effects
 * @param {HTMLElement} container - The container to add nebulas to
 */
function createNebulas(container) {
	const nebula1 = document.createElement('div');
	nebula1.className = 'nebula-glow nebula-1';
	
	const nebula2 = document.createElement('div');
	nebula2.className = 'nebula-glow nebula-2';
	
	container.appendChild(nebula1);
	container.appendChild(nebula2);
}

/**
 * Initialize starry night effect on hero sections
 */
function initStarryNight() {
	// Find all hero sections that should have stars
	const heroSections = document.querySelectorAll('.hero, .page-hero');
	
	heroSections.forEach(hero => {
		// Check if stars container already exists
		if (hero.querySelector('.stars-container')) {
			return;
		}
		
		// Create stars container
		const starsContainer = document.createElement('div');
		starsContainer.className = 'stars-container';
		
		// Generate three layers of stars with different densities
		generateStars(starsContainer, 50, 'stars-layer-1');  // Small stars
		generateStars(starsContainer, 30, 'stars-layer-2');  // Medium stars
		generateStars(starsContainer, 15, 'stars-layer-3');  // Large stars
		
		// Add shooting stars
		createShootingStars(starsContainer);
		
		// Add constellation
		createConstellation(starsContainer);
		
		// Add nebula glows
		createNebulas(starsContainer);
		
		// Insert stars container as first child
		hero.insertBefore(starsContainer, hero.firstChild);
	});
	
	console.log('✨ Starry night effect initialized');
}


function refreshStars() {
	const existingStars = document.querySelectorAll('.stars-container');
	existingStars.forEach(container => container.remove());
	initStarryNight();
}

// Make functions globally accessible for dynamic pages
window.initStarryNight = initStarryNight;
window.refreshStars = refreshStars;





//* ================================
//* ===== GLASS MORPHISM CARDS =====
//* ================================

/**
 * Add floating glass cards to case study hero
 */
function addGlassCards() {
	const caseStudyHero = document.querySelector('.case-study-hero');
	
	// Check if hero exists and cards aren't already added
	if (!caseStudyHero || caseStudyHero.querySelector('.glass-card-1')) {
		return;
	}
	
	// Create 3 glass cards
	for (let i = 1; i <= 3; i++) {
		const glassCard = document.createElement('div');
		glassCard.className = `glass-card-${i}`;
		
		// Insert before the container (behind content)
		const container = caseStudyHero.querySelector('.container');
		if (container) {
			caseStudyHero.insertBefore(glassCard, container);
		} else {
			caseStudyHero.appendChild(glassCard);
		}
	}
	
	console.log('🪟 Glass morphism cards added');
}

// Make function globally accessible
window.addGlassCards = addGlassCards;


// Initialize Everything on DOM Load
document.addEventListener('DOMContentLoaded', () => {
	loadPartials();
	initSmoothScroll();
	initScrollAnimations();
	initHeaderScroll();
	initSkillBars();
	listenToSystemThemeChanges();
	


	//* Initialize starry night effect after a short delay
	//* to ensure hero sections are rendered
	setTimeout(() => {
		initStarryNight();
	}, 300);

	setTimeout(() => {
		addGlassCards();
	}, 500);

	console.log('Portfolio initialized!');
});

// Handle Window Resize (debounced)
window.addEventListener('resize', debounce(() => {
	// Close mobile menu on resize to desktop
	const navMenu = document.getElementById('navMenu');
	if (window.innerWidth > 768 && navMenu) {
		navMenu.classList.remove('active');
		document.body.style.overflow = '';
	}
}, 250));