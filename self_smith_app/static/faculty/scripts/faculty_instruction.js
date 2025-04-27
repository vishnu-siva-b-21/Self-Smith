
function confirmStartGame(level) {
    const toggle = document.querySelector('.btn-onoff input[data-onoff="toggle"]');
    const toggleStatus = toggle && !toggle.checked ? 'off' : 'on';

    Swal.fire({
        title: 'Are you sure?',
        text: "You are about to start the game!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, start the game!',
        cancelButtonText: 'No, cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            // Redirect to the game route with the level and status (optional)
            const redirectUrl = `/faculty/game?level=${level}&status=not-started&toggle=${toggleStatus}`;
console.log("Redirecting to URL:", redirectUrl); // Debug log

// Perform the redirection
window.location.href = redirectUrl;
        }
    });
}

function toggleInfo() {
    const info = document.querySelector('.info');
    const content = document.querySelector('.info-content');
    info.classList.toggle('active');
    content.style.display = content.style.display === 'none' || content.style.display === '' ? 'block' : 'none';
}
