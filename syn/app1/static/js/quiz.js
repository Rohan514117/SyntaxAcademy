let current = 0;
const questions = document.querySelectorAll(".question-box");
const total = questions.length;
const navCircles = document.querySelectorAll(".nav-circle");

const nextBtn = document.getElementById("nextBtn");
const skipBtn = document.getElementById("skipBtn");
const submitBtn = document.getElementById("submitBtn");

const preQuizPopup = document.getElementById("preQuizPopup");
const mainQuizContainer = document.getElementById("mainQuizContainer");
const startQuizBtn = document.getElementById("startQuizBtn");
const timeRemaining = document.getElementById("timeRemaining");

let timerInterval;
let timeLeft = 10 * 60; // 10 minutes

// Init
if (total > 0) {
    questions[0].style.display = "block";
    navCircles[0].classList.add("active");
    updateButtons();

    startQuizBtn.addEventListener('click', () => {
        preQuizPopup.style.display = "none";
        mainQuizContainer.style.display = "block";
        startTimer();
    });

    function startTimer() {
        timerInterval = setInterval(() => {
            if(timeLeft <= 0) {
                clearInterval(timerInterval);
                autoSubmit();
                return;
            }
            timeLeft--;
            
            let m = Math.floor(timeLeft / 60);
            let s = timeLeft % 60;
            timeRemaining.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function showQuestion(index) {
        questions[current].style.display = "none";
        navCircles[current].classList.remove("active");
        
        current = index;
        
        questions[current].style.display = "block";
        navCircles[current].classList.add("active");
        updateButtons();
    }

    nextBtn.onclick = () => {
        if (current < total - 1) showQuestion(current + 1);
    };

    skipBtn.onclick = () => {
        if (current < total - 1) showQuestion(current + 1);
    };

    navCircles.forEach((circle, idx) => {
        circle.onclick = () => {
            showQuestion(idx);
        };
    });

    // Mark as answered when user selects an option
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            const questionIdx = radio.closest('.question-box').dataset.question;
            navCircles[questionIdx].classList.add("answered");
        });
    });

    function updateButtons() {
        if (current === total - 1) {
            nextBtn.style.display = "none";
            skipBtn.style.display = "none";
            submitBtn.style.display = "inline-block";
        } else {
            nextBtn.style.display = "inline-block";
            skipBtn.style.display = "inline-block";
            submitBtn.style.display = "none";
        }
    }

    async function autoSubmit() {
        document.getElementById("quizForm").dispatchEvent(new Event('submit'));
    }

    // SUBMIT QUIZ
    document.getElementById("quizForm").onsubmit = async function(e){
        e.preventDefault();
        clearInterval(timerInterval);

        const formData = new FormData(this);

        const response = await fetch(SUBMIT_URL, {
            method: "POST",
            headers: {
                "X-CSRFToken": CSRF_TOKEN
            },
            body: formData
        });

        const data = await response.json();

        document.querySelector(".quiz-container").innerHTML = `
            <div class="result-box">
                <h2>🎉 Quiz Completed</h2>
                <h3>Level ${LEVEL} Score: ${data.score} / ${data.total}</h3>
                
                ${data.passed ? 
                    `<p style="color: #6cf2c2;">Great job! You passed Level ${LEVEL}.</p>` : 
                    `<p style="color: #ff6b6b;">You scored ${data.percentage}%. You need 70% to pass. Keep learning and try again!</p>`
                }

                <a href="/courses/${COURSE_ID}/" class="return-btn">
                    ⬅ Back to Course
                </a>
            </div>
        `;
    };
}
