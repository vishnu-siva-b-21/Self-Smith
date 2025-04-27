const OVERLAP = 0.1;
const ROTATION = 5;
const DELAY = 600;
const SCALE = 1.1;
const SWIPE = 75;

let questionData = [];
let response = {};
let isNextClicked = false;

document.addEventListener("DOMContentLoaded", function () {
  fetchQuestions();
});

let toggleStatus = "on"; // Default value for the toggle

// Function to toggle the popup and set event listeners
function toggleInfo() {
  const popup = document.querySelector(".popup");
  const toggle = document.querySelector(
    '.btn-onoff input[data-onoff="toggle"]'
  );

  // Function to hide the popup when clicking outside
  const hidePopup = (event) => {
    if (!popup.contains(event.target) && !event.target.closest(".info")) {
      popup.style.display = "none"; // Hide the popup
      infoClicked = false; // Reset clicked status
      document.removeEventListener("click", hidePopup); // Remove listener
    }
  };

  // Toggle the popup visibility
  if (infoClicked) {
    popup.style.display = "none"; // Hide popup
    document.removeEventListener("click", hidePopup); // Remove listener
  } else {
    popup.style.display = "block"; // Show popup
    document.addEventListener("click", hidePopup); // Add listener for outside clicks
  }

  infoClicked = !infoClicked; // Flip the clicked status

  // Add listener to the toggle switch
  toggle.addEventListener("change", function () {
    toggleStatus = this.checked ? "on" : "off"; // Set the toggle status based on the checkbox
    saveToggleStatus(); // Persist the toggle state
    console.log(`Animations are now ${toggleStatus.toUpperCase()}`);

    if (toggleStatus === "off") {
      disableFunctions(); // Disable animations or related functions
    } else {
      window.location.reload();
      return;
    }
  });
}

// Function to disable specific functions
function disableFunctions() {
  console.log("Disabling specified functions...");

  // Override each function to do nothing and log that it's disabled
  window.resetConfetti = () => {
    console.log("resetConfetti is disabled.");
  };

  window.playPartyPopSound = () => {
    console.log("playPartyPopSound is disabled.");
  };

  window.playCandleBlowSound = () => {
    console.log("playCandleBlowSound is disabled.");
  };

  window.playBetterLuckSound = () => {
    console.log("playBetterLuckSound is disabled.");
  };

  window.playCheerAudSound = () => {
    console.log("playCheerAudSound is disabled.");
  };

  window.triggerConfetti = () => {
    console.log("triggerConfetti is disabled.");
  };
}

// Save the current toggle status in localStorage
function saveToggleStatus() {
  localStorage.setItem("toggleStatus", toggleStatus); // Save the current status
}

// Load the toggle status from localStorage
function loadToggleStatus() {
  const savedStatus = localStorage.getItem("toggleStatus");
  if (savedStatus) {
    toggleStatus = savedStatus; // Update the global variable
  }
}

// Set the toggle switch UI based on the stored toggle status
function setToggleUI() {
  const toggle = document.querySelector(
    '.btn-onoff input[data-onoff="toggle"]'
  );
  if (toggleStatus === "off") {
    toggle.checked = false; // Set toggle to off
    disableFunctions(); // Disable animations or related functions
  }
}

// Run logic on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  loadToggleStatus(); // Load toggle status from localStorage
  setToggleUI(); // Set the UI and logic based on the loaded status
});

async function fetchQuestions() {
  const level = document.getElementById("level").innerText;
  try {
    // Fetch data from the first endpoint (unattended questions)
    const response1 = await fetch(`/faculty/get-ques/${level}`, {
      method: "POST"
    });
    const data1 = await response1.json();

    // Fetch data from the second endpoint (completed questions)
    const response2 = await fetch(`/faculty/get-comp-ques/${level}`, {
      method: "POST"
    });
    const data2 = await response2.json();

    // Log the data from both endpoints
    console.log("Completed Questions:", data2.ques);
    console.log("Unattended Questions:", data1.ques);
    // Calculate totalMaxMarks and totalUserMarks for completed questions
    if (data2.ques && Array.isArray(data2.ques)) {
      data2.ques.forEach((question) => {
        if (question.badges.badge_image && question.badges.name && question.is_correct) {
          badges.push({
            badge_image: question.badges.badge_image,
            name: question.badges.name
          });
        }
        totalMaxMarks += question.max_marks || 0;
        totalUserMarks += question.user_question_mark || 0;
      });
    }

    if (data1.ques) {
      total_comp_ques = data2.ques.length;
      questionData = shuffleArray(data1.ques);
      const coverflow = document.querySelector(".coverflow");
      questionData.forEach((question, index) => {
        const card = createCard(question, index, total_comp_ques);
        coverflow.appendChild(card);
        
        setCardSize(card);

      });

      init();

      updateProgressBar(total_comp_ques);
    } else if (data.error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "data.error"
      });
    }
    questionData = shuffleArray(data1.ques);
  } catch (error) {
    console.error("Error fetching questions:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch questions. Please try again later."
    });
    window.location.href = "/faculty/dashboard";
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function createCard(question, index, total_comp_ques) {
  const card = document.createElement("div");
  card.className = "content";
  card.dataset.index = index;

  let q_color = "";
  let lesson_name = "";

  // Define the background images for the cards based on the lesson
  switch (question.lesson) {
    case "l1":
      q_color = "#929ace";
      lesson_name = "l1";
      break;
    case "l2":
      q_color = "#fe4545";
      lesson_name = "l2";
      break;
    case "l3":
      q_color = "#94ed85";
      lesson_name = "l3";
      break;
    case "l4":
      q_color = "#fbb06c";
      lesson_name = "l4";
      break;
    case "l5":
      q_color = "#c86ac7";
      lesson_name = "l5";
      break;
    case "l6":
      q_color = "#c8cd78";
      lesson_name = "l6";
      break;
    default:
      q_color = "lightgrey";
      break;
  }

  // Apply the card color
  card.style.setProperty("--color", q_color);
  card.style.backgroundColor = q_color;
  card.setAttribute("data-original-color", q_color);
  card.setAttribute("data-lesson-name", lesson_name);
  // Create the front of the card with the question number and lesson name
  const front = document.createElement("div");
  front.className = "front";

  // Check if the badge data exists
  const badgeData = {
    badge_image: question?.badges?.badge_image,
    name: question?.badges?.name
  };

  // Add the card image conditionally based on badge data
  if (badgeData.badge_image && badgeData.name) {
    const cardImage = document.createElement("img");
    cardImage.src = "../static/faculty/images/poppers.png";
    cardImage.alt = "Card Image";
    cardImage.className = "card-image"; // Add CSS for styling
    front.appendChild(cardImage); // Append the image to the front
  }

  // Create a container for the text content
  const contentContainer = document.createElement("div");
  contentContainer.className = "content-container";

  // Create the question number and lesson elements
  const questionNo = document.createElement("h2");
  questionNo.innerText = `Question No.${total_comp_ques + index + 1}`;

  const lesson = document.createElement("h3");
  let lessonText = "";
  switch (question.lesson) {
    case "l1":
      lessonText = "Innovative Pedagogies";
      break;
    case "l2":
      lessonText = "Student Psychology";
      break;
    case "l3":
      lessonText = "Communication Skill";
      break;
    case "l4":
      lessonText = "Course and Programme Outcome";
      break;
    case "l5":
      lessonText = "Research Culture";
      break;
    case "l6":
      lessonText = "Ethics & Values";
      break;
    default:
      lessonText = "General (NOT FOUND)";
      break;
  }
  lesson.innerText = lessonText;

  // Append the text content to the container
  contentContainer.appendChild(questionNo);
  contentContainer.appendChild(lesson);

  // Create the question text
  const questionText = document.createElement("p");
  questionText.innerText = question.question;
  questionText.classList.add("question-text");
  contentContainer.appendChild(questionText);

  // Add the options form
  const optionsForm = document.createElement("form");
  optionsForm.className = "options-form";

  question.options.forEach((option, idx) => {
    const option_word = option["ques"];

    const optionDiv = document.createElement("div");
    optionDiv.className = "option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `question-${index}`;
    radio.id = `question-${index}-option-${idx}`;
    radio.value = option_word;

    const label = document.createElement("label");
    label.htmlFor = radio.id;
    label.innerText = option_word;

    optionDiv.appendChild(radio);
    optionDiv.appendChild(label);
    optionsForm.appendChild(optionDiv);
  });

  // Append the options form and submit button to the content container
  contentContainer.appendChild(optionsForm);

  const submitBtn = document.createElement("button");
  submitBtn.className = "submit-btn";
  submitBtn.innerText = "Submit";
  submitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    submitAnswer(
      question,
      card,
      index,
      question.correct_option,
      question.options,
      total_comp_ques
    );
  });
  contentContainer.appendChild(submitBtn);

  // Append the content container to the front of the card
  front.appendChild(contentContainer);
  card.appendChild(front);

  const back = document.createElement("div");
  back.className = "back";

  const backText = document.createElement("h2");
  backText.innerText = `Evaluation`;

  const yourAnswer = document.createElement("p");
  yourAnswer.className = "your-answer";

  const betterAnswer = document.createElement("p");
  betterAnswer.innerHTML = `Best Answer: <span style="font-weight: bold;">${question.correct_option}</span>`;
  betterAnswer.className = "better-answer";

  const nextBtn = document.createElement("button");
  nextBtn.className = "next-btn-back";
  nextBtn.innerText = "Next";
  nextBtn.addEventListener("click", (event) => {
    event.preventDefault();
    resetCardColor(card);
    flipToFront(card, goToNextCard);
    });

  back.appendChild(backText);
  back.appendChild(yourAnswer);
  back.appendChild(betterAnswer);
  back.appendChild(nextBtn);

  card.appendChild(front);
  card.appendChild(back);
  // function adjustContentSize(card) {
  //   const contentContainer = card.querySelector(".content-container");
  //   const maxHeight = 600; // set your safe card max height (px)
  
  //   if (contentContainer.scrollHeight > maxHeight) {
  //     // If content is too tall, shrink font size
  //     contentContainer.style.fontSize = "0.5rem"; // shrink slightly
  //   } else {
  //     contentContainer.style.fontSize = "1rem"; // normal
  //   }
  // }
  
  return card;
  
}

function resetCardColor(card) {
  const originalColor = card.getAttribute("data-original-color");
  card.style.backgroundColor = originalColor;
}

function setCardSize(card) {
  const front = card.querySelector(".front");
  const back = card.querySelector(".back");
  const frontWidth = front.clientWidth;
  const backWidth = back.clientWidth;
  const maxWidth = Math.max(frontWidth, backWidth);
  card.style.width = `${maxWidth}px`;
  card.style.height = `${Math.max(front.clientHeight, back.clientHeight)}px`;
}

let content = [];
let index = 0;
let answered = new Array(questionData.length).fill(false);

function init() {
  content = [...document.querySelectorAll(".content")];
  content.forEach((c, i) => {
    c.style.zIndex = index === i ? 1 : 0;
    if (index !== i) {
      c.style.backgroundColor = getComputedStyle(c).getPropertyValue("--color");
      c.style.pointerEvents = "none";
    }
  });
  action_flow();
  change_bg(content[index]);
}

function action_flip(show) {
  let current = content[index];
  let shown = current.classList.contains("flipped");
  let change = false;

  if (show && !shown) {
    change = true;
    playWhooshSound();
    current.classList.add("flipped");
    current.style.transform = `rotateY(180deg) rotateZ(0deg) scale(${SCALE})`;
  } else if (shown && !show) {
    change = true;
    playWhooshSound();
    current.style.transform = "rotateY(0deg)";
    setTimeout(() => {
      current.classList.remove("flipped");
      current.style.transform = "";
    }, DELAY);
  }

  return change;
}

function action_flow() {
  content.forEach((c, i) => {
    let transform = "";
    let zindex = "";
    let offset = c.clientWidth * OVERLAP;

    if (i < index) {
      transform = `translateX(-${
        offset * (index - i)
      }%) rotateY(${ROTATION}deg)`;
      zindex = i;
      c.style.pointerEvents = "none";
    } else if (i === index) {
      transform = "rotateY(0deg) translateZ(140px)";
      zindex = content.length;
      c.style.pointerEvents = "auto";
      c.style.opacity = 1;
    } else {
      transform = `translateX(${
        offset * (i - index)
      }%) rotateY(-${ROTATION}deg)`;
      zindex = content.length - i;
      c.style.pointerEvents = "none";
      if (answered[i]) {
        c.classList.add("submitted");
        c.style.opacity = 1;
      } else {
        c.classList.remove("submitted");
        c.style.opacity = 0;
      }
    }

    c.style.transform = transform;
    c.style.zIndex = zindex;
    c.classList.remove("current");
  });

  content[index].style.opacity = 1;
  content[index].classList.add("current");
}

function events() {
  document.addEventListener("keydown", (event) => {
    const EVENTS = {
      ArrowLeft: "dismiss",
      ArrowRight: "dismiss",
      Enter: "submit",
      Backspace: "dismiss",
      Escape: "dismiss"
    };
    if (EVENTS[event.key]) {
      event.preventDefault();
    }
  });

  let touched = 0;

  document.addEventListener("touchstart", (event) => {
    touched = event.changedTouches[0].screenX;
  });

  document.addEventListener("touchend", (event) => {
    let moved = touched - event.changedTouches[0].screenX;
    if (moved < 0 && Math.abs(moved) > SWIPE) state("left");
    if (moved > 0 && Math.abs(moved) > SWIPE) state("right");
  });

  addEventListener("resize", () => {
    action_flow();
  });
}

let badges = [];
let totalMaxMarks = 0;
let totalUserMarks = 0;

const DELAY_FOR_NEXT_BUTTON = toggleStatus === "off" ? 1000 : 2000;

function submitAnswer(
  question,
  card,
  idx,
  correctAnswer,
  options,
  total_comp_ques
) {

  console.log(question);
  if (isNextClicked) return;

  isNextClicked = false;
  const selectedOption = card.querySelector('input[type="radio"]:checked');
  if (!selectedOption) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Please select an option before submitting!"
    });
    return;
  }

  const selectedOp = selectedOption.value;
  const selectedOptionData = options.find(
    (option) => option["ques"] === selectedOp
  );
  const userMark = selectedOptionData ? selectedOptionData["marks"] : null;
 
  const ques_max_marks = question.max_marks;

  totalMaxMarks += ques_max_marks;
  totalUserMarks += userMark;

  const data = {
    ques_id: question._id["$oid"],
    ques_name: question.question,
    ques_max_marks: ques_max_marks,
    user_answer: selectedOp,
    ques_correct_answer: question.correct_option,
    ques_user_mark: userMark
  };

  console.log(data)

  // Add badge data only if the answer is correct
  if (selectedOption.value === correctAnswer) {
    if (questionData[idx].badges.badge_image && questionData[idx].badges.name) {
    const badgeData = {
      badge_image: questionData[idx].badges.badge_image,
      name: questionData[idx].badges.name
    };
    data.badge = badgeData;
    badges.push(badgeData);
  }
  }

  const selectedLabel = card.querySelector(`label[for="${selectedOption.id}"]`);
  selectedLabel.classList.add("bold");
  const yourAnswer = card.querySelector(".your-answer");
  yourAnswer.innerHTML = `Your Answer: <span style="font-weight: bold;">${selectedOption.value}</span>`;
  answered[idx] = true;

  const frontContent = card.querySelector(".front");
  const backContent = card.querySelector(".back");

  frontContent.style.opacity = 0;
  backContent.style.opacity = 1;
  playWhooshSound();
  card.classList.add("flipped");
  card.style.transform = `rotateY(360deg) rotateZ(0deg) scale(${SCALE})`;

  const nextBtn = card.querySelector(".next-btn-back");
  nextBtn.classList.remove("show");

  setTimeout(() => {
    if (selectedOption.value === correctAnswer) {
      const bestAnswer = document.querySelector(".best-answer-animation");

      // Always display the best answer animation
      setTimeout(() => {
        bestAnswer.style.display = "block";
      }, 700);

      setTimeout(() => {
        bestAnswer.style.display = "none";
      }, 3000);

      // Trigger confetti and sound only if toggleStatus !== "off"
      if (toggleStatus !== "off") {
        setTimeout(() => {
          triggerConfetti();
          playPartyPopSound();
        }, 300);
      }
      if (question.badges && question.badges.name) {
        Swal.fire({
          title: "Congratulations!",
          text: question.badges.name,
          imageUrl: question.badges.badge_image, 
          imageWidth: 80,
          imageHeight: 80,
          imageAlt: "Badge Icon",
        });
      }
      setTimeout(() => {
        nextBtn.classList.add("show");
      }, DELAY_FOR_NEXT_BUTTON);
    } else {
      const betterLuck = document.querySelector(".better-luck-animation");
      const candlesAnimation = document.querySelector(".wrapper");
      if (toggleStatus == "off") {
        // Always display the better luck animation
        setTimeout(() => {
          betterLuck.style.display = "block";
        }, 700);

        setTimeout(() => {
          betterLuck.style.display = "none";
        }, 3000);
      }
      // Candles animation and sounds only if toggleStatus !== "off"
      if (toggleStatus !== "off") {
        candlesAnimation.style.display = "block";
        setTimeout(() => {
          playCandleBlowSound();
        }, 300);
        setTimeout(() => {
          candlesAnimation.style.display = "none";
          betterLuck.style.display = "block";
          playBetterLuckSound();
          setTimeout(() => {
            betterLuck.style.display = "none";
          }, 3000);
        }, 2600);
      } else {
        setTimeout(() => {
          betterLuck.style.display = "none";
        }, 3000);
      }

      setTimeout(() => {
        nextBtn.classList.add("show");
      }, DELAY_FOR_NEXT_BUTTON);
    }
  }, DELAY);

  card.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.disabled = true;
  });
  card.querySelector(".submit-btn").disabled = true;

  updateProgressBar(total_comp_ques);

  nextBtn.addEventListener("click", () => {
    console.log(data)
        fetch(`/faculty/save-ques`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.message) {
          Swal.fire({
            title: "Error",
            text: data.error,
            icon: "error"
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          title: "Error",
          text: "There was an error sending the request",
          icon: "error"
        });
      });
    if (idx === questionData.length - 1) {
      const allCards = document.querySelectorAll(".content");
      const prooo = document.getElementById("progress-container");
      const infobtn = document.getElementById("info-btn");
      
      allCards.forEach((card) => {
        card.style.transition = "opacity 0.5s ease-out";
        card.style.opacity = 0;
        setTimeout(() => {
          prooo.style.display = "none";
          infobtn.style.display = "none";
          card.style.display = "none";
        }, 500);
      });

      setTimeout(() => {
        const congratsCard = document.getElementById("congrats-card");
        congratsCard.style.display = "block";
        congratsCard.style.opacity = 0;
        congratsCard.style.transition = "opacity 0.5s ease-in";
        congratsCard.style.opacity = 1;

        const progressBar = congratsCard.querySelector(".progress-bar");
        progressBar.style.width = "0%";

        setTimeout(() => {
          progressBar.style.transition = "width 3s ease-in-out";
          const percentage = (totalUserMarks / totalMaxMarks) * 100;
          progressBar.style.width = `${percentage}%`;

          // Add tooltip hover functionality
          progressBar.setAttribute(
            "data-tooltip",
            `Progress: ${percentage.toFixed(2)}%`
          );
          progressBar.addEventListener("mouseenter", () => {
            const tooltip = document.createElement("div");
            tooltip.className = "progress-tooltip";
            tooltip.innerHTML = `${percentage.toFixed(2)}%`;
            document.body.appendChild(tooltip);

            const rect = progressBar.getBoundingClientRect();
            tooltip.style.left = `${
              rect.left +
              window.scrollX +
              rect.width / 2 -
              tooltip.offsetWidth / 2
            }px`;
            tooltip.style.top = `${
              rect.top + window.scrollY - tooltip.offsetHeight - 10
            }px`;

            progressBar.addEventListener("mouseleave", () => {
              document.body.removeChild(tooltip);
            });
          });

          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 1;
            updateStars(progress);
            if (progress >= percentage) {
              clearInterval(progressInterval);
            }
          }, 20);
        }, 100);

        const scoreElement = congratsCard.querySelector(".score");
        scoreElement.innerHTML = `Your Score: ${totalUserMarks} out of ${totalMaxMarks} marks`;

        const badgesContainer = congratsCard.querySelector(".badges-container");
        console.log(badges);
        badgesContainer.innerHTML = '<button class="badge" id="badge">View the Badges earned</button>';
        
        // Add event listener after adding the button to DOM
        document.getElementById("badge").addEventListener("click", function() {
          let badgeImages = '';
          
          // Create HTML string with all badge images using badge_image property
          badges.forEach(badge => {
            badgeImages += `<img src="${badge.badge_image}" alt="${badge.name}" style="width: 80px; height: 80px; margin: 10px;" />`;
          });
          
          // Display SweetAlert with badge images
          Swal.fire({
            title: 'Badges',
            html: badgeImages,
            width: '40%',
            confirmButtonText: 'Close',
            confirmButtonColor: '#4a90e2',
            background: '#f8f9fa',
            backdrop: `rgba(0,0,0,0.4)`
          });
        });
        
      }, 500);
    }
  });
}

function updateProgressBar(total_comp_ques) {
  const totalQuestions = questionData.length + total_comp_ques; // Total includes both attended and completed questions
  const answeredQuestions = answered.filter(Boolean).length + total_comp_ques; // Include completed questions in answered count
  const remainingQuestions = totalQuestions - answeredQuestions; // Remaining questions now factor in completed questions

  const percentage = (answeredQuestions / totalQuestions) * 100;

  // Update the progress bar width
  const progressFill = document.querySelector(".progress-fill-main");
  progressFill.style.width = `${percentage}%`;

  // Update the tooltip with the remaining questions
  const progressTooltip = document.getElementById("progress-info-main");
  progressTooltip.textContent = `Remaining Questions: ${remainingQuestions}`;
}

// Add a hover event listener to the progress bar
document
  .querySelector(".progress-container-main")
  .addEventListener("mouseenter", () => {
    const totalQuestions = questionData.length;
    const answeredQuestions = answered.filter(Boolean).length;
    const remainingQuestions = totalQuestions - answeredQuestions;

    // Update the tooltip to show the remaining questions on hover
    const progressTooltip = document.getElementById("progress-info-main");
    progressTooltip.textContent = `Remaining Questions: ${remainingQuestions}`;
  });

function playPartyPopSound() {
  const partyPopSound = document.getElementById("Party-pop");
  partyPopSound.currentTime = 0;
  partyPopSound.play();
  setTimeout(() => {
    playCheerAudSound();
  }, 500);
}

function playCandleBlowSound() {
  const candleBlowSound = document.getElementById("candle-blow");
  candleBlowSound.currentTime = 0;
  candleBlowSound.play();

  // setTimeout(() => {
  //   playBetterLuckSound();
  // }, 2200);
}

function playBetterLuckSound() {
  const betterLuckSound = document.getElementById("better-luck");
  betterLuckSound.currentTime = 0;
  betterLuckSound.play();
}
function playCheerAudSound() {
  const cheerAudSound = document.getElementById("cheer-aud");
  cheerAudSound.currentTime = 0;
  cheerAudSound.play();
}

function flipToFront(card, callback) {
  setTimeout(() => {
    card.classList.remove("flipped");
    card.style.transform = "rotateY(0deg)";
    resetCardColor(card);

    const sounds = ["Party-pop", "cheer-aud", "candle-blow", "better-luck"];
    sounds.forEach((soundId) => {
      const sound = document.getElementById(soundId);
      sound.pause();
      sound.currentTime = 0;
    });

    const animations = [
      ".better-luck-animation",
      ".best-answer-animation",
      ".wrapper"
    ];
    animations.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.display = "none";
      }
    });

    resetConfetti();

    const frontContent = card.querySelector(".front");
    const backContent = card.querySelector(".back");

    frontContent.style.opacity = 1;
    backContent.style.opacity = 0;
    if (answered[parseInt(card.dataset.index)]) {
      card.classList.add("submitted");
    }

    setTimeout(() => {
      if (callback) callback();
    }, DELAY);
  });
}

function resetConfetti() {
  if (window.confetti) {
    window.confetti.reset();
  }
  const confettiElements = document.querySelectorAll(".confetti-piece");
  confettiElements.forEach((element) => element.remove());
}

function playWhooshSound() {
  const whooshSound = document.getElementById("whoosh-sound");
  whooshSound.currentTime = 0;
  whooshSound.play();
}

function change_bg(card) {
  const lesson = card.getAttribute("data-lesson-name");

  document.body.style.transition = "background-image 1s ease-in-out";
  switch (lesson) {
    case "l1":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/Innovative pedogogy bg.jpg')";
      break;
    case "l2":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/Student psycology bg.jpg')";
      break;
    case "l3":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/Communication skills bg.jpg')";
      break;
    case "l4":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/Course outcomes bg.jpg')";
      break;
    case "l5":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/Research culture bg.jpg')";
      break;
    case "l6":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/Ethics and values bg.jpg')";
      break;
    default:
      break;
  }

  // Apply background properties
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
}

function goToNextCard() {
  if (index < content.length - 1) {
    index++;
    // Trigger background change with smooth transition
    change_bg(content[index]);
    action_flow();
  }
}

function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 1 },
    colors: ["#ff6b6b", "#f8e71c", "#32d7ff", "#bb6bd9", "#f78fb3", "#78e08f"]
  });
}

events();

document.getElementById("exit-game").addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure want to Exit?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, exit!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/faculty/dashboard";
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log("Delete canceled");
    }
  });
});
// document.getElementById("exit-game-congrats").addEventListener("click", () => {
//   Swal.fire({
//     title: "Are you sure want to Exit?",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonText: "Yes, exit!",
//     cancelButtonText: "No, cancel!",
//     reverseButtons: true
//   }).then((result) => {
//     if (result.isConfirmed) {
//       localStorage.clear();
//       window.location.href = "/faculty/dashboard";
//     } else if (result.dismiss === Swal.DismissReason.cancel) {
//       console.log("Delete canceled");
//     }
//   });
// });
function updateStars(progress) {
  if (progress >= 50) {
    document.getElementById("star1").classList.add("checked");
    document.getElementById("star1").classList.remove("unchecked");
  }
  if (progress >= 75) {
    document.getElementById("star2").classList.add("checked");
    document.getElementById("star2").classList.remove("unchecked");
  }
  if (progress >= 100) {
    document.getElementById("star3").classList.add("checked");
    document.getElementById("star3").classList.remove("unchecked");
  }
}

function animateProgressBar() {
  const progressBar = document.getElementById("progressBar");
  const targetValue = parseInt(document.getElementById("value").innerText, 10);
  let width = 0;

  const intervalTime = 2000 / targetValue;
  const interval = setInterval(() => {
    if (width >= targetValue) {
      clearInterval(interval);
    } else {
      width++;
      progressBar.style.width = width + "%";
      progressBar.setAttribute("aria-valuenow", width);
      updateStars();
    }
  }, intervalTime);
}
window.onload = animateProgressBar;
