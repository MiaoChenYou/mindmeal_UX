const slides = [...document.querySelectorAll(".slide")];
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
let activeIndex = 0;
let wheelLocked = false;
let touchStartY = 0;

function updateDeckScale() {
  const isPortraitLayout = window.matchMedia("(max-width: 900px)").matches;
  const scale = isPortraitLayout ? 1 : Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  document.documentElement.style.setProperty("--deck-scale", String(scale));
}

updateDeckScale();
window.addEventListener("resize", updateDeckScale, { passive: true });

function setActive(index, updateHash = true) {
  activeIndex = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === activeIndex);
    slide.classList.toggle("before", slideIndex < activeIndex);
    slide.setAttribute("aria-hidden", slideIndex === activeIndex ? "false" : "true");
  });
  previousButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === slides.length - 1;
  if (updateHash) history.replaceState(null, "", `#slide-${activeIndex + 1}`);
}

function goTo(index) {
  const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
  if (safeIndex !== activeIndex) setActive(safeIndex);
}

document.addEventListener("wheel", event => {
  const activeSlide = slides[activeIndex];
  const isMobileLayout = matchMedia("(max-width: 900px)").matches;
  if (isMobileLayout && activeSlide.scrollHeight > activeSlide.clientHeight) {
    const atTop = activeSlide.scrollTop <= 0;
    const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 2;
    if ((event.deltaY > 0 && !atBottom) || (event.deltaY < 0 && !atTop)) return;
  }
  event.preventDefault();
  if (wheelLocked || Math.abs(event.deltaY) < 18) return;
  wheelLocked = true;
  goTo(activeIndex + (event.deltaY > 0 ? 1 : -1));
  window.setTimeout(() => { wheelLocked = false; }, 650);
}, { passive: false });

document.addEventListener("touchstart", event => {
  touchStartY = event.changedTouches[0]?.clientY ?? 0;
}, { passive: true });

document.addEventListener("touchend", event => {
  const endY = event.changedTouches[0]?.clientY ?? touchStartY;
  const delta = touchStartY - endY;
  const activeSlide = slides[activeIndex];
  const atTop = activeSlide.scrollTop <= 0;
  const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 2;
  if (Math.abs(delta) < 55) return;
  if (delta > 0 && atBottom) goTo(activeIndex + 1);
  if (delta < 0 && atTop) goTo(activeIndex - 1);
}, { passive: true });
previousButton.addEventListener("click", () => goTo(activeIndex - 1));
nextButton.addEventListener("click", () => goTo(activeIndex + 1));

document.addEventListener("keydown", event => {
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    goTo(activeIndex + 1);
  }
  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goTo(activeIndex - 1);
  }
  if (event.key === "Home") goTo(0);
  if (event.key === "End") goTo(slides.length - 1);
});

const hashPage = Number(location.hash.replace("#slide-", ""));
if (hashPage >= 1 && hashPage <= slides.length) {
  setActive(hashPage - 1, false);
} else {
  setActive(0, false);
}

window.addEventListener("hashchange", () => {
  const page = Number(location.hash.replace("#slide-", ""));
  if (page >= 1 && page <= slides.length) setActive(page - 1, false);
});
