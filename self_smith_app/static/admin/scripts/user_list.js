     document.addEventListener('DOMContentLoaded', function () {
                // Add the 'loaded' class to the content after the page has fully loaded
                document.querySelector('.content').classList.add('loaded');
            });
    var isAdvancedUpload = function () {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();

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
    const allowedExtensions = ['csv', 'xlsx'];

    fileInput.addEventListener("click", () => {
        fileInput.value = '';
        console.log("hi" + fileInput.value);
    });
    fileInput.addEventListener("change", e => {
        let file = fileInput.files[0];
        let fileExtension = file.name.split('.').pop().toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            // Clear any previous error message
            cannotUploadMessage.classList.remove("fadeIn", "fadeOut");
            cannotUploadMessage.style.display = "none";

            uploadIcon.innerHTML = 'check_circle';
            dragDropText.innerHTML = 'File Dropped Successfully!';
            document.querySelector(".label").innerHTML = `drag & drop or <span class="browse-files"> <input style="display:none"; type="file" class="default-file-input" name="file" style=""/> <span class="browse-files-text" style="top: 0;"> browse file</span></span>`;
            uploadButton.innerHTML = `Upload`;
            fileName.innerHTML = file.name;
            fileSize.innerHTML = (file.size / 1024).toFixed(1) + " KB";
            uploadedFile.style.cssText = "display: flex;";
            progressBar.style.width = 0;
            fileFlag = 0;
        } else {
            showErrorMessage("Invalid file type. Only .csv and .xlsx files are allowed.");
            fileInput.value = '';
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
        if (isFileUploaded != '') {
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
            cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1s;";
        }
    });

    function uploadFile() {
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        fetch("/admin/get-csv-store-faculty", {
            method: "POST",
            body: formData,
        })
            .then(response => response.json()) // Change based on expected response type
            .then(data => {
                console.log(data);
                if (data.message) {
                    Swal.fire({
                        title: "Success",
                        text: data.message,
                        icon: "success",
                        confirmButtonText: "OK",
                        willClose: () => {
                            location.reload();
                        }
                    });
                } else if (data.error) {
                    Swal.fire({
                        title: "Error",
                        text: data.error,
                        icon: "error",
                        willClose: () => {
                            location.reload();
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                Swal.fire({
                    title: "Error",
                    text: "There was an error uploading the file",
                    icon: "error",
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
        ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach(evt =>
            draggableFileArea.addEventListener(evt, e => {
                e.preventDefault();
                e.stopPropagation();
            })
        );

        ["dragover", "dragenter"].forEach(evt => {
            draggableFileArea.addEventListener(evt, e => {
                e.preventDefault();
                e.stopPropagation();
                uploadIcon.innerHTML = 'file_download';
                dragDropText.innerHTML = 'Drop your file here!';
            });
        });
    }

    draggableFileArea.addEventListener("drop", e => {
        let files = e.dataTransfer.files;
        let file = files[0];
        let fileExtension = file.name.split('.').pop().toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            // Clear any previous error message
            cannotUploadMessage.classList.remove("fadeIn", "fadeOut");
            cannotUploadMessage.style.display = "none";

            uploadIcon.innerHTML = 'check_circle';
            dragDropText.innerHTML = 'File Dropped Successfully!';
            document.querySelector(".label").innerHTML = `drag & drop or <span class="browse-files"> <input style="display:none"; type="file" class="default-file-input" name="file" style=""/> <span class="browse-files-text" style="top: -23px; left: -20px;"> browse file</span> </span>`;
            uploadButton.innerHTML = `Upload`;

            fileInput.files = files;
            fileName.innerHTML = file.name;
            fileSize.innerHTML = (file.size / 1024).toFixed(1) + " KB";
            uploadedFile.style.cssText = "display: flex;";
            progressBar.style.width = 0;
            fileFlag = 0;
        } else {
            showErrorMessage("Invalid file type. Only .csv and .xlsx files are allowed.");
            fileInput.value = '';
        }
    });

    removeFileButton.addEventListener("click", () => {
        uploadedFile.style.cssText = "display: none;";
        fileInput.value = '';
        uploadIcon.innerHTML = 'file_upload';
        dragDropText.innerHTML = 'Drag & drop any file here';
        document.querySelector(".label").innerHTML = `or <span class="browse-files"> <input style="display:none"; name="file" type="file" class="default-file-input"/> <span class="browse-files-text">browse file</span> <span>from device</span> </span>`;
        uploadButton.innerHTML = `Upload`;
        cannotUploadMessage.style.cssText = "display: none;";
    });


document.addEventListener("DOMContentLoaded", () => {
  const starsContainers = document.querySelectorAll(".stars");
  starsContainers.forEach((starsContainer) => {
    const stars = starsContainer.querySelectorAll("i");
    stars.forEach((star, index1) => {
      star.addEventListener("click", () => {
        const rating = parseInt(starsContainer.getAttribute("data-rating"));
        stars.forEach((star, index2) => {
          index1 >= index2
            ? star.classList.add("active")
            : star.classList.remove("active");
        });
        starsContainer.setAttribute("data-rating", index1 + 1);
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const deleteForms = document.querySelectorAll(".delete-form");

  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit(); // Submit the form if confirmed
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log("Delete canceled");
        }
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Select all elements with class 'percentage-text'
  var percentageElements = document.querySelectorAll(".percentage-text");

  // Loop through each element and update its percentage using the 'updatePercentage' function
  percentageElements.forEach(function (element) {
    // Extract the rank value from the element's text content
    var rankString = element.textContent.trim(); // Trim to remove any leading or trailing spaces
    var rank = parseFloat(rankString);

    // Call the 'updatePercentage' function to update the element
    updatePercentage(rank, element.parentElement);
  });
});

function updatePercentage(rank, circleContainer) {
  var percentageText = circleContainer.querySelector(".percentage-text");
  var circle = circleContainer.querySelector("circle");

  // Validate the input to be between 0 and 100
  if (isNaN(rank) || rank < 0 || rank > 100) {
    return;
  }

  // Determine color based on percentage range
  var color = getColorByPercentage(rank);

  // Apply the background color with animation
  circle.style.stroke = color;

  // Calculate the dash array to represent the percentage
  var dashArray = (Math.PI * 2 * 60 * rank) / 100;
  circle.style.strokeDasharray = dashArray + " " + Math.PI * 2 * 60;

  // Update the text content with rank
  percentageText.textContent = rank + "%";
}

function getColorByPercentage(percentage) {
  if (percentage >= 0 && percentage <= 30) {
    return "red";
  } else if (percentage > 30 && percentage <= 60) {
    return "orange";
  } else if (percentage > 60 && percentage <= 85) {
    return "yellow";
  } else if (percentage > 85 && percentage <= 100) {
    return "green";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const deleteForms = document.querySelectorAll(".delete-form");

  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit(); // Submit the form if confirmed
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log("Delete canceled");
        }
      });
    });
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const addUserButton = document.querySelector(".add-user .add");
  const addAdminButton = document.querySelector(".add-user .add-admin");

  addUserButton.addEventListener("click", function () {
    const modalContent = `
            <form action="/admin/add-faculty" method="POST" id="user-form">
                <div>
                    <label for="name">Name:</label><br>
                    <input type="text" id="name" name="name">
                    <div id="name-error" class="error"></div>
                </div>
                <div>
                    <label for="email">Email:</label><br>
                    <input type="email" id="email" name="email">
                    <div id="email-error" class="error"></div>
                </div>
                <div>
                    <label for="dept">Department:</label><br>
                    <input type="text" id="dept" name="dept">
                    <div id="dept-error" class="error"></div>
                </div>
            </form>
        `;

    Swal.fire({
      title: "Add User",
      html: modalContent,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const dept = document.getElementById("dept").value;

        let isValid = true;

        // Name validation
        const nameField = document.getElementById("name");
        const nameError = document.getElementById("name-error");
        if (name.trim() === "") {
          nameError.innerText = "Name is required";
          nameField.classList.add("error-border");
          isValid = false;
        } else if (/\d/.test(name)) {
          nameError.innerText = "Name cannot contain numbers";
          nameField.classList.add("error-border");
          isValid = false;
        } else {
          nameError.innerText = "";
          nameField.classList.remove("error-border");
        }

        // Email validation
        const emailField = document.getElementById("email");
        const emailError = document.getElementById("email-error");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          emailError.innerText = "Invalid email address";
          emailField.classList.add("error-border");
          isValid = false;
        } else {
          emailError.innerText = "";
          emailField.classList.remove("error-border");
        }

        // Department validation
        const deptField = document.getElementById("dept");
        const deptError = document.getElementById("dept-error");
        if (dept.trim() === "") {
          deptError.innerText = "Department is required";
          deptField.classList.add("error-border");
          isValid = false;
        } else if (/\d/.test(dept)) {
          deptError.innerText = "Department cannot contain numbers";
          deptField.classList.add("error-border");
          isValid = false;
        } else {
          deptError.innerText = "";
          deptField.classList.remove("error-border");
        }
        if (isValid) {
          const form = document.getElementById("user-form");
          form.submit();
        }
        return isValid ? { name, email, dept, password } : false;
      }
    });
  });

  // Add Admin Button Event Listener
  addAdminButton.addEventListener("click", function () {
    const modalContent = `
            <form action="/admin/add-admin" method="POST" id="admin-form">
                <div>
                    <label for="admin-email">Email:</label><br>
                    <input type="email" id="admin-email" name="email">
                    <div id="admin-email-error" class="error"></div>
                </div>
                <div>
                    <label for="admin-password">Password:</label><br>
                    <input type="password" id="admin-password" name="password">
                    <div id="admin-password-error" class="error"></div>
                </div>
            </form>
        `;

    Swal.fire({
      title: "Add Admin",
      html: modalContent,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const email = document.getElementById("admin-email").value;
        const password = document.getElementById("admin-password").value;

        let isValid = true;

        // Email validation
        const emailField = document.getElementById("admin-email");
        const emailError = document.getElementById("admin-email-error");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          emailError.innerText = "Invalid email address";
          emailField.classList.add("error-border");
          isValid = false;
        } else {
          emailError.innerText = "";
          emailField.classList.remove("error-border");
        }

        const passwordField = document.getElementById("admin-password");
        const passwordError = document.getElementById("admin-password-error");
        const passwords = passwordField.value.trim();

        if (passwords === "") {
          passwordError.innerText = "Password is required";
          passwordField.classList.add("error-border");
          isValid = false;
        } else {
          passwordError.innerText = "";
          passwordField.classList.remove("error-border");

          const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
          if (!passwordRegex.test(passwords)) {
            let errorMessages = [];

            if (!/(?=.*[a-z])/.test(passwords)) {
              errorMessages.push("Password must contain at least 1 lowercase");
            } else if (!/(?=.*[A-Z])/.test(passwords)) {
              errorMessages.push("Password must contain at least 1 uppercase");
            } else if (!/(?=.*\d)/.test(passwords)) {
              errorMessages.push("Password must contain at least 1 digit");
            } else if (!/(?=.*[!@#$%^&*])/.test(passwords)) {
              errorMessages.push(
                "Password must contain at least 1 special character"
              );
            } else if (passwords.length < 8) {
              errorMessages.push("Password must be at least 8 characters long");
            }

            passwordError.innerText = errorMessages.join("\n");
            passwordField.classList.add("error-border");
            isValid = false;
          }
        }

        if (isValid) {
          const form = document.getElementById("admin-form");
          form.submit();
        }
        return isValid ? { email, password } : false;
      }
    });
  });
});
