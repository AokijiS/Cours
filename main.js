/* === NAVIGATION ENTRE SECTIONS === */
const links = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');
let activeSection = document.querySelector('section.active') || sections[0];

sections.forEach(section => {
  if (section !== activeSection) section.style.display = "none";
});

links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('#','');
    const targetSection = document.getElementById(targetId);
    if (!targetSection || targetSection === activeSection) return;

    activeSection.classList.remove('active');
    setTimeout(() => {
      activeSection.style.display = "none";
      targetSection.style.display = "flex";
      void targetSection.offsetWidth;
      targetSection.classList.add('active');
      activeSection = targetSection;
    }, 500);
  });
});

/* === QCM === */
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const quizContainer = document.getElementById('quizContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const resultDiv = document.getElementById('result');
const fileSelect = document.getElementById('fileSelect');

// Quand un fichier QCM est sélectionné
fileSelect.addEventListener('change', function() {
  const fileName = fileSelect.value;
  if (!fileName) return;

  fetch(fileName)
    .then(response => {
      if (!response.ok) throw new Error("Erreur de chargement du fichier");
      return response.text();
    })
    .then(text => {
      parseQuestions(text);
      currentQuestionIndex = 0;
      score = 0;
      displayQuestion();
      resultDiv.innerHTML = '';
    })
    .catch(err => {
      quizContainer.innerHTML = `<p style="color:red;">❌ ${err.message}</p>`;
    });
});

// Parse le fichier QCM texte
function parseQuestions(text){
  questions = [];
  const blocks = text.trim().split(/\n\s*\n/);
  blocks.forEach(block => {
    const lines = block.trim().split('\n');
    const questionLine = lines.find(l => l.startsWith('Q:'));
    const answerLine = lines.find(l => l.startsWith('R:'));
    const choices = lines.filter(l => /^[A-D]\)/.test(l));
    const explanationLine = lines.find(l => l.startsWith('E:')) || '';

    if(questionLine && answerLine && choices.length>0){
      questions.push({
        question: questionLine.slice(2).trim(),
        choices: choices.map(c=>({label:c[0], text:c.slice(2).trim()})),
        correct: answerLine.slice(2).trim().toUpperCase(),
        explanation: explanationLine ? explanationLine.slice(2).trim() : '',
        selected: null
      });
    }
  });
}

// Affiche une question
function displayQuestion(){
  const q = questions[currentQuestionIndex];
  quizContainer.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'question';
  div.innerHTML = `<h3>Question ${currentQuestionIndex+1}/${questions.length}</h3>
                   <p>${q.question}</p>`;

  const answersDiv = document.createElement('div');
  answersDiv.className = 'answers';

  q.choices.forEach(choice => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = choice.label;
    if(q.selected===choice.label) input.checked = true;
    input.addEventListener('change', ()=> q.selected=input.value);
    label.appendChild(input);
    label.append(` ${choice.label}) ${choice.text}`);
    answersDiv.appendChild(label);
  });

  div.appendChild(answersDiv);
  quizContainer.appendChild(div);

  prevBtn.style.display = currentQuestionIndex>0 ? 'inline-block':'none';
  nextBtn.style.display = currentQuestionIndex<questions.length-1 ? 'inline-block':'none';
  submitBtn.style.display = currentQuestionIndex===questions.length-1 ? 'inline-block':'none';
}

// Navigation entre questions
nextBtn.addEventListener('click', ()=>{
  if(currentQuestionIndex<questions.length-1){
    currentQuestionIndex++;
    displayQuestion();
  }
});

prevBtn.addEventListener('click', ()=>{
  if(currentQuestionIndex>0){
    currentQuestionIndex--;
    displayQuestion();
  }
});

// === Affichage des résultats détaillés ===
submitBtn.addEventListener('click', ()=>{
  score = 0;
  const wrongAnswers = [];

  questions.forEach(q => {
    if(q.selected === q.correct) {
      score++;
    } else {
      wrongAnswers.push(q);
    }
  });

  quizContainer.innerHTML = `<h2>Résultat :</h2>
    <p>🎯 ${score} / ${questions.length}</p>`;
  prevBtn.style.display = nextBtn.style.display = submitBtn.style.display = 'none';

  // Si tout est correct
  if (wrongAnswers.length === 0) {
    resultDiv.innerHTML = `<p>✅ Parfait ! Toutes les réponses sont correctes.</p>`;
    return;
  }

  // Sinon : afficher les mauvaises réponses une par une
  let wrongIndex = 0;

  function displayWrongQuestion() {
    const q = wrongAnswers[wrongIndex];
    quizContainer.innerHTML = `
      <h3>❌ Mauvaise réponse ${wrongIndex + 1}/${wrongAnswers.length}</h3>
      <p><strong>Question :</strong> ${q.question}</p>
      <ul>
        ${q.choices.map(c => 
          `<li>${c.label}) ${c.text} ${
            c.label === q.correct ? "✅" : (c.label === q.selected ? "❌" : "")
          }</li>`).join('')}
      </ul>
      <p><strong>Explication :</strong> ${q.explanation || "Aucune explication fournie."}</p>
      <div id="wrongNav">
        <button id="prevWrong" ${wrongIndex === 0 ? "disabled" : ""}>⬅️</button>
        <button id="nextWrong">${wrongIndex === wrongAnswers.length - 1 ? "Terminer" : "➡️"}</button>
      </div>
    `;

    document.getElementById('prevWrong').addEventListener('click', () => {
      if (wrongIndex > 0) {
        wrongIndex--;
        displayWrongQuestion();
      }
    });

    document.getElementById('nextWrong').addEventListener('click', () => {
      if (wrongIndex < wrongAnswers.length - 1) {
        wrongIndex++;
        displayWrongQuestion();
      } else {
        quizContainer.innerHTML = `<h2>🧠 Révision terminée !</h2>`;
      }
    });
  }

  displayWrongQuestion();
});

/* === MENU "⋮" (PROJETS, CONTACT, ETC.) === */
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const info = btn.closest('li').querySelector('.more-info');
    if (info) {
      info.style.display = info.style.display === 'block' ? 'none' : 'block';
    }
  });
});
