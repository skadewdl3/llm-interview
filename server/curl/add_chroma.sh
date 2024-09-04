curl -X POST http://localhost:5000/add_to_chroma -H "Content-Type: application/json" \
-d '{"vector": [0.1, 0.2, 0.3], "metadata": {"description": "Sample vector"}, "id": "vector_123"}'
