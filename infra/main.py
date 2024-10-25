import asyncio, json, machine, os, time

import api
import config
from enums import LockState, LockerState
from utils import connect, get_machine_id, read_rfid


IP_ADDR = None
MACHINE_ID = get_machine_id()
STATE = LockerState.ONLINE
LOCK_STATE = LockState.CLOSE
LOCKER_ID = None

LED = machine.Pin("LED", machine.Pin.OUT)
RELAY = machine.Pin(21, machine.Pin.OUT)
TIMER = machine.Timer()


def sync_state(t):
    api.ping(LOCKER_ID, STATE)


async def handle_client(reader, writer):
    global STATE, LOCK_STATE
    addr = reader.get_extra_info("peername")[0]
    req = (await reader.read(1024)).decode("utf-8")
    method = req.split()[0]
    path = req.split()[1]

    if addr != config.SERVER_IP:
        writer.write("HTTP/1.0 403 OK\r\nContent-type: text/json\r\n\r\n")
        writer.write(
            json.dumps(
                {
                    "success": False,
                    "message": "You are not authorized to perform this action",
                }
            )
        )

    else:
        if STATE == LockerState.AVAILABLE:
            if method == "GET":
                if path == "/":
                    writer.write("HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n")
                    writer.write(
                        json.dumps(
                            {
                                "success": True,
                                "message": "Locker state fetched sucessfully",
                                "data": {"state": STATE},
                            }
                        )
                    )
                else:
                    writer.write("HTTP/1.0 404 OK\r\nContent-type: text/json\r\n\r\n")
                    writer.write(
                        json.dumps({"success": False, "message": "Route not found"})
                    )

            elif method == "POST":
                if path == "/accquire":
                    if LOCK_STATE == LockState.CLOSE:
                        writer.write(
                            "HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n"
                        )
                        writer.write(
                            json.dumps(
                                {
                                    "success": True,
                                    "message": "Opened accquired successfully",
                                }
                            )
                        )
                        STATE = LockerState.IN_USE
                        LOCK_STATE = LockState.OPEN
                    else:
                        writer.write(
                            "HTTP/1.0 400 OK\r\nContent-type: text/json\r\n\r\n"
                        )
                        writer.write(
                            json.dumps(
                                {"success": False, "message": "Lock is already open"}
                            )
                        )
                else:
                    writer.write("HTTP/1.0 404 OK\r\nContent-type: text/json\r\n\r\n")
                    writer.write(
                        json.dumps({"success": False, "message": "Route not found"})
                    )

            else:
                writer.write("HTTP/1.0 405 OK\r\nContent-type: text/json\r\n\r\n")
                writer.write(
                    json.dumps({"success": False, "message": "Method not all"})
                )

        elif STATE == LockerState.IN_USE:
            if method == "GET":
                if path == "/":
                    writer.write("HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n")
                    writer.write(
                        json.dumps(
                            {
                                "success": True,
                                "message": "Locker state fetched sucessfully",
                                "data": {"state": STATE},
                            }
                        )
                    )
                else:
                    writer.write("HTTP/1.0 404 OK\r\nContent-type: text/json\r\n\r\n")
                    writer.write(
                        json.dumps({"success": False, "message": "Route not found"})
                    )

            elif method == "POST":
                if path == "/open":
                    if LOCK_STATE == LockState.CLOSE:
                        writer.write(
                            "HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n"
                        )
                        writer.write(
                            json.dumps(
                                {"success": True, "message": "Opened lock successfully"}
                            )
                        )
                        LOCK_STATE = LockState.OPEN
                    else:
                        writer.write(
                            "HTTP/1.0 400 OK\r\nContent-type: text/json\r\n\r\n"
                        )
                        writer.write(
                            json.dumps(
                                {"success": False, "message": "Lock is already open"}
                            )
                        )

                elif path == "/close":
                    if LOCK_STATE == LockState.OPEN:
                        writer.write(
                            "HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n"
                        )
                        writer.write(
                            json.dumps(
                                {"success": True, "message": "Closed lock successfully"}
                            )
                        )
                        LOCK_STATE = LockState.CLOSE
                    else:
                        writer.write(
                            "HTTP/1.0 400 OK\r\nContent-type: text/json\r\n\r\n"
                        )
                        writer.write(
                            json.dumps(
                                {"success": False, "message": "Lock is already closed"}
                            )
                        )

                elif path == "/release":
                    writer.write("HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n")
                    writer.write(
                        json.dumps(
                            {"success": True, "message": "Closed released successfully"}
                        )
                    )
                    LOCK_STATE = LockState.CLOSE
                    STATE = LockerState.AVAILABLE

                else:
                    writer.write("HTTP/1.0 404 OK\r\nContent-type: text/json\r\n\r\n")
                    writer.write(
                        json.dumps({"success": False, "message": "Route not found"})
                    )

            else:
                writer.write("HTTP/1.0 405 OK\r\nContent-type: text/json\r\n\r\n")
                writer.write(
                    json.dumps({"success": False, "message": "Method not all"})
                )
        else:
            writer.write("HTTP/1.0 400 OK\r\nContent-type: text/json\r\n\r\n")
            writer.write(
                json.dumps(
                    {
                        "success": False,
                        "message": f"Cannot perform any action in the {STATE}",
                    }
                )
            )

    await writer.drain()
    await writer.wait_closed()


async def locker():
    previous_data = ""
    global MACHINE_ID, STATE, LOCKER_ID, LOCK_STATE

    while True:
        if STATE == LockerState.ONLINE:
            try:
                data = api.init_locker(MACHINE_ID, IP_ADDR, STATE)

                STATE = data["state"]
                LOCKER_ID = data["id"]

            except Exception as e:
                print("Error occured: ", e)

        if STATE == LockerState.AVAILABLE:
            LED.on()

        if STATE == LockerState.IN_USE:
            LED.off()
            data = read_rfid()
            if data and data != previous_data:
                try:
                    is_valid = api.verify_key(LOCKER_ID, data)
                    if is_valid:
                        LOCK_STATE = (
                            LockState.OPEN
                            if LOCK_STATE == LockState.CLOSE
                            else LockState.CLOSE
                        )

                except Exception as e:
                    print("Error occured: ", e)

            previous_data = data

        await asyncio.sleep(0)


async def lock():
    global LOCK_STATE

    while True:
        if LOCK_STATE == LockState.OPEN:
            RELAY.off()

        if LOCK_STATE == LockState.CLOSE:
            RELAY.on()

        await asyncio.sleep(0)


async def main():
    global IP_ADDR
    IP_ADDR = await connect()

    TIMER.init(period=1000 * 60 * 30, callback=sync_state)

    server = asyncio.start_server(handle_client, IP_ADDR, 80)
    asyncio.create_task(server)
    asyncio.create_task(locker())
    asyncio.create_task(lock())


loop = asyncio.get_event_loop()
loop.create_task(main())

try:
    LED.off()
    loop.run_forever()

except Exception as e:
    print("Error occured: ", e)

except KeyboardInterrupt:
    pass

finally:
    loop.close()
