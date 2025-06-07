document.addEventListener("DOMContentLoaded", function () {
    const elMiniCookies = document.querySelector('[data-pobo-widget-id="234"]');
    if (elMiniCookies) {
        const link = elMiniCookies.querySelector("a");
        if (link) {
            link.textContent = "Zobrazit více informací";
            elMiniCookies.addEventListener("click", function (event) {
                // event.preventDefault(); ;
                window.location.href = link.href;
            });
        } else {
            console.warn("Link not found in the mini cookies widget.");
        }        
    }
});