let allProjects = [];
let currentFilter = 'all';

function shuffleArray(array) {
	const shuffled = [...array]; // Create a copy to avoid mutating original
	
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	
	return shuffled;
}

async function loadProjects() {
	try {
		const response = await fetch('/data/projects.json');
		const data = await response.json();
		
		// Check if we have a saved order in sessionStorage
		const savedOrder = sessionStorage.getItem('projectsOrder');
		
		if (savedOrder) {
			// Use saved order
			const savedIds = JSON.parse(savedOrder);
			allProjects = savedIds.map(id => 
				data.projects.find(p => p.id === id)
			).filter(Boolean); // Filter out any nulls
			console.log('✓ Projects loaded from saved order');
		} else {
			// Shuffle projects for random order (first visit)
			allProjects = shuffleArray(data.projects);
			
			// Save the order to sessionStorage
			const projectIds = allProjects.map(p => p.id);
			sessionStorage.setItem('projectsOrder', JSON.stringify(projectIds));
			console.log('✓ Projects loaded and randomized (new session)');
		}
		
		renderProjects(allProjects);
		initializeFilters();

	} catch (error) {
		console.error('Error loading projects:', error);
		displayError();
	}

}



//? ===========================
//? ==== HELPER FUNCTIONS =====
//? ===========================

/* Get tech stack names from array */
function getTechStackNames(techStack) {
	if (!techStack || !Array.isArray(techStack)) return [];
	
	// Check if techStack contains objects or strings
	if (techStack.length > 0 && typeof techStack[0] === 'object') {
		return techStack.map(tech => tech.name);
	}
	
	return techStack;
}

// ==== RENDER PROJECTS TO DOM ====
function renderProjects(projects) {
	const container = document.getElementById('projectsContainer');
	
	if (!container) return;
	
	if (projects.length === 0) {
		container.innerHTML = `
			<div class="text-center" style="grid-column: 1/-1;">
				<p class="text-secondary">No projects found for this filter.</p>
			</div>
		`;
		return;
	}
	
	container.innerHTML = projects.map(project => {
		const techNames = getTechStackNames(project.techStack);
		
		return `
		<div class="project-card" data-category="${project.category}" data-featured="${project.featured}" data-animate>
			<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" aria-label="View ${project.title} live demo">
				<div class="project-card-image">
					<img 
						src="${project.heroImage}" 
						alt="${project.title} preview"
						loading="lazy"
						onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22600%22%3E%3Crect fill=%22%23f8f9fa%22 width=%221200%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23636e72%22 font-family=%22Arial%22 font-size=%2224%22%3EProject Image%3C/text%3E%3C/svg%3E'"
					>
				</div>
			</a>
			
			<div class="project-card-body">
				<h3 class="project-card-title">${project.title}</h3>
				<p class="project-card-description">${project.shortDescription}</p>
				
				<div class="tags mb-md" role="list" aria-label="Technologies used">
					${techNames.slice(0, 5).map(tech => 
						`<span class="tag" role="listitem">${tech}</span>`
					).join('')}
				</div>
				
				<div class="project-card-footer">
					<div class="project-card-links">
						${project.repoUrl ? `
							<a href="${project.repoUrl}" 
							   target="_blank" 
							   rel="noopener noreferrer" 
							   title="View ${project.title} source code"
							   aria-label="View ${project.title} code on GitHub">
								<i class="bi bi-github" aria-hidden="true"></i>
							</a>
						` : ''}
						${project.liveUrl ? `
							<a href="${project.liveUrl}" 
							   target="_blank" 
							   rel="noopener noreferrer" 
							   title="View ${project.title} live demo"
							   aria-label="View ${project.title} live demo">
								<i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
							</a>
						` : ''}
					</div>

					${project.hasCaseStudy !== false ? `
						<a href="/project.html?id=${project.slug}" class="project-card-study">Case Study</a>
					` : ''}
				</div>
			</div>
		</div>
		`;
	}).join('');
	
	// Re-initialize animations for new elements
	if (typeof initScrollAnimations === 'function') {
		initScrollAnimations();
	}
	
	// Announce to screen readers
	if (window.announcer) {
		window.announcer.announce(`Loaded ${projects.length} project${projects.length !== 1 ? 's' : ''}`);
	}
}


function filterProjects(filter) {
	currentFilter = filter;
	
	let filtered = allProjects;
	
	if (filter === 'featured') {
		filtered = allProjects.filter(p => p.featured === true);
	} else if (filter !== 'all') {
		filtered = allProjects.filter(p => p.category === filter);
	}
	
	
	renderProjects(filtered);
	
	// Announce filter change
	if (window.announcer) {
		const filterLabel = filter === 'all' ? 'All projects' : 
		                    filter === 'featured' ? 'Featured projects' :
		                    filter.charAt(0).toUpperCase() + filter.slice(1) + ' projects';
		window.announcer.announce(`Filtered to ${filterLabel}. Showing ${filtered.length} project${filtered.length !== 1 ? 's' : ''}`);
	}
}


function initializeFilters() {
	const filterButtons = document.querySelectorAll('.filter-btn');
	
	filterButtons.forEach(button => {
		button.addEventListener('click', () => {
			// Remove active class from all buttons
			filterButtons.forEach(btn => {
				btn.classList.remove('active');
				btn.setAttribute('aria-pressed', 'false');
			});
			
			// Add active class to clicked button
			button.classList.add('active');
			button.setAttribute('aria-pressed', 'true');
			
			// Get filter value and filter projects
			const filter = button.getAttribute('data-filter');
			filterProjects(filter);
		});
		
		// Keyboard support
		button.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				button.click();
			}
		});
	});
	
	// Set initial active state
	const activeButton = document.querySelector('.filter-btn.active');
	if (activeButton) {
		activeButton.setAttribute('aria-pressed', 'true');
	}
}


function displayError() {
	const container = document.getElementById('projectsContainer');
	if (container) {
		container.innerHTML = `
			<div class="text-center" style="grid-column: 1/-1;">
				<div style="padding: var(--space-3xl);">
					<i class="bi bi-exclamation-triangle" 
					   style="font-size: 3rem; color: var(--color-error); margin-bottom: var(--space-lg);"></i>
					<p class="text-secondary" style="font-size: var(--font-size-lg);">
						Unable to load projects. Please try again later.
					</p>
					<button onclick="loadProjects()" 
					        class="btn btn-primary" 
					        style="margin-top: var(--space-lg);">
						Retry
					</button>
				</div>
			</div>
		`;
	}
	
	// Announce error
	if (window.announcer) {
		window.announcer.announce('Error loading projects. Please try again.', 'assertive');
	}
}


function addShuffleButton() {
	const filtersContainer = document.getElementById('projectFilters');
	
	if (filtersContainer && !document.getElementById('shuffleBtn')) {
		const shuffleBtn = document.createElement('button');
		shuffleBtn.id = 'shuffleBtn';
		shuffleBtn.className = 'btn btn-sm filter-btn';
		shuffleBtn.innerHTML = '<i class="bi bi-shuffle" aria-hidden="true"></i> Shuffle';
		shuffleBtn.setAttribute('aria-label', 'Shuffle projects order');
		
		shuffleBtn.addEventListener('click', () => {

			allProjects = shuffleArray(allProjects);
			
			// Get current filter and re-apply it
			const activeFilter = document.querySelector('.filter-btn.active:not(#shuffleBtn)');
			const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
			filterProjects(filter);
			
			// Remove animation class after animation completes
			setTimeout(() => {
				shuffleBtn.classList.remove('shuffling');
			}, 600);
			
			if (window.announcer) {
				window.announcer.announce('Projects shuffled');
			}
		});
		
		shuffleBtn.style.transition = 'transform 0.3s ease';
		filtersContainer.appendChild(shuffleBtn);
	}
}


const style = document.createElement('style');
style.textContent = `
	.filter-btn {
		background: var(--color-surface);
		color: var(--text-secondary);
		border: 2px solid transparent;
		transition: all var(--transition-fast);
	}
	
	.filter-btn:hover {
		background: var(--color-primary-light);
		color: var(--color-primary-dark);
		transform: translateY(-2px);
	}
	
	.filter-btn.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}
	
	.filter-btn:focus-visible {
		outline: 3px solid var(--color-primary-light);
		outline-offset: 2px;
	}
	
	/* Shuffle button special styling */
	#shuffleBtn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}
	
	#shuffleBtn:hover {
		background: var(--color-warning);
		color: white;
	}
	
	/* Dark mode */
	[data-theme="dark"] .filter-btn {
		background: var(--color-background);
		color: var(--text-secondary);
	}
	
	[data-theme="dark"] .filter-btn:hover {
		background: rgba(108, 92, 231, 0.2);
		color: var(--color-primary-light);
	}
	
	[data-theme="dark"] .filter-btn.active {
		background: var(--color-primary);
		color: white;
	}
`;



//? =================================
//? ==== INITIALIZE ON PAGE LOAD ====
//? =================================

document.addEventListener('DOMContentLoaded', () => {
	// Only load projects if we're on the projects page
	if (document.getElementById('projectsContainer')) {
		loadProjects();
		
		// Optional: Add shuffle button (uncomment if you want it)
		setTimeout(() => addShuffleButton(), 500);
		
		console.log('✓ Projects page initialized with random ordering');
	}
});


// Observe images for lazy loading
if ('IntersectionObserver' in window) {
	document.addEventListener('DOMContentLoaded', () => {
		const imageObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const img = entry.target;
					if (img.dataset.src) {
						img.src = img.dataset.src;
						img.removeAttribute('data-src');
					}
					observer.unobserve(img);
				}
			});
		});
		
		// Observe all lazy images
		setTimeout(() => {
			document.querySelectorAll('img[loading="lazy"]').forEach(img => {
				imageObserver.observe(img);
			});
		}, 100);
	});
}

