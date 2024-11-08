# Medical Chatbot Platform

A sophisticated healthcare chatbot platform that enables seamless communication between patients and healthcare providers. Built with Flask and powered by the LLaMA 3.2 3B model, this platform offers both free and premium services for medical consultations.

**Introduction**

The Medical Chatbot Platform is designed to revolutionize healthcare communication by providing an AI-powered interface for medical consultations. It offers:

- Free basic medical query services
- Premium multi-language support
- Dedicated doctor portal for patient data management
- Secure conversation history tracking
- Fine-tuned responses using LLaMA 3.2 3B model

**Architecture**:

![Medical Chatbot Architecture](images/architecutre.png)

Our system follows a comprehensive architectural design that ensures efficient data flow and service delivery:

### Data Flow Components

1. **Data Collection from Doctors**
   - Secure input system for medical knowledge
   - Validation and verification protocols
   - Regular updates to medical information database
   - Quality assurance checks by medical professionals

2. **Medical Inquiry Response System**
   - Advanced natural language processing
   - Context-aware response generation
   - Medical terminology integration
   - Symptom analysis and preliminary diagnosis support

3. **Patient Access Layer**
   - Bifurcated into two service tiers:
     - Limited Free Conversations
     - Paid Conversations
   - User authentication and session management
   - Access control and usage tracking

4. **API Integration for Websites**
   - RESTful API endpoints
   - Webhook support for real-time integration
   - Cross-platform compatibility
   - Secure data transmission protocols

### Service Tiers:

#### Free Features:
- Basic medical query handling
- Standard response times
- Limited conversation history
- Basic symptom checking
- General health information access

#### Premium Features:
- Multi-language support
- Priority response queuing
- Extended conversation history
- Detailed medical analysis
- Custom integration options
- Advanced symptom analysis
- Specialist consultation routing
- Comprehensive health tracking

### Integration Capabilities:

The architecture supports seamless integration with:
- Hospital management systems
- Electronic Health Records (EHR)
- Medical practice websites
- Healthcare apps
- Third-party medical services

### Security and Compliance:

- End-to-end encryption
- HIPAA compliance measures
- Data anonymization
- Regular security audits
- Access control mechanisms

## Key Technologies:

- **Backend Framework**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: SQLite (chatbot.db)
- **AI Model**: LLaMA 3.2 3B (fine-tuned)
- **Model Deployment**: [LM Studio](https://lmstudio.ai/) & Render
- **Authentication**: Werkzeug Security
- **Version Control**: Git

## Features:

### For Patients
- User registration and authentication
- Real-time medical consultations
- Chat history preservation
- Message regeneration capability
- Free basic services

### Premium Features:
- Multi-language support
- Priority response timing
- Extended consultation duration
- Comprehensive medical history analysis

### For Doctors:
- Dedicated dashboard
- Patient data visualization
- Free trial period
- Usage-based billing system
- Historical data analysis

## Project Structure:

```
medical-chatbot/
├── app.py              # Main Flask application
├── requirements.txt    # Project dependencies
├── static/
│   ├── script.js      # Frontend functionality
│   └── styles.css     # UI styling
├── templates/
│   └── index.html     # Main application template
└── chatbot.db         # SQLite database
```

## File Descriptions

### `app.py`
- Flask application setup
- Database initialization and management
- User authentication system
- Chat routing and message handling
- Model integration with LLaMA 3.2 3B
- API endpoint definitions

### `script.js`
- User interface interactions
- Real-time chat functionality
- Message regeneration handling
- Authentication form management
- Chat history loading
- Dynamic UI updates

### `styles.css`
- Responsive design implementation
- Chat interface styling
- Message bubble designs
- Form styling
- Animation effects
- Color scheme management

### `index.html`
- Main application structure
- Chat interface layout
- Authentication forms
- Responsive components
- Dynamic content areas

 **Installation:**

1. Clone the repository:
    - git clone https://github.com/yourusername/medical-chatbot.git
    - cd medical-chatbot

2. Install dependencies:
    - pip install -r requirements.txt

3. Set up LM Studio:
   - Download [LM Studio](https://lmstudio.ai/)
   - Load the LLaMA 3.2 3B model
   - Configure the model settings as specified in app.py

4. Initialize the database:
    >>> from app import init_db
    >>> init_db()

5. Start the application:
    - python app.py


 **Contact:**

For any queries, please raise an issue or contact: 
AKSHAY KARTHICK MS - +91 9500964663
NARESH KUMAR P -  +91 8072912033
RISHIKESH P - +91 9791540420
