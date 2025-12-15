
//* FORM CONFIGURATION
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrbwyden';
const HONEYPOT_FIELD = 'honeypot'; // Anti-spam field



//* FORM SUBMISSION
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});


async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.btn-primary');
    const originalBtnText = submitBtn.textContent;
    
    // Check honeypot (anti-spam)
    const honeypot = form.querySelector(`input[name="${HONEYPOT_FIELD}"]`);
    if (honeypot && honeypot.value !== '') {
        console.log('Spam detected');
        showMessage('error', 'Something went wrong. Please try again.');
        return;
    }
    
    // Validate form
    if (!validateForm(form)) {
        showMessage('error', 'Please fill in all required fields correctly.');
        return;
    }
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        // Collect form data
        const formData = new FormData(form);
        
        // Remove honeypot from submission
        formData.delete(HONEYPOT_FIELD);
        
        // Submit to Formspree
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Success!
            showMessage('success', 'Thank you! Your message has been sent successfully. I\'ll get back to you soon!');
            form.reset();
            
            // Optional: Track with analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'event_category': 'Contact',
                    'event_label': 'Contact Form'
                });
            }
        } else {
            // Formspree returned an error
            const data = await response.json();
            if (data.errors) {
                const errorMessages = data.errors.map(error => error.message).join(', ');
                showMessage('error', `Error: ${errorMessages}`);
            } else {
                showMessage('error', 'Oops! There was a problem sending your message. Please try again.');
            }
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('error', 'Oops! There was a problem sending your message. Please try again or email me directly.');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

function validateForm(form) {
    let isValid = true;
    
    // Get all required fields
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        // Skip honeypot field
        if (field.name === HONEYPOT_FIELD) return;
        
        const value = field.value.trim();
        const fieldName = field.name;
        
        // Clear previous errors
        clearFieldError(field);
        
        // Check if empty
        if (!value) {
            showFieldError(field, `${capitalize(fieldName)} is required`);
            isValid = false;
            return;
        }
        
        // Email validation
        if (field.type === 'email' && !isValidEmail(value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
            return;
        }
        
        // Minimum length validation
        if (fieldName === 'message' && value.length < 10) {
            showFieldError(field, 'Message must be at least 10 characters long');
            isValid = false;
            return;
        }
    });
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Create or update error message
    let errorElement = field.parentElement.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        field.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}


//? ===========================
//? ==== FEEDBACK MESSAGES ====
//? ===========================

function showMessage(type, message) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.classList.add("fade-out");
        setTimeout(() => existingMessage.remove(), 300);
    }
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message--${type}`;
    messageDiv.textContent = message;
    
    // Add to body
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.classList.add('fade-out');
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 300);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        // Skip honeypot
        if (input.name === HONEYPOT_FIELD) return;
        
        // Validate on blur (when user leaves the field)
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                clearFieldError(input);
                
                // Specific validation for email
                if (input.type === 'email' && !isValidEmail(input.value)) {
                    showFieldError(input, 'Please enter a valid email address');
                }
            }
        });
        
        // Clear error on input
        input.addEventListener('input', () => {
            if (input.classList.contains('error') && input.value.trim()) {
                clearFieldError(input);
            }
        });
    });
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Ensure honeypot field exists and is properly hidden
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    let honeypot = form.querySelector(`input[name="${HONEYPOT_FIELD}"]`);
    
    if (!honeypot) {
        // Create honeypot if it doesn't exist
        honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = HONEYPOT_FIELD;
        honeypot.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        honeypot.setAttribute('aria-hidden', 'true');
        form.appendChild(honeypot);
    }
});