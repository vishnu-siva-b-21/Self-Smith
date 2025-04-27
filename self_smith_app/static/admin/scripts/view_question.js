document.addEventListener('DOMContentLoaded', function () {
    // Add the 'loaded' class to the content after the page has fully loaded
    document.querySelector('.content').classList.add('loaded');
});

document.querySelectorAll('textarea').forEach(textarea => {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const levelSelect = document.getElementById('level-select');
    let currentLevel = "{{ selected_level | default('1', true) }}"; // Default to Level 1 if not set

    // Set the current level in the select element
    if (!levelSelect.value) {
        levelSelect.value = currentLevel;
    }

    window.handleLevelChange = function (selectElement) {
        const selectedLevel = selectElement.value;
        if (selectedLevel === currentLevel) {
            return;
        }
        document.getElementById('level-form').submit();
    };
});

function showError(container, message) {
    const errorMessage = container.querySelector(".error-message");
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function editQuestion(button) {
    const questionId = button.parentElement.getAttribute('data-question-id');

    // Enable editing
    document.getElementById('lesson-' + questionId).disabled = false;
    document.getElementById('ease-level-' + questionId).disabled = false;
    document.getElementById('question-text-' + questionId).removeAttribute('readonly');
    document.getElementById('max-marks-' + questionId).removeAttribute('readonly');

    const radioButtons = document.querySelectorAll(`#question-${questionId} input[type='radio']`);
    radioButtons.forEach(radio => {
        radio.disabled = false;
    });

    // Select the textarea elements instead of input[type='text']
    const optionTextareas = document.querySelectorAll(`#question-${questionId} textarea`);
    optionTextareas.forEach(textarea => {
        textarea.removeAttribute('readonly');
    });

    const optionMarksInputs = document.querySelectorAll(`#question-${questionId} input[type='number']`);
    optionMarksInputs.forEach(input => {
        input.removeAttribute('readonly');
    });

    // Show save and cancel buttons, hide edit button
    button.style.display = 'none';
    button.nextElementSibling.style.display = 'inline-block';  // Show the save button
    button.nextElementSibling.nextElementSibling.style.display = 'inline-block';  // Show the cancel button

    // Hide any previous error message
    const container = button.closest('.inner-box1');
    container.querySelector('.error-message').classList.add('hidden');
}

function saveQuestion(button) {
    const questionId = button.parentElement.getAttribute('data-question-id');
    const container = document.getElementById(`question-${questionId}`);
    const lesson = document.getElementById('lesson-' + questionId).value;
    const level = document.getElementById('ease-level-' + questionId).value;
    const questionText = document.getElementById('question-text-' + questionId).value.trim();
    const maxMarks = document.getElementById('max-marks-' + questionId).value.trim();

    const options = [];
    const optionElements = document.querySelectorAll(`#question-${questionId} .option-block`);
    let selectedOptionMarks = null;
    let correctOption = null;
    let maxMarksCount = 0;

    optionElements.forEach((element) => {
        const optionText = element.querySelector(`textarea`).value.trim(); // Correct selector for textarea
        const optionMarks = element.querySelector(`input[type='number']`).value.trim();
        const radio = element.querySelector(`input[type='radio']`);

        options.push({ optionText, optionMarks, radio });

        if (parseInt(optionMarks) === parseInt(maxMarks)) {
            maxMarksCount++;
        }

        if (radio.checked) {
            selectedOptionMarks = parseInt(optionMarks);
            correctOption = optionText;
        }
    });

    // Consolidated error handling
    if (!lesson) {
        showError(container, "Lesson field is required.");
        return;
    }
    if (!questionText) {
        showError(container, "Question text is required.");
        return;
    }
    if (!maxMarks) {
        showError(container, "Max marks is required.");
        return;
    }
    if (options.some(opt => opt.optionText === "")) {
        showError(container, "All options must be filled.");
        return;
    }
    if (options.some(opt => opt.optionMarks === "")) {
        showError(container, "All options must have assigned marks.");
        return;
    }
    if (options.some(opt => opt.optionMarks === "")) {
        showError(container, "All options must have assigned marks.");
        return;
    }
    if (options.some(opt => opt.optionMarks <0)) {
        showError(container, "Marks must be positive.");
        return;
    }
    if (options.some(opt => parseInt(opt.optionMarks) > parseInt(maxMarks))) {
        showError(container, "Option marks cannot exceed max marks.");
        return;
    }
    if (maxMarksCount > 1) {
        showError(container, "There can only be one best answer.");
        return;
    }
    if (selectedOptionMarks === null) {
        showError(container, "Select the best answer.");
        return;
    }
    if (selectedOptionMarks !== parseInt(maxMarks)) {
        showError(container, "Selected option's marks must be equal to max marks.");
        return;
    }

    // If no errors, proceed with AJAX request
    fetch(`/admin/question/update/${questionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question_text: questionText,
            max_marks: maxMarks,
            lesson: lesson,
            level: level,
            correct_option: correctOption,
            options: options.map(opt => ({ ques: opt.optionText, marks: opt.optionMarks }))
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Question updated successfully',
                    showConfirmButton: false,
                    timer: 3000
                });

                // Disable editing after save
                document.getElementById('lesson-' + questionId).disabled = true;
                document.getElementById('ease-level-' + questionId).disabled = true;
                document.getElementById('question-text-' + questionId).setAttribute('readonly', true);
                document.getElementById('max-marks-' + questionId).setAttribute('readonly', true);

                const radioButtons = document.querySelectorAll(`#question-${questionId} input[type='radio']`);
                radioButtons.forEach(radio => {
                    radio.disabled = true;
                });

                const optionTextareas = document.querySelectorAll(`#question-${questionId} textarea`);
                optionTextareas.forEach(textarea => {
                    textarea.setAttribute('readonly', true);
                });

                const optionMarksInputs = document.querySelectorAll(`#question-${questionId} input[type='number']`);
                optionMarksInputs.forEach(input => {
                    input.setAttribute('readonly', true);
                });

                // Show edit button, hide save and cancel buttons
                button.style.display = 'none';
                button.previousElementSibling.style.display = 'inline-block';
                button.nextElementSibling.style.display = 'none';

                container.querySelector('.error-message').classList.add('hidden');
            } else {
                showError(container, "Failed to update question. Please try again.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError(container, "An error occurred. Please try again.");
        });
}


function cancelEdit(button) {
    const questionId = button.parentElement.getAttribute('data-question-id');

    // Revert changes
    const questionTextarea = document.getElementById('question-text-' + questionId);
    questionTextarea.value = questionTextarea.defaultValue;

    const maxMarksInput = document.getElementById('max-marks-' + questionId);
    maxMarksInput.value = maxMarksInput.defaultValue;

    const optionTextareas = document.querySelectorAll(`#question-${questionId} textarea`);
    optionTextareas.forEach((textarea, index) => {
        const originalValue = textarea.defaultValue;
        textarea.value = originalValue;

        // Reset the height to the original size
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    });

    const optionMarksInputs = document.querySelectorAll(`#question-${questionId} input[type='number']`);
    optionMarksInputs.forEach((input) => {
        const originalValue = input.defaultValue;
        input.value = originalValue;
    });

    // Disable editing
    document.getElementById('lesson-' + questionId).disabled = true;
    document.getElementById('ease-level-' + questionId).disabled = true;
    questionTextarea.setAttribute('readonly', true);
    maxMarksInput.setAttribute('readonly', true);

    const radioButtons = document.querySelectorAll(`#question-${questionId} input[type='radio']`);
    radioButtons.forEach(radio => {
        radio.disabled = true;
    });

    optionTextareas.forEach(textarea => {
        textarea.setAttribute('readonly', true);
    });

    optionMarksInputs.forEach(input => {
        input.setAttribute('readonly', true);
    });

    // Show edit button, hide save and cancel buttons
    button.style.display = 'none';
    button.previousElementSibling.previousElementSibling.style.display = 'inline-block';
    button.previousElementSibling.style.display = 'none';

    const container = button.closest('.inner-box1');
    container.querySelector('.error-message').classList.add('hidden');
}
     // Function to open the SweetAlert for adding a badge
     function openBadgeAlert(button) {
        const questionId = button.parentElement.getAttribute('data-question-id'); // Get question ID
    
        // Check if badge details exist
        const badgeImageElement = document.getElementById(`badge-image-hidden-${questionId}`);
        const badgeNameElement = document.getElementById(`badge-name-hidden-${questionId}`);
        const badgeExists = badgeImageElement && badgeNameElement;
    
        const badgeName = badgeExists ? badgeNameElement.textContent.trim() : '';
        const badgeImage = badgeExists ? badgeImageElement.src : '';
    
        Swal.fire({
            title: badgeExists ? 'Edit Badge' : 'Add Badge',
            html: `
                <label for="badge-name">Badge Name:</label>
                <input id="badge-name" type="text" class="swal2-input" 
                    value="${badgeName}" placeholder="Enter badge name" required>
                
                <label for="badge-image">Upload Image:</label>
                <input id="badge-image" type="file" accept=".jpg,.jpeg,.png" class="swal2-input" ${badgeExists ? '' : 'required'}>
                
                ${badgeExists
                    ? `<label>Current Image:</label>
                       <img src="${badgeImage}" style="width: 100px; height: auto; display: block; margin: 10px auto;" />
                       <button id="remove-badge" type="button" class="swal2-styled" 
                           style="background-color: red; color: white; margin-top: 10px;">Remove Badge</button>`
                    : ''}
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: badgeExists ? 'Save Changes' : 'Add Badge',
            didRender: () => {
                // Attach event listener for "Remove Badge" button
                if (badgeExists) {
                    const removeBadgeButton = document.getElementById('remove-badge');
                    removeBadgeButton.addEventListener('click', () => {
                        removeBadge(questionId); // Call the remove function
                    });
                }
            },
            preConfirm: () => {
                const nameInput = document.getElementById('badge-name').value.trim();
                const imageInput = document.getElementById('badge-image').files[0];
    
                if (!nameInput) {
                    Swal.showValidationMessage('Please enter a badge name.');
                    return false;
                }
    
                if (!badgeExists && !imageInput) {
                    Swal.showValidationMessage('Please upload an image file.');
                    return false;
                }
    
                if (imageInput) {
                    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png'];
                    if (!validExtensions.includes(imageInput.type)) {
                        Swal.showValidationMessage('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
                        return false;
                    }
                }
    
                return { name: nameInput, image: imageInput };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('name', result.value.name);
                if (result.value.image) {
                    formData.append('image', result.value.image);
                }
    
                const endpoint = badgeExists 
                    ? `/admin/edit-badge/${questionId}` 
                    : `/admin/add-badge/${questionId}`;
                const method = 'POST';
    
                fetch(endpoint, {
                    method: method,
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire('Success', badgeExists ? 'Badge updated successfully!' : 'Badge added successfully!', 'success')
                            .then(() => {
                        window.location.reload();
                    });
                        } else {
                            Swal.fire('Error', `There was an error ${badgeExists ? 'updating' : 'adding'} the badge.`, 'error');
                        }
                    })
                    .catch(() => Swal.fire('Error', `There was an error ${badgeExists ? 'updating' : 'adding'} the badge.`, 'error'));
            }
        });
    }
    
    // Function to handle badge removal
    function removeBadge(questionId) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently remove the badge.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Remove it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/admin/remove-badge/${questionId}`, {
                    method: 'DELETE'
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire('Removed!', 'Badge has been removed.', 'success')
                            .then(() => {
                        window.location.reload();
                    });
                        } else {
                            Swal.fire('Error', 'There was an error removing the badge.', 'error');
                        }
                    })
                    .catch(() => Swal.fire('Error', 'There was an error removing the badge.', 'error'));
            }
        });
    }
document.addEventListener('DOMContentLoaded', function () {
    const deleteForms = document.querySelectorAll('.delete-form');
    
    deleteForms.forEach(form => {
    form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            form.submit(); // Submit the form if confirmed
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('Delete canceled');
        }
    });
    });
    });
    });
    


document.addEventListener("DOMContentLoaded", () => {
    const starsContainers = document.querySelectorAll(".stars");
        starsContainers.forEach(starsContainer => {
        const stars = starsContainer.querySelectorAll("i");
        stars.forEach((star, index1) => {
        star.addEventListener("click", () => {
        const rating = parseInt(starsContainer.getAttribute("data-rating"));
        stars.forEach((star, index2) => {
            index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
        });
            starsContainer.setAttribute("data-rating", index1 + 1);
            });
        });
    });
});