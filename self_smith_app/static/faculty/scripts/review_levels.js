document.querySelectorAll('.badge-clickable').forEach((badgeElement) => {
    badgeElement.addEventListener('click', function () {
      const badgeImage = this.getAttribute('data-badge-image');
      const badgeName = this.getAttribute('data-badge-name');
      const catGif = this.getAttribute('data-cat-gif');

      const squareDiv = document.createElement('div');
      squareDiv.classList.add('square');
      const containerDiv = document.createElement('div');
      containerDiv.style.display = 'flex';
      containerDiv.style.justifyContent = 'center';
      containerDiv.style.marginBottom = '20px';
      containerDiv.appendChild(squareDiv);

      const style = document.createElement('style');
      style.textContent = `
        .square {
            width: 100px;
            height: 100px;
            background-image: url("${badgeImage}");
            background-size: cover;
            background-position: center;
            transform: rotateY(45deg);
            animation: rotateAnimation 1s linear infinite;
        }
        @keyframes rotateAnimation {
            from {transform: rotateY(45deg);}
            to {transform: rotateY(225deg);}
        }
      `;
      document.head.appendChild(style);

      Swal.fire({
        title: `Congratulations on earning the ${badgeName} badge!`,
        html: `
          <div style="text-align: center;">
              ${containerDiv.outerHTML}
              <p><b>Keep progressing to earn higher badges!</b></p>
          </div>
        `,
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: 'Badge image',
        confirmButtonText: 'Okay',
        background: '#f0f0f0',
        backdrop: `
            rgba(0, 0, 0, 0.5)
            url("${catGif}")
            center top
            no-repeat
        `,
        customClass: {
          popup: 'swal2-popup-custom',
        },
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
      });
    });
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
            text: 'This quiz can only be attended on laptops. Please use a larger screen.',
            confirmButtonText: 'Okay'
          });
        }
      });
    });
  });