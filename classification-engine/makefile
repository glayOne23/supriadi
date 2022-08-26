test:
	pytest -v
cover:
	pytest --cov
dev:
	export FLASK_ENV=development && python3 api.py
syncdata:
	python3 scheduler.py --skip
start:
	export FLASK_ENV=production && gunicorn --bind 0.0.0.0:${PORT} api:app --access-logfile logs/access.log --capture-output
install:
	python3 -m pip install -r requirements.txt
