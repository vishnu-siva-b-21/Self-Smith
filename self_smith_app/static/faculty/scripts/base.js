var ChartColor = [
  "#5D62B4",
  "#54C3BE",
  "#EF726F",
  "#F9C446",
  "rgb(93.0, 98.0, 180.0)",
  "#21B7EC",
  "#04BCCC"
];
var primaryColor = getComputedStyle(document.body).getPropertyValue(
  "--primary"
);
var secondaryColor = getComputedStyle(document.body).getPropertyValue(
  "--secondary"
);
var successColor = getComputedStyle(document.body).getPropertyValue(
  "--success"
);
var warningColor = getComputedStyle(document.body).getPropertyValue(
  "--warning"
);
var dangerColor = getComputedStyle(document.body).getPropertyValue("--danger");
var infoColor = getComputedStyle(document.body).getPropertyValue("--info");
var darkColor = getComputedStyle(document.body).getPropertyValue("--dark");
var lightColor = getComputedStyle(document.body).getPropertyValue("--light");

(function ($) {
  "use strict";
  $(function () {
    var body = $("body");
    var contentWrapper = $(".content-wrapper");
    var scroller = $(".container-scroller");
    var footer = $(".footer");
    var sidebar = $(".sidebar");

    //Add active class to nav-link based on url dynamically
    //Active class can be hard coded directly in html file also as required

    function addActiveClass(element) {
      if (current === "") {
        //for root url
        if (element.attr("href").indexOf("index.html") !== -1) {
          element.parents(".nav-item").last().addClass("active");
          if (element.parents(".sub-menu").length) {
            element.closest(".collapse").addClass("show");
            element.addClass("active");
          }
        }
      } else {
        //for other url
        if (element.attr("href").indexOf(current) !== -1) {
          element.parents(".nav-item").last().addClass("active");
          if (element.parents(".sub-menu").length) {
            element.closest(".collapse").addClass("show");
            element.addClass("active");
          }
          if (element.parents(".submenu-item").length) {
            element.addClass("active");
          }
        }
      }
    }

    var current = location.pathname
      .split("/")
      .slice(-1)[0]
      .replace(/^\/|\/$/g, "");
    $(".nav li a", sidebar).each(function () {
      var $this = $(this);
      addActiveClass($this);
    });

    $(".horizontal-menu .nav li a").each(function () {
      var $this = $(this);
      addActiveClass($this);
    });

    //Close other submenu in sidebar on opening any

    sidebar.on("show.bs.collapse", ".collapse", function () {
      sidebar.find(".collapse.show").collapse("hide");
    });

    //Change sidebar and content-wrapper height
    applyStyles();

    function applyStyles() {
      //Applying perfect scrollbar
      if (!body.hasClass("rtl")) {
        if ($(".settings-panel .tab-content .tab-pane.scroll-wrapper").length) {
          const settingsPanelScroll = new PerfectScrollbar(
            ".settings-panel .tab-content .tab-pane.scroll-wrapper"
          );
        }
        if ($(".chats").length) {
          const chatsScroll = new PerfectScrollbar(".chats");
        }
        if (body.hasClass("sidebar-fixed")) {
          var fixedSidebarScroll = new PerfectScrollbar("#sidebar .nav");
        }
      }
    }

    $('[data-toggle="minimize"]').on("click", function () {
      if (
        body.hasClass("sidebar-toggle-display") ||
        body.hasClass("sidebar-absolute")
      ) {
        body.toggleClass("sidebar-hidden");
      } else {
        body.toggleClass("sidebar-icon-only");
      }
    });

    //checkbox and radios
    $(".form-check label,.form-radio label").append(
      '<i class="input-helper"></i>'
    );

    //fullscreen
    $("#fullscreen-button").on("click", function toggleFullScreen() {
      if (
        (document.fullScreenElement !== undefined &&
          document.fullScreenElement === null) ||
        (document.msFullscreenElement !== undefined &&
          document.msFullscreenElement === null) ||
        (document.mozFullScreen !== undefined && !document.mozFullScreen) ||
        (document.webkitIsFullScreen !== undefined &&
          !document.webkitIsFullScreen)
      ) {
        if (document.documentElement.requestFullScreen) {
          document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
          document.documentElement.webkitRequestFullScreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    });
  });
})(jQuery);

(function ($) {
  "use strict";
  $(function () {
    $('[data-toggle="offcanvas"]').on("click", function () {
      $(".sidebar-offcanvas").toggleClass("active");
    });
  });
})(jQuery);

(function ($) {
  "use strict";
  if ($("#visit-sale-chart").length) {
    const ctx = document.getElementById("visit-sale-chart");

    var graphGradient1 = document
      .getElementById("visit-sale-chart")
      .getContext("2d");
    var graphGradient2 = document
      .getElementById("visit-sale-chart")
      .getContext("2d");
    var graphGradient3 = document
      .getElementById("visit-sale-chart")
      .getContext("2d");

    var gradientStrokeViolet = graphGradient1.createLinearGradient(
      0,
      0,
      0,
      181
    );
    gradientStrokeViolet.addColorStop(0, "rgba(218, 140, 255, 1)");
    gradientStrokeViolet.addColorStop(1, "rgba(154, 85, 255, 1)");
    var gradientLegendViolet =
      "linear-gradient(to right, rgba(218, 140, 255, 1), rgba(154, 85, 255, 1))";

    var gradientStrokeBlue = graphGradient2.createLinearGradient(0, 0, 0, 360);
    gradientStrokeBlue.addColorStop(0, "rgba(54, 215, 232, 1)");
    gradientStrokeBlue.addColorStop(1, "rgba(177, 148, 250, 1)");
    var gradientLegendBlue =
      "linear-gradient(to right, rgba(54, 215, 232, 1), rgba(177, 148, 250, 1))";

    var gradientStrokeRed = graphGradient3.createLinearGradient(0, 0, 0, 300);
    gradientStrokeRed.addColorStop(0, "rgba(255, 191, 150, 1)");
    gradientStrokeRed.addColorStop(1, "rgba(254, 112, 150, 1)");
    var gradientLegendRed =
      "linear-gradient(to right, rgba(255, 191, 150, 1), rgba(254, 112, 150, 1))";
    const bgColor1 = ["rgba(218, 140, 255, 1)"];
    const bgColor2 = ["rgba(54, 215, 232, 1"];
    const bgColor3 = ["rgba(255, 191, 150, 1)"];

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"],
        datasets: [
          {
            label: "CHN",
            borderColor: gradientStrokeViolet,
            backgroundColor: gradientStrokeViolet,
            fillColor: bgColor1,
            hoverBackgroundColor: gradientStrokeViolet,
            pointRadius: 0,
            fill: false,
            borderWidth: 1,
            fill: "origin",
            data: [20, 40, 15, 35, 25, 50, 30, 20],
            barPercentage: 0.5,
            categoryPercentage: 0.5
          },
          {
            label: "USA",
            borderColor: gradientStrokeRed,
            backgroundColor: gradientStrokeRed,
            hoverBackgroundColor: gradientStrokeRed,
            fillColor: bgColor2,
            pointRadius: 0,
            fill: false,
            borderWidth: 1,
            fill: "origin",
            data: [40, 30, 20, 10, 50, 15, 35, 40],
            barPercentage: 0.5,
            categoryPercentage: 0.5
          },
          {
            label: "UK",
            borderColor: gradientStrokeBlue,
            backgroundColor: gradientStrokeBlue,
            hoverBackgroundColor: gradientStrokeBlue,
            fillColor: bgColor3,
            pointRadius: 0,
            fill: false,
            borderWidth: 1,
            fill: "origin",
            data: [70, 10, 30, 40, 25, 50, 15, 30],
            barPercentage: 0.5,
            categoryPercentage: 0.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        elements: {
          line: {
            tension: 0.4
          }
        },
        scales: {
          y: {
            display: false,
            grid: {
              display: true,
              drawOnChartArea: true,
              drawTicks: false
            }
          },
          x: {
            display: true,
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      },
      plugins: [
        {
          afterDatasetUpdate: function (chart, args, options) {
            const chartId = chart.canvas.id;
            var i;
            const legendId = `${chartId}-legend`;
            const ul = document.createElement("ul");
            for (i = 0; i < chart.data.datasets.length; i++) {
              ul.innerHTML += `
              <li>
                <span style="background-color: ${chart.data.datasets[i].fillColor}"></span>
                ${chart.data.datasets[i].label}
              </li>
            `;
            }
            // alert(chart.data.datasets[0].backgroundColor);
            return document.getElementById(legendId).appendChild(ul);
          }
        }
      ]
    });
  }

  if ($("#traffic-chart").length) {
    const ctx = document.getElementById("traffic-chart");

    var graphGradient1 = document
      .getElementById("traffic-chart")
      .getContext("2d");
    var graphGradient2 = document
      .getElementById("traffic-chart")
      .getContext("2d");
    var graphGradient3 = document
      .getElementById("traffic-chart")
      .getContext("2d");

    var gradientStrokeBlue = graphGradient1.createLinearGradient(0, 0, 0, 181);
    gradientStrokeBlue.addColorStop(0, "rgba(54, 215, 232, 1)");
    gradientStrokeBlue.addColorStop(1, "rgba(177, 148, 250, 1)");
    var gradientLegendBlue = "rgba(54, 215, 232, 1)";

    var gradientStrokeRed = graphGradient2.createLinearGradient(0, 0, 0, 50);
    gradientStrokeRed.addColorStop(0, "rgba(255, 191, 150, 1)");
    gradientStrokeRed.addColorStop(1, "rgba(254, 112, 150, 1)");
    var gradientLegendRed = "rgba(254, 112, 150, 1)";

    var gradientStrokeGreen = graphGradient3.createLinearGradient(0, 0, 0, 300);
    gradientStrokeGreen.addColorStop(0, "rgba(6, 185, 157, 1)");
    gradientStrokeGreen.addColorStop(1, "rgba(132, 217, 210, 1)");
    var gradientLegendGreen = "rgba(6, 185, 157, 1)";

    // const bgColor1 = ["rgba(54, 215, 232, 1)"];
    // const bgColor2 = ["rgba(255, 191, 150, 1"];
    // const bgColor3 = ["rgba(6, 185, 157, 1)"];

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "Search Engines 30%",
          "Direct Click 30%",
          "Bookmarks Click 40%"
        ],
        datasets: [
          {
            data: [30, 30, 40],
            backgroundColor: [
              gradientStrokeBlue,
              gradientStrokeGreen,
              gradientStrokeRed
            ],
            hoverBackgroundColor: [
              gradientStrokeBlue,
              gradientStrokeGreen,
              gradientStrokeRed
            ],
            borderColor: [
              gradientStrokeBlue,
              gradientStrokeGreen,
              gradientStrokeRed
            ],
            legendColor: [
              gradientLegendBlue,
              gradientLegendGreen,
              gradientLegendRed
            ]
          }
        ]
      },
      options: {
        cutout: 50,
        animationEasing: "easeOutBounce",
        animateRotate: true,
        animateScale: false,
        responsive: true,
        maintainAspectRatio: true,
        showScale: true,
        legend: false,
        plugins: {
          legend: {
            display: false
          }
        }
      },
      plugins: [
        {
          afterDatasetUpdate: function (chart, args, options) {
            const chartId = chart.canvas.id;
            var i;
            const legendId = `${chartId}-legend`;
            const ul = document.createElement("ul");
            for (i = 0; i < chart.data.datasets[0].data.length; i++) {
              ul.innerHTML += `
                <li>
                  <span style="background-color: ${chart.data.datasets[0].legendColor[i]}"></span>
                  ${chart.data.labels[i]}
                </li>
              `;
            }
            return document.getElementById(legendId).appendChild(ul);
          }
        }
      ]
    });
  }

  if ($("#inline-datepicker").length) {
    $("#inline-datepicker").datepicker({
      enableOnReadonly: true,
      todayHighlight: true
    });
  } 
})(jQuery);
