document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    
    // If no splash screen element exists on this page, or it was already shown in this session, skip.
    if (!splashScreen || sessionStorage.getItem('introAlreadyShown') === 'true') {
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
        document.body.classList.remove('splash-active');
        return;
    }

    // Set initial active state to block scrolling and hide navbar/hero content
    document.body.classList.add('splash-active');

    const logoContainer = document.querySelector('.splash-logo-container');
    const slides = document.querySelectorAll('.splash-slide');
    const loadingLine = document.querySelector('.splash-loading-line');
    
    // Total duration of the splash sequence in ms
    const TOTAL_DURATION = 12000; 

    // Slide transition logic
    const slideTimings = [
        { slideIndex: 0, start: 500, end: 3000 },
        { slideIndex: 1, start: 3000, end: 5500 },
        { slideIndex: 2, start: 5500, end: 8000 },
        { slideIndex: 3, start: 8000, end: 10500 },
    ];

    // Start logo animation
    setTimeout(() => {
        if (logoContainer) logoContainer.classList.add('active');
    }, 100);

    // Start Loading Line Animation
    if (loadingLine) {
        // Force reflow
        void loadingLine.offsetWidth;
        loadingLine.style.transition = `width ${TOTAL_DURATION}ms linear`;
        loadingLine.style.width = '100%';
    }

    // Schedule slides
    slideTimings.forEach(({ slideIndex, start, end }) => {
        const slide = slides[slideIndex];
        if (!slide) return;

        // Enter
        setTimeout(() => {
            slide.classList.add('active');
            slide.classList.remove('exit');
        }, start);

        // Exit
        setTimeout(() => {
            slide.classList.remove('active');
            slide.classList.add('exit');
        }, end);
    });

    let isClosed = false;
    const closeSplashScreen = () => {
        if (isClosed) return;
        isClosed = true;

        splashScreen.classList.add('hidden');
        document.body.classList.remove('splash-active');
        
        // Mark as shown for this session
        sessionStorage.setItem('introAlreadyShown', 'true');
        
        // Clean up DOM after transition
        setTimeout(() => {
            splashScreen.remove();
        }, 1500); // Wait for CSS transition to finish
    };

    // Final sequence: fade out splash screen and reveal site
    const finalTimeoutId = setTimeout(closeSplashScreen, TOTAL_DURATION);

    // Close on any key press, click, or touch
    const handleUserInterrupt = () => {
        closeSplashScreen();
        document.removeEventListener('keydown', handleUserInterrupt);
        document.removeEventListener('click', handleUserInterrupt);
        document.removeEventListener('touchstart', handleUserInterrupt);
        clearTimeout(finalTimeoutId);
    };

    document.addEventListener('keydown', handleUserInterrupt);
    document.addEventListener('click', handleUserInterrupt);
    document.addEventListener('touchstart', handleUserInterrupt);

});
