// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// Application State
const state = {
    currentUser: null,
    currentPage: 'home',
    feedbacks: [],
    users: [],
    currentSort: 'recent',
    currentSearch: '',
    itemsPerPage: 6,
    currentPageIndex: 0
};

// DOM Elements
const elements = {
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    authButtons: document.getElementById('authButtons'),
    userMenu: document.getElementById('userMenu'),
    userAvatar: document.getElementById('userAvatar'),
    usernameDisplay: document.getElementById('usernameDisplay'),
    loginBtn: document.getElementById('loginBtn'),
    signupBtn: document.getElementById('signupBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    themeToggle: document.getElementById('themeToggle'),
    hamburger: document.getElementById('hamburger'),
    
    // Pages
    pages: document.querySelectorAll('.page'),
    
    // Home Page
    totalFeedbacks: document.getElementById('totalFeedbacks'),
    totalUsers: document.getElementById('totalUsers'),
    avgRating: document.getElementById('avgRating'),
    totalLikes: document.getElementById('totalLikes'),
    
    // Feedbacks Page
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    feedbacksContainer: document.getElementById('feedbacksContainer'),
    pagination: document.getElementById('pagination'),
    
    // Add Feedback Page
    feedbackForm: document.getElementById('feedbackForm'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackDescription: document.getElementById('feedbackDescription'),
    feedbackScreenshot: document.getElementById('feedbackScreenshot'),
    screenshotPreview: document.getElementById('screenshotPreview'),
    speechToTextBtn: document.getElementById('speechToTextBtn'),
    
    // Dashboard
    profileAvatar: document.getElementById('profileAvatar'),
    avatarEditBtn: document.getElementById('avatarEditBtn'),
    dashboardUsername: document.getElementById('dashboardUsername'),
    dashboardEmail: document.getElementById('dashboardEmail'),
    userFeedbacksCount: document.getElementById('userFeedbacksCount'),
    userLikesCount: document.getElementById('userLikesCount'),
    userRepliesCount: document.getElementById('userRepliesCount'),
    userFeedbacks: document.getElementById('userFeedbacks'),
    sidebarMenuItems: document.querySelectorAll('.sidebar-menu-item'),
    dashboardTabs: document.querySelectorAll('.dashboard-tab'),
    profileForm: document.getElementById('profileForm'),
    profileUsername: document.getElementById('profileUsername'),
    profileEmail: document.getElementById('profileEmail'),
    currentPassword: document.getElementById('currentPassword'),
    newPassword: document.getElementById('newPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    colorOptions: document.querySelectorAll('.color-option'),
    backgroundOptions: document.querySelectorAll('.background-option'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    importDataFile: document.getElementById('importDataFile'),
    resetDataBtn: document.getElementById('resetDataBtn'),
    
    // Modals
    loginModal: document.getElementById('loginModal'),
    signupModal: document.getElementById('signupModal'),
    loginModalClose: document.getElementById('loginModalClose'),
    signupModalClose: document.getElementById('signupModalClose'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    switchToSignup: document.getElementById('switchToSignup'),
    switchToLogin: document.getElementById('switchToLogin'),
    
    // FAB
    fab: document.getElementById('fab'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer'),
    
    // Confetti
    confettiCanvas: document.getElementById('confettiCanvas')
};

// Initialize the application
function initApp() {
    // Load data from localStorage
    loadData();
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize the home page
    updateHomeStats();
    
    // Load feedbacks
    loadFeedbacks();
    
    // Apply saved theme
    applySavedTheme();
}

// Load data from localStorage
function loadData() {
    // Load users
    const storedUsers = localStorage.getItem('feedbackUsers');
    state.users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Load feedbacks
    const storedFeedbacks = localStorage.getItem('feedbacks');
    state.feedbacks = storedFeedbacks ? JSON.parse(storedFeedbacks) : [];
    
    // Load current user from session
    const currentUserSession = sessionStorage.getItem('currentUser');
    if (currentUserSession) {
        state.currentUser = JSON.parse(currentUserSession);
    }
    
    // Check if "Remember Me" is set
    const rememberMeUser = localStorage.getItem('rememberMeUser');
    if (rememberMeUser && !state.currentUser) {
        const userData = JSON.parse(rememberMeUser);
        state.currentUser = state.users.find(user => user.email === userData.email && user.password === userData.password);
        if (state.currentUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('feedbackUsers', JSON.stringify(state.users));
    localStorage.setItem('feedbacks', JSON.stringify(state.feedbacks));
}

// Check authentication status
function checkAuthStatus() {
    if (state.currentUser) {
        // User is logged in
        elements.authButtons.style.display = 'none';
        elements.userMenu.style.display = 'flex';
        elements.usernameDisplay.textContent = state.currentUser.username;
        
        // Set user avatar
        if (state.currentUser.avatar) {
            elements.userAvatar.querySelector('img').src = state.currentUser.avatar;
            elements.profileAvatar.querySelector('img').src = state.currentUser.avatar;
        } else {
            // Generate initial avatar
            const initial = state.currentUser.username.charAt(0).toUpperCase();
            elements.userAvatar.querySelector('img').alt = initial;
            elements.profileAvatar.querySelector('img').alt = initial;
        }
        
        // Update dashboard
        updateDashboard();
    } else {
        // User is not logged in
        elements.authButtons.style.display = 'flex';
        elements.userMenu.style.display = 'none';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Auth buttons
    elements.loginBtn.addEventListener('click', () => openModal('login'));
    elements.signupBtn.addEventListener('click', () => openModal('signup'));
    elements.logoutBtn.addEventListener('click', logout);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Hamburger menu
    elements.hamburger.addEventListener('click', toggleMobileMenu);
    
    // Feedbacks page
    elements.searchInput.addEventListener('input', handleSearch);
    elements.sortSelect.addEventListener('change', handleSortChange);
    
    // Add feedback form
    elements.feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    elements.feedbackScreenshot.addEventListener('change', handleScreenshotUpload);
    elements.speechToTextBtn.addEventListener('click', startSpeechToText);
    
    // Dashboard
    elements.sidebarMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('data-tab');
            switchDashboardTab(tab);
        });
    });
    
    elements.profileForm.addEventListener('submit', handleProfileUpdate);
    elements.avatarEditBtn.addEventListener('click', triggerAvatarUpload);
    
    // Theme customization
    elements.colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const color = option.getAttribute('data-color');
            changeAccentColor(color);
        });
    });
    
    elements.backgroundOptions.forEach(option => {
        option.addEventListener('click', () => {
            const background = option.getAttribute('data-background');
            changeBackgroundStyle(background);
        });
    });
    
    // Data management
    elements.exportDataBtn.addEventListener('click', exportUserData);
    elements.importDataFile.addEventListener('change', importUserData);
    elements.resetDataBtn.addEventListener('click', resetUserData);
    
    // Modals
    elements.loginModalClose.addEventListener('click', () => closeModal('login'));
    elements.signupModalClose.addEventListener('click', () => closeModal('signup'));
    elements.switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('login');
        openModal('signup');
    });
    elements.switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('signup');
        openModal('login');
    });
    
    // Auth forms
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.signupForm.addEventListener('submit', handleSignup);
    
    // FAB
    elements.fab.addEventListener('click', (e) => {
        e.preventDefault();
        const page = elements.fab.getAttribute('data-page');
        navigateToPage(page);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) {
            closeModal('login');
        }
        if (e.target === elements.signupModal) {
            closeModal('signup');
        }
    });
}

// Navigation
function navigateToPage(page) {
    // Update active nav link
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
    
    // Update active page
    elements.pages.forEach(p => {
        p.classList.remove('active');
        if (p.id === page) {
            p.classList.add('active');
        }
    });
    
    state.currentPage = page;
    
    // Page-specific initializations
    if (page === 'feedbacks') {
        loadFeedbacks();
    } else if (page === 'dashboard' && state.currentUser) {
        updateDashboard();
    }
    
    // Close mobile menu if open
    document.querySelector('.nav-menu').classList.remove('active');
    elements.hamburger.classList.remove('active');
}

// Toggle mobile menu
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
    elements.hamburger.classList.toggle('active');
}

// Modal functions
function openModal(modalType) {
    if (modalType === 'login') {
        elements.loginModal.classList.add('active');
    } else if (modalType === 'signup') {
        elements.signupModal.classList.add('active');
    }
}

function closeModal(modalType) {
    if (modalType === 'login') {
        elements.loginModal.classList.remove('active');
        elements.loginForm.reset();
    } else if (modalType === 'signup') {
        elements.signupModal.classList.remove('active');
        elements.signupForm.reset();
    }
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Find user
    const user = state.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login successful
        state.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('rememberMeUser', JSON.stringify({ email, password }));
        }
        
        checkAuthStatus();
        closeModal('login');
        showToast('Login successful!', 'success');
        
        // Navigate to dashboard if coming from auth-required action
        if (state.currentPage === 'add-feedback' || state.currentPage === 'dashboard') {
            navigateToPage('dashboard');
        }
    } else {
        // Login failed
        showToast('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmSignupPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (state.users.find(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }
    
    if (state.users.find(u => u.username === username)) {
        showToast('Username already taken', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        username,
        email,
        password,
        avatar: null,
        theme: {
            accentColor: '#4f46e5',
            background: 'gradient'
        },
        joined: new Date().toISOString()
    };
    
    state.users.push(newUser);
    saveData();
    
    // Auto login
    state.currentUser = newUser;
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    checkAuthStatus();
    closeModal('signup');
    showToast('Account created successfully!', 'success');
    
    // Navigate to dashboard
    navigateToPage('dashboard');
}

function logout() {
    state.currentUser = null;
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMeUser');
    checkAuthStatus();
    showToast('Logged out successfully', 'info');
    navigateToPage('home');
}

// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    elements.themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Save theme preference
    if (state.currentUser) {
        state.currentUser.theme = state.currentUser.theme || {};
        state.currentUser.theme.mode = newTheme;
        updateUser(state.currentUser);
    } else {
        localStorage.setItem('guestTheme', newTheme);
    }
}

function applySavedTheme() {
    let theme = 'light';
    
    if (state.currentUser && state.currentUser.theme && state.currentUser.theme.mode) {
        theme = state.currentUser.theme.mode;
    } else {
        const savedTheme = localStorage.getItem('guestTheme');
        if (savedTheme) theme = savedTheme;
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    elements.themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Apply saved accent color and background
    if (state.currentUser && state.currentUser.theme) {
        if (state.currentUser.theme.accentColor) {
            changeAccentColor(state.currentUser.theme.accentColor, false);
        }
        if (state.currentUser.theme.background) {
            changeBackgroundStyle(state.currentUser.theme.background, false);
        }
    }
}

function changeAccentColor(color, save = true) {
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Calculate darker shade for --primary-dark
    const darker = shadeColor(color, -20);
    document.documentElement.style.setProperty('--primary-dark', darker);
    
    // Calculate lighter shade for --primary-light
    const lighter = shadeColor(color, 20);
    document.documentElement.style.setProperty('--primary-light', lighter);
    
    // Update active color option
    elements.colorOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-color') === color) {
            option.classList.add('active');
        }
    });
    
    // Save to user preferences
    if (save && state.currentUser) {
        state.currentUser.theme = state.currentUser.theme || {};
        state.currentUser.theme.accentColor = color;
        updateUser(state.currentUser);
    }
}

function changeBackgroundStyle(background, save = true) {
    document.body.className = '';
    document.body.classList.add(`${background}-bg`);
    
    // Update active background option
    elements.backgroundOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-background') === background) {
            option.classList.add('active');
        }
    });
    
    // Save to user preferences
    if (save && state.currentUser) {
        state.currentUser.theme = state.currentUser.theme || {};
        state.currentUser.theme.background = background;
        updateUser(state.currentUser);
    }
}

// Helper function to shade colors
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

// Home page stats
function updateHomeStats() {
    const totalFeedbacks = state.feedbacks.length;
    const totalUsers = state.users.length;
    
    // Calculate average rating
    let totalRating = 0;
    state.feedbacks.forEach(feedback => {
        totalRating += feedback.rating;
    });
    const avgRating = totalFeedbacks > 0 ? (totalRating / totalFeedbacks).toFixed(1) : 0;
    
    // Calculate total likes
    let totalLikes = 0;
    state.feedbacks.forEach(feedback => {
        totalLikes += feedback.likes ? feedback.likes.length : 0;
    });
    
    elements.totalFeedbacks.textContent = totalFeedbacks;
    elements.totalUsers.textContent = totalUsers;
    elements.avgRating.textContent = avgRating;
    elements.totalLikes.textContent = totalLikes;
}

// Feedbacks management
function loadFeedbacks() {
    let filteredFeedbacks = [...state.feedbacks];
    
    // Apply search filter
    if (state.currentSearch) {
        const searchTerm = state.currentSearch.toLowerCase();
        filteredFeedbacks = filteredFeedbacks.filter(feedback => 
            feedback.title.toLowerCase().includes(searchTerm) || 
            feedback.description.toLowerCase().includes(searchTerm) ||
            feedback.user.username.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sorting
    switch (state.currentSort) {
        case 'recent':
            filteredFeedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'highest-rated':
            filteredFeedbacks.sort((a, b) => b.rating - a.rating);
            break;
        case 'most-liked':
            filteredFeedbacks.sort((a, b) => (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0));
            break;
    }
    
    // Apply pagination
    const startIndex = state.currentPageIndex * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);
    
    // Render feedbacks
    renderFeedbacks(paginatedFeedbacks);
    
    // Render pagination
    renderPagination(filteredFeedbacks.length);
}

function renderFeedbacks(feedbacks) {
    elements.feedbacksContainer.innerHTML = '';
    
    if (feedbacks.length === 0) {
        elements.feedbacksContainer.innerHTML = `
            <div class="no-feedbacks">
                <i class="fas fa-comment-slash"></i>
                <h3>No feedbacks found</h3>
                <p>${state.currentSearch ? 'Try adjusting your search terms' : 'Be the first to share your feedback!'}</p>
            </div>
        `;
        return;
    }
    
    feedbacks.forEach(feedback => {
        const feedbackElement = createFeedbackElement(feedback);
        elements.feedbacksContainer.appendChild(feedbackElement);
    });
}

function createFeedbackElement(feedback) {
    const div = document.createElement('div');
    div.className = 'feedback-card';
    
    // Format date
    const date = new Date(feedback.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    // Generate star rating
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= feedback.rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    // Check if current user has liked this feedback
    const isLiked = state.currentUser && feedback.likes && feedback.likes.includes(state.currentUser.id);
    
    // Check if current user is the author
    const isAuthor = state.currentUser && feedback.user.id === state.currentUser.id;
    
    div.innerHTML = `
        <div class="feedback-header">
            <div class="feedback-user">
                <div class="user-avatar">
                    ${feedback.user.avatar ? 
                        `<img src="${feedback.user.avatar}" alt="${feedback.user.username}">` : 
                        feedback.user.username.charAt(0).toUpperCase()
                    }
                </div>
                <div class="user-details">
                    <h4>${feedback.user.username}</h4>
                    <span>${formattedDate}</span>
                </div>
            </div>
            <div class="feedback-rating">
                ${stars}
            </div>
        </div>
        <div class="feedback-content">
            <h3>${feedback.title}</h3>
            <p>${feedback.description}</p>
            ${feedback.screenshot ? `
                <div class="feedback-screenshot">
                    <img src="${feedback.screenshot}" alt="Screenshot" class="screenshot-img">
                </div>
            ` : ''}
        </div>
        <div class="feedback-actions">
            <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${feedback.id}">
                <i class="fas fa-heart"></i>
                <span>${feedback.likes ? feedback.likes.length : 0}</span>
            </button>
            <button class="action-btn reply-btn" data-id="${feedback.id}">
                <i class="fas fa-comment"></i>
                <span>${feedback.replies ? feedback.replies.length : 0}</span>
            </button>
            ${isAuthor ? `
                <button class="action-btn edit-btn" data-id="${feedback.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${feedback.id}">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    // Add event listeners to action buttons
    const likeBtn = div.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => handleLike(feedback.id));
    
    const replyBtn = div.querySelector('.reply-btn');
    replyBtn.addEventListener('click', () => handleReply(feedback.id));
    
    if (isAuthor) {
        const editBtn = div.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => handleEdit(feedback.id));
        
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => handleDelete(feedback.id));
    }
    
    return div;
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    
    if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (state.currentPageIndex > 0) {
        paginationHTML += `<button class="page-prev" data-page="${state.currentPageIndex - 1}">Previous</button>`;
    }
    
    // Page numbers
    for (let i = 0; i < totalPages; i++) {
        const isActive = i === state.currentPageIndex;
        paginationHTML += `<button class="${isActive ? 'active' : ''}" data-page="${i}">${i + 1}</button>`;
    }
    
    // Next button
    if (state.currentPageIndex < totalPages - 1) {
        paginationHTML += `<button class="page-next" data-page="${state.currentPageIndex + 1}">Next</button>`;
    }
    
    elements.pagination.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    elements.pagination.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const page = parseInt(button.getAttribute('data-page'));
            state.currentPageIndex = page;
            loadFeedbacks();
        });
    });
}

function handleSearch() {
    state.currentSearch = elements.searchInput.value;
    state.currentPageIndex = 0;
    loadFeedbacks();
}

function handleSortChange() {
    state.currentSort = elements.sortSelect.value;
    state.currentPageIndex = 0;
    loadFeedbacks();
}

// Feedback interactions
function handleLike(feedbackId) {
    if (!state.currentUser) {
        showToast('Please log in to like feedback', 'error');
        openModal('login');
        return;
    }
    
    const feedback = state.feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return;
    
    // Initialize likes array if it doesn't exist
    if (!feedback.likes) {
        feedback.likes = [];
    }
    
    // Check if user already liked this feedback
    const userIndex = feedback.likes.indexOf(state.currentUser.id);
    
    if (userIndex === -1) {
        // Add like
        feedback.likes.push(state.currentUser.id);
    } else {
        // Remove like
        feedback.likes.splice(userIndex, 1);
    }
    
    saveData();
    loadFeedbacks();
    
    // Update home stats
    updateHomeStats();
}

function handleReply(feedbackId) {
    if (!state.currentUser) {
        showToast('Please log in to reply', 'error');
        openModal('login');
        return;
    }
    
    // For simplicity, we'll just show a prompt
    // In a real app, you'd have a more sophisticated reply system
    const reply = prompt('Enter your reply:');
    if (reply && reply.trim() !== '') {
        const feedback = state.feedbacks.find(f => f.id === feedbackId);
        if (!feedback) return;
        
        // Initialize replies array if it doesn't exist
        if (!feedback.replies) {
            feedback.replies = [];
        }
        
        // Add reply
        feedback.replies.push({
            id: generateId(),
            user: {
                id: state.currentUser.id,
                username: state.currentUser.username,
                avatar: state.currentUser.avatar
            },
            content: reply.trim(),
            timestamp: new Date().toISOString()
        });
        
        saveData();
        loadFeedbacks();
        showToast('Reply added successfully', 'success');
    }
}

function handleEdit(feedbackId) {
    const feedback = state.feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return;
    
    // Populate form with feedback data
    elements.feedbackTitle.value = feedback.title;
    elements.feedbackDescription.value = feedback.description;
    
    // Set rating
    document.querySelectorAll('input[name="rating"]').forEach(radio => {
        if (parseInt(radio.value) === feedback.rating) {
            radio.checked = true;
        }
    });
    
    // Set screenshot if exists
    if (feedback.screenshot) {
        elements.screenshotPreview.innerHTML = `<img src="${feedback.screenshot}" alt="Screenshot">`;
    }
    
    // Change form submit handler to update instead of create
    elements.feedbackForm.onsubmit = (e) => {
        e.preventDefault();
        updateFeedback(feedbackId);
    };
    
    // Navigate to add feedback page
    navigateToPage('add-feedback');
    
    // Change page title
    document.querySelector('#add-feedback .page-header h2').textContent = 'Edit Feedback';
}

function handleDelete(feedbackId) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    const feedbackIndex = state.feedbacks.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) return;
    
    state.feedbacks.splice(feedbackIndex, 1);
    saveData();
    loadFeedbacks();
    updateHomeStats();
    showToast('Feedback deleted successfully', 'success');
}

// Feedback form handling
function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    if (!state.currentUser) {
        showToast('Please log in to submit feedback', 'error');
        openModal('login');
        return;
    }
    
    const title = elements.feedbackTitle.value;
    const description = elements.feedbackDescription.value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const screenshot = elements.screenshotPreview.querySelector('img')?.src || null;
    
    if (!rating) {
        showToast('Please select a rating', 'error');
        return;
    }
    
    // Create new feedback
    const newFeedback = {
        id: generateId(),
        title,
        description,
        rating: parseInt(rating),
        screenshot,
        user: {
            id: state.currentUser.id,
            username: state.currentUser.username,
            avatar: state.currentUser.avatar
        },
        likes: [],
        replies: [],
        timestamp: new Date().toISOString()
    };
    
    state.feedbacks.push(newFeedback);
    saveData();
    
    // Reset form
    elements.feedbackForm.reset();
    elements.screenshotPreview.innerHTML = '';
    
    // Show success message
    showToast('Feedback submitted successfully!', 'success');
    
    // Show confetti animation
    triggerConfetti();
    
    // Update home stats
    updateHomeStats();
    
    // Navigate to feedbacks page
    navigateToPage('feedbacks');
}

function updateFeedback(feedbackId) {
    const feedback = state.feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return;
    
    const title = elements.feedbackTitle.value;
    const description = elements.feedbackDescription.value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const screenshot = elements.screenshotPreview.querySelector('img')?.src || null;
    
    if (!rating) {
        showToast('Please select a rating', 'error');
        return;
    }
    
    // Update feedback
    feedback.title = title;
    feedback.description = description;
    feedback.rating = parseInt(rating);
    feedback.screenshot = screenshot;
    
    saveData();
    
    // Reset form and handler
    elements.feedbackForm.reset();
    elements.screenshotPreview.innerHTML = '';
    elements.feedbackForm.onsubmit = handleFeedbackSubmit;
    
    // Reset page title
    document.querySelector('#add-feedback .page-header h2').textContent = 'Share Your Feedback';
    
    // Show success message
    showToast('Feedback updated successfully!', 'success');
    
    // Navigate to feedbacks page
    navigateToPage('feedbacks');
}

function handleScreenshotUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        elements.screenshotPreview.innerHTML = `<img src="${event.target.result}" alt="Screenshot">`;
    };
    reader.readAsDataURL(file);
}

function startSpeechToText() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Speech recognition is not supported in your browser', 'error');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.start();
    
    showToast('Listening... Speak now', 'info');
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.feedbackDescription.value += transcript;
        showToast('Speech transcribed successfully', 'success');
    };
    
    recognition.onerror = (event) => {
        showToast('Speech recognition error: ' + event.error, 'error');
    };
}

// Dashboard functions
function updateDashboard() {
    if (!state.currentUser) return;
    
    // Update user info
    elements.dashboardUsername.textContent = state.currentUser.username;
    elements.dashboardEmail.textContent = state.currentUser.email;
    elements.profileUsername.value = state.currentUser.username;
    elements.profileEmail.value = state.currentUser.email;
    
    if (state.currentUser.avatar) {
        elements.profileAvatar.querySelector('img').src = state.currentUser.avatar;
    }
    
    // Update user stats
    const userFeedbacks = state.feedbacks.filter(f => f.user.id === state.currentUser.id);
    const userFeedbacksCount = userFeedbacks.length;
    
    let userLikesCount = 0;
    userFeedbacks.forEach(feedback => {
        userLikesCount += feedback.likes ? feedback.likes.length : 0;
    });
    
    let userRepliesCount = 0;
    userFeedbacks.forEach(feedback => {
        userRepliesCount += feedback.replies ? feedback.replies.length : 0;
    });
    
    elements.userFeedbacksCount.textContent = userFeedbacksCount;
    elements.userLikesCount.textContent = userLikesCount;
    elements.userRepliesCount.textContent = userRepliesCount;
    
    // Render user feedbacks
    renderUserFeedbacks(userFeedbacks);
}

function renderUserFeedbacks(feedbacks) {
    elements.userFeedbacks.innerHTML = '';
    
    if (feedbacks.length === 0) {
        elements.userFeedbacks.innerHTML = `
            <div class="no-feedbacks">
                <i class="fas fa-comment-slash"></i>
                <h3>No feedbacks yet</h3>
                <p>Share your first feedback to get started!</p>
                <button class="btn btn-primary" data-page="add-feedback">Add Feedback</button>
            </div>
        `;
        
        // Add event listener to the button
        elements.userFeedbacks.querySelector('button').addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('add-feedback');
        });
        
        return;
    }
    
    feedbacks.forEach(feedback => {
        const feedbackElement = createFeedbackElement(feedback);
        elements.userFeedbacks.appendChild(feedbackElement);
    });
}

function switchDashboardTab(tabId) {
    // Update active sidebar menu item
    elements.sidebarMenuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        }
    });
    
    // Update active tab
    elements.dashboardTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === tabId) {
            tab.classList.add('active');
        }
    });
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    if (!state.currentUser) return;
    
    const username = elements.profileUsername.value;
    const email = elements.profileEmail.value;
    const currentPassword = elements.currentPassword.value;
    const newPassword = elements.newPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    
    // Check if username is already taken (by another user)
    const usernameTaken = state.users.find(u => u.username === username && u.id !== state.currentUser.id);
    if (usernameTaken) {
        showToast('Username already taken', 'error');
        return;
    }
    
    // Check if email is already taken (by another user)
    const emailTaken = state.users.find(u => u.email === email && u.id !== state.currentUser.id);
    if (emailTaken) {
        showToast('Email already registered', 'error');
        return;
    }
    
    // Update user info
    state.currentUser.username = username;
    state.currentUser.email = email;
    
    // Update password if provided
    if (currentPassword && newPassword) {
        if (currentPassword !== state.currentUser.password) {
            showToast('Current password is incorrect', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        state.currentUser.password = newPassword;
    }
    
    // Update user in state and storage
    updateUser(state.currentUser);
    
    // Update all feedbacks by this user
    state.feedbacks.forEach(feedback => {
        if (feedback.user.id === state.currentUser.id) {
            feedback.user.username = username;
            feedback.user.avatar = state.currentUser.avatar;
        }
    });
    
    saveData();
    
    // Update UI
    checkAuthStatus();
    updateDashboard();
    
    // Clear password fields
    elements.currentPassword.value = '';
    elements.newPassword.value = '';
    elements.confirmPassword.value = '';
    
    showToast('Profile updated successfully', 'success');
}

function triggerAvatarUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            state.currentUser.avatar = event.target.result;
            updateUser(state.currentUser);
            
            // Update all feedbacks by this user
            state.feedbacks.forEach(feedback => {
                if (feedback.user.id === state.currentUser.id) {
                    feedback.user.avatar = event.target.result;
                }
            });
            
            saveData();
            checkAuthStatus();
            updateDashboard();
            showToast('Avatar updated successfully', 'success');
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}

// Data management
function exportUserData() {
    if (!state.currentUser) return;
    
    const userData = {
        user: state.currentUser,
        feedbacks: state.feedbacks.filter(f => f.user.id === state.currentUser.id)
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedbackhub-data-${state.currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully', 'success');
}

function importUserData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validate imported data
            if (!importedData.user || !importedData.feedbacks) {
                showToast('Invalid data file', 'error');
                return;
            }
            
            // Confirm import
            if (!confirm(`This will replace all your current feedbacks (${importedData.feedbacks.length} items). Continue?`)) {
                return;
            }
            
            // Remove user's existing feedbacks
            state.feedbacks = state.feedbacks.filter(f => f.user.id !== state.currentUser.id);
            
            // Add imported feedbacks
            importedData.feedbacks.forEach(feedback => {
                // Update feedback ID and user reference
                feedback.id = generateId();
                feedback.user = {
                    id: state.currentUser.id,
                    username: state.currentUser.username,
                    avatar: state.currentUser.avatar
                };
                
                state.feedbacks.push(feedback);
            });
            
            saveData();
            updateDashboard();
            updateHomeStats();
            
            // Reset file input
            e.target.value = '';
            
            showToast('Data imported successfully', 'success');
        } catch (error) {
            showToast('Error importing data: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function resetUserData() {
    if (!confirm('This will permanently delete all your feedbacks. This action cannot be undone. Are you sure?')) {
        return;
    }
    
    // Remove user's feedbacks
    state.feedbacks = state.feedbacks.filter(f => f.user.id !== state.currentUser.id);
    
    saveData();
    updateDashboard();
    updateHomeStats();
    
    showToast('All your data has been reset', 'success');
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function triggerConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiCount = 150;
    const confetti = [];
    
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 3 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }
    
    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let stillFalling = false;
        
        confetti.forEach(particle => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation * Math.PI / 180);
            
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            
            ctx.restore();
            
            particle.y += particle.speed;
            particle.rotation += particle.rotationSpeed;
            
            if (particle.y < canvas.height) {
                stillFalling = true;
            }
        });
        
        if (stillFalling) {
            animationId = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}

function updateUser(user) {
    const userIndex = state.users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        state.users[userIndex] = user;
        saveData();
        
        // Update session storage if it's the current user
        if (state.currentUser && state.currentUser.id === user.id) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (elements.confettiCanvas) {
        elements.confettiCanvas.width = window.innerWidth;
        elements.confettiCanvas.height = window.innerHeight;
    }
});