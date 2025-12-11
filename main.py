import os
import joblib
import pandas as pd
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# --- UPDATE: Using the latest Flash model ---
model_gemini = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

# 2. Allow Frontend to talk to Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Load Models
artifacts = {}

@app.on_event("startup")
def load_artifacts():
    try:
        # Load .pkl files from the 'models' folder
        artifacts['exercise_model'] = joblib.load("models/exercise_model.pkl")
        artifacts['diet_model'] = joblib.load("models/diet_model.pkl")
        artifacts['equipment_model'] = joblib.load("models/equipment_model.pkl")
        
        # Load Columns
        artifacts['exercise_columns'] = joblib.load("models/onehot_edited_columns_exersice.pkl")
        artifacts['diet_columns'] = joblib.load("models/onehot_edited_columns_diet.pkl")
        artifacts['equipment_columns'] = joblib.load("models/onehot_edited_columns_equip.pkl")
        
        # Load Encoders
        artifacts['diet_labels'] = joblib.load("models/diet_label_encoder.pkl")
        artifacts['exercise_labels'] = joblib.load("models/exercise_label_encoder.pkl").classes_
        artifacts['equipment_labels'] = joblib.load("models/equipment_label_encoder.pkl").classes_
        
        print("✅ Models loaded successfully")
    except Exception as e:
        print(f"❌ Error loading models: {e}")

# 4. Define Input Schema
class UserRequest(BaseModel):
    sex: int
    age: int
    height: float
    weight: float
    goal: str
    fitness_type: str
    hypertension: int
    diabetes: int

# 5. The API Endpoint
@app.post("/generate-plan")
async def generate_plan(user: UserRequest):
    try:
        # Calculate BMI
        bmi = user.weight / (user.height ** 2)
        if bmi < 18.5: level = "Underweight"
        elif 18.5 <= bmi < 25: level = "Normal"
        elif 25 <= bmi < 30: level = "Overweight"
        else: level = "Obese"

        # Prepare Data
        data_dict = {
            "Sex": user.sex, "Age": user.age, "Height": user.height, "Weight": user.weight,
            "BMI": bmi, "Level": level, "Fitness Goal": user.goal, "Fitness Type": user.fitness_type,
            "Hypertension": user.hypertension, "Diabetes": user.diabetes
        }
        
        input_df = pd.DataFrame([data_dict])
        input_df_encoded = pd.get_dummies(input_df)

        # Reindex columns
        exercise_input = input_df_encoded.reindex(columns=artifacts['exercise_columns'], fill_value=0)
        diet_input = input_df_encoded.reindex(columns=artifacts['diet_columns'], fill_value=0)
        equipment_input = input_df_encoded.reindex(columns=artifacts['equipment_columns'], fill_value=0)

        # Predict
        rec_exercise = artifacts['exercise_labels'][artifacts['exercise_model'].predict(exercise_input)[0]]
        rec_diet = artifacts['diet_labels'][artifacts['diet_model'].predict(diet_input)[0]]
        rec_equipment = artifacts['equipment_labels'][artifacts['equipment_model'].predict(equipment_input)[0]]

        # Ask Gemini
        prompt = f"""
        Act as a professional fitness trainer.
        Client: {user.age}yo, {user.weight}kg, {user.height}m, Goal: {user.goal}.
        Analysis: Exercise: {rec_exercise}, Diet: {rec_diet}, Equipment: {rec_equipment}.
        Task: Create a weekly workout and diet plan (in Markdown).
        Task: Create a highly detailed weekly routine. 
        IMPORTANT: Format the 'Weekly Schedule' and 'Diet Plan' as Markdown Tables and generate the schedule based on the resluts of the ai and by using your resorses.
        Use clear headers (##) and bullet points for advice.
         """
        response = model_gemini.generate_content(prompt)

        return {
            "predictions": {"exercise": rec_exercise, "diet": rec_diet, "equipment": rec_equipment},
            "gemini_plan": response.text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))