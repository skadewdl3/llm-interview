curl -X POST http://127.0.0.1:5000/generate_summary -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1"
}'


curl -X POST http://127.0.0.1:5000/generate_questions -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1"
}'


curl -X POST http://127.0.0.1:5000/check_question -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1",
  "question": "What is your opinion on the current political climate?"
}'

curl -X POST http://127.0.0.1:5000/evaluate_response -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1"
}'
