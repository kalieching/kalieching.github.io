const detailsElements = document.querySelectorAll('.portfolio-container');

detailsElements.forEach((details) => {
  details.addEventListener('toggle', () => {
    if (details.open) {
      detailsElements.forEach((otherDetails) => {
        if (otherDetails !== details) {
          otherDetails.open = false;
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
  'img/photography/flower_portrait.JPG',
  'img/photography/purple_flowers.jpg',
  'img/photography/red_stairs_2.JPG',
  'img/photography/lily.jpeg',
  'img/photography/roof_pose.jpg',
  'img/photography/gondola.jpg',
  'img/photography/red_stairs_1.JPG',
  'img/photography/maple.jpeg',
  'img/photography/tahoe.JPG',
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
