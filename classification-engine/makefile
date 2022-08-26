test:
	pytest -v
cover:
	pytest --cov
dev:
	export FLASK_ENV=development && python3 wsgi.py
start:
	export FLASK_ENV=production && gunicorn --bind 0.0.0.0:300 wsgi:app --capture-output
install:
	pip install -r requirements.txt
