// Cloud-Based Smart Monitoring System - Enhanced UI JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const timestamp = document.getElementById('timestamp');
    const submitBtn = document.getElementById('submitBtn');

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const sensorType = document.getElementById('sensorType').value;
        const value = document.getElementById('value').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;

        // Create data object
        const data = {
            sensorType,
            value: parseFloat(value),
            location,
            description,
            timestamp: new Date().toISOString()
        };

        try {
            // Show loading state with spinner
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting to Azure...';
            submitBtn.disabled = true;

            // Submit data to backend server
            const response = await submitDataToServer(data);

            if (response.success) {
                // Show success message with animation
                errorDiv.style.display = 'none';
                resultDiv.style.display = 'block';
                
                // Scroll to results
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                timestamp.textContent = `Submitted at: ${new Date().toLocaleString()}`;
                
                // Reset form
                form.reset();
                
                // Show success animation
                animateSuccess();
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            // Show error message with animation
            resultDiv.style.display = 'none';
            errorDiv.style.display = 'block';
            
            // Scroll to error
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            errorMessage.textContent = error.message;
            
            // Show error animation
            animateError();
        } finally {
            // Reset button state
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Data to Azure Cloud';
            submitBtn.disabled = false;
        }
    });

    // Submit data to backend server
    async function submitDataToServer(data) {
        try {
            const response = await fetch('/api/sensor-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            
            return result;
        } catch (error) {
            console.error('Error submitting data:', error);
            throw error;
        }
    }

    // Success animation
    function animateSuccess() {
        const resultIcon = resultDiv.querySelector('.result-icon');
        resultIcon.style.transform = 'scale(0)';
        resultIcon.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            resultIcon.style.transform = 'scale(1)';
        }, 10);
    }

    // Error animation
    function animateError() {
        const errorIcon = errorDiv.querySelector('.result-icon');
        errorIcon.style.animation = 'shake 0.5s';
        
        setTimeout(() => {
            errorIcon.style.animation = '';
        }, 500);
    }

    // Add shake animation to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);

    // Initialize page
    initializePage();
});

function initializePage() {
    console.log('Cloud-Based Smart Monitoring System - Enhanced UI initialized');
    
    // Add any initialization logic here
    // For example, loading existing data, connecting to WebSocket, etc.
    
    // Display current date/time in footer
    const now = new Date();
    console.log(`System operational as of: ${now.toLocaleString()}`);
    
    // Add interactive effects
    addInteractiveEffects();
}

function addInteractiveEffects() {
    // Add hover effects to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Add focus effects to form inputs
    const inputs = document.querySelectorAll('.form-input, .form-select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
}