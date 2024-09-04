from flask import Flask, request, jsonify
import redis
import chromadb
from chromadb.config import Settings
import numpy as np
from openai import OpenAI
import json
import datetime
import PyPDF2  
import uuid  


app = Flask(__name__)


redis_client = redis.StrictRedis(host='127.0.0.1', port=6379, db=0, decode_responses=True)


chroma_client = chromadb.HttpClient(host="http://127.0.0.1:8000",
                                    settings=Settings())


chroma_client.delete_collection(name="my_vectors")
collection_name = "my_vectors"
collection = chroma_client.create_collection(name=collection_name)


# client = OpenAI(
#     # This is the default and can be omitted
#     api_key="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"
# )
client = OpenAI(
    api_key="G78SOON3GRB6L8NOC50FJQI8N78U0PM4C41Y2SFD",
    base_url="https://api.runpod.ai/v2/vllm-1d0a3g9p6pjkn3/openai/v1",
)

# Utility to extract text from a PDF file
def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ''
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        text += page.extract_text()
    return text

@app.route('/add_to_chroma', methods=['POST'])
def add_to_chroma():
    try:
        data = request.json
        vector = data['vector']  
        metadata = data['metadata']  
        vector_id = data['id']  

     
        vector = np.array(vector).tolist()

    
        collection.add(ids=[vector_id], embeddings=[vector], metadatas=[metadata])

        return jsonify({"message": "Vector added successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/query_chroma', methods=['POST'])
def query_chroma():
    try:
        data = request.json
        query_vector = data['query_vector']  
        n_results = data.get('n_results', 5) 


        query_vector = np.array(query_vector).tolist()


        results = collection.query(query_embeddings=[query_vector], n_results=n_results)

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/set_redis', methods=['POST'])
def set_redis():
    try:
        data = request.json
        key = data['key']
        value = data['value']


        redis_client.set(key, value)

        return jsonify({"message": "Value set in Redis successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/get_redis', methods=['GET'])
def get_redis():
    try:
        key = request.args.get('key')

     
        value = redis_client.get(key)

        if value:
            return jsonify({"key": key, "value": value}), 200
        else:
            return jsonify({"error": "Key not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/chatgpt', methods=['POST'])
def chatgpt():
    try:
        data = request.json
        prompt = data.get('prompt', '')

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400


        models = client.models.list()
        model_gpt = models.data[0].id
        print(model_gpt)
        
        response = client.chat.completions.create(
 
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            model=model_gpt,
        )

       
        completion_text = response.choices[0].message.content.strip()

        return jsonify({"response": completion_text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400



# Route to create a new room
@app.route('/create_room', methods=['POST'])
def create_room():
    try:
        data = request.json
        room_id = data['room_id']
        
        # Create room with empty conversation list
        redis_client.set(room_id, json.dumps([]))  # Using JSON list to store conversation
        
        return jsonify({"message": f"Room '{room_id}' created successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route to append conversation to a room
@app.route('/append_conversation', methods=['POST'])
def append_conversation():
    try:
        data = request.json
        room_id = data['room_id']
        person_name = data['person_name']
        text = data['text']
        
        # Get the current conversation from Redis
        conversation = redis_client.get(room_id)
        if conversation is None:
            return jsonify({"error": f"Room '{room_id}' not found."}), 404

        # Parse the conversation (it's stored as a JSON list)
        conversation = json.loads(conversation)
        
        # Add new entry with timestamp
        conversation_entry = {
            "person_name": person_name,
            "text": text,
            "timestamp": datetime.datetime.now().isoformat()
        }
        conversation.append(conversation_entry)
        
        # Save updated conversation back to Redis
        redis_client.set(room_id, json.dumps(conversation))
        
        return jsonify({"message": "Conversation appended successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route to generate summary from the conversation
@app.route('/generate_summary', methods=['POST'])
def generate_summary():
    try:
        data = request.json
        room_id = data['room_id']
        
        # Get the conversation from Redis
        conversation = redis_client.get(room_id)
        if conversation is None:
            return jsonify({"error": f"Room '{room_id}' not found."}), 404

        # Parse the conversation (it's stored as a JSON list)
        conversation = json.loads(conversation)
        
        # Prepare prompt for the LLM (concatenate all messages)
        conversation_text = "\n".join([f"{entry['person_name']}: {entry['text']}" for entry in conversation])
        prompt = f"Summarize the following conversation:\n\n{conversation_text}"
        
        # Query LLM for the summary
        models = client.models.list()
        model_gpt = models.data[0].id
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            model=model_gpt,
        )
        
        summary = response.choices[0].message.content.strip()
        
        return jsonify({"summary": summary}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/evaluate_response', methods=['POST'])
def evaluate_response():
    try:
        data = request.json
        room_id = data['room_id']
        
        # Get the conversation from Redis (all previous messages in the interview)
        conversation = redis_client.get(room_id)
        if conversation is None:
            return jsonify({"error": f"Room '{room_id}' not found."}), 404

        # Parse the conversation (it's stored as a JSON list)
        conversation = json.loads(conversation)
        
        # Assuming the interviewer questions and candidate responses are stored in the conversation
        conversation_text = "\n".join([f"{entry['person_name']}: {entry['text']}" for entry in conversation])
        
        # Marking Schema (based on the PDF you provided)
        marking_schema = """
        Evaluate the candidate’s responses based on the following criteria:
        
        Work Output (40%):
        1. Scientific Projects/Assignments
        2. Work Quality
        3. Work Quantity
        4. Administrative Duties
        
        Personal Attributes (30%):
        1. Attitude
        2. Responsibility
        3. Initiative
        4. Commitment to Work
        5. Adaptability
        6. Communication Skills
        7. Discipline
        8. Resourcefulness
        9. Credibility & Accountability
        10. Team Work
        
        Functional Competency (30%):
        1. Scientific Knowledge
        2. Experimental or Practical Ability
        3. Fulfillment of Set Commitments
        4. Updating of Knowledge & Skills
        5. Knowledge of Rules and Regulations
        
        Provide grades from Outstanding (5), Very Good (4), Average (3), Below Average (2), and Poor (1).
        """

        # Prepare prompt for the LLM
        prompt = f"""
        The following is the conversation between an interviewer and a candidate:\n\n{conversation_text}\n\n
        {marking_schema}
        
        Based on the candidate’s responses, provide an evaluation with a grade for each of the categories.
        """

        # Query the LLM for evaluation
        models = client.models.list()
        model_gpt = models.data[0].id
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert evaluator following a scientific grading system."},
                {"role": "user", "content": prompt}
            ],
            model=model_gpt,
        )
        
        evaluation = response.choices[0].message.content.strip()
        
        return jsonify({"evaluation": evaluation}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        room_id = data['room_id']
        
        # Get the conversation from Redis
        conversation = redis_client.get(room_id)
        if conversation is None:
            return jsonify({"error": f"Room '{room_id}' not found."}), 404

        # Parse the conversation (it's stored as a JSON list)
        conversation = json.loads(conversation)
        
        # Prepare prompt for the LLM (concatenate all messages)
        conversation_text = "\n".join([f"{entry['person_name']}: {entry['text']}" for entry in conversation])
        prompt = f"Based on the following conversation, suggest three follow-up questions:\n\n{conversation_text}"
        
        # Query LLM for the questions
        models = client.models.list()
        model_gpt = models.data[0].id
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            model=model_gpt,
        )
        
        questions = response.choices[0].message.content.strip().split("\n")[:3]
        
        return jsonify({"suggested_questions": questions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

@app.route('/check_question', methods=['POST'])
def check_question():
    try:
        data = request.json
        room_id = data['room_id']
        question = data['question']
        
        # Get the conversation from Redis
        conversation = redis_client.get(room_id)
        if conversation is None:
            return jsonify({"error": f"Room '{room_id}' not found."}), 404

        # Parse the conversation (it's stored as a JSON list)
        conversation = json.loads(conversation)
        
        # Prepare prompt for the LLM (concatenate all messages)
        conversation_text = "\n".join([f"{entry['person_name']}: {entry['text']}" for entry in conversation])
        prompt = f"The following is a conversation:\n\n{conversation_text}\n\nBased on this conversation, check if the following question is relevant, or if it deviates from the conversation context, is unnecessary, political, or inappropriate:\n\n{question}"

        # Query LLM for evaluation of the question
        models = client.models.list()
        model_gpt = models.data[0].id
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            model=model_gpt,
        )
        
        # Process LLM response
        evaluation = response.choices[0].message.content.strip()
        
        return jsonify({"evaluation": evaluation}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400



# Route for candidates to upload their resume (PDF), extract text, and store in ChromaDB
@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    try:
        # Ensure a PDF is provided
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file provided."}), 400
        
        # Extract text from the uploaded PDF file
        pdf_file = request.files['resume']
        extracted_text = extract_text_from_pdf(pdf_file)
        
        # Generate a vector embedding for the extracted text
        vector = generate_embedding(extracted_text)
        
        # Generate a unique vector ID for this resume
        vector_id = str(uuid.uuid4())
        
        # Store the vector and metadata in ChromaDB
        metadata = {"resume_text": extracted_text}
        collection.add(ids=[vector_id], embeddings=[vector], metadatas=[metadata])
        
        return jsonify({"message": "Resume uploaded and stored successfully.", "vector_id": vector_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route for interviewers to submit a job description and get relevant candidates from ChromaDB
@app.route('/recommend_candidates', methods=['POST'])
def recommend_candidates():
    try:
        # Get the job description and number of results from the request body
        data = request.json
        job_description = data['job_description']
        n_results = int(data.get('n_results', 5))  # Default to 5 candidates if not provided
        
        # Generate an embedding for the job description
        job_vector = generate_embedding(job_description)
        
        # Query the ChromaDB to find the top N candidates
        job_vector = np.array(job_vector).tolist()
        results = collection.query(query_embeddings=[job_vector], n_results=n_results)
        
        # Return the candidates sorted by relevancy
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
