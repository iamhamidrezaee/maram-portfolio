document.addEventListener('DOMContentLoaded', () => {
    // Video Modal Logic
    const videoGridItems = document.querySelectorAll('.grid-item');
    const modal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const videoSource = modalVideo.querySelector('source');
    const closeButton = document.querySelector('.close-button');

    if (videoGridItems.length > 0 && modal && modalVideo && videoSource && closeButton) {
        videoGridItems.forEach(item => {
            item.addEventListener('click', () => {
                const videoSrc = item.getAttribute('data-video-src');
                if (videoSrc) {
                    videoSource.setAttribute('src', videoSrc);
                    modalVideo.load();
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    modalVideo.play().catch(error => console.error("Video play failed:", error));
                }
            });
        });

        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modalVideo.pause();
            videoSource.setAttribute('src', '');
        }

        closeButton.addEventListener('click', closeModal);

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    }

    // Contact Form Submission with Multiple Fallbacks
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        // List of backup email services
        const emailServices = [
            {
                name: 'FormSubmit',
                action: 'https://formsubmit.co/mataee@umich.edu',
                note: 'Primary service - no signup required'
            },
            {
                name: 'Formspree',
                action: 'https://formspree.io/f/mpwazjpg',
                note: 'Backup service - works immediately from localhost'
            }
        ];
        
        let currentServiceIndex = 0;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            const formData = new FormData(contactForm);
            
            // Try current service
            const success = await tryEmailService(currentServiceIndex, formData);
            
            if (success) {
                showMessage('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
            } else {
                // Try fallback
                currentServiceIndex = (currentServiceIndex + 1) % emailServices.length;
                const fallbackSuccess = await tryEmailService(currentServiceIndex, formData);
                
                if (fallbackSuccess) {
                    showMessage('Message sent successfully via backup service!', 'success');
                    contactForm.reset();
                } else {
                    // Final fallback: mailto link
                    openEmailClient(formData);
                }
            }
            
            // Reset button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        });
        
        async function tryEmailService(serviceIndex, formData) {
            const service = emailServices[serviceIndex];
            
            try {
                showMessage(`Trying ${service.name}...`, 'info');
                
                const response = await fetch(service.action, {
                    method: 'POST',
                    body: formData
                });
                
                // FormSubmit redirects on success, Formspree returns JSON
                if (response.ok || response.redirected) {
                    return true;
                }
                
                throw new Error(`${service.name} failed: ${response.status}`);
                
            } catch (error) {
                console.error(`${service.name} error:`, error);
                showMessage(`${service.name} unavailable, trying backup...`, 'warning');
                return false;
            }
        }
        
        function openEmailClient(formData) {
            const name = formData.get('name') || 'Website Visitor';
            const email = formData.get('email') || '';
            const message = formData.get('message') || '';
            
            const subject = encodeURIComponent('Portfolio Contact Form Submission');
            const body = encodeURIComponent(`
Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from Maram's Portfolio Contact Form
            `.trim());
            
            const mailtoLink = `mailto:mataee@umich.edu?subject=${subject}&body=${body}`;
            
            showMessage('Opening your email client as final fallback...', 'info');
            
            // Try to open mailto link
            window.location.href = mailtoLink;
            
            // Show success message anyway since we can't know if it worked
            setTimeout(() => {
                showMessage('Email client opened! Please send the message from your email app.', 'success');
            }, 1000);
        }
    }

    // Newsletter subscription
    const subscribeBtn = document.querySelector('.subscribe-btn');
    const emailInput = document.querySelector('.email-input');

    if (subscribeBtn && emailInput) {
        subscribeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                showMessage('Thank you for subscribing!');
                emailInput.value = '';
            } else {
                showMessage('Please enter a valid email address.');
            }
        });
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show message function with type support
    function showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        
        let bgColor, textColor;
        
        switch (type) {
            case 'success':
                bgColor = 'rgba(76, 175, 80, 0.9)';
                textColor = '#fff';
                break;
            case 'error':
                bgColor = 'rgba(244, 67, 54, 0.9)';
                textColor = '#fff';
                break;
            case 'warning':
                bgColor = 'rgba(255, 152, 0, 0.9)';
                textColor = '#fff';
                break;
            default:
                bgColor = 'rgba(33, 150, 243, 0.9)';
                textColor = '#fff';
        }
        
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: ${textColor};
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 10000;
            font-size: 0.9rem;
            font-weight: 400;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, type === 'info' ? 3000 : 5000);
    }

    // Video autoplay fallback for hero video
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Prevent context menu on hero video
        heroVideo.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.log('Hero video autoplay was prevented by browser policy');
            });
        }
    }
}); 