document.addEventListener('DOMContentLoaded', function () {
    fetch("/admin/get-graph-data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data from the server");
        }
        return response.json();
      })
      .then((data) => {
        if (isDataEmpty(data)) {
          console.warn("No data available for the chart. Removing container.");
          hideContainer();
          return;
        }

        // Parse the data into labels and dataPoints
        const labels = Object.keys(data);
        const dataPoints = Object.values(data);

        // Initialize the chart with the fetched data
        createChart(labels, dataPoints);
      })
      .catch((error) => {
        console.error("Error fetching chart data:", error);
      });

    // Helper function to check if the data is empty
    function isDataEmpty(data) {
      return !data || Object.keys(data).length === 0;
    }

    // Helper function to hide the chart container
    function hideContainer() {
      const container = document.querySelector('.bottom-row');
      if (container) {
        container.remove();
      }
    }

    // Function to create the chart
    function createChart(labels, data) {
      var ctx = document.getElementById("myAreaChart").getContext("2d");

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: "Questions Answered",
            lineTension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: "rgba(78, 115, 223, 1)",
            pointRadius: 3,
            pointBackgroundColor: "rgba(78, 115, 223, 1)",
            pointBorderColor: "rgba(78, 115, 223, 1)",
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
            pointHoverBorderColor: "rgba(78, 115, 223, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 2,
            data: data, // Bind the data to the chart
          }],
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 10,
              right: 25,
              top: 25,
              bottom: 0,
            },
          },
          scales: {
            xAxes: [{
              gridLines: {
                display: false,
              },
              ticks: {
                maxTicksLimit: 6,
              },
              scaleLabel: {
                display: true,
                labelString: 'Users',
                fontSize: 14,
                fontStyle: 'bold',
              },
            }],
            yAxes: [{
              ticks: {
                callback: function (value) {
                  return value; // Ensure values are displayed correctly
                },
              },
              scaleLabel: {
                display: true,
                labelString: 'No. of Questions Answered.',
                fontSize: 14,
                fontStyle: 'bold',
              },
            }],
          },
        },
      });
    }
  });



  function enableEdit() {
    const inputField = document.getElementById('d-password');
    const editIcon = document.querySelector('.edit-icon');
    const tickIcon = document.querySelector('.tick-icon');
    const wrongIcon = document.querySelector('.wrong-icon');

    inputField.removeAttribute('readonly');
    inputField.focus();

    editIcon.style.display = 'none';
    tickIcon.style.display = 'inline';
    wrongIcon.style.display = 'inline';
  }

  function saveEdit() {
    const inputField = document.getElementById('d-password');
    const adminId = inputField.getAttribute('data-admin-id');
    const editIcon = document.querySelector('.edit-icon');
    const tickIcon = document.querySelector('.tick-icon');
    const wrongIcon = document.querySelector('.wrong-icon');

    inputField.setAttribute('readonly', true);

    tickIcon.style.display = 'none';
    wrongIcon.style.display = 'none';
    editIcon.style.display = 'inline';


    fetch(`/admin/update-user-default-pass/${adminId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: inputField.value,
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'User password updated successfully',
            showConfirmButton: false,
            timer: 3000
          });

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to update password. Please try again.',
            showConfirmButton: false,
            timer: 3000
          });
        }
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'An error occurred. Please try again.',
          showConfirmButton: false,
          timer: 3000
        });
      });
  }

  function cancelEdit() {
    const inputField = document.getElementById('d-password');
    const editIcon = document.querySelector('.edit-icon');
    const tickIcon = document.querySelector('.tick-icon');
    const wrongIcon = document.querySelector('.wrong-icon');

    inputField.setAttribute('readonly', true);

    tickIcon.style.display = 'none';
    wrongIcon.style.display = 'none';
    editIcon.style.display = 'inline';

    // Reset the input field to its previous value
    inputField.value = document.getElementById("d-password").defaultValue; // Replace this with the previous value if needed
  }
