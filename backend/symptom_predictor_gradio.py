import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import gradio as gr

# Load datasets
train = pd.read_csv("Training.csv")
test = pd.read_csv("Testing.csv")

# Drop the last "unconfirmed" column if present (commonly the 133rd one)
if "prognosis" not in train.columns:
    train.drop(train.columns[-1], axis=1, inplace=True)
if "prognosis" not in test.columns:
    test.drop(test.columns[-1], axis=1, inplace=True)

# Encode target labels
le = LabelEncoder()
train['prognosis'] = le.fit_transform(train['prognosis'])
test['prognosis'] = le.transform(test['prognosis'])

# Prepare features and target
X = train.drop('prognosis', axis=1)
y = train['prognosis']

# Train model
model = RandomForestClassifier()
model.fit(X, y)

# Sort symptoms alphabetically
symptoms = sorted(X.columns.tolist())

# Prediction function
def predict_disease(selected_symptoms):
    if not selected_symptoms:
        return "⚠️ Please select at least one symptom."

    input_data = [1 if symptom in selected_symptoms else 0 for symptom in symptoms]
    pred = model.predict([input_data])[0]
    disease = le.inverse_transform([pred])[0]
    return f"🩺 Predicted Disease: {disease}"

# Gradio UI
def create_symptom_ui():
    with gr.Blocks() as symptom_app:
        gr.Markdown("## 🧬 Symptom → Disease Predictor")
        gr.Markdown("Select your symptoms below to predict the possible disease:")

        symptom_select = gr.CheckboxGroup(
            choices=symptoms,
            label="Select Symptoms",
        )
        predict_btn = gr.Button("🔍 Predict Disease")
        output = gr.Textbox(label="Prediction Result")

        predict_btn.click(fn=predict_disease, inputs=symptom_select, outputs=output)

    return symptom_app
