const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const avatarLines = {
  build: 'I’m making a small change and testing it.',
  debug: 'I’m following the clues to find the problem.',
  learn: 'I’m learning one new cloud skill at a time.',
};
const avatarSpeech = document.querySelector('#avatar-speech');
document.querySelectorAll('[data-avatar-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.avatarMode;
    if (!avatarLines[mode] || !avatarSpeech) return;
    avatarSpeech.textContent = avatarLines[mode];
    document.querySelectorAll('[data-avatar-mode]').forEach((option) => {
      option.setAttribute('aria-pressed', String(option === button));
    });
  });
});

const cloudDemo = document.querySelector('.featured-lab');
const demoToggle = document.querySelector('#sim-toggle');
const demoStatus = document.querySelector('#sim-status');
const targetAHealth = cloudDemo?.querySelector('[data-target="az-a"] .target-health');
demoToggle?.addEventListener('click', () => {
  const failing = demoToggle.getAttribute('aria-pressed') !== 'true';
  demoToggle.setAttribute('aria-pressed', String(failing));
  cloudDemo.classList.toggle('is-failing', failing);
  targetAHealth.textContent = failing ? '● UNHEALTHY · REMOVED' : '● HEALTHY';
  demoStatus.textContent = failing
    ? 'Simulated: the ALB stops routing to target A. Auto Scaling is configured to replace unhealthy capacity.'
    : 'Simulation reset: both targets are healthy again.';
  demoToggle.firstChild.textContent = failing ? 'Reset the simulation ' : 'Simulate an AZ A issue ';
  demoToggle.querySelector('span').textContent = failing ? '↻' : '⚡';
});

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  navLinks.classList.toggle('open', !open);
});
navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
}));

const game = document.querySelector('#game-content');
const gameReset = document.querySelector('#game-reset');
const incidentRounds = [
  {
    question: 'What’s the best first check?',
    answers: [
      ['Inspect target group health checks and target status', true],
      ['Rebuild the whole VPC from scratch', false],
      ['Change the website’s font and try again', false],
    ],
    good: 'Nice. The ALB routes to healthy targets, so start with target status, health-check path, port, and security-group path. The instances may be running while the health check still fails.',
    next: 'The targets say unhealthy. The app process is running, but the health check path returns 404. Now what?',
  },
  {
    question: 'Which clue do you follow next?',
    answers: [
      ['Check the target group path against the app’s real health route', true],
      ['Rotate every IAM key in the account', false],
      ['Delete the load balancer and hope', false],
    ],
    good: 'Exactly. Compare the configured health-check path and port with a route the app actually serves. Then check the response and logs. One clue at a time beats infrastructure whack-a-mole.',
    next: null,
  },
];
let roundIndex = 0;
function renderRound() {
  const round = incidentRounds[roundIndex];
  game.replaceChildren();
  const question = document.createElement('p');
  question.className = 'game-question';
  question.textContent = round.question;
  const options = document.createElement('div');
  options.className = 'game-options';
  round.answers.forEach(([label, correct]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      game.querySelector('.game-result')?.remove();
      button.disabled = true;
      if (correct) options.querySelectorAll('button').forEach((option) => { option.disabled = true; });
      const result = document.createElement('p');
      result.className = `game-result${correct ? ' good' : ''}`;
      result.textContent = correct ? round.good : 'Not quite. Keep it small: what does the ALB know about the target, and how does it decide? Try another clue.';
      game.append(result);
      if (correct && round.next) {
        roundIndex += 1;
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'game-next';
        next.textContent = 'Next clue →';
        next.addEventListener('click', renderRound, { once: true });
        game.append(next);
      } else if (correct) {
        const done = document.createElement('p');
        done.className = 'game-win handwritten';
        done.textContent = 'Incident handled. No DNS was harmed. ✳';
        game.append(done);
      }
    });
    options.append(button);
  });
  game.append(question, options);
}
renderRound();
gameReset.addEventListener('click', () => { roundIndex = 0; renderRound(); });

const form = document.querySelector('#chat-form');
const input = document.querySelector('#chat-input');
const messages = document.querySelector('#chat-messages');
const status = document.querySelector('#chat-status');
const sendButton = form.querySelector('button');
const modeLabel = document.querySelector('#chat-mode-label');
const history = [];
let chatReady = false;
let chatMode = 'gemini';

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}
function addMessage(text, role, typing = false) {
  const row = document.createElement('div');
  row.className = `chat-message ${role === 'user' ? 'user-message' : 'bot-message'}${typing ? ' typing' : ''}`;
  if (role !== 'user') {
    const avatar = document.createElement('span');
    avatar.className = 'message-avatar';
    avatar.textContent = 'tk';
    row.append(avatar);
  }
  const bubble = document.createElement('p');
  bubble.textContent = text;
  row.append(bubble);
  messages.append(row);
  messages.scrollTop = messages.scrollHeight;
  return row;
}
async function checkChatStatus() {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) throw new Error('Chat server is not available.');
    const data = await response.json();
    if (data.chatAvailable) {
      chatReady = true;
      chatMode = 'gemini';
      modeLabel.textContent = 'GEMINI · PROFILE MODE';
      input.disabled = false;
      sendButton.disabled = false;
      setStatus('Lab connection is up. Questions are sent to Gemini with the portfolio notes.');
    } else {
      enableLocalBot();
    }
  } catch {
    enableLocalBot();
  }
}
function enableLocalBot() {
  chatReady = true;
  chatMode = 'local';
  modeLabel.textContent = 'LOCAL · PROFILE BOT';
  input.disabled = false;
  sendButton.disabled = false;
  setStatus('Local mode is ready. It works without an API key.');
}
function getLocalReply(message) {
  const question = message.toLowerCase();
  if (/education|degree|college|cgpa|study/.test(question)) {
    return 'Tanmay completed a B.E. in Computer Engineering at DBATU in 2026. His CGPA is 8.20.';
  }
  if (/ethans|trainee|training/.test(question)) {
    return 'Tanmay is a Cloud and DevOps Trainee at Ethans Tech in Pune.';
  }
  if (/cloudpulse|load balanc|high availab|terraform/.test(question)) {
    return 'CloudPulse is Tanmay’s AWS and Terraform practice project. It explores an Application Load Balancer, EC2 Auto Scaling, health checks, Lambda, and DynamoDB. It is not presented as a live AWS deployment.';
  }
  if (/opsdesk|linux|bash|backup|systemd/.test(question)) {
    return 'OpsDesk is a student portal and Linux operations lab. It includes health checks, system reports, database backup and restore checks, and log cleanup.';
  }
  if (/campus|three.?tier|rds|mysql/.test(question)) {
    return 'Campus Help Desk is a three-tier AWS project design with a web front end, PHP API, and private MySQL database. Its live deployment has not been verified.';
  }
  if (/skill|tool|technology|aws|devops|role|job/.test(question)) {
    return 'Tanmay is looking for an entry-level Cloud, DevOps, Cloud Support, or Linux role. His project tools include AWS, Terraform, Linux, Bash, Python, Node.js, SQLite, and Git.';
  }
  if (/contact|linkedin|github|hire/.test(question)) {
    return 'You can contact Tanmay through the LinkedIn link, or explore his code through the GitHub link on this page.';
  }
  if (/about|who is tanmay|introduc/.test(question)) {
    return 'Tanmay Kshirsagar is a Computer Engineering graduate in Pune. He is training in Cloud and DevOps at Ethans Tech and learns by building and testing projects.';
  }
  return 'I can answer questions about Tanmay’s projects, skills, education, training, or job goals. Try asking about CloudPulse, OpsDesk, or Ethans Tech.';
}
checkChatStatus();

async function sendChatMessage(text) {
  if (!chatReady || !text.trim()) return;
  const message = text.trim().slice(0, 500);
  addMessage(message, 'user');
  history.push({ role: 'user', text: message });
  input.value = '';
  input.disabled = true;
  sendButton.disabled = true;
  setStatus('Tanmay’s bot is checking the project notes…');
  const thinking = addMessage('Thinking through the lab notes…', 'model', true);
  try {
    if (chatMode === 'local') {
      thinking.remove();
      const reply = getLocalReply(message);
      addMessage(reply, 'model');
      history.push({ role: 'model', text: reply });
      if (history.length > 8) history.splice(0, history.length - 8);
      setStatus('Local reply from Tanmay’s portfolio details.');
      return;
    }
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: history.slice(-8) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'The bot hit a snag. Please try again in a moment.');
    thinking.remove();
    addMessage(result.reply, 'model');
    history.push({ role: 'model', text: result.reply });
    if (history.length > 8) history.splice(0, history.length - 8);
    setStatus('Reply generated from the approved profile context.');
  } catch (error) {
    thinking.remove();
    const detail = error instanceof Error ? error.message : 'The bot hit a snag. Please try again.';
    addMessage(detail, 'model');
    history.pop();
    setStatus('Could not reach Gemini. Your question was not saved by this site.', true);
  } finally {
    input.disabled = !chatReady;
    sendButton.disabled = !chatReady;
    if (chatReady) input.focus();
  }
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendChatMessage(input.value);
});
document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => {
  if (!chatReady) {
    setStatus('The portfolio bot is still starting. Try again in a moment.', true);
    return;
  }
  sendChatMessage(button.dataset.prompt);
}));
