curl -X POST http://127.0.0.1:5000/recommend_candidates -H "Content-Type: application/json" -d '{
  "job_description": " Agriculture",
  "n_results": 1
}'



curl -X POST -F 'resume=@resume.pdf' http://127.0.0.1:5000/upload_resume
