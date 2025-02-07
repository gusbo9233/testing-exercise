from flask import Flask, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# Sample data: a list of medical journal documents with various types and categories.
documents = [
    {
        "id": 1,
        "title": "Advances in Cardiology",
        "type": "Review",
        "category": "Cardiology",
        "abstract": "This review discusses recent advances in cardiology...",
        "content": "Full content of the review on advances in cardiology. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 2,
        "title": "Neurological Cases in Pediatrics",
        "type": "Case Report",
        "category": "Neurology",
        "abstract": "A case report on neurological issues in pediatric patients...",
        "content": "Detailed content about neurological cases in pediatric neurology. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 3,
        "title": "Oncology: New Frontiers",
        "type": "Research Article",
        "category": "Oncology",
        "abstract": "Research article exploring new frontiers in oncology treatments...",
        "content": "In-depth research content on oncology. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 4,
        "title": "Clinical Study on Diabetes",
        "type": "Clinical Study",
        "category": "Endocrinology",
        "abstract": "A clinical study discussing diabetes advancements...",
        "content": "Study details, methodology, results, and discussion on diabetes. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 5,
        "title": "Innovations in Medical Imaging",
        "type": "Review",
        "category": "Radiology",
        "abstract": "Review of recent innovations in medical imaging technologies...",
        "content": "Detailed discussion on medical imaging innovations. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 6,
        "title": "Emergency Medicine Protocols",
        "type": "Guidelines",
        "category": "Emergency Medicine",
        "abstract": "Updated protocols for emergency medicine procedures...",
        "content": "Comprehensive guidelines for emergency medicine procedures and best practices. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 7,
        "title": "Psychiatric Treatment Methods",
        "type": "Clinical Study",
        "category": "Psychiatry",
        "abstract": "Study on modern psychiatric treatment approaches...",
        "content": "Analysis of various psychiatric treatment methods and their effectiveness. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 8,
        "title": "Surgical Techniques in Orthopedics",
        "type": "Research Article",
        "category": "Orthopedics",
        "abstract": "New surgical techniques for joint replacement...",
        "content": "Detailed description of innovative surgical techniques in orthopedics. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 9,
        "title": "Pediatric Vaccination Studies",
        "type": "Clinical Study",
        "category": "Pediatrics",
        "abstract": "Analysis of vaccination effectiveness in children...",
        "content": "Comprehensive study of vaccination outcomes in pediatric populations. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 10,
        "title": "Dermatology Case Series",
        "type": "Case Report",
        "category": "Dermatology",
        "abstract": "Series of unusual dermatological cases and treatments...",
        "content": "Collection of interesting dermatological cases and their management. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 11,
        "title": "Advances in Ophthalmology",
        "type": "Review",
        "category": "Ophthalmology",
        "abstract": "Recent developments in eye surgery and treatment...",
        "content": "Overview of latest advances in ophthalmological procedures and treatments. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        "id": 12,
        "title": "Infectious Disease Management",
        "type": "Guidelines",
        "category": "Infectious Disease",
        "abstract": "Updated guidelines for managing infectious diseases...",
        "content": "Current protocols and guidelines for infectious disease management and control. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    }
]

def timed_response(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        if isinstance(result, tuple):
            response, status_code = result
        else:
            response, status_code = result, 200
            
        if isinstance(response, dict):
            response['response_time_ms'] = round(response_time, 2)
            if not isinstance(response, dict):
                response = {'documents': response}
        return response, status_code
    return wrapper

@app.route('/documents', methods=['GET'])
@timed_response
def get_documents():
    """
    GET /documents endpoint.

    Optional query parameters:
    - search: a term to search for in the document's title or abstract (case-insensitive).
    - type: filter by document type (e.g., Review, Case Report, Research Article, Clinical Study).
    - category: filter by document category (e.g., Cardiology, Neurology, Oncology, etc.).
    """
    search_query = request.args.get('search', '')
    doc_type = request.args.get('type', '')
    category = request.args.get('category', '')

    # Start with the full list of documents.
    filtered_docs = documents

    # Filter by search query in title or abstract.
    if search_query:
        filtered_docs = [
            doc for doc in filtered_docs
            if search_query.lower() in doc['title'].lower() or
               search_query.lower() in doc.get('abstract', '').lower()
        ]

    # Filter by document type.
    if doc_type:
        filtered_docs = [
            doc for doc in filtered_docs
            if doc['type'].lower() == doc_type.lower()
        ]

    # Filter by document category.
    if category:
        filtered_docs = [
            doc for doc in filtered_docs
            if doc['category'].lower() == category.lower()
        ]

    return jsonify({'documents': filtered_docs})

@app.route('/documents/<int:doc_id>', methods=['GET'])
def get_document(doc_id):
    """
    GET /documents/<doc_id> endpoint.

    Returns the full content of a document with the provided id.
    If no document is found with that id, returns a 404 error.
    """
    document = next((doc for doc in documents if doc['id'] == doc_id), None)
    if document is None:
        return jsonify({"error": "Document not found"}), 404
    return jsonify(document)

@app.route('/options', methods=['GET'])
def get_options():
    """Get all available filter options from the documents."""
    categories = sorted(set(doc['category'] for doc in documents))
    types = sorted(set(doc['type'] for doc in documents))
    
    return jsonify({
        'categories': categories,
        'types': types,
        'sortOptions': [
            {'value': 'name', 'label': 'Sort by Name'},
            {'value': 'id', 'label': 'Sort by ID'}
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3333)
