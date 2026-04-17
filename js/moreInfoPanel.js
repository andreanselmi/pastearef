/*Small js to handle the welcome info panel at the beginning of the sidebar*/


const helpBtn = document.getElementById('help-btn');
const helpPanel = document.getElementById('help-panel');

helpBtn.onclick = (e) => {
    e.stopPropagation(); // Clicks are associated with the parents DOM too, so this stops the click event from "reaching" the parent window where it would trigger the "close panel" event instantly
    helpPanel.classList.toggle('show'); //add the additional "show" class to the helpPanel
};

// Close panel if the user clicks anywhere else in the sidebar or window
window.addEventListener('click', () => {
    helpPanel.classList.remove('show');
});

// Stop clicks INSIDE the panel from closing the panel (so you can click the link!)
helpPanel.onclick = (e) => e.stopPropagation();
