// DOM Elements
const phasesContainer = document.getElementById('phases-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const phaseFilter = document.getElementById('phase-filter');
const topicFilter = document.getElementById('topic-filter');
const statusFilter = document.getElementById('status-filter');
const overallProgress = document.getElementById('overall-progress');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');
const problemModal = document.getElementById('problem-modal');
const modalProblemTitle = document.getElementById('modal-problem-title');
const leetcodeLink = document.getElementById('leetcode-link');
const problemStatusSelect = document.getElementById('problem-status-select');
const problemNotesTextarea = document.getElementById('problem-notes-textarea');
const timeComplexitySelect = document.getElementById('time-complexity-select');
const spaceComplexitySelect = document.getElementById('space-complexity-select');
const completionDate = document.getElementById('completion-date');
const saveProblemBtn = document.getElementById('save-problem-btn');
const cancelProblemBtn = document.getElementById('cancel-problem-btn');
const closeBtn = document.querySelector('.close-btn');

// Current problem being edited
let currentProblem = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderPhases();
    updateProgressStats();
    populateTopicFilter();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Filters
    phaseFilter.addEventListener('change', handleFilters);
    topicFilter.addEventListener('change', handleFilters);
    statusFilter.addEventListener('change', handleFilters);

    // Modal events
    saveProblemBtn.addEventListener('click', saveProblem);
    cancelProblemBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === problemModal) {
            closeModal();
        }
    });
}

// Render all phases and their topics
function renderPhases() {
    phasesContainer.innerHTML = '';
    
    window.dsaTracker.data.phases.forEach(phase => {
        // Create phase card
        const phaseCard = document.createElement('div');
        phaseCard.className = 'phase-card';
        phaseCard.dataset.phaseId = phase.id;
        
        // Phase header
        const phaseHeader = document.createElement('div');
        phaseHeader.className = 'phase-header';
        phaseHeader.innerHTML = `
            <div class="phase-title">${phase.title}</div>
            <div class="phase-progress">
                <span class="phase-progress-text">0/0</span>
                <div class="phase-progress-bar">
                    <div class="phase-progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        // Phase content
        const phaseContent = document.createElement('div');
        phaseContent.className = 'phase-content';
        
        // Render topics for this phase
        phase.topics.forEach(topic => {
            const topicContainer = document.createElement('div');
            topicContainer.className = 'topic-container';
            topicContainer.dataset.topicId = topic.id;
            
            const topicHeader = document.createElement('div');
            topicHeader.className = 'topic-header';
            topicHeader.innerHTML = `
                <span>${topic.title}</span>
                <span class="topic-progress">0/0</span>
            `;
            
            const topicProblems = document.createElement('div');
            topicProblems.className = 'topic-problems';
            
            // Render subtopics and problems
            topic.subtopics.forEach(subtopic => {
                const subtopicTitle = document.createElement('h3');
                subtopicTitle.className = 'subtopic-title';
                subtopicTitle.textContent = subtopic.title;
                topicProblems.appendChild(subtopicTitle);
                
                // Render problems
                subtopic.problems.forEach(problem => {
                    const problemCard = createProblemCard(problem);
                    topicProblems.appendChild(problemCard);
                });
            });
            
            topicContainer.appendChild(topicHeader);
            topicContainer.appendChild(topicProblems);
            phaseContent.appendChild(topicContainer);
            
            // Toggle topic problems visibility
            topicHeader.addEventListener('click', () => {
                topicProblems.classList.toggle('expanded');
            });
        });
        
        phaseCard.appendChild(phaseHeader);
        phaseCard.appendChild(phaseContent);
        phasesContainer.appendChild(phaseCard);
        
        // Toggle phase content visibility
        phaseHeader.addEventListener('click', () => {
            phaseContent.classList.toggle('expanded');
        });
    });
    
    // Update progress for each phase and topic
    updatePhaseProgress();
}

// Create a problem card
function createProblemCard(problem) {
    const problemCard = document.createElement('div');
    problemCard.className = `problem-card ${problem.status}`;
    problemCard.dataset.problemId = problem.id;
    
    let statusText = 'Not Started';
    let statusClass = 'not-started-status';
    
    if (problem.status === 'completed') {
        statusText = 'Completed';
        statusClass = 'completed-status';
    } else if (problem.status === 'in-progress') {
        statusText = 'In Progress';
        statusClass = 'in-progress-status';
    }
    
    problemCard.innerHTML = `
        <h3>${problem.title}</h3>
        <div class="problem-status ${statusClass}">${statusText}</div>
    `;
    
    // Open modal when clicking on a problem card
    problemCard.addEventListener('click', () => {
        openProblemModal(problem);
    });
    
    return problemCard;
}

// Open the problem modal
function openProblemModal(problem) {
    currentProblem = problem;
    
    modalProblemTitle.textContent = problem.title;
    leetcodeLink.href = problem.leetcodeUrl;
    problemStatusSelect.value = problem.status;
    problemNotesTextarea.value = problem.notes;
    timeComplexitySelect.value = problem.timeComplexity;
    spaceComplexitySelect.value = problem.spaceComplexity;
    completionDate.value = problem.completionDate || '';
    
    problemModal.style.display = 'flex';
}

// Close the problem modal
function closeModal() {
    problemModal.style.display = 'none';
    currentProblem = null;
}

// Save problem changes
function saveProblem() {
    if (!currentProblem) return;
    
    // Update problem data
    currentProblem.status = problemStatusSelect.value;
    currentProblem.notes = problemNotesTextarea.value;
    currentProblem.timeComplexity = timeComplexitySelect.value;
    currentProblem.spaceComplexity = spaceComplexitySelect.value;
    currentProblem.completionDate = completionDate.value || null;
    
    // Save to localStorage
    window.dsaTracker.saveData(window.dsaTracker.data);
    
    // Update UI
    renderPhases();
    updateProgressStats();
    
    // Close modal
    closeModal();
}

// Update progress statistics
function updateProgressStats() {
    let completed = 0;
    let total = 0;
    
    // Count all problems
    window.dsaTracker.data.phases.forEach(phase => {
        phase.topics.forEach(topic => {
            topic.subtopics.forEach(subtopic => {
                subtopic.problems.forEach(problem => {
                    total++;
                    if (problem.status === 'completed') {
                        completed++;
                    }
                });
            });
        });
    });
    
    // Update UI
    completedCount.textContent = completed;
    totalCount.textContent = total;
    
    // Update progress bar
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
    overallProgress.style.width = `${progressPercentage}%`;
}

// Update progress for each phase and topic
function updatePhaseProgress() {
    window.dsaTracker.data.phases.forEach(phase => {
        const phaseCard = document.querySelector(`.phase-card[data-phase-id="${phase.id}"]`);
        if (!phaseCard) return;
        
        let phaseCompleted = 0;
        let phaseTotal = 0;
        
        phase.topics.forEach(topic => {
            const topicContainer = phaseCard.querySelector(`.topic-container[data-topic-id="${topic.id}"]`);
            if (!topicContainer) return;
            
            let topicCompleted = 0;
            let topicTotal = 0;
            
            topic.subtopics.forEach(subtopic => {
                subtopic.problems.forEach(problem => {
                    topicTotal++;
                    phaseTotal++;
                    
                    if (problem.status === 'completed') {
                        topicCompleted++;
                        phaseCompleted++;
                    }
                });
            });
            
            // Update topic progress
            const topicProgress = topicContainer.querySelector('.topic-progress');
            if (topicProgress) {
                topicProgress.textContent = `${topicCompleted}/${topicTotal}`;
            }
        });
        
        // Update phase progress
        const phaseProgressText = phaseCard.querySelector('.phase-progress-text');
        const phaseProgressFill = phaseCard.querySelector('.phase-progress-fill');
        
        if (phaseProgressText && phaseProgressFill) {
            phaseProgressText.textContent = `${phaseCompleted}/${phaseTotal}`;
            
            const progressPercentage = phaseTotal > 0 ? (phaseCompleted / phaseTotal) * 100 : 0;
            phaseProgressFill.style.width = `${progressPercentage}%`;
        }
    });
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderPhases();
        return;
    }
    
    // Hide all problem cards first
    const allProblemCards = document.querySelectorAll('.problem-card');
    allProblemCards.forEach(card => {
        card.style.display = 'none';
    });
    
    // Show matching problems
    window.dsaTracker.data.phases.forEach(phase => {
        phase.topics.forEach(topic => {
            topic.subtopics.forEach(subtopic => {
                subtopic.problems.forEach(problem => {
                    if (problem.title.toLowerCase().includes(searchTerm)) {
                        const problemCard = document.querySelector(`.problem-card[data-problem-id="${problem.id}"]`);
                        if (problemCard) {
                            problemCard.style.display = 'block';
                            
                            // Make sure the parent containers are visible
                            const topicProblems = problemCard.closest('.topic-problems');
                            const phaseContent = problemCard.closest('.phase-content');
                            
                            if (topicProblems && phaseContent) {
                                topicProblems.classList.add('expanded');
                                phaseContent.classList.add('expanded');
                            }
                        }
                    }
                });
            });
        });
    });
}

// Populate topic filter dropdown
function populateTopicFilter() {
    topicFilter.innerHTML = '<option value="all">All Topics</option>';
    
    window.dsaTracker.data.phases.forEach(phase => {
        phase.topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.title;
            topicFilter.appendChild(option);
        });
    });
}

// Handle filter changes
function handleFilters() {
    const selectedPhase = phaseFilter.value;
    const selectedTopic = topicFilter.value;
    const selectedStatus = statusFilter.value;
    
    // Show all phase cards first
    const phaseCards = document.querySelectorAll('.phase-card');
    phaseCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Filter by phase
    if (selectedPhase !== 'all') {
        phaseCards.forEach(card => {
            if (card.dataset.phaseId !== selectedPhase) {
                card.style.display = 'none';
            }
        });
    }
    
    // Show all topic containers first
    const topicContainers = document.querySelectorAll('.topic-container');
    topicContainers.forEach(container => {
        container.style.display = 'block';
    });
    
    // Filter by topic
    if (selectedTopic !== 'all') {
        topicContainers.forEach(container => {
            if (container.dataset.topicId !== selectedTopic) {
                container.style.display = 'none';
            } else {
                // Make sure the parent phase is visible
                const phaseContent = container.closest('.phase-content');
                if (phaseContent) {
                    phaseContent.classList.add('expanded');
                }
            }
        });
    }
    
    // Show all problem cards first
    const problemCards = document.querySelectorAll('.problem-card');
    problemCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Filter by status
    if (selectedStatus !== 'all') {
        problemCards.forEach(card => {
            if (!card.classList.contains(selectedStatus)) {
                card.style.display = 'none';
            } else {
                // Make sure the parent containers are visible
                const topicProblems = card.closest('.topic-problems');
                if (topicProblems) {
                    topicProblems.classList.add('expanded');
                }
            }
        });
    }
}
