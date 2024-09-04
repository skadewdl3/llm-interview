import os
from flask import Flask, request, jsonify
import redis
import chromadb
from chromadb.config import Settings
import numpy as np
import google.generativeai as genai  
import PyPDF2  
import uuid 

app = Flask(__name__)


redis_client = redis.StrictRedis(host='127.0.0.1', port=6379, db=0, decode_responses=True)


chroma_client = chromadb.HttpClient(host="http://127.0.0.1:8000", settings=Settings())
chroma_client.delete_collection(name="candidate_vectors")
collection_name = "candidate_vectors"
collection = chroma_client.create_collection(name=collection_name)


genai.configure(api_key="AIzaSyC8kjCHCANXkDigiNIu7GYUZSPR_V_iuHM")


def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ''
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        text += page.extract_text()
    return text


def generate_embedding(text):

    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        output_dimensionality=10 
    )
    return result["embedding"]


@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    try:
       
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file provided."}), 400
        
      
        pdf_file = request.files['resume']
        extracted_text = extract_text_from_pdf(pdf_file)

        print(extracted_text)
        

        vector = generate_embedding(extracted_text)
        
  
        vector_id = str(uuid.uuid4())
        
        metadata = {"resume_text": extracted_text}
        collection.add(ids=[vector_id], embeddings=[vector], metadatas=[metadata])
        
        return jsonify({"message": "Resume uploaded and stored successfully.", "vector_id": vector_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/recommend_candidates', methods=['POST'])
def recommend_candidates():
    try:

        data = request.json
        job_description = data['job_description']
        n_results = int(data.get('n_results', 5))  
        
   
        job_vector = generate_embedding(job_description)
        

        job_vector = np.array(job_vector).tolist()
        results = collection.query(query_embeddings=[job_vector], n_results=n_results)
        

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

