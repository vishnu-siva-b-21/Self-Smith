document.querySelectorAll('.progress-done').forEach(progress => {
    const done = parseInt(progress.getAttribute('data-done')); // Get the progress value

    if (done === 0) {
      // Change the parent's class from "progress" to "start-quiz"
      const progressContainer = progress.parentElement; // Get parent div with class "progress"
      progressContainer.className = 'start-quiz'; // Replace class with "start-quiz"

      // Remove the progress bar content
      progressContainer.innerHTML = ''; // Clear the inner content of the progress container

      // Add the "Start the Quiz" message
      const startText = document.createElement('big');
      startText.textContent = 'Click to Start';
      startText.style.color = '#FFF'; // Set text color
      startText.style.fontWeight = 'bold'; // Bold font
      startText.style.textAlign = 'center'; // Center the text
      startText.style.display = 'block'; // Make it behave as a block element
      startText.style.marginTop = '10px'; // Optional spacing
      startText.style.margin = '15px 0';
      startText.style.height = '30px';
      startText.style.width = '300px';
      startText.style.display = 'flex';
      startText.style.justifyContent = 'space-between';
      progressContainer.appendChild(startText); // Add the big tag to the container
    } else {
      // Show progress for other values
      progress.style.width = done + '%';
      progress.style.opacity = 1;
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Select all anchor tags with the class 'quiz-link'
    const quizLinks = document.querySelectorAll('.quiz-link');

    quizLinks.forEach(link => {
      link.addEventListener('click', function (event) {
        const screenWidth = window.innerWidth;

        // Check if the screen width is less than 1024px (not a laptop screen)
        if (screenWidth < 1024) {
          event.preventDefault(); // Prevent navigation
          Swal.fire({
            icon: 'warning',
            title: 'Not Supported',
            text: 'This quiz can only be attended on Larger Screens. Please use one.',
            confirmButtonText: 'Okay'
          });
        }
      });
    });
  });