import config
import urequests
import json


def init_locker(machine_id, ip_addr, state):
    url = f"{config.API_BASE_URL}/locker/online"
    headers = { "content-type": "application/json" }
    data = json.dumps({ "machineId": machine_id, "ipAddr": ip_addr, "state": state })
    
    res = urequests.post(url, headers=headers, data=data)
    data = res.json()
    
    if data["success"] != True:
        raise Exception(data["message"])
    
    return data["data"]["locker"]

def verify_key(machine_id, state, key):
    pass
