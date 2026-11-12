
document.getElementById('year').textContent = new Date().getFullYear();

const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dot')];
const current = document.getElementById('current');
const slider = document.querySelector('.slider');
const videoSection = document.querySelector('#videos');

let active = 0;
let sectionVisible = false;
let dragStartX = 0;
let dragMoved = false;
let suppressClick = false;

const videos = slides.map(slide => {
    const video = slide.querySelector('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    return video;
});

function playActiveVideo() {
    videos.forEach((video, i) => {
        if (i !== active) {
            video.pause();
        }
    });

    if (sectionVisible) {
        videos[active].play().catch(() => {
            // Някои браузъри може да блокират автоматичното пускане.
        });
    } else {
        videos[active].pause();
    }
}

function showSlide(index) {
    active = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === active);
        dots[i]?.classList.toggle('active', i === active);

        videos[i].pause();

        if (i === active) {
            videos[i].currentTime = 0;
        }
    });

    current.textContent = String(active + 1).padStart(2, '0');

    if (sectionVisible) {
        videos[active].play().catch(() => {});
    }
}

document.querySelector('.prev').addEventListener('click', () => {
    showSlide(active - 1);
});

document.querySelector('.next').addEventListener('click', () => {
    showSlide(active + 1);
});

dots.forEach((dot, i) => {
    dot.addEventListener('click', () => showSlide(i));
});

// Клик върху видеото = пауза / продължаване
videos.forEach((video, i) => {
    video.addEventListener('click', () => {
        if (suppressClick) return;
        if (i !== active || !sectionVisible) return;

        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
});

// Автоматично пускане при влизане в екрана
// и спиране при излизане от екрана
const observer = new IntersectionObserver(entries => {
    sectionVisible = entries[0].isIntersecting;
    if (sectionVisible) {
        playActiveVideo();
    } else {
        videos.forEach(video => video.pause());
    }
}, {
    threshold: 0.35
});

observer.observe(videoSection);

// Смяна чрез плъзгане с мишка или пръст
slider.addEventListener('pointerdown', e => {
    dragStartX = e.clientX;
    dragMoved = false;
});

slider.addEventListener('pointerup', e => {
    const distance = e.clientX - dragStartX;

    if (Math.abs(distance) > 55) {
        dragMoved = true;
        suppressClick = true;

        showSlide(distance < 0 ? active + 1 : active - 1);

        setTimeout(() => {
            suppressClick = false;
        }, 100);
    }
});

slider.addEventListener('click', e => {
    if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
    }
}, true);

// Пакетите във формата за контакт
document.querySelectorAll('[data-package]').forEach(link => {
    link.addEventListener('click', () => {
        const select = document.getElementById('package');
        const val = link.dataset.package;
        const option = [...select.options].find(o =>
            val.toLowerCase().includes(o.text.toLowerCase()) ||
            o.text.toLowerCase().includes(val.split(' — ')[0].toLowerCase())
        );

        select.value = option ? option.value : 'Друго';
    });
});

// Мобилно меню
const menuButton = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
    });
});
