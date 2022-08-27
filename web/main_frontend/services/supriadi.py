import jwt
import datetime
import requests
from django.contrib import messages
from django.conf import settings


class SUPRIADI:

    def cek_token(self, request, token):        
        try:            
            token = jwt.decode(token, options={"verify_signature": False})
            exp = datetime.datetime.fromtimestamp(token['exp'])
            now = datetime.datetime.now()                        
            if now < exp:
                return True, ""
            else:
                return False, messages.error(request, 'Session anda habis, mohon login lagi untuk dapat melihat data')
        # except jwt.ExpiredSignatureError:
        except Exception as e:
            # Signature has expired
            print(e)
            return False, messages.error(request, 'Session anda habis, mohon login lagi untuk dapat melihat data')

    def cek_data(self, request, r, success_status_code):                                                
        try:
            if r.status_code == success_status_code:
                return True, r.json()
            elif r.status_code == 401:
                return False, messages.warning(request, 'User tidak dikenal, kembali menuju dashboard untuk mendeteksi user kembali' % r.status_code)            
            elif r.status_code == 400 or r.status_code == 422:
                return False, messages.warning(request, r.json().get('details'))
            else:
                return False, messages.warning(request, 'Ada kesalahan %d. Hubungi admin sistem' % r.status_code)
        except requests.Timeout:
            return False, messages.error(request, 'Server merespon terlalu lama. Silakan coba beberapa saat lagi')
        except requests.exceptions.ConnectionError:
            return False, messages.error(request, 'Gagal menghubungi sistem SiHRD, Coba ulangi beberapa saat lagi')
        except Exception as e:
            return False, messages.error(request, 'Terjadi kesalahan: %s, hubungi admin sistem ini.' % str(e))

    def get(self, request, sub_url: str, token: str):
        hasil, data = self.cek_token(request, token)
        if not hasil:           
            return hasil, data
        url = settings.API_URL + sub_url
        r = requests.get(url, headers={'Authorization': F'Bearer {token}'})
        hasil, data = self.cek_data(request, r, 200)
        if hasil:
            return True, data
        else:
            return hasil, data

    def get_no_auth(self, request, sub_url: str):        
        url = F"{settings.API_URL}{sub_url}"        
        r = requests.get(url)
        hasil, data = self.cek_data(request, r, 200)
        if hasil:
            return True, data
        else:
            return hasil, data                      

    def post_no_auth(self, request, sub_url, data=None, files=None):        
        url = settings.API_URL + sub_url        
        r = requests.post(url, json=data, files=files)
        return self.cek_data(request, r, 200)


supriadi = SUPRIADI()
