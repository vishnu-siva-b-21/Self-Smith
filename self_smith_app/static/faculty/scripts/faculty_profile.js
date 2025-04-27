document.getElementById('change-password-btn').addEventListener('click', function () {
    Swal.fire({
        title: 'Change Password',
        html:


            '<input type="password" id="old-password" class="swal2-input" placeholder="Enter your old password" style="margin-bottom: 0px;">' +
            '</div>' +


            '<input type="password" id="new-password" class="swal2-input" placeholder="Enter new password" style="margin-bottom: 0px;">' +
            '</div>' +


            '<input type="password" id="confirm-password" class="swal2-input" placeholder="Confirm new password" style="margin-bottom: 2px;">' +
            '</div>',
        focusConfirm: false,
        icon: 'info',
        confirmButtonText: 'Submit',
        confirmButtonColor: '#4e73df',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#d33',
        customClass: {
            popup: 'popup-class',
            title: 'title-class',
            icon: 'icon-class',
        },
        preConfirm: () => {
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!oldPassword || !newPassword || !confirmPassword) {
                Swal.showValidationMessage('Please fill out all the fields');
                return false;
            } else if (newPassword.length < 8) {
                Swal.showValidationMessage('Password must be at least 8 characters long');
                return false;
            } else if (!/[A-Z]/.test(newPassword)) {
                Swal.showValidationMessage('Password must contain at least 1 uppercase letter');
                return false;
            } else if (!/[!@#$&*]/.test(newPassword)) {
                Swal.showValidationMessage('Password must contain at least 1 special character');
                return false;
            } else if (!/[0-9]/.test(newPassword)) {
                Swal.showValidationMessage('Password must contain at least 1 numeral');
                return false;
            } else if (newPassword !== confirmPassword) {
                Swal.showValidationMessage('New password and confirmation do not match');
                return false;
            }

            return {
                oldPassword: oldPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            };
        }
    }).then((result) => {
        const email = document.getElementById('display-email').innerText;
        console.log(email)
        if (result.isConfirmed) {
            const data = result.value;
            const userData = {
                faculty_email: email,
                currentPassword: data.oldPassword,
                newPassword: data.newPassword
            };

            fetch('/faculty/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to change password');
                    }
                })
                .then(responseData => {
                    Swal.fire('Password Changed!', responseData.message, 'success');
                })
                .catch(error => {
                    Swal.fire('Error', error.message, 'error');
                });
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const progressDoneElements = document.querySelectorAll('.progress-done');

    progressDoneElements.forEach(progress => {
        const progressValue = progress.getAttribute('data-done');
        progress.style.width = progressValue + '%';
        progress.style.opacity = 1;
    });
});
