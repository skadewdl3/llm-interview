curl -X POST http://127.0.0.1:5000/recommend_candidates -H "Content-Type: application/json" -d '{
  "job_description": " ASP.NET CORE, Azure, Angular, Go",
  "n_results": 1
}'
