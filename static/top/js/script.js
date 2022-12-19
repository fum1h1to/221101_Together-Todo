const swiper = new Swiper('#js-meritBoxSlide', {
    // Optional parameters
    effect: 'fade',
    loop: true,
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    autoplay: {
        delay: 5000,
    }

  });