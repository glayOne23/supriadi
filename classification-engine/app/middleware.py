from flask import jsonify, request
import os

def auth_api_key():
    """
    Decode JWT Token on each v5 endpoint
    """

    api_key = request.headers.get('x-api-key')

    if api_key is None:
        return jsonify(401)

    correct_key = os.environ.get('X-API-KEY')
    correct_key = '236e5acea9094ff761415a59527c3a43'
    # 236e5acea9094ff761415a59527c3a43
    if api_key != correct_key:
        return jsonify({
            "message": "Unauthorized, you bukan syahid"
        }), 401

    return
