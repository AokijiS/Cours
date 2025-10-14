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

    // Masque la section active
    activeSection.classList.remove('active');

    setTimeout(() => {
      activeSection.style.display = "none";

      // Affiche la nouvelle section
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
const fileSelect = document.getElementById('fileSelect'); // <- nouvelle liste

// Quand un fichier est sélectionné
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

submitBtn.addEventListener('click', ()=>{
  score=0;
  questions.forEach(q=>{
    if(q.selected===q.correct) score++;
  });

  quizContainer.innerHTML=`<h2>Résultat :</h2><p>🎯 ${score} / ${questions.length}</p>`;
  prevBtn.style.display = nextBtn.style.display = submitBtn.style.display = 'none';
});

document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const info = btn.parentElement.nextElementSibling;
    info.style.display = info.style.display === 'block' ? 'none' : 'block';
  });
});


    // JS pour afficher/masquer les détails au clic sur ⋮
    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const info = btn.parentElement.nextElementSibling;

        // Fermer les autres avant d’ouvrir la sélection
        document.querySelectorAll('.more-info').forEach(el => {
          if (el !== info) el.style.display = 'none';
        });

        // Alterne l’affichage
        info.style.display = info.style.display === 'block' ? 'none' : 'block';
      });
    });

document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const info = btn.closest('li').querySelector('.more-info');
    if (info) {
      info.style.display = info.style.display === 'block' ? 'none' : 'block';
    }
  });
});


