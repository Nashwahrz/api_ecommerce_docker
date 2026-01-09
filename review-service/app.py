from flask import Flask, jsonify, request
from database import reviews_collection
import sys

app = Flask(__name__)

# ==============================
#  ROUTES
# ==============================

# 1. Welcome route
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "success",
        "message": "Welcome to the Review Service (MongoDB Connected)",
        "supported_methods": ["GET /reviews", "POST /reviews", "GET /reviews/product/<id>"]
    })

# 2. Get all reviews
@app.route('/reviews', methods=['GET'])
def get_reviews():
    try:
        # Mengambil semua data dari MongoDB, hilangkan '_id' agar bisa di-jsonify
        all_reviews = list(reviews_collection.find({}, {'_id': 0}))
        return jsonify(all_reviews)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. Get reviews by product ID
@app.route('/reviews/product/<int:product_id>', methods=['GET'])
def get_review_by_product_id(product_id):
    try:
        filtered_reviews = list(reviews_collection.find({"product_id": product_id}, {'_id': 0}))
        return jsonify(filtered_reviews)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. Create new review (MENDUKUNG JSON & FORM DATA)
@app.route('/reviews', methods=['POST'])
def create_review():
    # Cek apakah data datang dari JSON atau Form (Postman)
    if request.is_json:
        data = request.get_json()
    else:
        # Mengambil data dari form-data atau x-www-form-urlencoded
        data = request.form.to_dict()

    # Validasi input
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ['product_id', 'review', 'rating']
    missing = [field for field in required_fields if field not in data]

    if missing:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing)}"
        }), 400

    try:
        # Siapkan data (Casting ke int karena Form Data masuk sebagai string)
        new_review = {
            'product_id': int(data['product_id']),
            'review': data['review'],
            'rating': int(data['rating']),
        }

        # Simpan ke MongoDB
        reviews_collection.insert_one(new_review)
        
        # Hapus _id MongoDB agar tidak error saat dikembalikan sebagai JSON
        if '_id' in new_review:
            del new_review['_id']
            
        return jsonify({
            "message": "Review created successfully",
            "data": new_review
        }), 201

    except ValueError:
        return jsonify({"error": "product_id and rating must be numeric"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. Delete reviews by product
@app.route('/reviews/product/<int:product_id>', methods=['DELETE'])
def delete_reviews_by_product(product_id):
    try:
        result = reviews_collection.delete_many({"product_id": product_id})
        return jsonify({"message": f"{result.deleted_count} reviews deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
#  RUN APP
# ==============================
if __name__ == '__main__':
    # host 0.0.0.0 agar bisa diakses antar container Docker
    app.run(debug=True, host='0.0.0.0', port=5004)