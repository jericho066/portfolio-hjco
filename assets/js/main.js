
const logger = {
	isDevelopment: window.location.hostname === 'localhost' || 
	               window.location.hostname === '127.0.0.1',
	
	log(...args) {
		if (this.isDevelopment) {
			console.log(...args);
		}
	},
	
	warn(...args) {
		if (this.isDevelopment) {
			console.warn(...args);
		}
	},
	
	error(...args) {
		// Always log errors, even in production
		console.error(...args);
	}
};


/**
 * Global error handler for uncaught errors
 * Shows user-friendly messages and logs errors
 */
window.addEventListener('error', (event) => {
	logger.error('Global error caught:', {
		message: event.message,
		filename: event.filename,
		line: event.lineno,
		column: event.colno,
		error: event.error
	});
	
	// Show user-friendly message
	showUserFriendlyError('Something went wrong. Please refresh the page.');
});



//? =================================
//? ==== SCREEN READER ANNOUNCER ====
//? =================================

const announcer = {
    element: null,
    timeout: null,
    
    /**
     * Initialize the announcer
     */
    init() {
        this.element = document.getElementById('announcer');
        if (!this.element) {
            logger.warn('Announcer element not found');
        }
    },
    
    /**
     * Announce a message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    announce(message, priority = 'polite') {
        if (!this.element) return;
        
        // Clear previous timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        
        // Set priority
        this.element.setAttribute('aria-live', priority);
        
        // Clear and set message
        this.element.textContent = '';
        
        setTimeout(() => {
            this.element.textContent = message;
        }, 100);
        
        // Clear after announcement
        this.timeout = setTimeout(() => {
            this.element.textContent = '';
        }, 1000);
    }
};

// Make globally available
window.announcer = announcer;


/**
 * Display user-friendly error message
 * @param {string} message - Error message to display
 */
function showUserFriendlyError(message) {
	const errorDiv = document.createElement('div');
	errorDiv.className = 'global-error-message';
	errorDiv.innerHTML = `
		<div class="error-content">
			<i class="bi bi-exclamation-triangle"></i>
			<span>${message}</span>
			<button onclick="this.parentElement.parentElement.remove()" aria-label="Close error message">
				<i class="bi bi-x"></i>
			</button>
		</div>
	`;
	
	document.body.appendChild(errorDiv);
	
	// Auto-remove after 5 seconds
	setTimeout(() => {
		if (errorDiv.parentElement) {
			errorDiv.remove();
		}
	}, 5000);
}

//? ===================================
//? ==== MODULAR SLIDER CONTROLLER ====
//? ===================================

const SliderController = {
	currentSlide: 0,
	slides: [],
	totalSlides: 0,
	autoplayInterval: null,
	
	/**
	 * Initialize the slider
	 * @returns {boolean} Success status
	 */
	init() {
		this.slides = document.querySelectorAll('.slide');
		this.totalSlides = this.slides.length;
		
		if (this.totalSlides === 0) {
			logger.log('No slides found to initialize');
			return false;
		}
		
		this.currentSlide = 0;
		this.update();
		this.attachEventListeners();
		
		logger.log(`✓ Slider initialized with ${this.totalSlides} slides`);
		return true;
	},
	
	/**
	 * Update slider display
	 */
	update() {
		const slides = this.slides;
		const dots = document.querySelectorAll('.dot');
		
		if (!slides || slides.length === 0) return;
		
		slides.forEach((slide, index) => {
			slide.classList.remove('active', 'prev', 'next');
			
			const diff = index - this.currentSlide;
			
			if (diff === 0) {
				slide.classList.add('active');
			} else if (diff === -1 || (this.currentSlide === 0 && index === this.totalSlides - 1)) {
				slide.classList.add('prev');
			} else if (diff === 1 || (this.currentSlide === this.totalSlides - 1 && index === 0)) {
				slide.classList.add('next');
			}

		});
		
		// Update dots
		dots.forEach((dot, index) => {
			const isActive = index === this.currentSlide;
			dot.classList.toggle('active', isActive);
			dot.setAttribute('aria-current', isActive ? 'true' : 'false');
		});
		
		// Announce to screen readers
		this.announce();
	},
	
	/**
	 * Navigate to next slide
	 */
	next() {
		this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
		this.update();
	},
	
	/**
	 * Navigate to previous slide
	 */
	previous() {
		this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
		this.update();
	},
	
	/**
	 * Go to specific slide
	 * @param {number} index - Slide index
	 */
	goTo(index) {
		if (index >= 0 && index < this.totalSlides) {
			this.currentSlide = index;
			this.update();
		}
	},
	
	/**
	 * Announce slide change to screen readers
	 */
	announce() {
		const activeSlide = this.slides[this.currentSlide];
		const slideTitle = activeSlide?.querySelector('h3')?.textContent;
		
		if (slideTitle && window.announcer) {
			window.announcer.announce(
				`Slide ${this.currentSlide + 1} of ${this.totalSlides}: ${slideTitle}`
			);
		}
	},
	
	/**
	 * Attach keyboard and touch event listeners
	 */
	attachEventListeners() {
		// Keyboard navigation
		document.addEventListener('keydown', (e) => {
			if (this.slides.length === 0) return;
			
			if (e.key === 'ArrowLeft') {
				this.previous();
			} else if (e.key === 'ArrowRight') {
				this.next();
			}
		});
		
		// Touch navigation
		let touchStartX = 0;
		let touchEndX = 0;
		
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
				this.handleSwipe(touchStartX, touchEndX);
			}
		}, { passive: true });
	},
	
	/**
	 * Handle swipe gesture
	 * @param {number} startX - Touch start X position
	 * @param {number} endX - Touch end X position
	 */
	handleSwipe(startX, endX) {
		const threshold = 50;
		if (endX < startX - threshold) {
			this.next();
		} else if (endX > startX + threshold) {
			this.previous();
		}
	}
};

// Expose methods globally for onclick handlers (backward compatibility)
window.nextSlide = () => SliderController.next();
window.previousSlide = () => SliderController.previous();
window.goToSlide = (index) => SliderController.goTo(index);
window.initSlider = () => SliderController.init();



//? ====================================================
//? ==== IMPROVED ASYNC LOADING WITH ERROR HANDLING ====
//? ====================================================

async function loadPartials() {
	try {
		// Load both partials in parallel for better performance
		const [headerResponse, footerResponse] = await Promise.all([
			fetch('/partials/header.html'),
			fetch('/partials/footer.html')
		]);
		
		// Check if responses are ok
		if (!headerResponse.ok) {
			throw new Error(`Header load failed: ${headerResponse.status}`);
		}
		if (!footerResponse.ok) {
			throw new Error(`Footer load failed: ${footerResponse.status}`);
		}
		
		// Get HTML content
		const [headerHTML, footerHTML] = await Promise.all([
			headerResponse.text(),
			footerResponse.text()

		]);
		
		// Insert into DOM
		const headerElement = document.getElementById('header');
		const footerElement = document.getElementById('footer');
		
		if (headerElement) headerElement.innerHTML = headerHTML;
		if (footerElement) footerElement.innerHTML = footerHTML;
		
		// Initialize components that depend on header/footer
		initNavigation();
		setActiveNavLink();
		initHeaderScroll();
		setupThemeToggle();
		

		logger.log('✓ Partials loaded successfully');
		
	} catch (error) {
		logger.error('Error loading partials:', error);
		showUserFriendlyError('Unable to load page components. Please refresh.');
		// throw error;
	}
}

function initNavigation() {
	const navToggle = document.getElementById('navToggle');
	const navMenu = document.getElementById('navMenu');
	
	if (!navToggle || !navMenu) return;
	
	// Set initial ARIA attributes
	navToggle.setAttribute('aria-expanded', 'false');
	navToggle.setAttribute('aria-controls', 'navMenu');
	
	navToggle.addEventListener('click', () => {
		const isActive = navMenu.classList.toggle('active');
		navToggle.classList.toggle('active');
		
		// Update ARIA state
		navToggle.setAttribute('aria-expanded', isActive.toString());
		
		// Prevent body scroll when menu is open
		document.body.style.overflow = isActive ? 'hidden' : '';
		
		// Announce to screen readers
		if (window.announcer) {
			window.announcer.announce(
				isActive ? 'Navigation menu opened' : 'Navigation menu closed'
			);
		}
	});
	
	// Close menu when clicking outside
	document.addEventListener('click', (e) => {
		if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
			navMenu.classList.remove('active');
			navToggle.classList.remove('active');
			navToggle.setAttribute('aria-expanded', 'false');
			document.body.style.overflow = '';
		}
	});
	
	// Close menu when clicking a link
	const navLinks = navMenu.querySelectorAll('.nav-link');
	navLinks.forEach((link) => {
		link.addEventListener('click', () => {
			navMenu.classList.remove('active');
			navToggle.classList.remove('active');
			navToggle.setAttribute('aria-expanded', 'false');
			document.body.style.overflow = '';
		});
	});
}

/**
 * Set active navigation link based on current page
 */
function setActiveNavLink() {
	const currentPath = window.location.pathname;
	const navLinks = document.querySelectorAll('.nav-link');
	
	navLinks.forEach((link) => {
		link.classList.remove('active');
		link.removeAttribute('aria-current');
		
		const linkPath = new URL(link.href).pathname;
		
		// Match exact path or root
		if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
			link.classList.add('active');
			link.setAttribute('aria-current', 'page');
		}
	});
}

/**
 * Initialize smooth scroll for anchor links
 */
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
				const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
				
				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth',
				});
				
				// Set focus for keyboard users
				target.setAttribute('tabindex', '-1');
				target.focus();
			}
		});
	});
}

/**
 * Add scroll animations using Intersection Observer
 */
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

/**
 * Initialize header scroll behavior (hide on scroll down, show on scroll up)
 */
function initHeaderScroll() {
	const header = document.querySelector('.header');
	
	if (!header) {
		logger.warn('Header element not found');
		return;
	}
	
	let lastScrollY = window.scrollY;
	let ticking = false;
	
	const updateHeader = () => {
		const currentScrollY = window.scrollY;
		
		// Add shadow when scrolled
		header.style.boxShadow = currentScrollY > 0 ? 'var(--shadow-md)' : 'none';
		
		// Hide header when scrolling down, show when scrolling up
		if (currentScrollY > lastScrollY && currentScrollY > 100) {
			header.classList.add('header-hidden');
		} else {
			header.classList.remove('header-hidden');
		}
		
		lastScrollY = currentScrollY;
		ticking = false;
	};
	
	window.addEventListener('scroll', () => {
		if (!ticking) {
			window.requestAnimationFrame(updateHeader);
			ticking = true;
		}
	}, { passive: true });
	
	logger.log('✓ Header scroll initialized');
}

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

/**
 * Initialize skill progress bars animation
 */
function initSkillBars() {
	const skillCategories = document.querySelectorAll('.skill-category');
	
	if (skillCategories.length === 0) return;
	
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
		{ threshold: 0.3 }
	);
	
	skillCategories.forEach((category) => observer.observe(category));
}


//? ==========================
//? ==== THEME MANAGEMENT ====
//? ==========================

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
	
	logger.log(`✓ Theme initialized: ${theme}`);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
	const currentTheme = document.documentElement.getAttribute('data-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	
	document.documentElement.setAttribute('data-theme', newTheme);
	localStorage.setItem('theme', newTheme);
	
	// Announce to screen readers
	if (window.announcer) {
		window.announcer.announce(`Switched to ${newTheme} mode`);
	}
	
	logger.log(`Theme toggled to: ${newTheme}`);
}

/**
 * Setup theme toggle button
 */
function setupThemeToggle() {
	const themeToggle = document.getElementById('themeToggle');
	
	if (!themeToggle) {
		logger.warn('Theme toggle button not found');
		return;
	}
	
	themeToggle.addEventListener('click', toggleTheme);
	
	// Keyboard support
	themeToggle.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleTheme();
		}
	});
	
	logger.log('✓ Theme toggle initialized');
}

/**
 * Listen to system theme changes
 */
function listenToSystemThemeChanges() {
	const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	
	darkModeMediaQuery.addEventListener('change', (e) => {
		// Only auto-switch if user hasn't set a preference
		if (!localStorage.getItem('theme')) {
			const newTheme = e.matches ? 'dark' : 'light';
			document.documentElement.setAttribute('data-theme', newTheme);
			
			if (window.announcer) {
				window.announcer.announce(`System theme changed to ${newTheme} mode`);
			}
		}
	});
}



//? =============================
//? ==== STARRY NIGHT EFFECT ====
//? =============================

function generateStars(container, count, layerClass) {
	const layer = document.createElement('div');
	layer.className = `stars-layer ${layerClass}`;
	
	for (let i = 0; i < count; i++) {
		const star = document.createElement('div');
		star.className = 'star';
		
		// Random position
		star.style.left = `${Math.random() * 100}%`;
		star.style.top = `${Math.random() * 100}%`;
		
		// Random animation delay
		star.style.animationDelay = `${Math.random() * 3}s`;
		
		// Random opacity for depth
		star.style.opacity = `${0.5 + Math.random() * 0.5}`;
		
		layer.appendChild(star);
	}
	
	container.appendChild(layer);
}

/**
 * Initialize starry night effect on hero sections
 */
function initStarryNight() {
	const heroSections = document.querySelectorAll('.hero, .page-hero');
	
	heroSections.forEach(hero => {
		// Check if stars already exist
		if (hero.querySelector('.stars-container')) return;
		
		const starsContainer = document.createElement('div');
		starsContainer.className = 'stars-container';
		
		// Generate three layers with different densities
		generateStars(starsContainer, 50, 'stars-layer-1');
		generateStars(starsContainer, 30, 'stars-layer-2');
		generateStars(starsContainer, 15, 'stars-layer-3');
		
		// Add shooting stars
		createShootingStars(starsContainer);
		hero.insertBefore(starsContainer, hero.firstChild);
	});
	
	logger.log('✨ Starry night effect initialized');
}

// Expose globally
window.initStarryNight = initStarryNight;


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


//? ==============================
//? ==== GLASS MORPHISM CARDS ====
//? ==============================

function addGlassCards() {
	const caseStudyHero = document.querySelector('.case-study-hero');
	
	if (!caseStudyHero || caseStudyHero.querySelector('.glass-card-1')) {
		return;
	}
	
	// Create 3 glass cards
	for (let i = 1; i <= 3; i++) {
		const glassCard = document.createElement('div');
		glassCard.className = `glass-card-${i}`;
		
		const container = caseStudyHero.querySelector('.container');
		if (container) {
			caseStudyHero.insertBefore(glassCard, container);
		} else {
			caseStudyHero.appendChild(glassCard);
		}
	}
	
	logger.log('🪟 Glass morphism cards added');
}

window.addGlassCards = addGlassCards;



//? ========================
//? ==== INITIALIZATION ====
//? ========================

document.addEventListener('DOMContentLoaded', () => {
	logger.log('🚀 Portfolio initialization started...');
	
	announcer.init();

	// Initialize theme first
	initTheme();
	
	loadPartials();
	
	// Initialize animations and interactions
	initSmoothScroll();
	initScrollAnimations();
	initSkillBars();
	listenToSystemThemeChanges();
	
	// Initialize effects with delays for better performance
	setTimeout(() => {
		initStarryNight();
	}, 300);
	
	setTimeout(() => {
		addGlassCards();
	}, 500);
	
	logger.log('✅ Portfolio initialized successfully!');
});



//? ===============================
//? ==== WINDOW RESIZE HANDLER ====
//? ===============================

window.addEventListener('resize', debounce(() => {
	// Close mobile menu on resize to desktop
	const navMenu = document.getElementById('navMenu');
	const navToggle = document.getElementById('navToggle');
	
	if (window.innerWidth > 768 && navMenu) {
		navMenu.classList.remove('active');
		if (navToggle) {
			navToggle.classList.remove('active');
			navToggle.setAttribute('aria-expanded', 'false');
		}
		document.body.style.overflow = '';
	}
}, 250));

// ============================================================================
// ==== PERFORMANCE MONITORING (Optional - Development Only)
// ============================================================================

if (logger.isDevelopment && 'PerformanceObserver' in window) {
	try {
		// Monitor First Contentful Paint
		const paintObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				logger.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
			}
		});
		paintObserver.observe({ entryTypes: ['paint'] });
		
		// Monitor Largest Contentful Paint
		const lcpObserver = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1];
			logger.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
		});
		lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
		
	} catch (error) {
		logger.error('Performance monitoring error:', error);
	}
}

