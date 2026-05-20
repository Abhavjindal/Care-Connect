import gradio as gr
import speech_recognition as sr
from gtts import gTTS
import tempfile
import soundfile as sf
import google.generativeai as genai
from datetime import datetime
import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# ------------------ Gemini AI Configuration ------------------
genai.configure(api_key="AIzaSyC_WRtStwMRHd1LhzsmsK0Fybi8iGZfMqY")
model = genai.GenerativeModel("models/gemini-2.5-pro")

# ------------------ Text AI Reply ------------------
def get_ai_reply(user_text):
    try:
        prompt = (
            f"You are a friendly AI health assistant. The user said: '{user_text}'. "
            f"Provide a short, empathetic, and medically informed response in simple English. "
            f"Don't diagnose diseases; only give general wellness advice."
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"❌ Error getting AI reply: {e}"

# ------------------ Voice Processing ------------------
def process_audio(audio_tuple):
    if audio_tuple is None:
        return "No audio received.", None

    sample_rate, audio_data = audio_tuple
    temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    sf.write(temp_wav.name, audio_data, sample_rate)

    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(temp_wav.name) as source:
            audio_content = recognizer.record(source)
            user_text = recognizer.recognize_google(audio_content)
    except Exception as e:
        return f"❌ Speech recognition failed: {e}", None

    ai_response = get_ai_reply(user_text)

    try:
        tts = gTTS(ai_response)
        temp_mp3 = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(temp_mp3.name)
        voice_reply = temp_mp3.name
    except Exception as e:
        voice_reply = None
        ai_response += f"\n(Audio generation failed: {e})"

    return ai_response, voice_reply

# ------------------ Medicine Reminder Logic ------------------
reminders = []

def add_reminder(medicine_name, time):
    if not medicine_name or not time:
        return "⚠️ Please enter both medicine name and time.", reminders

    new_entry = [medicine_name, time, datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
    reminders.append(new_entry)
    return f"✅ Added reminder for {medicine_name} at {time}", reminders

# ------------------ Symptom to Disease Predictor ------------------
TRAIN_CSV = "Training.csv"
MODEL_FILE = "symptom_model.pkl"

def load_symptom_data():
    df_train = pd.read_csv(TRAIN_CSV)
    # ✅ Remove unnamed/empty columns
    df_train = df_train.loc[:, ~df_train.columns.str.contains('^Unnamed')]
    
    label_col = "prognosis" if "prognosis" in df_train.columns else df_train.columns[-1]
    symptoms = [c for c in df_train.columns if c != label_col]
    X = df_train[symptoms].values
    y = LabelEncoder().fit_transform(df_train[label_col])
    return df_train, symptoms, label_col

def train_symptom_model():
    df_train, symptoms, label_col = load_symptom_data()
    le = LabelEncoder()
    y = le.fit_transform(df_train[label_col])
    X = df_train.drop(columns=[label_col]).values
    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X, y)
    with open(MODEL_FILE, "wb") as f:
        pickle.dump({"model": model, "label_encoder": le, "symptoms": symptoms}, f)
    return model, le, symptoms

def load_symptom_model():
    if os.path.exists(MODEL_FILE):
        with open(MODEL_FILE, "rb") as f:
            data = pickle.load(f)
        return data["model"], data["label_encoder"], data["symptoms"]
    else:
        return train_symptom_model()

symptom_model, label_encoder, symptoms = load_symptom_model()
symptoms = sorted(symptoms)

def predict_disease(selected_symptoms):
    x = np.zeros(len(symptoms))
    for s in selected_symptoms:
        if s in symptoms:
            x[symptoms.index(s)] = 1
    probs = symptom_model.predict_proba([x])[0]
    top_idx = np.argmax(probs)
    disease = label_encoder.inverse_transform([top_idx])[0]
    confidence = round(probs[top_idx] * 100, 2)
    top3_idx = np.argsort(probs)[-3:][::-1]
    top3 = [f"{label_encoder.inverse_transform([i])[0]} ({round(probs[i]*100,2)}%)" for i in top3_idx]
    return f"**Predicted Disease:** {disease}\n**Confidence:** {confidence}%\n\n**Top 3 Predictions:**\n- " + "\n- ".join(top3)

# ------------------ Gradio App ------------------
with gr.Blocks(title="CareConnect - Virtual Nurse Companion") as app:
    app.css = """
footer, #footer, .svelte-1ipelgc, .svelte-1f354aw, .svelte-1l6f3jn,
.absolute.bottom-0, .fixed.bottom-0 {
    display: none !important;
}
"""

    gr.Markdown("# 🩺 CareConnect - Virtual Nurse Companion")

    # 🤖 AI Doctor Tab
    with gr.Tab("🤖 AI Doctor"):
        gr.Markdown("Ask your health question by speaking or typing below:")
        with gr.Row():
            with gr.Column():
                audio_input = gr.Audio(sources=["microphone"], type="numpy", label="🎙️ Speak your question")
                voice_btn = gr.Button("🎧 Ask by Voice")
            with gr.Column():
                text_input = gr.Textbox(label="💬 Or type your question", placeholder="e.g., How to improve sleep quality?")
                text_btn = gr.Button("💭 Ask by Text")

        text_output = gr.Textbox(label="🩺 AI Doctor Reply", lines=4)
        audio_output = gr.Audio(label="🔊 Voice Reply")

        voice_btn.click(process_audio, inputs=audio_input, outputs=[text_output, audio_output])
        text_btn.click(lambda text: (get_ai_reply(text), None), inputs=text_input, outputs=[text_output, audio_output])

    # 💊 Medicine Reminders Tab
    with gr.Tab("💊 Medicine Reminders"):
        gr.Markdown("Add and view your daily medicine reminders below:")
        med_name = gr.Textbox(label="Medicine Name", placeholder="e.g., Paracetamol")
        med_time = gr.Textbox(label="Time (e.g., 09:00 AM)")
        status = gr.Textbox(label="Status", interactive=False)
        reminder_table = gr.Dataframe(
            headers=["Medicine", "Time", "Added On"],
            value=[],
            interactive=False,
            label="📋 Reminder List"
        )
        add_button = gr.Button("➕ Add Reminder")
        add_button.click(add_reminder, [med_name, med_time], [status, reminder_table])

    # 🧠 Symptom-based Disease Predictor Tab
    with gr.Tab("🧠 Disease Predictor"):
        gr.Markdown("### Select the symptoms you are experiencing below:")
        symptom_input = gr.CheckboxGroup(symptoms, label="Select Symptoms")
        predict_btn = gr.Button("🔍 Predict Disease")
        prediction_output = gr.Markdown()
        predict_btn.click(predict_disease, inputs=symptom_input, outputs=prediction_output)

# ------------------ Launch ------------------
app.launch(show_api=False, show_error=True)
