// RYO Column Interface - Desktop & Mobile
let currentQuestion = null;
let currentPage = 1;
let currentMode = 'markdown';
let currentMobileTab = 'qa';
let currentMobileIndex = 1;

function initializeColumnInterface() {
    if (!window.paperData) {
        console.error('Paper data not loaded');
        return;
    }
    
    // Desktop handlers
    setupQuestionHandlers();
    setupThumbnailHandlers();
    setupModeHandlers();
    setupQRHandlers();
    
    // Mobile handlers
    setupMobileHandlers();
    
    // Load first page by default
    if (window.paperData.markdown_pages && window.paperData.markdown_pages.length > 0) {
        loadPage(1);
    }
    
    // Auto-select first question
    if (window.paperData.questions && Object.keys(window.paperData.questions).length > 0) {
        const firstQuestionNum = Object.keys(window.paperData.questions).sort((a, b) => parseInt(a) - parseInt(b))[0];
        selectQuestion(firstQuestionNum);
        
        // Also initialize mobile with first question
        currentMobileIndex = parseInt(firstQuestionNum);
        loadMobileContent();
    }
    
    // Process MathJax after initialization (in case MathJax is already loaded)
    // Also set up a check for when MathJax becomes available
    const processMathJax = () => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    };
    
    // Try immediately
    processMathJax();
    
    // Also try after a short delay in case MathJax is still loading
    setTimeout(processMathJax, 100);
    setTimeout(processMathJax, 500);
    
    // Hide PDF mode button if no PDF images available
    if (!window.paperData.pdf_images || !window.paperData.pdf_images.pages) {
        const pdfBtn = document.querySelector('[data-mode="pdf"]');
        if (pdfBtn) {
            pdfBtn.style.display = 'none';
        }
        
        // Also hide mobile PDF tab
        const mobilePdfTab = document.querySelector('[data-tab="pdf"]');
        if (mobilePdfTab) {
            mobilePdfTab.style.display = 'none';
        }
    }
}

// ===== MOBILE HANDLERS =====
function setupMobileHandlers() {
    // Mobile tab handlers
    const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
    mobileTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchMobileTab(tab);
        });
    });
    
    // Mobile navigation handlers
    const prevBtn = document.getElementById('mobile-prev-btn');
    const nextBtn = document.getElementById('mobile-next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', navigateMobilePrev);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', navigateMobileNext);
    }
    
    // Mobile QR handler
    const mobileQrBtn = document.getElementById('mobile-qr-btn');
    if (mobileQrBtn) {
        mobileQrBtn.addEventListener('click', showQRCode);
    }
}

function switchMobileTab(tab) {
    if (tab === currentMobileTab) return;
    
    // Update tab buttons
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    currentMobileTab = tab;
    
    // Reset to first item when switching tabs
    currentMobileIndex = 1;
    
    loadMobileContent();
}

function loadMobileContent() {
    const navInfo = document.getElementById('mobile-nav-info');
    const content = document.getElementById('mobile-content');
    const prevBtn = document.getElementById('mobile-prev-btn');
    const nextBtn = document.getElementById('mobile-next-btn');
    
    if (currentMobileTab === 'qa') {
        loadMobileQA();
    } else if (currentMobileTab === 'pdf') {
        loadMobilePDF();
    } else if (currentMobileTab === 'markdown') {
        loadMobileMarkdown();
    }
}

function loadMobileQA() {
    const questions = window.paperData.questions;
    const questionNums = Object.keys(questions).sort((a, b) => parseInt(a) - parseInt(b));
    const currentQuestionNum = questionNums[currentMobileIndex - 1];
    const questionData = questions[currentQuestionNum];
    
    if (!questionData) return;
    
    // Update navigation info with enhanced display
    const navInfo = document.getElementById('mobile-nav-info');
    const truncatedQuestion = truncateText(questionData.question, 25);
    navInfo.textContent = `Q${currentMobileIndex}/${questionNums.length}: ${truncatedQuestion}`;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('mobile-prev-btn');
    const nextBtn = document.getElementById('mobile-next-btn');
    prevBtn.disabled = currentMobileIndex <= 1;
    nextBtn.disabled = currentMobileIndex >= questionNums.length;
    
    // Load content
    const content = document.querySelector('.mobile-content-inner');
    
    // Special handling for core analysis (Q4)
    if (currentQuestionNum === "4") {
        const coreAnalysis = window.paperData.core_analysis;
        if (coreAnalysis && coreAnalysis.output_data) {
            const outputData = coreAnalysis.output_data;
            content.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <h3 style="color: #FF8C00; margin-bottom: 0.5rem;">Q${currentQuestionNum}: ${questionData.question}</h3>
                    <div style="padding: 1rem; background: #FFF8DC; border-radius: 8px; border-left: 4px solid #FF8C00;">
                        <div class="core-analysis-content">
                            <h4 style="color: #8B4513; margin-top: 0;">Core Contribution</h4>
                            <p style="margin: 0 0 1rem 0; line-height: 1.6;">${outputData.core_contribution}</p>
                            
                            <h4 style="color: #8B4513;">Method Breakdown</h4>
                            <p style="margin: 0 0 1rem 0; line-height: 1.6;">${outputData.method_breakdown}</p>
                            
                            <h4 style="color: #8B4513;">Subsystems/Parts</h4>
                            <p style="margin: 0 0 1rem 0; line-height: 1.6;">${outputData.subsystems_parts}</p>
                            
                            <h4 style="color: #8B4513;">Interactions</h4>
                            <p style="margin: 0 0 1rem 0; line-height: 1.6;">${outputData.interactions}</p>
                            
                            <h4 style="color: #8B4513;">Delta vs Baseline</h4>
                            <p style="margin: 0 0 1rem 0; line-height: 1.6;">${outputData.delta_vs_baseline}</p>
                            
                            <h4 style="color: #8B4513;">Evidence Anchor</h4>
                            <p style="margin: 0 0 1rem 0; line-height: 1.6;">${outputData.evidence_anchor}</p>
                            
                            <h4 style="color: #8B4513;">Transferability</h4>
                            <p style="margin: 0; line-height: 1.6;">${outputData.transferability}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <h3 style="color: #0066cc; margin-bottom: 0.5rem;">Q${currentQuestionNum}: ${questionData.question}</h3>
                    <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0066cc;">
                        <p style="margin: 0; line-height: 1.6;">Core analysis not available. Run 'ryo dera-core' first.</p>
                    </div>
                </div>
            `;
        }
    } else {
        content.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3 style="color: #0066cc; margin-bottom: 0.5rem;">Q${currentQuestionNum}: ${questionData.question}</h3>
                <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0066cc;">
                    <p style="margin: 0; line-height: 1.6;">${questionData.answer}</p>
                </div>
            </div>
        `;
    }
    
    // Re-render MathJax after content is loaded
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    }
}

function loadMobilePDF() {
    const pdfPages = window.paperData.pdf_images?.pages || [];
    const currentPageData = pdfPages[currentMobileIndex - 1];
    
    if (!currentPageData) return;
    
    // Update navigation info with enhanced display
    const navInfo = document.getElementById('mobile-nav-info');
    navInfo.textContent = `Page ${currentMobileIndex}/${pdfPages.length}`;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('mobile-prev-btn');
    const nextBtn = document.getElementById('mobile-next-btn');
    prevBtn.disabled = currentMobileIndex <= 1;
    nextBtn.disabled = currentMobileIndex >= pdfPages.length;
    
    // Load high-res mobile image
    const content = document.querySelector('.mobile-content-inner');
    const imagePath = currentPageData.mobile_filename ? 
        `images/mobile/${currentPageData.mobile_filename}` : 
        `images/${currentPageData.filename}`;
    
    content.innerHTML = `
        <div style="text-align: center;">
            <img src="${imagePath}" alt="Page ${currentPageData.page_number}" 
                 style="max-width: 100%; height: auto; border-radius: 4px; border: 1px solid #ddd;">
        </div>
    `;
}

function loadMobileMarkdown() {
    const pages = window.paperData.markdown_pages || [];
    const currentPageData = pages[currentMobileIndex - 1];
    
    if (!currentPageData) return;
    
    // Update navigation info with enhanced display
    const navInfo = document.getElementById('mobile-nav-info');
    const truncatedTitle = truncateText(currentPageData.title, 20);
    navInfo.textContent = `Sec ${currentMobileIndex}/${pages.length}: ${truncatedTitle}`;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('mobile-prev-btn');
    const nextBtn = document.getElementById('mobile-next-btn');
    prevBtn.disabled = currentMobileIndex <= 1;
    nextBtn.disabled = currentMobileIndex >= pages.length;
    
    // Load content
    const content = document.querySelector('.mobile-content-inner');
    content.innerHTML = `
        <div>
            <h3 style="color: #0066cc; margin-bottom: 1rem;">${currentPageData.title}</h3>
            <div style="line-height: 1.7;">
                ${formatMarkdownContent(currentPageData.content)}
            </div>
        </div>
    `;
    
    // Re-render MathJax after content is loaded
    const processMath = () => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        } else {
            setTimeout(processMath, 100);
        }
    };
    processMath();
}

function scrollContentToTop() {
    const contentArea = document.getElementById('mobile-content');
    if (contentArea) {
        contentArea.scrollTop = 0; // Instant scroll for busy people
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function navigateMobilePrev() {
    if (currentMobileIndex > 1) {
        currentMobileIndex--;
        loadMobileContent();
        scrollContentToTop();
    }
}

function navigateMobileNext() {
    let maxIndex;
    if (currentMobileTab === 'qa') {
        maxIndex = Object.keys(window.paperData.questions).length;
    } else if (currentMobileTab === 'pdf') {
        maxIndex = window.paperData.pdf_images?.pages?.length || 0;
    } else if (currentMobileTab === 'markdown') {
        maxIndex = window.paperData.markdown_pages?.length || 0;
    }
    
    if (currentMobileIndex < maxIndex) {
        currentMobileIndex++;
        loadMobileContent();
        scrollContentToTop();
    }
}

// ===== DESKTOP HANDLERS (unchanged) =====

function setupQRHandlers() {
    const qrBtn = document.getElementById('qr-btn');
    const qrOverlay = document.getElementById('qr-overlay');
    
    if (qrBtn) {
        qrBtn.addEventListener('click', showQRCode);
    }
    
    if (qrOverlay) {
        qrOverlay.addEventListener('click', hideQRCode);
    }
    
    // ESC key to close QR overlay
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideQRCode();
        }
    });
}

function showQRCode() {
    const qrOverlay = document.getElementById('qr-overlay');
    if (qrOverlay) {
        qrOverlay.classList.add('show');
    }
}

function hideQRCode() {
    const qrOverlay = document.getElementById('qr-overlay');
    if (qrOverlay) {
        qrOverlay.classList.remove('show');
    }
}

function setupModeHandlers() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            switchMode(mode);
        });
    });
}

function setupQuestionHandlers() {
    const questionBtns = document.querySelectorAll('.question-btn');
    questionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const questionNum = e.target.dataset.question;
            selectQuestion(questionNum);
        });
    });
}

function setupThumbnailHandlers() {
    const thumbnailBtns = document.querySelectorAll('.thumbnail-btn');
    thumbnailBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Handle clicks on the button or its children (like images)
            let target = e.target;
            while (target && !target.dataset.page) {
                target = target.parentElement;
            }
            if (target && target.dataset.page) {
                const pageNum = parseInt(target.dataset.page);
                loadPage(pageNum);
            }
        });
    });
    
    // Setup collapse button for thumbnails column
    const collapseBtn = document.getElementById('collapse-thumbnails');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', toggleThumbnailsColumn);
    }
}

function toggleThumbnailsColumn() {
    const thumbnailsColumn = document.getElementById('thumbnails-column');
    const layout = document.querySelector('.four-column-layout');
    const collapseIcon = document.querySelector('.collapse-icon');
    const collapseBtn = document.getElementById('collapse-thumbnails');
    
    console.log('Elements found:', { thumbnailsColumn, layout, collapseIcon, collapseBtn });
    
    if (thumbnailsColumn.classList.contains('collapsed')) {
        // Expand
        thumbnailsColumn.classList.remove('collapsed');
        if (layout) layout.classList.remove('collapsed-thumbnails');
        collapseIcon.textContent = '−';
        collapseBtn.title = 'Collapse thumbnails';
    } else {
        // Collapse
        thumbnailsColumn.classList.add('collapsed');
        if (layout) layout.classList.add('collapsed-thumbnails');
        collapseIcon.textContent = '+';
        collapseBtn.title = 'Expand thumbnails';
    }
}

function selectQuestion(questionNum) {
    // Update active question
    document.querySelectorAll('.question-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-question="${questionNum}"]`).classList.add('active');
    
    // Show answer
    const questionData = window.paperData.questions[questionNum];
    if (questionData) {
        const answerContent = document.querySelector('.answer-content');
        
        // Special handling for core analysis (Q4)
        if (questionNum === "4") {
            const coreAnalysis = window.paperData.core_analysis;
            if (coreAnalysis && coreAnalysis.output_data) {
                const outputData = coreAnalysis.output_data;
                answerContent.innerHTML = `
                    <div class="core-analysis-content">
                        <h2>Core Contribution</h2>
                        <p>${outputData.core_contribution}</p>
                        
                        <h2>Method Breakdown</h2>
                        <p>${outputData.method_breakdown}</p>
                        
                        <h2>Subsystems/Parts</h2>
                        <p>${outputData.subsystems_parts}</p>
                        
                        <h2>Interactions</h2>
                        <p>${outputData.interactions}</p>
                        
                        <h2>Delta vs Baseline</h2>
                        <p>${outputData.delta_vs_baseline}</p>
                        
                        <h2>Evidence Anchor</h2>
                        <p>${outputData.evidence_anchor}</p>
                        
                        <h2>Transferability</h2>
                        <p>${outputData.transferability}</p>
                    </div>
                `;
            } else {
                answerContent.innerHTML = `
                    <h4>Q${questionNum}: ${questionData.question}</h4>
                    <p>Core analysis not available. Run 'ryo dera-core' first.</p>
                `;
            }
        } else {
            answerContent.innerHTML = `
                <h4>Q${questionNum}: ${questionData.question}</h4>
                <p>${questionData.answer}</p>
            `;
        }
        
        // Re-render MathJax after content is loaded
        const processMath = () => {
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise();
            } else {
                setTimeout(processMath, 100);
            }
        };
        processMath();
    }
    
    currentQuestion = questionNum;
}

function loadPage(pageNum) {
    if (currentMode === 'markdown') {
        loadMarkdownPage(pageNum);
    } else if (currentMode === 'pdf') {
        loadPDFPage(pageNum);
    }
}

function switchMode(mode) {
    if (mode === currentMode) return;
    
    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    currentMode = mode;
    
    // Update thumbnails and content based on mode
    updateThumbnails();
    loadPage(currentPage);
}

function updateThumbnails() {
    const thumbnailList = document.querySelector('.thumbnail-list');
    
    if (currentMode === 'markdown') {
        // Show markdown section thumbnails
        const pages = window.paperData.markdown_pages || [];
        thumbnailList.innerHTML = pages.map(page => 
            `<li><button class="thumbnail-btn" data-page="${page.id}">${page.id}. ${page.title}</button></li>`
        ).join('');
        
        // Set up handlers for new buttons
        setupThumbnailHandlers();
        
        // Ensure current page is within range
        if (currentPage > pages.length) {
            currentPage = 1;
        }
        
    } else if (currentMode === 'pdf') {
        // Show PDF page thumbnails
        const pdfPages = window.paperData.pdf_images?.pages || [];
        thumbnailList.innerHTML = pdfPages.map(page => 
            `<li><button class="thumbnail-btn pdf-thumb" data-page="${page.page_number}">
                <img src="images/thumbs/${page.thumb_filename}" alt="Page ${page.page_number}" style="width: 100%; height: auto; border-radius: 2px;">
                <span style="display: block; text-align: center; margin-top: 4px; font-size: 0.8rem;">Page ${page.page_number}</span>
            </button></li>`
        ).join('');
        
        // Set up handlers for new buttons
        setupThumbnailHandlers();
        
        // Ensure current page is within range
        if (currentPage > pdfPages.length) {
            currentPage = 1;
        }
    }
}

function loadPage(pageNum) {
    if (currentMode === 'markdown') {
        loadMarkdownPage(pageNum);
    } else if (currentMode === 'pdf') {
        loadPDFPage(pageNum);
    }
}

function loadMarkdownPage(pageNum) {
    const page = window.paperData.markdown_pages?.find(p => p.id === pageNum);
    if (!page) return;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageNum}"]`)?.classList.add('active');
    
    // Load page content
    const pageContent = document.querySelector('.page-content');
    pageContent.innerHTML = `
        <h3>${page.title}</h3>
        ${formatMarkdownContent(page.content)}
    `;
    
    currentPage = pageNum;
    
    // Re-render MathJax after content is loaded
    // Wait for MathJax to be ready if it's still loading
    const processMath = () => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        } else {
            // MathJax not ready yet, try again after a short delay
            setTimeout(processMath, 100);
        }
    };
    processMath();
}

function loadPDFPage(pageNum) {
    const pdfPages = window.paperData.pdf_images?.pages || [];
    const page = pdfPages.find(p => p.page_number === pageNum);
    if (!page) return;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageNum}"]`)?.classList.add('active');
    
    // Load PDF page image
    const pageContent = document.querySelector('.page-content');
    pageContent.innerHTML = `
        <div style="text-align: center;">
            <img src="images/${page.filename}" alt="Page ${page.page_number}" 
                 style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
        </div>
    `;
    
    currentPage = pageNum;
}

function formatMarkdownContent(content) {
    // Basic markdown to HTML conversion
    // Math formulas will be preserved as-is and processed by MathJax
    let html = content;
    
    // Headers
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // Paragraphs
    html = html.replace(/\\n\\n/g, '</p><p>');
    html = `<p>${html}</p>`;
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    
    return html;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeColumnInterface);
} else {
    initializeColumnInterface();
}
