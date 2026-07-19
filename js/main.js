const box = document.getElementById('testimonialCarousel'); // get this exact element from the web page
const buttons = document.querySelectorAll('.testimonial-tab'); // get all of the elements from this class

function show(num) {
    buttons.forEach((btn) => btn.classList.remove('active'));
    void buttons[num].offsetWidth; // so it does not move so quick when restarting
    buttons[num].classList.add('active');
}

box.addEventListener('slide.bs.carousel', function (e) {
    show(e.to);
});

show(1);