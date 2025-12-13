// Get project ID from URL
function getProjectIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Load project data
async function loadProject() {
  const projectId = getProjectIdFromUrl();

  if (!projectId) {
    showError('No project specified');
    return;
  }

  try {
    const response = await fetch('/data/projects.json');
    const data = await response.json();
    const project = data.projects.find((p) => p.slug === projectId);

    if (!project) {
      showError('Project not found');
      return;
    }

    renderProject(project);
    updatePageMeta(project);
  } catch (error) {
    console.error('Error loading project:', error);
    showError('Unable to load project');
  }
}

// Render project content
function renderProject(project) {
  const container = document.getElementById('projectContent');

  container.innerHTML = `
		<!-- Hero Section -->
		<section class="case-study-hero">
		<div class="container">
			<div class="case-study-descriptions">
			
				<h1 data-animate>${project.title}</h1>
				<p class="case-study-subtitle" data-animate>
					${project.shortDescription}
				</p>
				
				<div class="case-study-meta" data-animate>
					${project.techStack.slice(0, 5).map(tech => 
					`<span class="badge">${tech.name}</span>`
					).join('')}
				</div>
				
				<div class="case-study-actions" data-animate>
					<a href="${project.liveUrl}" target="_blank" class="btn btn-primary btn-lg">
						<i class="bi bi-box-arrow-up-right"></i> View Live
					</a>
					<a href="${project.repoUrl}" target="_blank" class="btn btn-secondary btn-lg">
						<i class="bi bi-github"></i> View Code
					</a>
				</div>
			</div>
			
			<!-- Image Slider -->
			${project.gallery && project.gallery.length > 0 ? `
			<div class="image-slider" data-animate>
				<div class="slider-wrapper">
					<div class="slider-content">
						${project.gallery.map((slide, index) => `
							<div class="slide ${index === 0 ? 'active' : ''}">
								<img src="${slide.image}" alt="${slide.title}" class="slide-image">
								<div class="slide-text">
									<h3>${slide.title}</h3>
									<p>${slide.description}</p>
								</div>
							</div>
						`).join('')}
					</div>
				</div>
				
				<button class="slider-btn prev" onclick="previousSlide()">
					<i class="bi bi-chevron-left"></i>
				</button>
				<button class="slider-btn next" onclick="nextSlide()">
					<i class="bi bi-chevron-right"></i>
				</button>
				
				<div class="slider-dots">
					${project.gallery.map((_, index) => `
						<div class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
					`).join('')}
				</div>
				</div>
				` : `
				<div class="project-showcase" data-animate>
					<img src="${project.heroImage}" alt="${project.title} Interface" loading="lazy">
				</div>
				`}
			</div>
		</section>
		
		<!-- Overview Section -->
		<section class="content-section">
			<div class="container">
				<div class="section-intro" data-animate>
					<h2>Project Overview</h2>
					<p>
						${project.overview || project.shortDescription}
					</p>
				</div>
				
				<div class="info-cards">
					<div class="info-card" data-animate>
						<h3>The Challenge</h3>
						<p>
							${project.problem}
						</p>
					</div>
					
					<div class="info-card" data-animate>
						<h3>The Solution</h3>
						<p>
							${project.solution}
						</p>
					</div>
					
					<div class="info-card" data-animate>
						<h3>The Impact</h3>
						<p>
							${project.impact || project.results}
						</p>
					</div>
				</div>
			</div>
		</section>
		
		<!-- Problem & Goal Section -->
		<section class="content-section alt-bg">
			<div class="container">
				<div class="max-w-4xl mx-auto">
					<h2 class="text-3xl font-bold mb-2xl text-center" data-animate>Problem & Goal</h2>
					${
            project.problemGoal
              ? project.problemGoal
                  .map(
                    (p) => `
						<p class="text-xl text-secondary leading-relaxed" data-animate>
							${p}
						</p>
					`
                  )
                  .join('')
              : `
						<p class="text-xl text-secondary leading-relaxed" data-animate>
							${project.problem}
						</p>
						<p class="text-xl text-secondary leading-relaxed" data-animate>
							${project.solution}
						</p>
					`
          }
				</div>
			</div>
		</section>
		
		<!-- Process Section -->
		<section class="content-section">
			<div class="container">
				<div class="max-w-4xl mx-auto">
					<h2 class="text-3xl font-bold mb-3xl text-center" data-animate>Development Process</h2>
					
					<div class="process-timeline">
						${
              project.process
                ? project.process
                    .map(
                      (step, index) => `
							<div class="process-step" data-animate>
								<h3>${step.number}. ${step.title}</h3>
								<p>
									${step.description}
								</p>
								${
                  step.features
                    ? `
									<div class="feature-grid">
										${step.features
                      .map(
                        (feature) => `
											<div class="feature-item">
												<i class="${feature.icon}"></i>
												<p>${feature.text}</p>
											</div>
										`
                      )
                      .join('')}
									</div>
								`
                    : ''
                }
							</div>
						`
                    )
                    .join('')
                : ''
            }

						
					</div>
				</div>
			</div>
		</section>
		
		<!-- Tech Stack Section -->
		<section class="content-section alt-bg">
			<div class="container">
				<h2 class="text-3xl font-bold mb-3xl text-center" data-animate>Technologies Used</h2>
				
				<div class="tech-stack-grid">
					${
            Array.isArray(project.techStack) &&
            typeof project.techStack[0] === 'object'
              ? project.techStack
                  .map((tech) => {
                    // Handle both bi- (Bootstrap) and ri- (Remix) icon classes
                    const iconClass =
                      tech.icon.startsWith('bi-') || tech.icon.startsWith('ri-')
                        ? tech.icon
                        : `bi-${tech.icon}`;
                    return `
							<div class="tech-item" data-animate>
								<div class="tech-icon" style="background: ${tech.bg};">
									<i class="${iconClass}" style="color: ${tech.color};"></i>
								</div>
								<h4>${tech.name}</h4>
								<p>${tech.description}</p>
							</div>
						`;
                  })
                  .join('')
              : generateDefaultTechStack(project.techStack)
          }
				</div>
			</div>
		</section>
		
		<!-- Challenges Section -->
		${
      project.challenges
        ? `
		<section class="content-section">
			<div class="container">
				<div class="max-w-4xl mx-auto">
					<h2 class="text-3xl font-bold mb-3xl text-center" data-animate>Challenges & Solutions</h2>
					
					${project.challenges
            .map(
              (challenge) => `
						<div class="challenge-card" data-animate>
							<div class="challenge-header">
								<i class="bi bi-exclamation-triangle"></i>
								<h3>${challenge.title}</h3>
							</div>
							<p><strong>Problem:</strong> ${challenge.problem}</p>
							<p><strong>Solution:</strong> ${challenge.solution}</p>
						</div>
					`
            )
            .join('')}
				</div>
			</div>
		</section>
		`
        : ''
    }
		
		<!-- Results Section -->
		<section class="content-section alt-bg">
			<div class="container">
				<h2 class="text-3xl font-bold mb-3xl text-center" data-animate>Results & Impact</h2>
				
				<div class="results-grid">
					${
            project.results && Array.isArray(project.results)
              ? project.results
                  .map(
                    (result) => `
							<div class="result-card" data-animate>
								<div class="result-icon">
									<i class="${result.icon}" style="color: ${result.color};"></i>
								</div>
								<h4>${result.title}</h4>
								<p>${result.description}</p>
							</div>
						`
                  )
                  .join('')
              : generateDefaultResults()
          }
				</div>
			</div>
		</section>
		
		<!-- Lessons Learned Section -->
		${
      project.lessons
        ? `
		<section class="content-section">
			<div class="container">
				<div class="max-w-4xl mx-auto">
					<h2 class="text-3xl font-bold mb-3xl text-center" data-animate>Key Takeaways</h2>
					
					<ul class="lessons-list">
						${project.lessons
              .map(
                (lesson) => `
							<li data-animate>
								<i class="bi bi-lightbulb"></i>
								<p>
									<strong>${lesson.title}:</strong> ${lesson.description}
								</p>
							</li>
						`
              )
              .join('')}
					</ul>
				</div>
			</div>
		</section>
		`
        : ''
    }
		
		<!-- CTA Section -->
		<section class="cta-section">
			<div class="container">
				<div class="max-w-2xl mx-auto">
					<h2 data-animate>Experience ${project.title}</h2>
					<p data-animate>Try the live application or explore the source code to see how it's built</p>
					
					<div class="cta-buttons" data-animate>
						<a href="${project.liveUrl}" target="_blank" class="btn btn-primary btn-lg">
							<i class="bi bi-box-arrow-up-right"></i> View Live Project
						</a>
						<a href="${project.repoUrl}" target="_blank" class="btn btn-secondary btn-lg">
							<i class="bi bi-github"></i> View on GitHub
						</a>
					</div>
					
					<a href="/projects.html" class="back-to-projects" data-animate>
						<i class="bi bi-arrow-left"></i>
						Back to All Projects
					</a>
				</div>
			</div>
		</section>
		
		<!-- Next Project Section -->
		<section class="content-section">
			<div class="container">
				<div class="text-center">
					<h2 class="text-3xl font-bold mb-xl" data-animate>More Projects</h2>
					<p class="text-xl text-secondary mb-2xl" data-animate>
						Check out my other work to see more of what I can do
					</p>
					<a href="/projects.html" class="btn btn-primary btn-lg" data-animate>
						View All Projects
					</a>
				</div>
			</div>
		</section>
	`;

	// Re-initialize animations
	if (typeof initScrollAnimations === 'function') {
		setTimeout(() => {
			initScrollAnimations();
		}, 100);
	}

	// Re-initialize slider - IMPORTANT: Must wait for DOM to be ready
	setTimeout(() => {
		console.log('Attempting to initialize slider...');
		if (typeof window.initSlider === 'function') {
			window.initSlider();
		} else {
			console.error('initSlider function not found');
		}
	}, 500);

	// Add floating shapes
	setTimeout(() => {
		const heroSection = document.querySelector('.case-study-hero');
		if (heroSection && !heroSection.querySelector('.floating-shape')) {
			const shapes = ['shape-1', 'shape-2', 'shape-3'];
			shapes.forEach((shapeClass) => {
				const shape = document.createElement('div');
				shape.className = `floating-shape ${shapeClass}`;
				heroSection.insertBefore(shape, heroSection.firstChild);
			});
		}
	}, 100);

	// Re-initialize animations
	if (typeof initScrollAnimations === 'function') {
		setTimeout(() => {
			initScrollAnimations();
		}, 100);
	}

	// Re-initialize slider
	setTimeout(() => {
		if (typeof initSlider === 'function') {
			initSlider();
		}
	}, 200);
}

// Generate default tech stack if not detailed
function generateDefaultTechStack(techArray) {
  const techIcons = {
    React: {
      icon: 'bi-react',
      color: '#61DAFB',
      bg: 'rgba(97, 218, 251, 0.2)',
    },
    API: { icon: 'bi-plug', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.2)' },
    CSS: {
      icon: 'bi-palette',
      color: '#2965f1',
      bg: 'rgba(41, 101, 241, 0.2)',
    },
    LocalStorage: {
      icon: 'bi-floppy',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.2)',
    },
    Recharts: {
      icon: 'bi-bar-chart',
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.2)',
    },
    JavaScript: {
      icon: 'bi-code-slash',
      color: '#ea580c',
      bg: 'rgba(234, 88, 12, 0.2)',
    },
    'React Router': {
      icon: 'bi-signpost',
      color: '#61DAFB',
      bg: 'rgba(97, 218, 251, 0.2)',
    },
  };

  return techArray
    .map((tech) => {
      const techInfo = techIcons[tech] || {
        icon: 'bi-code-slash',
        color: '#6c5ce7',
        bg: 'rgba(108, 92, 231, 0.2)',
      };
      return `
			<div class="tech-item" data-animate>
				<div class="tech-icon" style="background: ${techInfo.bg};">
					<i class="${techInfo.icon}" style="color: ${techInfo.color};"></i>
				</div>
				<h4>${tech}</h4>
				<p>Core technology used in development</p>
			</div>
		`;
    })
    .join('');
}

// Generate default results
function generateDefaultResults() {
  const defaultResults = [
    {
      icon: 'bi-lightning-charge',
      color: '#F97316',
      title: 'Fast Performance',
      description: 'Optimized for speed and efficiency',
    },
    {
      icon: 'bi-phone',
      color: '#3B82F6',
      title: 'Fully Responsive',
      description: 'Works seamlessly across all devices',
    },
    {
      icon: 'bi-hand-thumbs-up',
      color: '#10B981',
      title: 'Intuitive UX',
      description: 'Easy to use and navigate',
    },
    {
      icon: 'bi-shield-check',
      color: '#8B5CF6',
      title: 'Reliable',
      description: 'Stable and error-free experience',
    },
  ];

  return defaultResults
    .map(
      (result) => `
		<div class="result-card" data-animate>
			<div class="result-icon">
				<i class="${result.icon}" style="color: ${result.color};"></i>
			</div>
			<h4>${result.title}</h4>
			<p>${result.description}</p>
		</div>
	`
    )
    .join('');
}

// Update page meta tags
function updatePageMeta(project) {
  document.title = `${project.title} - Case Study | Jerico Oliver`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = `${project.title} case study - ${project.shortDescription}`;
  }
}

// Show error message
function showError(message) {
  const container = document.getElementById('projectContent');
  container.innerHTML = `
		<section class="section-lg">
			<div class="container text-center">
				<h1 class="text-4xl font-bold mb-md">Project Not Found</h1>
				<p class="text-xl text-secondary mb-2xl">${message}</p>
				<a href="/projects.html" class="btn btn-primary">Back to Projects</a>
			</div>
		</section>
	`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadProject);
