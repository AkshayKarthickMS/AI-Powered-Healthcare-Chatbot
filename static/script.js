// Toggle between Login and Register forms
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
}

// Show message function for validation errors
function showErrorMessage(message) {
    alert(message);  // Simple alert for error messages
}

// Helper function to create message elements
function createMessageElement(content, isUser, messageId = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = content;

    if (!isUser) {
        // Add regenerate button for bot messages
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'regenerate';
        regenerateBtn.innerHTML = '🔄';
        regenerateBtn.onclick = () => regenerateResponse(messageId);
        messageDiv.appendChild(regenerateBtn);
    }

    // Add timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    messageDiv.appendChild(timeDiv);

    return messageDiv;
}

// Function to regenerate a response
function regenerateResponse(messageId) {
    const chatBox = document.getElementById('chat-box');
    const messages = Array.from(chatBox.children);
    const messageIndex = messages.findIndex(msg => msg.dataset.messageId === messageId);
    
    if (messageIndex >= 0) {
        const userMessage = messages[messageIndex - 1].textContent;
        const previousMessages = [];
        
        // Collect conversation history up to this point
        for (let i = 0; i < messageIndex; i++) {
            const msg = messages[i];
            previousMessages.push({
                role: msg.classList.contains('user') ? 'user' : 'assistant',
                content: msg.textContent
            });
        }

        // Send regenerate request
        fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                regenerate: true,
                previousMessages: previousMessages,
                messageId: messageId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messages[messageIndex].replaceWith(
                    createMessageElement(data.reply, false, messageId)
                );
            }
        })
        .catch(console.error);
    }
}

// Register button click event
document.getElementById('register-button').onclick = function() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        showErrorMessage("Please fill in all fields for registration.");
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Registration successful! Please log in.");
            showLoginForm();
        } else {
            showErrorMessage(data.message);
        }
    })
    .catch(console.error);
};

// Login button click event
document.getElementById('login-button').onclick = function() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showErrorMessage("Please fill in all fields for login.");
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showChat();
            loadChatHistory();
        } else {
            showErrorMessage(data.message);
        }
    })
    .catch(console.error);
};

// Show the chat window after logging in
function showChat() {
    document.getElementById('login-form').style.display = "none";
    document.getElementById('register-form').style.display = "none";
    document.getElementById('chat-container').style.display = "flex";
}

// Load chat history
function loadChatHistory() {
    fetch('/get_chat_history')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.chat_history.length > 0) {
                const chatBox = document.getElementById('chat-box');
                chatBox.innerHTML = '';
                
                const latestChat = data.chat_history[0];
                latestChat.messages.forEach((message, index) => {
                    if (message.role !== 'system') {
                        const messageElement = createMessageElement(
                            message.content,
                            message.role === 'user',
                            message.role === 'assistant' ? `msg-${index}` : null
                        );
                        chatBox.appendChild(messageElement);
                    }
                });
                
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        })
        .catch(console.error);
}

// Logout button click event
document.getElementById('logout-button').onclick = function() {
    fetch('/logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('chat-container').style.display = "none";
            document.getElementById('login-form').style.display = "block";
            document.getElementById('chat-box').innerHTML = '';
        }
    })
    .catch(console.error);
};

// Send message event
document.getElementById('send-button').onclick = function() {
    const inputElement = document.getElementById('user-input');
    const message = inputElement.value.trim();
    
    if (!message) return;
    
    const chatBox = document.getElementById('chat-box');
    chatBox.appendChild(createMessageElement(message, true));
    inputElement.value = '';
    
    const messageId = `msg-${Date.now()}`;
    
    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: message,
            messageId: messageId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            chatBox.appendChild(createMessageElement(data.reply, false, messageId));
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    })
    .catch(error => {
        console.error("Error:", error);
        chatBox.appendChild(createMessageElement(
            "Sorry, I'm having trouble connecting right now. Please try again later.",
            false
        ));
    });
};

// Start a new chat
document.getElementById('new-chat').onclick = function() {
    fetch('/new_chat', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('chat-box').innerHTML = '';
        }
    })
    .catch(console.error);
};

// Enter key event listeners
document.getElementById('login-password').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('login-button').click();
    }
});

document.getElementById('register-password').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('register-button').click();
    }
});

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('send-button').click();
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    fetch('/chat_page')
        .then(response => {
            if (response.redirected) {
                showLoginForm();
            } else {
                showChat();
                loadChatHistory();
            }
        })
        .catch(console.error);
});