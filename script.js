document.addEventListener('DOMContentLoaded', function() {
    // Logo click handler - redirect to main page
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // Logout click handler
    const logoutButton = document.querySelector('.sidebar-bottom .sidebar-item:last-child');
    if (logoutButton) {
        logoutButton.style.cursor = 'pointer';
        logoutButton.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }

    // Navigation handlers for sidebar items
    const setupNavigation = () => {
        // Daily Goal (Dashboard) link in sidebar
        const dailyGoalLink = document.querySelector('.sidebar-item img[alt="Daily Goal"]').parentElement;
        if (dailyGoalLink) {
            dailyGoalLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }

        // Tracker Intake link in sidebar
        const trackerLink = document.querySelector('.sidebar-item .fa-chart-line').parentElement;
        if (trackerLink) {
            trackerLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'tracker.html';
            });
        }

        // Settings link in sidebar
        const settingsLink = document.querySelector('.sidebar-item .fa-cog').parentElement;
        if (settingsLink) {
            settingsLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'settings.html';
            });
        }
    };

    // Set up navigation
    setupNavigation();

    // Mobile sidebar toggle functionality
    const toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    };

    // Add mobile menu button if needed
    if (window.innerWidth <= 768) {
        const navbar = document.querySelector('.nav-left');
        const menuButton = document.createElement('button');
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
        menuButton.className = 'mobile-menu-btn';
        menuButton.addEventListener('click', toggleSidebar);
        navbar.prepend(menuButton);
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn.contains(e.target) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // Add smooth hover transitions for sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transition = 'background-color 0.3s ease';
        });
    });

    // Water tracking functionality
    const setupWaterTracking = () => {
        const waterProgress = document.querySelector('.progress-water');
        const goalPercentage = document.querySelector('.goal-percentage');
        const unitToggle = document.getElementById('unitToggle');
        const addWaterBtn = document.querySelector('.add-water-btn');
        const resetBtn = document.querySelector('.reset-btn');
        const dailyGoalDisplay = document.querySelector('.daily-goal');
        
        // Initialize water data with new 500ml goal system
        const waterData = {
            dailyIntake: 0,
            dailyGoal: 500, // 500ml total
            incrementPercentage: 20, // 20% per click
            unit: 'ml',
            lastUpdated: new Date().toDateString()
        };

        // Calculate percentage based on clicks (20% per click)
        const calculatePercentage = (clicks) => {
            return Math.min(clicks * waterData.incrementPercentage, 100);
        };

        // Update goal display based on unit
        const updateGoalDisplay = () => {
            if (dailyGoalDisplay) {
                if (waterData.unit === 'ml') {
                    dailyGoalDisplay.textContent = '500ml';
                } else {
                    dailyGoalDisplay.textContent = '0.5L';
                }
            }
        };

        // Load saved data
        const loadWaterData = () => {
            const saved = localStorage.getItem('waterTracking');
            if (saved) {
                const data = JSON.parse(saved);
                // Only load today's data
                if (data.date === new Date().toDateString()) {
                    waterData.dailyIntake = Number(data.dailyIntake);
                    waterData.unit = data.unit || 'ml';
                } else {
                    // Reset for new day
                    waterData.dailyIntake = 0;
                    saveWaterData();
                }
            }
            // Update displays
            const clicks = Math.floor(waterData.dailyIntake / (waterData.dailyGoal / 5));
            updateProgressDisplay(calculatePercentage(clicks));
            updateGoalDisplay();
        };

        // Update progress display with smooth animation
        const updateProgressDisplay = (percentage) => {
            waterProgress.style.transition = 'width 0.3s ease-in-out';
            waterProgress.style.width = `${percentage}%`;
            goalPercentage.textContent = `${percentage}%`;
        };

        // Save data
        const saveWaterData = () => {
            localStorage.setItem('waterTracking', JSON.stringify({
                dailyIntake: waterData.dailyIntake,
                date: new Date().toDateString(),
                unit: waterData.unit
            }));
        };

        // Add water (20% increment)
        const addWater = () => {
            const currentClicks = Math.floor(waterData.dailyIntake / (waterData.dailyGoal / 5));
            if (currentClicks < 5) { // Max 5 clicks for 100%
                waterData.dailyIntake = Math.min(
                    waterData.dailyIntake + (waterData.dailyGoal / 5),
                    waterData.dailyGoal
                );
                updateProgressDisplay(calculatePercentage(currentClicks + 1));
                saveWaterData();
            }
        };

        // Reset progress
        const resetProgress = () => {
            waterData.dailyIntake = 0;
            updateProgressDisplay(0);
            saveWaterData();
        };

        // Setup add water button
        if (addWaterBtn) {
            addWaterBtn.addEventListener('click', addWater);
        }

        // Setup reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', resetProgress);
        }

        // Setup unit toggle
        if (unitToggle) {
            unitToggle.checked = waterData.unit === 'ml';
            unitToggle.addEventListener('change', (e) => {
                waterData.unit = e.target.checked ? 'ml' : 'L';
                updateGoalDisplay();
                saveWaterData();
            });
        }

        // Update goal display
        updateGoalDisplay();

        // Initialize
        loadWaterData();
    };

    // Setup water tracking
    setupWaterTracking();

    // Reminder functionality
    const setupReminderControls = () => {
        const reminderCards = document.querySelector('.reminder-cards');
        const addReminderBtn = document.querySelector('.add-reminder-btn');
        const premiumAlert = document.querySelector('.premium-alert');
        let reminderCount = 1; // Start with one reminder

        // Handle day chip clicks
        const setupDayChips = (card) => {
            card.querySelectorAll('.day-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    chip.classList.toggle('active');
                });
            });
        };

        // Handle delete button
        const setupDeleteButton = (card) => {
            const deleteBtn = card.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    card.remove();
                    reminderCount--;
                });
            }
        };

        // Create new reminder card
        const createReminderCard = () => {
            const card = document.createElement('div');
            card.className = 'reminder-card';
            card.innerHTML = `
                <div class="reminder-time">
                    <input type="time" class="time-input" value="09:00">
                    <div class="day-chips">
                        <span class="day-chip">M</span>
                        <span class="day-chip">T</span>
                        <span class="day-chip">W</span>
                        <span class="day-chip">T</span>
                        <span class="day-chip">F</span>
                        <span class="day-chip">S</span>
                        <span class="day-chip">S</span>
                    </div>
                </div>
                <div class="reminder-actions">
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            return card;
        };

        // Add reminder button click handler
        if (addReminderBtn) {
            addReminderBtn.addEventListener('click', () => {
                if (reminderCount >= 3) {
                    premiumAlert.classList.add('show');
                    return;
                }
                
                const newCard = createReminderCard();
                reminderCards.appendChild(newCard);
                setupDayChips(newCard);
                setupDeleteButton(newCard);
                reminderCount++;
            });
        }

        // Setup initial reminder card
        const initialCard = reminderCards.querySelector('.reminder-card');
        if (initialCard) {
            setupDayChips(initialCard);
            setupDeleteButton(initialCard);
        }
    };

    // Setup all functionality
    if (document.querySelector('.goal-container') || document.querySelector('.tracker-container')) {
        setupWaterTracking();
    }
    
    // Setup reminder controls only for the main page
    if (document.querySelector('.goal-container')) {
        setupReminderControls();
    }
}); 