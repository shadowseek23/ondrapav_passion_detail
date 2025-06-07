document.addEventListener("DOMContentLoaded", function () {
    const elDiscussion = document.querySelector('[data-testid="tabDiscussion"]');
    elDiscussion.firstElementChild.textContent = "Dotazy";
    const elRating = document.querySelector('[data-testid="tabRating"]');
    elRating.firstElementChild.textContent = "Recenze";
});