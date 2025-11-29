class RotaryKnob {
    constructor(x, y, radius, minValue, maxValue, snapInterval, onChange) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.snapInterval = snapInterval;
        this.onChange = onChange;
        
        this.currentValue = minValue;
        this.angle = 0;
        this.isDragging = false;
        
        this.minAngle = -135 * (Math.PI / 180);
        this.maxAngle = 135 * (Math.PI / 180);
    }
    
    isInside(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
    
    startDrag(mouseX, mouseY) {
        if (this.isInside(mouseX, mouseY)) {
            this.isDragging = true;
            this.updateFromMouse(mouseX, mouseY);
            return true;
        }
        return false;
    }
    
    updateFromMouse(mouseX, mouseY) {
        if (!this.isDragging) return;
        
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        let angle = Math.atan2(dy, dx);
        
        if (angle < this.minAngle) angle = this.minAngle;
        if (angle > this.maxAngle) angle = this.maxAngle;
        
        this.angle = angle;
        
        const normalizedAngle = (angle - this.minAngle) / (this.maxAngle - this.minAngle);
        const rawValue = this.minValue + normalizedAngle * (this.maxValue - this.minValue);
        const snappedValue = Math.round(rawValue / this.snapInterval) * this.snapInterval;
        
        if (snappedValue !== this.currentValue) {
            this.currentValue = Math.max(this.minValue, Math.min(this.maxValue, snappedValue));
            if (this.onChange) {
                this.onChange(this.currentValue);
            }
        }
    }
    
    stopDrag() {
        this.isDragging = false;
    }
    
    setValue(value) {
        this.currentValue = Math.max(this.minValue, Math.min(this.maxValue, value));
        const normalizedValue = (this.currentValue - this.minValue) / (this.maxValue - this.minValue);
        this.angle = this.minAngle + normalizedValue * (this.maxAngle - this.minAngle);
    }
    
    draw(ctx) {
        // Debug: draw a small dot at the exact x,y position
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw indicator line
        ctx.strokeStyle = '#ffffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius * 0.7, 0);
        ctx.stroke();
        
        // Draw dot at end
        ctx.fillStyle = '#ffffffff';
        ctx.beginPath();
        ctx.arc(this.radius * 0.7, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Draw range arc
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.minAngle, this.maxAngle);
        ctx.stroke();
    }
}

const LENGTH_OPTIONS = {
    0: { label: 'SMALL', min: 10, max: 20 },
    1: { label: 'MEDIUM', min: 20, max: 35 },
    2: { label: 'LARGE', min: 35, max: 50 }
};

let yearKnob = null;
let lengthKnob = null;
let knobCanvas = null;
let knobCtx = null;
let interfaceContainer = null;

function initKnobs() {
    interfaceContainer = document.getElementById('interface-container');
    knobCanvas = document.getElementById('knob-canvas');
    
    // Set canvas resolution to match container
    knobCanvas.width = 1920;
    knobCanvas.height = 1080;
    
    // Make canvas size match its displayed size
    knobCanvas.style.width = '1920px';
    knobCanvas.style.height = '1080px';
    
    knobCtx = knobCanvas.getContext('2d');
    
    yearKnob = new RotaryKnob(
        1399, 254,
        30,
        2010, 2125,
        1,
        (year) => {
            console.log('Year:', year);
            updateYearDisplay(year);
            updateMarkovWeights(year);
            generateAndDisplay();
        }
    );
    
    lengthKnob = new RotaryKnob(
        1399, 400,
        30,
        0, 2,  // Three options: 0, 1, 2
        1,
        (option) => {
            const length = LENGTH_OPTIONS[option];
            console.log('Length:', length.label);
            updateSentenceLength(length.min, length.max);
            generateAndDisplay();
        }
    );
    
    yearKnob.setValue(2025);
    lengthKnob.setValue(1); // Medium
    
    drawKnobs();
    
    interfaceContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseDown(e) {
    const rect = interfaceContainer.getBoundingClientRect();
    const scaleX = 1920 / rect.width;
    const scaleY = 1080 / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (yearKnob.startDrag(x, y) || lengthKnob.startDrag(x, y)) {
        knobCanvas.style.pointerEvents = 'auto';
        drawKnobs();
    }
}

function handleMouseMove(e) {
    if (!yearKnob.isDragging && !lengthKnob.isDragging) return;
    
    const rect = interfaceContainer.getBoundingClientRect();
    const scaleX = 1920 / rect.width;
    const scaleY = 1080 / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    yearKnob.updateFromMouse(x, y);
    lengthKnob.updateFromMouse(x, y);
    drawKnobs();
}

function handleMouseUp(e) {
    yearKnob.stopDrag();
    lengthKnob.stopDrag();
    knobCanvas.style.pointerEvents = 'none';
}

function drawKnobs() {
    knobCtx.clearRect(0, 0, knobCanvas.width, knobCanvas.height);
    yearKnob.draw(knobCtx);
    lengthKnob.draw(knobCtx);
    updateKnobImages();
}

function updateKnobImages() {
    const knob1Img = document.getElementById('knob1-img');
    const knob2Img = document.getElementById('knob2-img');
    
    if (knob1Img) {
        // Convert angle from radians to degrees and rotate
        const degrees1 = yearKnob.angle * (180 / Math.PI);
        knob1Img.style.transform = `rotate(${degrees1}deg)`;
    }
    
    if (knob2Img) {
        const degrees2 = lengthKnob.angle * (180 / Math.PI);
        knob2Img.style.transform = `rotate(${degrees2}deg)`;
    }
}

function updateYearDisplay(year) {
    const display = document.getElementById('year-display');
    if (display) {
        display.textContent = year;
    }
}

let currentMinWords = 20;
let currentMaxWords = 35;

function updateSentenceLength(min, max) {
    currentMinWords = min;
    currentMaxWords = max;
    window.currentMinWords = min;
    window.currentMaxWords = max;
    console.log('Updated sentence length:', min, 'to', max);
}

function updateMarkovWeights(year) {
    if (typeof setYearFromKnob === 'function') {
        setYearFromKnob(year);
    }
}

// Power toggle functionality
let systemPowered = false;

function initToggle() {
    const toggleSwitch = document.getElementById('toggle-switch');
    const yearDisplay = document.getElementById('year-display');
    const textDisplay = document.getElementById('text-display');
    const toggleOnImg = document.getElementById('toggle-on-img');
    const toggleOffImg = document.getElementById('toggle-off-img');
    
    toggleSwitch.addEventListener('click', () => {
        systemPowered = !systemPowered;
        
        if (systemPowered) {
            // Turn ON
            document.body.classList.remove('system-off');
            toggleOnImg.classList.add('active');
            toggleOffImg.classList.remove('active');
            yearDisplay.classList.remove('powered-off');
            textDisplay.classList.remove('powered-off');
            
            // Generate first text
            if (typeof generateAndDisplay === 'function') {
                generateAndDisplay();
            }
        } else {
            // Turn OFF
            document.body.classList.add('system-off');
            toggleOnImg.classList.remove('active');
            toggleOffImg.classList.add('active');
            yearDisplay.classList.add('powered-off');
            textDisplay.classList.add('powered-off');
        }
    });
}

// Update initKnobs to also init the toggle
function initKnobs() {
    interfaceContainer = document.getElementById('interface-container');
    knobCanvas = document.getElementById('knob-canvas');
    
    // Set canvas resolution to match container
    knobCanvas.width = 1920;
    knobCanvas.height = 1080;
    
    // Make canvas size match its displayed size
    knobCanvas.style.width = '1920px';
    knobCanvas.style.height = '1080px';
    
    knobCtx = knobCanvas.getContext('2d');
    
    yearKnob = new RotaryKnob(
        1399, 254,
        30,
        2010, 2125,
        1,
        (year) => {
            if (!systemPowered) return;  // Don't update if powered off
            console.log('Year:', year);
            updateYearDisplay(year);
            updateMarkovWeights(year);
            generateAndDisplay();
        }
    );
    
    lengthKnob = new RotaryKnob(
        1399, 400,
        30,
        0, 2,
        1,
        (option) => {
            if (!systemPowered) return;  // Don't update if powered off
            const length = LENGTH_OPTIONS[option];
            console.log('Length:', length.label);
            updateSentenceLength(length.min, length.max);
            generateAndDisplay();
        }
    );
    
    yearKnob.setValue(2025);
    lengthKnob.setValue(1);
    
    drawKnobs();
    
    // Initialize toggle
    initToggle();
    
    // Start system as OFF
    document.body.classList.add('system-off');
    document.getElementById('year-display').classList.add('powered-off');
    document.getElementById('text-display').classList.add('powered-off');
    
    interfaceContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}