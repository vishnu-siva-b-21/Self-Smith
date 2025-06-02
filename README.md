# 🧠 Self Smith - Empowering Teachers Through Psychological Insights ![Python](https://img.shields.io/badge/Python-3.8%2B-blue) ![Flask](https://img.shields.io/badge/Flask-2.0%2B-yellow) ![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) ![Status](https://img.shields.io/badge/status-active-brightgreen)

**Self Smith** is a web application designed to help teachers enhance their **passive teaching abilities** by asking insightful, psychology-based questions. The app analyzes the responses and provides **actionable feedback** to promote deeper student engagement and improve overall learning outcomes.

---

## 📚 Table of Contents

- 🌟 [Features](#features)
- 🌐 [Live Demo](#live-demo)
- 🧰 [Tech Stack](#tech-stack)
- 🛠️ [How to Run Locally](#how-to-run-locally)
- 💡 [Future Enhancements](#future-enhancements)
- 🤝 [Contributing](#contributing)
- 📬 [Contact](#contact)
- ⭐ [Support](#support)
- 📝 [License](#license)

---

<a id="features"></a>

## 📌 Features

- 🧠 **Psychology-Based Evaluation**  
  Presents carefully crafted questions based on educational psychology and behavioral patterns.

- 🧾 **Instant Feedback for Teachers**  
  Teachers receive real-time feedback and suggestions based on their responses.

- 📈 **Improvement Tracker**  
  Allows teachers to monitor their growth in soft skills and teaching methodology over time.

- 🌐 **User-Friendly Web Interface**  
  Clean and responsive UI for seamless experience across devices.

- 🔒 **Secure & Confidential**  
  All inputs and evaluations are private and handled securely.

---

<a id="live-demo"></a>

## 🌐 Live Demo

🔗 **Try it here**: [Self-Smith](https://self-smith.onrender.com/)  
_(Runs best on modern browsers and desktop view.)_

---

<a id="tech-stack"></a>

## 🧰 Tech Stack

| Category      | Technologies Used                              |
| ------------- | ---------------------------------------------- |
| 💻 Frontend   | HTML, CSS, JavaScript (Vanilla)                |
| 🔙 Backend    | Python, Flask                                  |
| 🛢️ Database   | MongoDB                                        |
| 🚀 Deployment | Render / Vercel / Heroku (based on preference) |

---

<a id="how-to-run-locally"></a>

## 🛠️ How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/vishnu-siva-b-21/Self-Smith.git
cd Self-Smith
```

### 2. Create a Virtual Environment & Install Dependencies

```bash
python -m venv venv
source venv/bin/activate   # For Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Start MongoDB Locally

To use MongoDB, install the **MongoDB Community Server** from the [official MongoDB website](https://www.mongodb.com/try/download/community).  
After installation, start the MongoDB server locally on default port 27017.

### 4. Configure Mail Settings (Optional for Local Testing)
If you're running locally without a .env file, update default values in config.py:
``` python
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your_email@gmail.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your_app_password")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False") == "True"
```
 - ⚠️ Use an App Password if you're using Gmail with 2FA enabled.

### 5. Run the Flask Application

```bash
python app.py
```

### 5. Access the Website

Open your browser and go to: [http://127.0.0.1:5000](http://127.0.0.1:5000)  
✅ Default Admin Credentials (for demo/testing)

- Email: admin@gmail.com
- Password: admin

---

<a id="future-enhancements"></a>

## 🌱 Future Enhancements

- 🧪 **AI-Powered Personality Analysis**  
  Integrate NLP models to provide deeper psychological profiling from open-ended responses.

- 🌍 **Multilingual Support**  
  Enable teachers from diverse regions to access the app in their native languages.

- 📊 **Analytics Dashboard**  
  Allow schools/admins to view teacher engagement and improvements (with consent).

- 🗣️ **Voice-Based Questionnaires**  
  Add voice input and audio feedback for improved accessibility and natural interaction.

- 🧠 **Adaptive Question System**  
  Dynamically adjust questions based on previous answers to better tailor insights.

---

<a id="contributing"></a>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork the repo and open a Pull Request.

- Fork the repo
- Create a new branch (`git checkout -b feature-xyz `)
- Commit your changes (`git commit -m 'Added new feature'`)
- Push and open a Pull Request

---

<a id="contact"></a>

## 📬 Contact

If you'd like to connect or know more:  
 ✉️ Email: vishnu.siva.b.21@gmail.com  
 🔗 [LinkedIn](https://www.linkedin.com/in/b-vishnu-siva/) | [Portfolio](https://vishnusiva.site/)

---

<a id="support"></a>

### ⭐Support

If you found this project helpful, please consider giving it a star on GitHub!  
Share it with others who might benefit — educators, developers, or students!

---

<a id="license"></a>

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).  
Feel free to use, modify, and distribute for both personal and commercial purposes.

---
