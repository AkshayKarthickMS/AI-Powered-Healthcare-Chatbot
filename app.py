from flask import Flask, request, jsonify, session, render_template, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4
import sqlite3
import os
import json
import requests

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Change this to a secure secret key

MODEL_URL = "https://14b7-2409-40f4-300b-4b62-4177-87a-78de-1eb.ngrok-free.app/v1/chat/completions"

def init_db():
    if not os.path.exists('chatbot.db'):
        conn = sqlite3.connect('chatbot.db')
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT UNIQUE NOT NULL,
                            password TEXT NOT NULL
                          )''')
        cursor.execute('''CREATE TABLE IF NOT EXISTS chats (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER,
                            chat_id TEXT,
                            messages TEXT,
                            FOREIGN KEY(user_id) REFERENCES users(id)
                          )''')
        conn.commit()
        conn.close()

init_db()

def chat_with_model(user_input, conversation_history):
    if len(conversation_history) == 0:
        conversation_history.append({
            "role": "system", 
            "content": "You are Dr. Akshay Karthick, a compassionate and concise doctor. Respond to patient queries with empathy and warmth, using 1-2 complete sentences. Ask only 1-2 questions at a time to keep the conversation focused. Offer virtual medications when appropriate and suggest physical visits only in rare cases. If any questions apart from medical queries are asked, respond like 'I'm a doctor, I can't answer those questions.' Always respond without exceeding 50 words limit."
        })
    
    conversation_history.append({"role": "user", "content": user_input})
    
    payload = {
        "model": "llama-3.2-3b-instruct",
        "messages": conversation_history,
        "temperature": 0.8,
        "max_tokens": 100,
        "top_k": 40,
        "repeat_penalty": 1.1,
        "top_p": 0.95,
        "min_p": 0.05,
    }
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(MODEL_URL, json=payload, headers=headers)
        response.raise_for_status()
        model_reply = response.json().get('choices', [{}])[0].get('message', {})
        if 'content' in model_reply:
            conversation_history.append(model_reply)
            return model_reply['content']
        else:
            return "I'm having trouble understanding your request. Can you please rephrase it?"
    except requests.RequestException as e:
        return f"An error occurred: {e}"

@app.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('chat_page'))
    return render_template('index.html')

@app.route('/chat_page')
def chat_page():
    if 'user_id' not in session:
        return redirect(url_for('home'))
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect('chatbot.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[2], password):
        session['user_id'] = user[0]
        session['username'] = username
        return jsonify({"success": True, "message": "Login successful"})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required"}), 400

    hashed_password = generate_password_hash(password)
    
    conn = sqlite3.connect('chatbot.db')
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", 
                      (username, hashed_password))
        conn.commit()
        return jsonify({"success": True, "message": "Registration successful"})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Username already exists"}), 400
    finally:
        conn.close()

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

@app.route('/chat', methods=['POST'])
def chat():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    user_input = data.get('message')
    is_regeneration = data.get('regenerate', False)
    previous_messages = data.get('previousMessages', [])
    message_id = data.get('messageId')
    
    # Use previous messages if regenerating, otherwise get from session
    conversation_history = previous_messages if is_regeneration else session.get('conversation_history', [])
    
    # Get the response from the model
    reply = chat_with_model(user_input, conversation_history)
    
    # Only save to session and database if not regenerating
    if not is_regeneration:
        session['conversation_history'] = conversation_history
        
        # Save to database
        conn = sqlite3.connect('chatbot.db')
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO chats (user_id, chat_id, messages) 
            VALUES (?, ?, ?)
        """, (session['user_id'], str(uuid4()), json.dumps(conversation_history)))
        conn.commit()
        conn.close()
    
    return jsonify({
        "success": True,
        "reply": reply,
        "messageId": message_id
    })

@app.route('/new_chat', methods=['POST'])
def new_chat():
    session['conversation_history'] = []
    return jsonify({"success": True, "message": "New chat started"})

@app.route('/get_chat_history', methods=['GET'])
def get_chat_history():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    conn = sqlite3.connect('chatbot.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT chat_id, messages 
        FROM chats 
        WHERE user_id = ? 
        ORDER BY id DESC
    """, (session['user_id'],))
    chats = cursor.fetchall()
    conn.close()

    chat_history = []
    for chat in chats:
        messages = json.loads(chat[1])
        if messages:
            chat_history.append({
                "chat_id": chat[0],
                "messages": messages
            })

    return jsonify({"success": True, "chat_history": chat_history})

if __name__ == '__main__':
    app.run(debug=True)