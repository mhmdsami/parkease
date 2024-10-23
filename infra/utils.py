import ubinascii, machine, network, asyncio

import config


def get_machine_id() -> str:
    return ubinascii.hexlify(machine.unique_id()).decode('utf-8')

async def connect() -> str:
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(config.NETWORK_SSID, config.NETWORK_PASSWORD)
    while not wlan.isconnected():
        await asyncio.sleep(1)
    
    return wlan.ipconfig('addr4')[0]
