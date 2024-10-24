import ubinascii, machine, network, asyncio

from mfrc522 import MFRC522
import config


reader = MFRC522(spi_id=0, sck=6, miso=4, mosi=7, cs=5, rst=22)


def get_machine_id():
    return ubinascii.hexlify(machine.unique_id()).decode("utf-8")


async def connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(config.NETWORK_SSID, config.NETWORK_PASSWORD)
    while not wlan.isconnected():
        await asyncio.sleep(1)

    return wlan.ipconfig("addr4")[0]


def read_rfid():
    try:
        reader.init()
        (stat, tag_type) = reader.request(reader.REQIDL)
        if stat == reader.OK:
            (stat, uid) = reader.SelectTagSN()
            if stat == reader.OK:
                (stat, data) = reader.read_data(uid)
                if stat == reader.OK:
                    return data

    except:
        pass
