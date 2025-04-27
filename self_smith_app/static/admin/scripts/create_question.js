var isAdvancedUpload = (function () {
  var div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
})();

let draggableFileArea = document.querySelector(".drag-file-area");
let browseFileText = document.querySelector(".browse-files");
let uploadIcon = document.querySelector(".upload-icon");
let dragDropText = document.querySelector(".dynamic-message");
let fileInput = document.querySelector(".default-file-input");
let cannotUploadMessage = document.querySelector(".cannot-upload-message");
let cancelAlertButton = document.querySelector(".cancel-alert-button");
let uploadedFile = document.querySelector(".file-block");
let fileName = document.querySelector(".file-name");
let fileSize = document.querySelector(".file-size");
let progressBar = document.querySelector(".progress-bar");
let removeFileButton = document.querySelector(".remove-file-icon");
let uploadButton = document.querySelector(".upload-button");
let fileFlag = 0;
const allowedExtensions = ["csv", "xlsx"];

fileInput.addEventListener("click", () => {
  fileInput.value = "";
  console.log("hi" + fileInput.value);
});
fileInput.addEventListener("change", (e) => {
  let file = fileInput.files[0];
  let fileExtension = file.name.split(".").pop().toLowerCase();

  if (allowedExtensions.includes(fileExtension)) {
    // Clear any previous error message
    cannotUploadMessage.classList.remove("fadeIn", "fadeOut");
    cannotUploadMessage.style.display = "none";

    uploadIcon.innerHTML = "check_circle";
    dragDropText.innerHTML = "File Dropped Successfully!";
    document.querySelector(
      ".label"
    ).innerHTML = `drag & drop or <span class="browse-files"> <input type="file" style="display:none"; class="default-file-input" name="file" style=""/> <span class="browse-files-text" style="top: 0;"> browse file</span></span>`;
    uploadButton.innerHTML = `Upload`;
    fileName.innerHTML = file.name;
    fileSize.innerHTML = (file.size / 1024).toFixed(1) + " KB";
    uploadedFile.style.cssText = "display: flex;";
    progressBar.style.width = 0;
    fileFlag = 0;
  } else {
    showErrorMessage(
      "Invalid file type. Only .csv and .xlsx files are allowed."
    );
    fileInput.value = "";
  }
});

function showErrorMessage(message) {
  cannotUploadMessage.classList.remove("fadeOut");
  cannotUploadMessage.classList.add("fadeIn");
  cannotUploadMessage.style.display = "flex";
  cannotUploadMessage.innerHTML = message;

  // Start fade-out after 2 seconds
  setTimeout(() => {
    cannotUploadMessage.classList.remove("fadeIn");
    cannotUploadMessage.classList.add("fadeOut");
    setTimeout(() => {
      cannotUploadMessage.style.display = "none";
    }, 1000); // Delay hiding the element to allow fade-out animation to complete
  }, 2000);
}

uploadButton.addEventListener("click", () => {
  let isFileUploaded = fileInput.value;
  if (isFileUploaded != "") {
    if (fileFlag == 0) {
      fileFlag = 1;
      var width = 0;
      var id = setInterval(frame, 50);
      function frame() {
        if (width >= 390) {
          clearInterval(id);
          uploadButton.innerHTML = `<span class="material-icons-outlined upload-button-icon"> check_circle </span> Uploaded`;
          uploadFile();
        } else {
          width += 5;
          progressBar.style.width = width + "px";
        }
      }
    }
  } else {
    cannotUploadMessage.style.cssText =
      "display: flex; animation: fadeIn linear 1s;";
  }
});

function uploadFile() {
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  fetch("/admin/get-csv-store-questions", {
    method: "POST",
    body: formData
  })
    .then((response) => {
      // Check if the response status indicates success
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw errorData; // Throw the parsed error for the catch block
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      let addedRowsText =
        data.added_rows.length > 0
          ? `\nAdded rows: ${data.added_rows.join(", ")}`
          : "";

      if (data.message) {
        Swal.fire({
          title: "Success",
          text: `${data.message}${addedRowsText}`,
          icon: "success",
          confirmButtonText: "OK",
          willClose: () => {
            location.reload();
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);

      let addedRowsText =
        error.added_rows && error.added_rows.length > 0
          ? `\nAdded rows: ${error.added_rows.join(", ")}`
          : "";

      Swal.fire({
        title: "Error",
        text: `${
          error.error || "An unexpected error occurred"
        }${addedRowsText}`,
        icon: "error",
        confirmButtonText: "OK",
        willClose: () => {
          location.reload();
        }
      });
    });
}

cancelAlertButton.addEventListener("click", () => {
  cannotUploadMessage.style.cssText = "display: none;";
});

if (isAdvancedUpload) {
  [
    "drag",
    "dragstart",
    "dragend",
    "dragover",
    "dragenter",
    "dragleave",
    "drop"
  ].forEach((evt) =>
    draggableFileArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    })
  );

  ["dragover", "dragenter"].forEach((evt) => {
    draggableFileArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadIcon.innerHTML = "file_download";
      dragDropText.innerHTML = "Drop your file here!";
    });
  });
}

draggableFileArea.addEventListener("drop", (e) => {
  let files = e.dataTransfer.files;
  let file = files[0];
  let fileExtension = file.name.split(".").pop().toLowerCase();

  if (allowedExtensions.includes(fileExtension)) {
    // Clear any previous error message
    cannotUploadMessage.classList.remove("fadeIn", "fadeOut");
    cannotUploadMessage.style.display = "none";

    uploadIcon.innerHTML = "check_circle";
    dragDropText.innerHTML = "File Dropped Successfully!";
    document.querySelector(
      ".label"
    ).innerHTML = `drag & drop or <span class="browse-files"> <input style="display:none"; type="file" class="default-file-input" name="file" style=""/> <span class="browse-files-text" style="top: -23px; left: -20px;"> browse file</span> </span>`;
    uploadButton.innerHTML = `Upload`;

    fileInput.files = files;
    fileName.innerHTML = file.name;
    fileSize.innerHTML = (file.size / 1024).toFixed(1) + " KB";
    uploadedFile.style.cssText = "display: flex;";
    progressBar.style.width = 0;
    fileFlag = 0;
  } else {
    showErrorMessage(
      "Invalid file type. Only .csv and .xlsx files are allowed."
    );
    fileInput.value = "";
  }
});

removeFileButton.addEventListener("click", () => {
  uploadedFile.style.cssText = "display: none;";
  fileInput.value = "";
  uploadIcon.innerHTML = "file_upload";
  dragDropText.innerHTML = "Drag & drop any file here";
  document.querySelector(
    ".label"
  ).innerHTML = `or <span class="browse-files"> <input style="display:none"; name="file" type="file" class="default-file-input"/> <span class="browse-files-text">browse file</span> <span>from device</span> </span>`;
  uploadButton.innerHTML = `Upload`;
  cannotUploadMessage.style.cssText = "display: none;";
});

function sendChoose() {
  let isValid = true;

  // Clear any previous error messages
  document.querySelectorAll(".error-message").forEach((error) => {
    error.classList.remove("show-error");
  });

  const lessonDropdown = document.getElementById("lesson");
  const levelDropdown = document.getElementById("ease-level");
  const question = document.querySelector(".question2").value.trim();
  const maxMarks = parseFloat(
    document.querySelector(".max-marks").value.trim()
  );
  const pairs = document.querySelectorAll("#default .pair");
  const options = [];
  const marks = [];
  let correctOption = null;
  let correctOptionMark = null;
  let maxMarksCount = 0;

  // Lesson validation
  if (lessonDropdown.value === "") {
    document.getElementById("lesson-error").classList.add("show-error");
    isValid = false;
  }

  // Level validation
  if (levelDropdown.value === "") {
    document.getElementById("ease-level-error").classList.add("show-error");
    isValid = false;
  }

  // Question validation
  if (question === "") {
    document.getElementById("question-error").classList.add("show-error");
    isValid = false;
  }

  // Max Marks validation
  if (isNaN(maxMarks)) {
    document.getElementById("marks-error").classList.add("show-error");
    isValid = false;
  }

  pairs.forEach((pair) => {
    const answerText = pair.querySelector(".answer").value.trim();
    const optionMarks = parseFloat(
      pair.querySelector(".option-marks").value.trim()
    );
    const isChecked = pair.querySelector('input[type="radio"]').checked;

    options.push({ ques: answerText, marks: optionMarks });
    marks.push(optionMarks);

    if (answerText === "") {
      pair.querySelector("#option-text-error").classList.add("show-error");
      isValid = false;
    }

    if (isNaN(optionMarks)) {
      pair.querySelector("#option-marks-error").classList.add("show-error");
      isValid = false;
    } else if (optionMarks < 0) {
      pair.querySelector("#option-marks-error").classList.add("show-error");
      isValid = false;
    } else if (optionMarks > maxMarks) {
      pair.querySelector("#option-marks-error").textContent =
        "Option marks cannot exceed the maximum marks.";
      pair.querySelector("#option-marks-error").classList.add("show-error");
      isValid = false;
    } else {
      pair.querySelector("#option-marks-error").textContent =
        "Please enter marks for this option";
    }

    if (parseInt(optionMarks) === parseInt(maxMarks)) {
      maxMarksCount++;
    }

    if (isChecked) {
      correctOptionMark = optionMarks;
      correctOption = answerText;
    }
  });

  // Validate that one of the options has the maximum marks
  if (!marks.includes(maxMarks)) {
    document.getElementById("marks-error").textContent =
      "One of the options must contain the maximum marks.";
    document.getElementById("marks-error").classList.add("show-error");
    isValid = false;
  }
  if (maxMarksCount > 1) {
    document.getElementById("marks-error").textContent =
      "There can only be one Best Answer.";
    document.getElementById("marks-error").classList.add("show-error");
    isValid = false;
  }
  // Validate that the correct option is selected
  if (correctOption === null) {
    document.getElementById("marks-error").textContent =
      "Select the Best Answer.";
    document.getElementById("marks-error").classList.add("show-error");
    isValid = false;
  } else if (correctOptionMark !== maxMarks) {
    document.getElementById("marks-error").textContent =
      "The Best Answer must contain the maximum marks.";
    document.getElementById("marks-error").classList.add("show-error");
    isValid = false;
  }

  if (isValid) {
    const chooseQuestion = {
      question: question,
      maxMarks: maxMarks,
      lesson: lessonDropdown.value,
      Level: levelDropdown.value,
      options: options,
      correctOption: correctOption
    };

    fetch("/admin/receive-store-ques", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(chooseQuestion)
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Question added successfully") {
          Swal.fire("Question added successfully");

          // Reset the form
          document.querySelector(".question2").value = "";
          document.querySelector(".max-marks").value = "";
          lessonDropdown.value = "";
          levelDropdown.value = "";
          pairs.forEach((pair) => {
            pair.querySelector(".answer").value = "";
            pair.querySelector(".option-marks").value = "";
            pair.querySelector('input[type="radio"]').checked = false;
          });
        } else {
          Swal.fire("Failed to add question");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire("Error occurred while adding question");
      });
  }
}

function addChooseOption() {
  const chooseContent = document.querySelector("#default .choose-content");
  const newPair = document.createElement("div");
  newPair.classList.add("pair", "extra");
  newPair.innerHTML = `
      <input type="radio" name="option" class="checkbox">
      <input type="text" class="answer" placeholder="Option Text">
      <span class="error-message" id="option-text-error">Please fill out this option</span>
      <input type="number" class="option-marks" placeholder="Marks" style="margin-left: 10px;">
      <span class="error-message" id="option-marks-error">Please enter marks for this option</span>
      <form class="delete-form" action="#">
          <div class="btn-group">
              <button type="submit" class="btn text-light del" data-toggle="modal">
                  <i class="fa-solid fa-minus"></i>
              </button>
          </div>
      </form>
  `;
  chooseContent.appendChild(newPair);

  const deleteButton = newPair.querySelector(".del");
  deleteButton.addEventListener("click", function (e) {
    e.preventDefault();
    newPair.remove();
  });
}

function addChooseDeleteListeners() {
  const deleteButtons = document.querySelectorAll("#default .del");
  deleteButtons.forEach((deleteButton) => {
    deleteButton.addEventListener("click", function (e) {
      e.preventDefault();
      deleteButton.closest(".pair").remove();
    });
  });
}

// Initialize delete listeners on page load
addChooseDeleteListeners();
