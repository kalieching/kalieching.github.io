// ============================================
// BLOG POST PAGE FUNCTIONALITY
// ============================================

// Get post ID from URL
function getPostIdFromURL() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
  }
  
  // Find post data
  function findPost(postId) {
    return blogPosts.find(post => post.id === postId);
  }
  
  // Render post content
  function renderPost() {
    const postId = getPostIdFromURL();
    const post = findPost(postId);
    
    if (!post) {
      document.getElementById('post-title').textContent = 'Post Not Found';
      document.getElementById('post-content').innerHTML = '<p>Sorry, this blog post could not be found.</p>';
      return;
    }
    
    // Update page title
    document.getElementById('page-title').textContent = `${post.title} | Kalie Ching`;
    document.title = `${post.title} | Kalie Ching`;
    
    // Update post header
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-date').textContent = post.date;
    
    // Update tags
    const tagsContainer = document.getElementById('post-tags');
    if (post.tags && post.tags.length > 0) {
      tagsContainer.innerHTML = post.tags.map(tag => 
        `<span class="tag tag-${tag}">${tag}</span>`
      ).join('');
    } else {
      tagsContainer.style.display = 'none';
    }
    
    // Update content
    document.getElementById('post-content').innerHTML = post.content;
    
    // Initialize view counter
    initViewCounter(postId);
  }
  
  // ============================================
  // VIEW COUNTER (using localStorage + optional API)
  // ============================================
  function initViewCounter(postId) {
    const viewCountElement = document.getElementById('view-count-number');
    
    // Check if already viewed this session
    const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
    
    if (!viewedPosts.includes(postId)) {
      // Increment view count
      incrementViewCount(postId);
      viewedPosts.push(postId);
      sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
    }
    
    // Display current view count
    const viewCount = getViewCount(postId);
    viewCountElement.textContent = viewCount;
  }
  
  function getViewCount(postId) {
    const counts = JSON.parse(localStorage.getItem('blogViewCounts') || '{}');
    return counts[postId] || 0;
  }
  
  function incrementViewCount(postId) {
    const counts = JSON.parse(localStorage.getItem('blogViewCounts') || '{}');
    counts[postId] = (counts[postId] || 0) + 1;
    localStorage.setItem('blogViewCounts', JSON.stringify(counts));
    
    // Optional: Send to analytics API
    // You can integrate with Google Analytics, PostHog, or a custom backend
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: postId,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }
  
  // ============================================
  // DARK MODE TOGGLE
  // ============================================
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const body = document.body;
  
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
  } else {
    body.classList.remove('dark-mode');
    darkModeToggle.textContent = '🌙';
  }
  
  darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
      darkModeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    } else {
      darkModeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    }
    
    // Update Giscus theme
    updateGiscusTheme();
  });
  
  function updateGiscusTheme() {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
      const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme } } },
        'https://giscus.app'
      );
    }
  }
  
  // ============================================
  // INITIALIZE PAGE
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    renderPost();
  });