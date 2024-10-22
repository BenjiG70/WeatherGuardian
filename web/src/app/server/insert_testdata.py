import requests #(sudo) pip install requests
import random

#Ip of your server
server_url = "http://<your_ip>:port/insert/data"
x = 0
while x < 100:
    x+=1
    #Testdata
    data = {
        'temperature': random.randint(0, 50),
        'humidity': random.randint(0, 100),
        'air_pressure': random.randint(0, 2000),
        'sensor': 'Test_Client'
    }

    #Send post-request to earlier defined server
    try:
        #send data as json
        response = requests.post(server_url, json=data)

        #check if sending was successfull
        if response.status_code == 200:
            print("Success:", response.json())
        else:
            print("Error:", response.status_code, response.text)

    except requests.exceptions.RequestException as e:
        print(f"Error to connect to serverr: {e}")
