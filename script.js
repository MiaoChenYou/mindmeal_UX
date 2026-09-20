const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll("[data-dot]")];
const currentPage = document.querySelector("#current-page");
const progressBar = document.querySelector("#progress-bar");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
let activeIndex = 0;

function setActive(index, updateHash = true) {
  activeIndex = Math.max(0, Math.min(index, slides.length - 1));
  const page = String(activeIndex + 1).padStart(2, "0");
  currentPage.textContent = page;
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === activeIndex));
  previousButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === slides.length - 1;
  if (updateHash) history.replaceState(null, "", `#slide-${activeIndex + 1}`);
}

function goTo(index) {
  const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
  slides[safeIndex].scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

const observer = new IntersectionObserver(
  entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(Number(visible.target.dataset.slide) - 1);
  },
  { threshold: [0.35, 0.55, 0.75] }
);

slides.forEach(slide => observer.observe(slide));
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
  requestAnimationFrame(() => slides[hashPage - 1].scrollIntoView());
} else {
  setActive(0, false);
}
