// ============================================
// ACCORDION FUNCTIONALITY
// ============================================
const detailsElements = document.querySelectorAll('.portfolio-container');

detailsElements.forEach((details) => {
  const summary = details.querySelector('summary');
  const content = details.querySelector('.dropdown-content');
  let isAnimating = false;
  
  // Initialize closed state
  if (!details.open && content) {
    content.style.maxHeight = '0';
    content.style.opacity = '0';
    content.style.transform = 'translateY(-10px)';
  }
  
  summary.addEventListener('click', (e) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }
    
    if (details.open) {
      e.preventDefault();
      isAnimating = true;
      
      if (content) {
        const currentHeight = content.scrollHeight;
        content.style.maxHeight = currentHeight + 'px';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
        void content.offsetHeight;
        
        requestAnimationFrame(() => {
          content.style.maxHeight = '0';
          content.style.opacity = '0';
          content.style.transform = 'translateY(-10px)';
          
          setTimeout(() => {
            details.open = false;
            isAnimating = false;
          }, 400);
        });
      } else {
        details.open = false;
        isAnimating = false;
      }
    }
  });
  
  details.addEventListener('toggle', () => {
    if (isAnimating) return;
    
    if (details.open) {
      if (content) {
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        content.style.transform = 'translateY(-10px)';
        void content.offsetHeight;
        
        requestAnimationFrame(() => {
          const targetHeight = content.scrollHeight;
          content.style.maxHeight = targetHeight + 'px';
          content.style.opacity = '1';
          content.style.transform = 'translateY(0)';
        });
      }
      
      // Close other details with animation
      detailsElements.forEach((otherDetails) => {
        if (otherDetails !== details && otherDetails.open) {
          const otherContent = otherDetails.querySelector('.dropdown-content');
          
          if (otherContent) {
            const currentHeight = otherContent.scrollHeight;
            otherContent.style.maxHeight = currentHeight + 'px';
            otherContent.style.opacity = '1';
            otherContent.style.transform = 'translateY(0)';
            void otherContent.offsetHeight;
            
            requestAnimationFrame(() => {
              otherContent.style.maxHeight = '0';
              otherContent.style.opacity = '0';
              otherContent.style.transform = 'translateY(-10px)';
              
              setTimeout(() => {
                otherDetails.open = false;
              }, 400);
            });
          } else {
            otherDetails.open = false;
          }
        }
      });
    }
  });
});

// ============================================
// BLOG POST RENDERING
// ============================================
function renderBlogPosts() {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;
  
  blogPosts.forEach(post => {
    const blogPostDiv = document.createElement('div');
    blogPostDiv.className = 'blog-post';
    
    let tagsHTML = '';
    if (post.tags && post.tags.length > 0) {
      tagsHTML = '<div class="blog-tags">' + 
        post.tags.map(tag => `<span class="tag tag-${tag}">${tag}</span>`).join('') + 
        '</div>';
    }
    
    blogPostDiv.innerHTML = `
      <h3>${post.date} ⋆ <a href="blog/${post.id}.html">${post.title}</a></h3>
      ${tagsHTML}
    `;
    
    container.appendChild(blogPostDiv);
  });
}

// Call on page load
if (document.getElementById('blog-posts-container')) {
  renderBlogPosts();
}

// ============================================
// ART GALLERY
// ============================================
const art = [
  'img/art/woman.jpg',
  'img/art/woman_oil.jpg',
  'img/art/woman_charcoal.jpg',
  'img/art/digital.JPG',
  'img/art/still_life_bear.jpg',
  'img/art/landscape.jpg',
  'img/art/still_life_fruit.jpg',
  'img/art/fish_oil.jpg',
  'img/art/og.jpg',
];

function setupGallery(gridSelector, popupSelector, popupImgSelector, closeBtnSelector, items) {
  const grid = document.querySelector(gridSelector);
  const popup = document.querySelector(popupSelector);
  const popupImg = document.querySelector(popupImgSelector);
  const closeBtn = document.querySelector(closeBtnSelector);
  
  if (!grid || !popup || !popupImg || !closeBtn) return;
  
  items.forEach((itemPath) => {
    const img = document.createElement('img');
    img.src = itemPath;
    img.alt = 'Gallery image';
    img.classList.add('grid-item');
    grid.appendChild(img);

    img.addEventListener('click', () => {
      popupImg.src = itemPath;
      popup.style.display = 'flex';
    });
  });

  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });
}

setupGallery('.art-grid', '#art-popup', '.popup-art', '.art-close-btn', art);

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
});