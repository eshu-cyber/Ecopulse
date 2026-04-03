import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  // Redirect if unauthenticated
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout Error:", error);
      }
    };
  }

  const API = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://ecopulse-fc3w.onrender.com"; // Replace with your actual Render backend URL

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ---------------- THEME ----------------
  const toggleBtn = document.getElementById("toggleTheme");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "clean") {
    document.body.classList.add("clean");
  }

  toggleBtn.onclick = () => {
    document.body.classList.toggle("clean");
    localStorage.setItem("theme",
      document.body.classList.contains("clean") ? "clean" : "dark"
    );
  };

  // ---------------- PAGE SWITCHING & SIDEBAR ----------------
  const pollutionPage = document.getElementById("pollutionPage");
  const hospitalPage = document.getElementById("hospitalPage");
  const modelPage = document.getElementById("modelPage");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const openSidebar = document.getElementById("openSidebar");
  const closeSidebar = document.getElementById("closeSidebar");

  // Sidebar Open/Close Logic
  openSidebar.onclick = () => {
    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
  };

  function closeSidebarMenu() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
  }

  closeSidebar.onclick = closeSidebarMenu;
  sidebarOverlay.onclick = closeSidebarMenu;

  document.getElementById("showPollution").onclick = () => {
    pollutionPage.style.display = "block";
    hospitalPage.style.display = "none";
    modelPage.style.display = "none";
    closeSidebarMenu();
  };

  document.getElementById("showHospital").onclick = () => {
    pollutionPage.style.display = "none";
    hospitalPage.style.display = "block";
    modelPage.style.display = "none";
    closeSidebarMenu();
  };

  document.getElementById("showModel").onclick = () => {
    pollutionPage.style.display = "none";
    hospitalPage.style.display = "none";
    modelPage.style.display = "block";
    closeSidebarMenu();
  };

  // ---------------- ELEMENTS ----------------
  const filterYear = document.getElementById("filterYear");
  const filterMonth = document.getElementById("filterMonth");
  const filterDay = document.getElementById("filterDay");

  const hospital = document.getElementById("hospital");
  const hospitalYear = document.getElementById("hospitalYear");
  const hospitalMonth = document.getElementById("hospitalMonth");
  const hospitalDay = document.getElementById("hospitalDay");

  const tableData = document.getElementById("tableData");
  const hospitalTbody = document.getElementById("hospitalData");

  const avgAqi = document.getElementById("avgAqi");
  const maxAqi = document.getElementById("maxAqi");

  const downloadBtn = document.getElementById("downloadBtn");

  let pollutionData = [];
  let hospitalData = [];

  let predChart, casesChart;
  let masterData = null; // Global JSON cache to instantly power the entire dashboard!


  // The Python backend now securely handles all simulation of AQI, NO2, and PM arrays using model.py math.

  // ---------------- DOWNLOAD ----------------
  downloadBtn.onclick = () => {

    let csv = "TYPE,Year,Month,Day,Value,Extra\n";

    pollutionData.forEach(d => {
      csv += `Pollution,${d.year},${d.month},${d.day},AQI:${d.aqi}|PM25:${d.pm25}|PM10:${d.pm10}|NO2:${d.no2},${d.type}\n`;
    });

    hospitalData.forEach(d => {
      csv += `Hospital,${d.year},${d.month},${d.day},${d.cases},${d.hospital}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Health_Report.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  // ---------------- DROPDOWNS ----------------
  ["all", 2024, 2025, 2026, 2027].forEach(y => {
    filterYear.add(new Option(y, y));
    hospitalYear.add(new Option(y, y));
  });

  ["all", ...months].forEach(m => {
    filterMonth.add(new Option(m, m));
    hospitalMonth.add(new Option(m, m));
  });

  ["all", ...Array.from({ length: 30 }, (_, i) => i + 1)].forEach(d => {
    filterDay.add(new Option(d, d));
    hospitalDay.add(new Option(d, d));
  });

  // ---------------- INIT ----------------
  async function init() {
    let res = await fetch(API + "/data");
    let data = await res.json();

    // Cache the complete Python calculations!
    masterData = data.predictions;

    Object.keys(data.hospitals).forEach(h => {
      hospital.add(new Option(h, h));
    });

    hospital.value = "NTR Hospital";
    filterYear.value = 2026;
    hospitalYear.value = 2026;

    await loadPollution();
    await loadHospital();
    updateMap();
  }

  init();

  // ---------------- POLLUTION ----------------
  async function loadPollution() {
    if (!masterData) return;

    pollutionData = [];
    tableData.innerHTML = "";

    let aqiArr = [];
    let year = filterYear.value == "all" ? 2026 : Number(filterYear.value);

    // Directly access the zero-latency backend data structures
    let yearCache = masterData["NTR Hospital"][year];

    let rowsHTML = "";

    for (let m = 0; m < 12; m++) {
      let mName = months[m];
      if (filterMonth.value != "all" && filterMonth.value != mName) continue;

      let monthArray = yearCache[mName];

      monthArray.forEach(dayInfo => {
        let d = dayInfo.day;
        if (filterDay.value != "all" && Number(filterDay.value) !== d) return;

        aqiArr.push(dayInfo.aqi);
        let type = year <= 2024 ? "Past" : "Predicted";

        pollutionData.push({
          year, month: mName, day: d,
          aqi: dayInfo.aqi, pm25: dayInfo.pm25, pm10: dayInfo.pm10, no2: dayInfo.no2, type
        });

        rowsHTML += `
        <tr>
          <td>${year}</td>
          <td>${mName}</td>
          <td>${d}</td>
          <td><strong>${dayInfo.aqi}</strong></td>
          <td>${dayInfo.pm25} µg</td>
          <td>${dayInfo.pm10} µg</td>
          <td>${dayInfo.no2} ppb</td>
          <td>${type}</td>
        </tr>
      `;
      });
    }

    tableData.innerHTML = rowsHTML;

    if (aqiArr.length) {
      avgAqi.innerText = Math.round(aqiArr.reduce((a, b) => a + b) / aqiArr.length);
      maxAqi.innerText = Math.max(...aqiArr);
    }

    await drawAQIGraph();
  }

  // ---------------- HOSPITAL ----------------
  async function loadHospital() {
    if (!masterData) return;

    hospitalData = [];
    hospitalTbody.innerHTML = "";

    let year = Number(hospitalYear.value);
    let selectedHospital = hospital.value;

    let yearCache = masterData[selectedHospital][year];

    let hospitalRowsHTML = "";

    for (let m = 0; m < 12; m++) {
      let mName = months[m];
      if (hospitalMonth.value != "all" && hospitalMonth.value != mName) continue;

      let monthArray = yearCache[mName];

      monthArray.forEach(dayInfo => {
        let d = dayInfo.day;
        if (hospitalDay.value != "all" && Number(hospitalDay.value) !== d) return;

        hospitalData.push({
          hospital: selectedHospital, year, month: mName, day: d, cases: dayInfo.cases,
          copd: dayInfo.copd, ihd: dayInfo.ihd, stroke: dayInfo.stroke, lung_cancer: dayInfo.lung_cancer, pneumonia: dayInfo.pneumonia
        });

        hospitalRowsHTML += `
        <tr>
          <td>${year}</td>
          <td>${mName}</td>
          <td>${d}</td>
          <td><strong>${dayInfo.cases}</strong></td>
          <td>${dayInfo.copd}</td>
          <td>${dayInfo.ihd}</td>
          <td>${dayInfo.stroke}</td>
          <td>${dayInfo.lung_cancer}</td>
          <td>${dayInfo.pneumonia}</td>
        </tr>
      `;
      });
    }

    hospitalTbody.innerHTML = hospitalRowsHTML;

    await drawCasesGraph(selectedHospital);
  }

  // ---------------- AQI GRAPH ----------------
  async function drawAQIGraph() {

    if (predChart) predChart.destroy();

    let labels = [];
    let aqiData = [];
    let pm25Data = [];
    let pm10Data = [];
    let no2Data = [];

    let selectedMonth = filterMonth.value;

    if (selectedMonth === "all") {
      labels = months;
      for (let m of months) {
        let days = pollutionData.filter(d => d.month === m);
        if (days.length === 0) {
          aqiData.push(null); pm25Data.push(null); pm10Data.push(null); no2Data.push(null);
          continue;
        }
        aqiData.push(Math.round(days.reduce((sum, d) => sum + d.aqi, 0) / days.length));
        pm25Data.push(Math.round(days.reduce((sum, d) => sum + d.pm25, 0) / days.length));
        pm10Data.push(Math.round(days.reduce((sum, d) => sum + d.pm10, 0) / days.length));
        no2Data.push(Math.round(days.reduce((sum, d) => sum + d.no2, 0) / days.length));
      }
    } else {
      // Show daily timeline
      pollutionData.forEach(d => {
        labels.push(`${d.month} ${d.day}`);
        aqiData.push(d.aqi);
        pm25Data.push(d.pm25);
        pm10Data.push(d.pm10);
        no2Data.push(d.no2);
      });
    }

    predChart = new Chart(document.getElementById("predChart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          { label: "Overall AQI", data: aqiData, borderColor: "#ef4444", backgroundColor: "#ef4444", tension: 0.3 },
          { label: "PM 2.5 (µg/m³)", data: pm25Data, borderColor: "#38bdf8", backgroundColor: "#38bdf8", tension: 0.3 },
          { label: "PM 10 (µg/m³)", data: pm10Data, borderColor: "#facc15", backgroundColor: "#facc15", tension: 0.3 },
          { label: "NO2 (ppb)", data: no2Data, borderColor: "#22c55e", backgroundColor: "#22c55e", tension: 0.3 }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }



  function drawCasesGraph(selectedHospital) {
    if (!masterData) return;
    const canvas = document.getElementById("casesChart");
    if (!canvas) return;
    if (casesChart) casesChart.destroy();

    let labels = [2024, 2025, 2026, 2027];
    let values = [];

    for (let y of labels) {
      let total = 0;
      let yearCache = masterData[selectedHospital][y];
      for (let m of months) {
        total += yearCache[m].reduce((sum, item) => sum + item.cases, 0);
      }
      values.push(total);
    }

    casesChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: `Yearly Cases - ${selectedHospital}`,
          data: values,
          backgroundColor: "#38bdf8",
          borderRadius: 5
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // ---------------- EVENTS ----------------
  filterYear.onchange = loadPollution;
  filterMonth.onchange = loadPollution;
  filterDay.onchange = loadPollution;

  hospital.onchange = async () => {
    hospitalMonth.value = "all";
    hospitalDay.value = "all";
    await loadHospital();
    updateMap();
  };

  hospitalYear.onchange = loadHospital;
  hospitalMonth.onchange = loadHospital;
  hospitalDay.onchange = loadHospital;

  function updateMap() {
    const mapIframe = document.getElementById("googleMap");
    if (!mapIframe) return;

    const h = hospital.value;
    // Ensure every hospital search is localized specifically to Atchutapuram, Andhra Pradesh
    let q = h + ", Atchutapuram, Andhra Pradesh";

    // Alternative for no-key embed:
    mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  }

  document.getElementById("hospitalReset").onclick = async () => {
    hospital.value = "NTR Hospital";
    hospitalYear.value = 2026;
    hospitalMonth.value = "all";
    hospitalDay.value = "all";
    await loadHospital();
    updateMap();
  };

  document.getElementById("resetBtn").onclick = () => {
    filterYear.value = 2026;
    filterMonth.value = "all";
    filterDay.value = "all";
    loadPollution();
  };

});