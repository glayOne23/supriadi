import requests
from django.contrib import messages
from django.conf import settings


class SUPRIADI:
    token = ''

    def get_new_token(self, request):
        data = {
            'username': 'myums',
            'password': 'SYf4Q9aq0o2r',            
        }
        url = F"{settings.API_URL}token/"
        response = requests.post(url, data=data)
        hasil, data = self.cek_data(request, response, 200)
        if hasil:
            request.session['api_gateway_access_token'] = data['access']
            request.session['api_gateway_refresh_token'] = data['refresh']
            self.token = request.session.get('api_gateway_access_token')
            return True, data
        else:
            return False, data

    def get_token(self, request):
        # jika ada token
        if request.session.get('api_gateway_access_token'):
            self.token = request.session.get('api_gateway_access_token')
        # jika tidak ada token
        else:
            self.get_new_token(request)
    

    def cek_data(self, request, r, success_status_code):
        try:
            if r.status_code == success_status_code:
                return True, r.json()
            elif r.status_code == 401:
                return False, messages.warning(request, 'User tidak dikenal, kembali menuju dashboard untuk mendeteksi user kembali' % r.status_code)
            elif not r.json()['success']:
                return False, messages.error(request, r.json()['message'])
            else:
                return False, messages.warning(request, 'Ada kesalahan %d. Hubungi admin sistem' % r.status_code)
        except requests.Timeout:
            return False, messages.error(request, 'Server merespon terlalu lama. Silakan coba beberapa saat lagi')
        except requests.exceptions.ConnectionError:
            return False, messages.error(request, 'Gagal menghubungi sistem SiHRD, Coba ulangi beberapa saat lagi')
        except Exception as e:
            return False, messages.error(request, 'Terjadi kesalahan: %s, hubungi admin sistem ini.' % str(e))

    def get(self, request, sub_url: str):
        self.get_token(request)
        url = settings.API_URL + sub_url
        r = requests.get(url, headers={'Authorization': F'Bearer {self.token}'})
        hasil, data = self.cek_data(request, r, 200)
        if hasil:
            return True, data["rows"]
        else:
            return hasil, data

    def post(self, request, sub_url, data=None, files=None):
        self.get_token(request)
        url = settings.API_URL + sub_url
        r = requests.post(url, headers={'Authorization': F'Bearer {self.token}'}, data=data, files=files)
        return self.cek_data(request, r, 201)

    def put(self, request, sub_url, data=None, files=None):
        self.get_token(request)
        url = settings.API_URL + sub_url
        r = requests.put(url, headers={'Authorization': F'Bearer {self.token}'}, data=data, files=files)
        return self.cek_data(request, r, 200)

    def delete(self, request, sub_url, data=None):
        self.get_token(request)
        url = settings.API_URL + sub_url
        r = requests.delete(url, headers={'Authorization': F'Bearer {self.token}'})
        return self.cek_data(request, r, 200)


supriadi = SUPRIADI()
