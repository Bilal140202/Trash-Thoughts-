const room = new WebsimSocket();
const thoughtInput = document.getElementById('thoughtInput');
const trashBtn = document.getElementById('trashBtn');
const dustbin = document.getElementById('dustbin');
const quoteOverlay = document.getElementById('quoteOverlay');
const quoteText = document.getElementById('quoteText');
const dustbinContainer = document.querySelector('.dustbin-container');

const positiveQuotes = [
    "Every trash thought thrown away is a step towards a clearer mind! 🌈",
    "Dumping negativity: The ultimate self-care technique! 💪",
    "Your mental dustbin is cleaning service for your soul! ✨",
    "Goodbye trashy thoughts, hello inner peace! 🕊️",
    "Clearing mental clutter, one thought at a time! 🧘‍♀️",
    "Thoughts are temporary, your strength is permanent! 💎",
    "Every discarded thought makes room for new possibilities! 🌟",
    "You're not your thoughts, you're the observer of your thoughts! 🧠"
];

let thoughtHistory = [];

function initEmojiPicker() {
    const emojiTrigger = document.getElementById('emojiTrigger');
    const emojiPanel = document.getElementById('emojiPanel');
    const commonEmojis = ['😀', '😂', '😭', '😡', '😱', '🤔', '👍', '👎', '❤️', '🔥'];

    commonEmojis.forEach(emoji => {
        const emojiButton = document.createElement('button');
        emojiButton.textContent = emoji;
        emojiButton.addEventListener('click', () => {
            thoughtInput.value += emoji;
            emojiPanel.style.display = 'none';
        });
        emojiPanel.appendChild(emojiButton);
    });

    const redditEmojis = ['🤖', '🚀', '🔥', '👽', '💡', '🎉', '😎'];
    redditEmojis.forEach(emoji => {
        const emojiButton = document.createElement('button');
        emojiButton.textContent = emoji;
        emojiButton.addEventListener('click', () => {
            thoughtInput.value += emoji;
            emojiPanel.style.display = 'none';
        });
        emojiPanel.appendChild(emojiButton);
    });

    emojiTrigger.addEventListener('click', () => {
        emojiPanel.style.display = emojiPanel.style.display === 'flex' ? 'none' : 'flex';
    });
}

function saveThoughtToHistory(thought) {
    if (thought.trim()) {
        const thoughtEntry = {
            text: thought,
            timestamp: new Date().toISOString()
        };
        thoughtHistory.push(thoughtEntry);
        
        if (thoughtHistory.length > 10) {
            thoughtHistory.shift();
        }
    }
}

async function trashThoughts() {
    if (!thoughtInput.value.trim()) return;

    // Add dustbin open animation
    dustbin.classList.add('open');

    await room.collection('trashed_thoughts').create({
        text: thoughtInput.value,
        timestamp: new Date().toISOString()
    });

    saveThoughtToHistory(thoughtInput.value);

    const thoughtElement = document.createElement('div');
    thoughtElement.textContent = thoughtInput.value;
    thoughtElement.classList.add('trashed-thought');
    thoughtElement.style.animation = 'bounce-to-trash 1s forwards';

    dustbinContainer.appendChild(thoughtElement);

    setTimeout(() => {
        thoughtElement.remove();
        thoughtInput.value = '';
        showRandomQuote();
        
        // Close dustbin after a short delay
        setTimeout(() => {
            dustbin.classList.remove('open');
        }, 300);
    }, 1000);

    // Optional: Analyze the trashed thought
    analyzeTrashedThought(thoughtInput.value);
}

function showRandomQuote() {
    const quote = positiveQuotes[Math.floor(Math.random() * positiveQuotes.length)];
    quoteText.textContent = quote;
    quoteOverlay.style.display = 'flex';
    setTimeout(() => {
        quoteOverlay.style.opacity = 1;
    }, 50);

    setTimeout(() => {
        quoteOverlay.style.opacity = 0;
        setTimeout(() => {
            quoteOverlay.style.display = 'none';
        }, 500);
    }, 2000);
}

function showThoughtHistory() {
    const historyModal = document.createElement('div');
    historyModal.classList.add('thought-history-modal');
    
    const historyTitle = document.createElement('h2');
    historyTitle.textContent = 'Recent Trashed Thoughts';
    historyModal.appendChild(historyTitle);

    if (thoughtHistory.length === 0) {
        const noThoughtsMessage = document.createElement('p');
        noThoughtsMessage.textContent = 'No thoughts trashed yet!';
        historyModal.appendChild(noThoughtsMessage);
    } else {
        thoughtHistory.reverse().forEach(thought => {
            const thoughtItem = document.createElement('div');
            thoughtItem.classList.add('history-thought-item');
            thoughtItem.innerHTML = `
                <span class="thought-text">${thought.text}</span>
                <span class="thought-timestamp">${new Date(thought.timestamp).toLocaleString()}</span>
            `;
            historyModal.appendChild(thoughtItem);
        });
    }

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(historyModal);
    });
    historyModal.appendChild(closeButton);

    document.body.appendChild(historyModal);
}

const historyBtn = document.createElement('button');
historyBtn.textContent = '📜 Thought History';
historyBtn.classList.add('history-button');
historyBtn.addEventListener('click', showThoughtHistory);
document.querySelector('.action-row').appendChild(historyBtn);

trashBtn.addEventListener('click', trashThoughts);
initEmojiPicker();

async function analyzeTrashedThought(thought) {
    try {
        const completion = await websim.chat.completions.create({
            messages: [{
                role: "system",
                content: "Provide a brief, compassionate insight about the thought being trashed."
            }, {
                role: "user",
                content: thought
            }],
            max_tokens: 100
        });

        console.log("Thought Insight:", completion.content);
    } catch (error) {
        console.error("Thought analysis failed", error);
    }
}

// Add mood tracking feature
function initMoodTracker() {
    const moodTrackerContainer = document.createElement('div');
    moodTrackerContainer.classList.add('mood-tracker');
    
    const moodTitle = document.createElement('h3');
    moodTitle.textContent = 'How are you feeling?';
    moodTrackerContainer.appendChild(moodTitle);

    const moods = [
        { emoji: '😄', label: 'Happy' },
        { emoji: '😢', label: 'Sad' },
        { emoji: '😠', label: 'Angry' },
        { emoji: '😱', label: 'Anxious' },
        { emoji: '🤔', label: 'Confused' },
        { emoji: '😴', label: 'Tired' }
    ];

    const moodButtonsContainer = document.createElement('div');
    moodButtonsContainer.classList.add('mood-buttons');

    moods.forEach(mood => {
        const moodButton = document.createElement('button');
        moodButton.innerHTML = `${mood.emoji}<span>${mood.label}</span>`;
        moodButton.addEventListener('click', async () => {
            await room.collection('mood_logs').create({
                mood: mood.label,
                timestamp: new Date().toISOString()
            });

            // Provide personalized insight based on mood
            try {
                const insight = await websim.chat.completions.create({
                    messages: [{
                        role: "system",
                        content: "Provide a short, compassionate supportive message based on the user's current mood."
                    }, {
                        role: "user",
                        content: `My current mood is: ${mood.label}`
                    }],
                    max_tokens: 100
                });

                showMoodInsightModal(mood.emoji, insight.content);
            } catch (error) {
                console.error("Mood insight generation failed", error);
            }
        });
        moodButtonsContainer.appendChild(moodButton);
    });

    moodTrackerContainer.appendChild(moodButtonsContainer);
    document.querySelector('.container').insertBefore(moodTrackerContainer, document.querySelector('.trash-thoughts-box'));
}

function showMoodInsightModal(moodEmoji, insightText) {
    const moodInsightModal = document.createElement('div');
    moodInsightModal.classList.add('mood-insight-modal');
    
    moodInsightModal.innerHTML = `
        <div class="mood-insight-content">
            <div class="mood-emoji">${moodEmoji}</div>
            <p class="mood-insight-text">${insightText}</p>
            <button class="close-mood-insight">Close</button>
        </div>
    `;

    moodInsightModal.querySelector('.close-mood-insight').addEventListener('click', () => {
        document.body.removeChild(moodInsightModal);
    });

    document.body.appendChild(moodInsightModal);
}

function initThoughtStatistics() {
    const statisticsBtn = document.createElement('button');
    statisticsBtn.textContent = '📊 Thought Insights';
    statisticsBtn.classList.add('statistics-button');
    statisticsBtn.addEventListener('click', showThoughtStatistics);
    document.querySelector('.action-row').appendChild(statisticsBtn);
}

async function showThoughtStatistics() {
    const thoughts = await room.collection('trashed_thoughts').getList();
    
    const statisticsModal = document.createElement('div');
    statisticsModal.classList.add('thought-statistics-modal');
    
    const insights = await websim.chat.completions.create({
        messages: [{
            role: "system",
            content: "Analyze the list of thoughts and provide a brief, compassionate psychological insight."
        }, {
            role: "user",
            content: thoughts.map(t => t.text).join('\n')
        }],
        max_tokens: 200
    });

    statisticsModal.innerHTML = `
        <h2>Thought Insights</h2>
        <div class="statistics-content">
            <div class="stats-summary">
                <p>Total Thoughts Trashed: ${thoughts.length}</p>
                <p>Most Recent Thought: ${thoughts[0]?.text || 'No thoughts yet'}</p>
            </div>
            <div class="psychological-insight">
                <h3>Psychological Perspective</h3>
                <p>${insights.content}</p>
            </div>
        </div>
        <button class="close-statistics">Close</button>
    `;

    statisticsModal.querySelector('.close-statistics').addEventListener('click', () => {
        document.body.removeChild(statisticsModal);
    });

    document.body.appendChild(statisticsModal);
}

// Call new initialization functions
initMoodTracker();
initThoughtStatistics();