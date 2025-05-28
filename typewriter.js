// assets/js/typewriter.js
function typeWriterEffect(elementId, texts, speed = 100, pause = 1000) {
    let element = document.getElementById(elementId);
    let textIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function type() {
        let currentText = texts[textIndex];
        if (!deleting) {
            element.textContent = currentText.substring(0, charIndex++);
            if (charIndex > currentText.length) {
                deleting = true;
                setTimeout(type, pause);
                return;
            }
        } else {
            element.textContent = currentText.substring(0, charIndex--);
            if (charIndex < 0) {
                deleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }
        }
        setTimeout(type, speed);
    }

    type();
}


