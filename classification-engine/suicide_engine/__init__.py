"""
"""
import pickle
import keras
from tqdm import tqdm
from typing import Tuple
import neattext.functions as nfx
from keras.preprocessing.sequence import pad_sequences

model = keras.models.load_model('/app/suicide_engine/ai_resources/model')

def clean_text(texts: list) -> Tuple[list, list]:
    """
    """
    text_length=[]
    cleaned_text=[]
    for sent in tqdm(texts):
        sent=sent.lower()
        sent=nfx.remove_special_characters(sent)
        sent=nfx.remove_stopwords(sent)
#         sent=nfx.remove_shortwords(sent)
        text_length.append(len(sent.split()))
        cleaned_text.append(sent)

    return cleaned_text, text_length


def prediction(data: list) -> bool:
    """
    """
    cleaned_text, _ = clean_text(data)

    with open('/app/suicide_engine/ai_resources/tokenizer.pickle', 'rb') as handle:
        tokenizer = pickle.load(handle)

    test_text_seq = tokenizer.texts_to_sequences(cleaned_text)
    test_text_pad = pad_sequences(test_text_seq,maxlen=40)

    predict_x = model.predict(test_text_pad)
    if predict_x[0][0] > 0.2: # threshold
        return True
    else:
        return False
