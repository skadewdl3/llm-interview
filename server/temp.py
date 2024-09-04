import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyC8kjCHCANXkDigiNIu7GYUZSPR_V_iuHM")

model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("Write a story about a magic backpack.")
print(response.text)