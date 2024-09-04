from flask import Flask, request, jsonify
import redis
import chromadb
from chromadb.config import Settings
import numpy as np
from openai import OpenAI


app = Flask(__name__)


redis_client = redis.StrictRedis(host='127.0.0.1', port=6379, db=0, decode_responses=True)


chroma_client = chromadb.HttpClient(host="http://127.0.0.1:8000",
                                    settings=Settings())


chroma_client.delete_collection(name="my_vectors")
collection_name = "my_vectors"
collection = chroma_client.create_collection(name=collection_name)


client = OpenAI(
    api_key="G78SOON3GRB6L8NOC50FJQI8N78U0PM4C41Y2SFD",
    base_url="https://api.runpod.ai/v2/vllm-1d0a3g9p6pjkn3/openai/v1",
)



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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
