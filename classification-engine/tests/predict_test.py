import json
import pytest
from app import create_app

app = create_app()

headers = {
    "Content-Type": "application/json",
    "x-api-key": "236e5acea9094ff761415a59527c3a43"
}

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_not_found(client):
    """
    """
    response = client.post("/save_emails", headers=headers)
    response_data = json.loads(response.get_data(as_text=True))

    assert response.status_code == 404
    assert "not found" in response_data.get('message')
    assert 0 == response_data.get('status')


def test_wrong_api_key(client):
    """
    """
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "wrong"
    }
    response = client.post("/predict", headers=headers)

    assert response.status_code == 401


def test_no_tweet(client):
    """
    """
    data = {

    }

    response = client.post("/predict", data=json.dumps(data), headers=headers)
    response_data = json.loads(response.get_data(as_text=True))

    assert response.status_code == 200
    assert "No tweet" in response_data.get('message')
    assert 0 == response_data.get('status')


def test_tweet_suicide(client):
    data = {
        "tweet": "Im so scared I might do something drastic, Ive been shaped by fear and anxiety. Idk what to do anymore"
    }

    response = client.post("/predict", data=json.dumps(data), headers=headers)
    response_data = json.loads(response.get_data(as_text=True))

    assert response.status_code == 200
    assert "prediction result" in response_data.get('message')
    assert 1 == response_data.get('status')
    assert True == response_data.get('is_suicide')


def test_tweet_not_suicide(client):
    data = {
        "tweet": "Im happy"
    }

    response = client.post("/predict", data=json.dumps(data), headers=headers)
    response_data = json.loads(response.get_data(as_text=True))

    assert response.status_code == 200
    assert "prediction result" in response_data.get('message')
    assert 1 == response_data.get('status')
    assert True == response_data.get('is_suicide')
