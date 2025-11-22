from flask import Flask, jsonify, request

app = Flask(__name__)

# Dummy data
reviews = [
    {"id": 1, "product_id": 101, "review": "Great product:", "rating": 5},
    {"id": 2, "product_id": 101, "review": "Wow product:", "rating": 3},
    {"id": 3, "product_id": 101, "review": "Amazing:", "rating": 4},
]

# GET /reviews -> semua review
@app.route('/reviews', methods=['GET'])
def get_reviews():
    return jsonify(reviews)

# GET /reviews/<id> -> review berdasarkan ID review
@app.route('/reviews/<int:review_id>', methods=['GET'])
def get_review_by_id(review_id):
    review = next((r for r in reviews if r["id"] == review_id), None)
    if not review:
        return jsonify({"message": "review not found"}), 404
    return jsonify(review)

# GET /reviews/product/<product_id> -> review berdasarkan product_id
@app.route('/reviews/product/<int:product_id>', methods=['GET'])
def get_reviews_by_product(product_id):
    filtered_reviews = [r for r in reviews if r["product_id"] == product_id]
    return jsonify(filtered_reviews)

# POST /reviews -> tambah review baru
@app.route('/reviews', methods=['POST'])
def create_review():

    data = request.get_json() or {}

    required_fields = ["product_id", "review", "rating"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400
    
    new_id = len(reviews) + 1
    new_review = {
        "id": new_id,
        "product_id": int(data["product_id"]),
        "review": data["review"],
        "rating": int(data["rating"])
    }
    reviews.append(new_review)
    return jsonify(new_review), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
