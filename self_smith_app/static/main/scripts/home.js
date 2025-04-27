document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("role-signin")
    .addEventListener("change", function () {
      const forgotPassword = document.getElementById("forgot-password");
      if (this.value === "faculty") {
        forgotPassword.style.display = "inline";
      } else {
        forgotPassword.style.display = "none";
      }
    });
  role = document.getElementById("role-signin").value;
  const forgotPassword = document.getElementById("forgot-password");
  if (role == "faculty") {
    forgotPassword.style.display = "inline";
  } else {
    forgotPassword.style.display = "none";
  }

  openCity(null, "sign-in");
  document
    .getElementById("signInTab")
    .addEventListener("click", function (event) {
      openCity(event, "sign-in");
    });
  document
    .getElementById("sign-in-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      if (validateSignInForm()) {
        document.getElementById("sign-in-form").submit();
      }
    });
});
function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  if (evt) {
    evt.currentTarget.className += " active";
  } else {
    document.getElementById("signInTab").className += " active";
  }
}
function validateSignInForm() {
  let isValid = true;
  const role = document.getElementById("role-signin");
  const roleError = document.getElementById("role-signin-error");
  if (!role.value) {
    roleError.innerText = "Role is required";
    role.classList.add("error");
    isValid = false;
  } else {
    roleError.innerText = "";
    role.classList.remove("error");
  }
  const email = document.getElementById("your_email_signin");
  const emailError = document.getElementById("email-signin-error");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.value.trim() === "") {
    emailError.innerText = "Email is required";
    email.classList.add("error");
    isValid = false;
  } else if (!emailRegex.test(email.value)) {
    emailError.innerText = "Valid email is required";
    email.classList.add("error");
    isValid = false;
  } else {
    emailError.innerText = "";
    email.classList.remove("error");
  }
  const password = document.getElementById("password_signin");
  const passwordError = document.getElementById("password-signin-error");
  if (password.value.trim() === "") {
    passwordError.innerText = "Password is required";
    password.classList.add("error");
    isValid = false;
  } else {
    passwordError.innerText = "";
    password.classList.remove("error");
  }
  return isValid;
}

function showLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "flex";
}

function hideLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "none";
}

function showForgotPasswordPopup() {
  const signin_email = document.getElementById("your_email_signin").value;
  Swal.fire({
    title: "Forgot Password",
    html: `
        <p>Please enter your email address to reset your password.</p>
        <input type="email" id="email" class="swal2-input" placeholder="Enter your email address" aria-label="Enter your email address" value=${signin_email}>
        <br>
      `,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Submit",
    customClass: {
      popup: "animated fadeInDown"
    },
    preConfirm: () => {
      const email = Swal.getPopup().querySelector("#email").value;

      if (!email) {
        Swal.showValidationMessage("Please enter your email address");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.showValidationMessage("Please enter a valid email address");
      }
      return {
        email: email
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      showLoadingScreen();
      const data = result.value;
      fetch("/user-reset-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then((response) => response.json())
        .then((data) => {
          hideLoadingScreen();
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
          } else if (data.authorized) {
            Swal.fire({
              title: "Unauthorized",
              icon: "error",
              willClose: () => {
                window.location.href = "/";
              }
            });
          } else {
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
            text: "There was an error sending the password reset request",
            icon: "error"
          });
        });
    }
  });
}
document.getElementById('toggle-password-signin').addEventListener('click', function () {
  var passwordField = document.getElementById('password_signin');
  var eyeIcon = document.getElementById('eye-icon');
  if (passwordField.type === 'password') {
      passwordField.type = 'text';
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
  } else {
      passwordField.type = 'password';
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
  }
});