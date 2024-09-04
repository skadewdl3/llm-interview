
# Create room
curl -X POST http://127.0.0.1:5000/create_room -H "Content-Type: application/json" -d '{"room_id": "InterviewRoom1"}'


# Append conversation

curl -X POST http://127.0.0.1:5000/append_conversation -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1", 
  "person_name": "Interviewer 1", 
  "text": "Welcome, thank you for joining us today. Could you please introduce yourself?"
}'


curl -X POST http://127.0.0.1:5000/append_conversation -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1", 
  "person_name": "Candidate", 
  "text": "Thank you for having me. My name is John Doe, and I have over 5 years of experience in software engineering, specifically in backend development and cloud computing."
}'


curl -X POST http://127.0.0.1:5000/append_conversation -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1", 
  "person_name": "Interviewer 2", curl -X POST http://127.0.0.1:5000/generate_summary -H "Content-Type: application/json" -d '{"room_id": "InterviewRoom1"}'

  "text": "Great to meet you, John. Can you tell us about a challenging project you worked on and how you overcame the difficulties?"
}'


curl -X POST http://127.0.0.1:5000/append_conversation -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1", 
  "person_name": "Candidate", 
  "text": "One of the most challenging projects I worked on was a large-scale migration to the cloud. We faced several challenges, including performance optimization and ensuring data integrity during the migration. I led a team that conducted extensive testing and implemented new strategies for load balancing and data encryption, ensuring the project was delivered on time."
}'


curl -X POST http://127.0.0.1:5000/append_conversation -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1", 
  "person_name": "Interviewer 1", 
  "text": "That sounds impressive! What technologies do you enjoy working with the most?"
}'

curl -X POST http://127.0.0.1:5000/append_conversation -H "Content-Type: application/json" -d '{
  "room_id": "InterviewRoom1", 
  "person_name": "Candidate", 
  "text": "I enjoy working with Python, Kubernetes, and AWS. I like the flexibility Python provides, and Kubernetes has been essential in scaling our applications. AWS offers a range of tools that have made cloud infrastructure management much easier."
}'



# Generate summary
curl -X POST http://127.0.0.1:5000/generate_summary -H "Content-Type: application/json" -d '{"room_id": "InterviewRoom1"}'
