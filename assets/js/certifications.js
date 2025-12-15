

// Certificate images mapping
const certificateImages = {
	'fcc-rwdv8': '/assets/img/certifications/fcc-responsive-web-design.png'
	// 'fcc-js': '/assets/img/certifications/fcc-javascript.png',
	// 'fcc-fed': '/assets/img/certifications/fcc-frontend-libraries.png',
};



function openCertificateModal(certificateId) {
	const modal = document.getElementById('certificateModal');
	const certificateImage = document.getElementById('certificateImage');
	
	if (!modal || !certificateImage) {
		console.error('Modal elements not found');
		return;
	}
	
	// Get certificate image path
	const imagePath = certificateImages[certificateId];
	
	if (!imagePath) {
		console.error(`Certificate image not found for ID: ${certificateId}`);
		return;
	}
	
	// Set image and show modal
	certificateImage.src = imagePath;
	certificateImage.alt = `Certificate Preview - ${certificateId}`;
	modal.classList.add('active');
	
	// Prevent body scroll
	document.body.style.overflow = 'hidden';
	
	// Add escape key listener
	document.addEventListener('keydown', handleModalEscape);
	
	// Add smooth fade-in to image
	certificateImage.style.opacity = '0';
	certificateImage.onload = () => {
		setTimeout(() => {
			certificateImage.style.transition = 'opacity 0.3s ease';
			certificateImage.style.opacity = '1';
		}, 50);
	};
}



function closeCertificateModal() {
	const modal = document.getElementById('certificateModal');
	
	if (!modal) return;
	
	modal.classList.remove('active');
	
	// Restore body scroll
	document.body.style.overflow = '';
	
	// Remove escape key listener
	document.removeEventListener('keydown', handleModalEscape);
}



function handleModalEscape(e) {
	if (e.key === 'Escape') {
		closeCertificateModal();
	}
}

/**
 * Initialize certifications animations
 * Animates progress bars when they come into view
 */
function initCertificationsAnimations() {
	const progressBars = document.querySelectorAll('.progress-fill');
	
	if (progressBars.length === 0) return;
	
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const progressBar = entry.target;
					const targetWidth = progressBar.style.width;
					
					// Reset width first
					progressBar.style.width = '0%';
					
					// Animate to target width
					setTimeout(() => {
						progressBar.style.width = targetWidth;
					}, 100);
					
					// Unobserve after animation
					observer.unobserve(progressBar);
				}
			});
		},
		{
			threshold: 0.3,
		}
	);
	
	progressBars.forEach((bar) => observer.observe(bar));
}

/**
 * Update certificate progress
 * Call this function to dynamically update progress
 * @param {string} certificateId - The certificate card identifier
 * @param {number} progress - Progress percentage (0-100)
 */
function updateCertificateProgress(certificateId, progress) {
	const card = document.querySelector(`[data-certificate-id="${certificateId}"]`);
	
	if (!card) {
		console.error(`Certificate card not found: ${certificateId}`);
		return;
	}
	
	const progressFill = card.querySelector('.progress-fill');
	const progressPercentage = card.querySelector('.progress-percentage');
	
	if (progressFill) {
		progressFill.style.width = `${progress}%`;
	}
	
	if (progressPercentage) {
		progressPercentage.textContent = `${progress}%`;
	}
}

/**
 * Check if certificate image exists
 * @param {string} imagePath - Path to the certificate image
 * @returns {Promise<boolean>}
 */
async function certificateImageExists(imagePath) {
	try {
		const response = await fetch(imagePath, { method: 'HEAD' });
		return response.ok;
	} catch (error) {
		return false;
	}
}

/**
 * Validate all certificate images on page load
 */
async function validateCertificateImages() {
	for (const [id, path] of Object.entries(certificateImages)) {
		const exists = await certificateImageExists(path);
		if (!exists) {
			console.warn(`Certificate image missing: ${path} (ID: ${id})`);
		}
	}
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
	// Only initialize if we're on the about page
	if (document.querySelector('.section-certifications')) {
		initCertificationsAnimations();
		
		// Validate images in development (remove in production)
		if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
			validateCertificateImages();
		}
		
		console.log('Certifications section initialized!');
	}
});



// Make functions globally accessible
window.openCertificateModal = openCertificateModal;
window.closeCertificateModal = closeCertificateModal;
window.updateCertificateProgress = updateCertificateProgress;


