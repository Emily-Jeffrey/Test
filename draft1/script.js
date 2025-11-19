
const cursorImages = {
  site: "cursors/address-pin.png",
  groundwater: "cursors/sea-wave.png",
  surface: "cursors/water-droplet.png",
  soil: "cursors/soil-plant.png",
  air: "cursors/air-flow.png",
  calculate: "cursors/magnifying-glass.png",
};


const cursorDataUrls = {};


function makeScaledCursor(path, size, callback) {
  if (cursorDataUrls[path]) {
    callback(cursorDataUrls[path]);
    return;
  }

  const img = new Image();
  img.src = path;

  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, size, size);

    const url = canvas.toDataURL("image/png");
    cursorDataUrls[path] = url;
    callback(url);
  };

  img.onerror = function () {
    console.error("Failed to load cursor image:", path);
    callback(null);
  };
}


function initNavCursors() {
  Object.keys(cursorImages).forEach((section) => {
    const path = cursorImages[section];
    const selector = `.nav-${section}`; 
    const elems = document.querySelectorAll(selector);
    if (!elems.length) return;

    makeScaledCursor(path, 32, (url) => {
      if (!url) return;

      
      cursorDataUrls[section] = url;

      
      elems.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          el.style.cursor = `url("${url}") 0 0, pointer`;
        });
        el.addEventListener("mouseleave", () => {
          el.style.cursor = "pointer";
        });
      });
    });
  });
}


function applyCursorToContent(section) {
  const content = document.querySelector(".content");
  if (!content) return;

  const path = cursorImages[section];
  if (!path) {
    content.style.cursor = "auto";
    return;
  }

  makeScaledCursor(path, 32, (url) => {
    if (!url) {
      content.style.cursor = "auto";
      return;
    }
    
    content.style.cursor = `url("${url}") 0 0, auto`;
  });
}


function loadContent(section) {
  const content = document.getElementById("contentArea");

  const sections = {
    site: `
      <h2>Site Information</h2>
      <fieldset>
        <legend>Basic Site Data</legend>
        <label>Site Name: <input type="text" size="40" /></label><br /><br />
        <label>Site ID: <input type="text" size="20" /></label><br /><br />
        <label>State:
          <select>
            <option>Select...</option>
            <option>Alabama</option>
            <option>Alaska</option>
            <option>Arizona</option>
            <option>Arkansas</option>
            <option>California</option>
          </select>
        </label>
      </fieldset>
    `,
    groundwater: `
      <h2>Groundwater Migration Pathway</h2>
      <fieldset>
        <legend>Likelihood of Release</legend>
        <label>Observed Release:
          <input type="radio" name="release" value="yes" /> Yes
          <input type="radio" name="release" value="no" /> No
        </label>
      </fieldset>
      <fieldset>
        <legend>Waste Characteristics</legend>
        <label>Hazardous Waste Quantity: <input type="text" size="15" /></label>
      </fieldset>
    `,
    surface: `
      <h2>Surface Water Migration Pathway</h2>
      <fieldset>
        <legend>Likelihood of Release</legend>
        <label>Observed Release:
          <input type="radio" name="sw_release" value="yes" /> Yes
          <input type="radio" name="sw_release" value="no" /> No
        </label>
      </fieldset>
    `,
    soil: `
      <h2>Soil Exposure Pathway</h2>
      <fieldset>
        <legend>Resident Population</legend>
        <label>Population within 200 feet: <input type="text" size="15" /></label>
      </fieldset>
    `,
    air: `
      <h2>Air Migration Pathway</h2>
      <fieldset>
        <legend>Likelihood of Release</legend>
        <label>Observed Release:
          <input type="radio" name="air_release" value="yes" /> Yes
          <input type="radio" name="air_release" value="no" /> No
        </label>
      </fieldset>
    `,
    calculate: `
      <h2>Calculate Site Score</h2>
      <fieldset>
        <legend>Pathway Scores</legend>
        <p>Groundwater Migration: <strong>0.00</strong></p>
        <p>Surface Water Migration: <strong>0.00</strong></p>
        <p>Soil Exposure: <strong>0.00</strong></p>
        <p>Air Migration: <strong>0.00</strong></p>
      </fieldset>
      <fieldset>
        <legend>Overall Site Score</legend>
        <p style="font-size: 16px;"><strong>0.00</strong></p>
      </fieldset>
      <button>Calculate Scores</button>
      <button>Print Report</button>
    `,
  };

  content.innerHTML =
    sections[section] ||
    `<h2>Welcome to QuickScore</h2>
     <p>Select a pathway from the navigation menu to begin site assessment.</p>`;

  
  applyCursorToContent(section);
}


document.addEventListener("DOMContentLoaded", function () {
  
  const slides = document.querySelectorAll(".background-slider .slide");
  if (slides.length) {
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 5000);
  }


  initNavCursors();

  
});
