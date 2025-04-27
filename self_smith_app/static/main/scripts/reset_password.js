document.querySelectorAll('.toggle-password').forEach(function (element) {
    element.addEventListener('click', function () {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const form = document.querySelector('.profile-form');

    const minLengthRegex = /.{8,}/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /\d/;
    const symbolRegex = /[@$!%*?&]/;

    let currentError = null;
    let confirmError = null;

    function validatePassword(value) {
        if (currentError) {
            currentError.remove();
            currentError = null;
        }

        if (!minLengthRegex.test(value)) {
            currentError = showError('Password must be at least 8 characters long.', password);
        } else if (!uppercaseRegex.test(value)) {
            currentError = showError('Password must contain at least 1 uppercase letter.', password);
        } else if (!lowercaseRegex.test(value)) {
            currentError = showError('Password must contain at least 1 lowercase letter.', password);
        } else if (!digitRegex.test(value)) {
            currentError = showError('Password must contain at least 1 digit.', password);
        } else if (!symbolRegex.test(value)) {
            currentError = showError('Password must contain at least 1 symbol.', password);
        }

        return currentError === null;
    }

    function showError(message, input) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerText = message;
        input.parentElement.appendChild(error);
        return error;
    }

    function validateForm() {
        let isValid = true;

        document.querySelectorAll('.input-container input').forEach(input => {
            input.classList.remove('error');
            const errorMessage = input.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                errorMessage.remove();
            }
        });

        if (!validatePassword(password.value)) {
            isValid = false;
            password.classList.add('error');
        }

        if (confirmPassword.value !== password.value) {
            if (!confirmError) {
                confirmError = showError('Passwords do not match.', confirmPassword);
            }
            isValid = false;
            confirmPassword.classList.add('error');
        } else {
            if (confirmError) {
                confirmError.remove();
                confirmError = null;
            }
        }

        return isValid;
    }

    togglePassword.addEventListener('click', () => {
        if (password.type === 'password') {
            password.type = 'text';
            togglePassword.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            password.type = 'password';
            togglePassword.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });

    toggleConfirmPassword.addEventListener('click', () => {
        if (confirmPassword.type === 'password') {
            confirmPassword.type = 'text';
            toggleConfirmPassword.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            confirmPassword.type = 'password';
            toggleConfirmPassword.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });
    form.addEventListener('submit', (e) => {
        if (!validateForm()) {
            e.preventDefault();
        }
    });
});

document.querySelectorAll('.toggle-password').forEach(function (element) {
    element.addEventListener('click', function () {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });
});