curl -X POST http://localhost:5000/query_chroma -H "Content-Type: application/json" \
-d '{"query_vector": [0.0, 0.2, 0.3], "n_results": 5}'
