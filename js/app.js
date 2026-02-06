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
      // User wants to close - prevent default and animate out
      e.preventDefault();
      isAnimating = true;
      
      if (content) {
        const currentHeight = content.scrollHeight;
        content.style.maxHeight = currentHeight + 'px';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
        
        // Force reflow
        void content.offsetHeight;
        
        // Animate out
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
      // Opening animation
      if (content) {
        // Set initial state
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        content.style.transform = 'translateY(-10px)';
        
        // Force reflow
        void content.offsetHeight;
        
        // Animate in
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
          const otherSummary = otherDetails.querySelector('summary');
          const otherContent = otherDetails.querySelector('.dropdown-content');
          
          if (otherContent) {
            const currentHeight = otherContent.scrollHeight;
            otherContent.style.maxHeight = currentHeight + 'px';
            otherContent.style.opacity = '1';
            otherContent.style.transform = 'translateY(0)';
            
            // Force reflow
            void otherContent.offsetHeight;
            
            // Animate out
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

const photos = [
  'img/design/jk_logo.png',
  'img/design/jk_header.png',
  // 'img/photography/red_stairs_2.JPG',
  // 'img/photography/lily.jpeg',
  // 'img/photography/roof_pose.jpg',
  // 'img/photography/gondola.jpg',
  // 'img/photography/red_stairs_1.JPG',
  // 'img/photography/maple.jpeg',
  // 'img/photography/tahoe.JPG',
];

const artGrid = document.querySelector('.art-grid');
const artPopup = document.getElementById('art-popup');
const popupArt = document.querySelector('.popup-art');
const artCloseBtn = document.querySelector('.art-close-btn');

const photoGrid = document.querySelector('.photo-grid');
const photoPopup = document.getElementById('photo-popup');
const popupImage = document.querySelector('.popup-image');
const photoCloseBtn = document.querySelector('.photo-close-btn');

function setupGrid(grid, popup, popupImage, closeBtn, items) {
  if (grid) {
    items.forEach((itemPath) => {
      const img = document.createElement('img');
      img.src = itemPath;
      img.alt = 'Image';
      img.classList.add('grid-item');
      grid.appendChild(img);

      img.addEventListener('click', () => {
        popupImage.src = itemPath;
        popup.style.display = 'flex';
      });
    });
  } else {
    console.error('Grid container not found!');
  }

  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });
}

setupGrid(artGrid, artPopup, popupArt, artCloseBtn, art);
setupGrid(photoGrid, photoPopup, popupImage, photoCloseBtn, photos);

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'dark') {
  body.classList.add('dark-mode');
  darkModeToggle.textContent = '☀️';
} else {
  darkModeToggle.textContent = '🌙';
}

// Toggle dark mode
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
