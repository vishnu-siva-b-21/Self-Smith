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

// Function to disable the specified functions
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

// Function to check toggle status from the URL
function getToggleStatus() {
  const params = new URLSearchParams(window.location.search);
  return params.get("toggle"); // Returns 'on', 'off', or null if the parameter is not set
}

// Run logic on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const toggleStatus = getToggleStatus();
  console.log("Toggle status:", toggleStatus);

  if (toggleStatus === "off") {
    disableFunctions();
  }
});

// function fetchQuestions() {
//   level = document.getElementById("level").innerText;
//   fetch(`/faculty/get-ques/${level}`, { method: "POST" })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data.ques);
//       if (data.ques) {
//         questionData = shuffleArray(data.ques);
//         const coverflow = document.querySelector(".coverflow");

//         questionData.forEach((question, index) => {
//           const card = createCard(question, index);
//           coverflow.appendChild(card);
//           setCardSize(card);
//         });

//         init();
//       } else if (data.error) {
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: "data.error"
//         });
//       }
//     })
//     .catch((error) => console.error("Error fetching questions:", error));
// }

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
    // Combine completed questions before unattended questions
    questionData = shuffleArray(data1.ques);

    // const questionData = shuffleArray([...data2.ques, ...data1.ques]);

    // Render questions
  } catch (error) {
    console.error("Error fetching questions:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch questions. Please try again later."
    });
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
      q_color = "orange";
      lesson_name = "l1";
      break;
    case "l2":
      q_color = "#E1C16E";
      lesson_name = "l2";
      break;
    case "l3":
      q_color = "#AFE1AF";
      lesson_name = "l3";
      break;
    case "l4":
      q_color = "#6495ED";
      lesson_name = "l4";
      break;
    case "l5":
      q_color = "skyblue";
      lesson_name = "l5";
      break;
    case "l6":
      q_color = "#FA8072";
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

  const questionNo = document.createElement("h2");
  questionNo.innerText = `Question ${total_comp_ques + index + 1}`;

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

  // Append elements to the card
  front.appendChild(questionNo);
  front.appendChild(lesson);
  card.appendChild(front);

  lesson.innerText = lessonText;

  const questionText = document.createElement("p");
  questionText.innerText = question.question;
  questionText.classList.add("question-text");

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

  const submitBtn = document.createElement("button");
  submitBtn.className = "submit-btn";
  submitBtn.innerText = "Submit";
  submitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    submitAnswer(
      card,
      index,
      question.correct_option,
      question.options,
      total_comp_ques
    );
  });

  front.appendChild(questionNo);
  front.appendChild(lesson);
  front.appendChild(questionText);
  front.appendChild(optionsForm);
  front.appendChild(submitBtn);

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
  nextBtn.innerText = "Save & Next";
  nextBtn.addEventListener("click", (event) => {
    event.preventDefault();
    resetCardColor(card);
    flipToFront(card, goToNextCard);
    fetch(`/faculty/save-ques`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(response)
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
  });

  back.appendChild(backText);
  back.appendChild(yourAnswer);
  back.appendChild(betterAnswer);
  back.appendChild(nextBtn);

  card.appendChild(front);
  card.appendChild(back);

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

let totalMaxMarks = 0;
let totalUserMarks = 0;
const toggleStatus = getToggleStatus();
const DELAY_FOR_NEXT_BUTTON = toggleStatus === "off" ? 1000 : 2000;
function submitAnswer(card, idx, correctAnswer, options, total_comp_ques) {
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
  const questionID = questionData[idx]._id["$oid"];
  const ques_max_marks = questionData[idx].max_marks;

  totalMaxMarks += ques_max_marks;
  totalUserMarks += userMark;

  const data = {
    ques_id: questionID,
    ques_max_marks: ques_max_marks,
    user_answer: selectedOp,
    ques_user_mark: userMark
  };

  // Add badge data only if the answer is correct
  if (selectedOption.value === correctAnswer) {
    const badgeData = {
      badge_image: questionData[idx]?.badges?.badge_image || null,
      name: questionData[idx]?.badges?.name || null
    };
    data.badge = badgeData;
  }

  response = data;

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
    
      // Show Swal.fire for the badge only if badgeData exists and is valid
      const badgeData = {
        badge_image: questionData[idx]?.badges?.badge_image || null,
        name: questionData[idx]?.badges?.name || null
      };
      if (badgeData && badgeData.badge_image && badgeData.name) {
        Swal.fire({
          icon: "success",
          title: "Congratulations!",
          html: `
            <div style="text-align: center;">
              <p>You have earned a badge:</p>
              <img src="${badgeData.badge_image}" alt="Badge Image" style="width: 100px; height: 100px; border-radius: 50%; margin: 10px 0;">
              <h3>${badgeData.name}</h3>
            </div>
          `,
          confirmButtonText: "Awesome!"
        });
      }
    
      // Trigger confetti and sound only if toggleStatus !== "off"
      if (toggleStatus !== "off") {
        setTimeout(() => {
          triggerConfetti();
          playPartyPopSound();
        }, 300);
      }
    
      setTimeout(() => {
        nextBtn.classList.add("show");
      }, DELAY_FOR_NEXT_BUTTON);
    }
    else {
      const betterLuck = document.querySelector(".better-luck-animation");
      const candlesAnimation = document.querySelector(".wrapper");

      // Always display the better luck animation
      betterLuck.style.display = "block";

      // Candles animation and sounds only if toggleStatus !== "off"
      if (toggleStatus !== "off") {
        candlesAnimation.style.display = "block";
        setTimeout(() => {
          playCandleBlowSound();
        }, 300);
        setTimeout(() => {
          candlesAnimation.style.display = "none";
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
    if (idx === questionData.length - 1) {
      const allCards = document.querySelectorAll(".content");
      const prooo = document.getElementById("progress-container");
      const exitbtn = document.getElementById("exit-game");
      allCards.forEach((card) => {
        card.style.transition = "opacity 0.5s ease-out";
        card.style.opacity = 0;
        setTimeout(() => {
          prooo.style.display = "none";
          exitbtn.style.display = "none";
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

  setTimeout(() => {
    playBetterLuckSound();
  }, 2200);
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
  console.log(card);
  console.log(lesson);

  document.body.style.transition = "background-image 1s ease-in-out";
  switch (lesson) {
    case "l1":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/ls1.jpg')";
      break;
    case "l2":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/ls2.jpg')";
      break;
    case "l3":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/ls3.jpg')";
      break;
    case "l4":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/ls4.jpg')";
      break;
    case "l5":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/ls5.jpg')";
      break;
    case "l6":
      document.body.style.backgroundImage =
        "url('../static/faculty/images/lesson_bgs/ls6.jpg')";
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
      window.location.href = "/faculty/ongoing-levels";
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log("Delete canceled");
    }
  });
});
document.getElementById("exit-game-congrats").addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure want to Exit?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, exit!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/faculty/ongoing-levels";
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log("Delete canceled");
    }
  });
});
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
