from flask import Blueprint, jsonify, request, current_app
from app.middleware import auth_api_key
from suicide_engine import prediction

app_bp = Blueprint("app_bp", __name__)

# middleware
app_bp.before_request(auth_api_key)

@app_bp.route("/predict", methods=["POST"])
def predict():
    request_data = request.get_json()
    current_app.logger.info(f"Predict request: {request_data}")

    tweet = request_data.get("tweet", None)

    if not tweet:
        return jsonify({
            "message": "No tweet",
            "status": 0
        })

    prediction_result = prediction([tweet])
    # prediction_result = True

    result = {
        "is_suicide": prediction_result,
        "message": "suicidal tweet prediction result",
        "status": 1
    }

    current_app.logger.info(f"Predict response: {result}")

    return jsonify(result)


@app_bp.errorhandler(404)
def page_not_found(e) -> tuple:
    """
        it will render if user got invalid route
    """
    return jsonify({
        "message": "not found",
        "status": 0
    }), 404
