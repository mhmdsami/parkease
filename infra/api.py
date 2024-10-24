import urequests, json

import config


def init_locker(machine_id, ip_addr, state):
    url = f"{config.API_BASE_URL}/locker/online"
    headers = {"Content-Type": "application/json"}
    data = json.dumps({"machineId": machine_id, "ipAddr": ip_addr, "state": state})

    res = urequests.post(url, headers=headers, data=data)
    data = res.json()

    if data["success"] != True:
        raise Exception(data["message"])

    return data["data"]["locker"]


def verify_key(locker_id, key):
    url = f"{config.API_BASE_URL}/locker/verify"
    headers = {"Content-Type": "application/json"}
    data = json.dumps({"lockerId": locker_id, "key": key})

    res = urequests.post(url, headers=headers, data=data)
    data = res.json()

    return data["success"]


def ping(locker_id, state):
    url = f"{config.API_BASE_URL}/locker/ping/{locker_id}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps({"lockerId": locker_id, "state": state})

    urequests.post(url, headers=headers, data=data)
