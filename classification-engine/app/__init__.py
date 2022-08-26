"""
initiation file for the app
this file invoked from setup.py outstide
this represent the corpe/ directory
"""

from flask import Flask, jsonify
from app.config import Config
from app.exceptions import InvalidUsage

def create_app(config=Config):
    """
    end point of the app
    """
    # Initiate flask object and its config
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config)

    from app.routes import page_not_found
    app.register_error_handler(404, page_not_found)

    @app.errorhandler(InvalidUsage)
    def handle_invalid_usage(error):
        """
        Handle invalid usage exceptions

        Params:
            - error: details error

        Return:
            - response(json): message with status code
        """
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    # run route from the app context
    with app.app_context():
        # Import routes
        from app.routes import app_bp
        app.register_blueprint(app_bp)

        return app
