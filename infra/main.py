import asyncio, json, machine

import api
import config
from enums import LockState, LockerState
from utils import connect, get_machine_id


machine.Pin("LED", machine.Pin.OUT).off()
IP_ADDR = None
MACHINE_ID = get_machine_id()
STATE = LockerState.ONLINE
LOCK_STATE = LockState.CLOSE
LOCKER_ID = None


async def handle_client(reader, writer):
    global STATE, LOCK_STATE
    addr = reader.get_extra_info("peername")[0]
    req = (await reader.read(1024)).decode("utf-8")
    method = req.split()[0]
    path = req.split()[1]
    
    if addr != config.SERVER_IP:
        writer.write('HTTP/1.0 403 OK\r\nContent-type: text/json\r\n\r\n')
        writer.write(json.dumps({ "success": False, "message": "You are not authorized to perform this action" }))        
    
    else:
        if STATE == LockerState.AVAILABLE:
            if method == "GET":
                if path == "/":
                    writer.write('HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n')
                    writer.write(json.dumps({ "success": True, "message": "Locker state fetched sucessfully", "data": { "state": STATE } }))
                else:
                    writer.write('HTTP/1.0 404 OK\r\nContent-type: text/json\r\n\r\n')
                    writer.write(json.dumps({ "success": False, "message": "Route not found" }))
                
            elif method == "POST":
                if path == "/accquire":
                    if LOCK_STATE == LockState.CLOSE:
                        writer.write('HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n')
                        writer.write(json.dumps({ "success": True, "message": "Opened lock successfully" }))
                        STATE = LockerState.IN_USE
                        LOCK_STATE = LockState.OPEN
                        machine.Pin("LED", machine.Pin.OUT).on()
                    else:
                        writer.write('HTTP/1.0 400 OK\r\nContent-type: text/json\r\n\r\n')
                        writer.write(json.dumps({ "success": False, "message": "Lock is already open" }))
                else:
                    writer.write('HTTP/1.0 404 OK\r\nContent-type: text/json\r\n\r\n')
                    writer.write(json.dumps({ "success": False, "message": "Route not found" }))
            
            else:
                writer.write('HTTP/1.0 405 OK\r\nContent-type: text/json\r\n\r\n')
                writer.write(json.dumps({ "success": False, "message": "Method not all" }))
            
        elif STATE == LockerState.IN_USE:
            if method == "GET":
                if path == "/":
                    writer.write('HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n')
                    writer.write(json.dumps({ "success": True, "message": "Locker state fetched sucessfully", "data": { "state": STATE } }))
                else:
                    writer.write('HTTP/1.0 404 OK\r\nContent-type: text/json\r\n\r\n')
                    writer.write(json.dumps({ "success": False, "message": "Route not found" }))

            elif method == "POST":
                if path == "/open":
                    if LOCK_STATE == LockState.CLOSE:
                        writer.write('HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n')
                        writer.write(json.dumps({ "success": True, "message": "Opened lock successfully" }))
                        LOCK_STATE = LockState.OPEN
                    else:
                        writer.write('HTTP/1.0 400 OK\r\nContent-type: text/json\r\n\r\n')
                        writer.write(json.dumps({ "success": False, "message": "Lock is already open" }))
                    
                elif path == "/close":
                    if LOCK_STATE == LockState.OPEN:
                        writer.write('HTTP/1.0 200 OK\r\nContent-type: text/json\r\n\r\n')
                        writer.write(json.dumps({ "success": True, "message": "Closed lock successfully" }))
                        LOCK_STATE = LockState.CLOSE
                    else:
                        writer.write('HTTP/1.0 400 OK\r\nContent-type: text/json\r\n\r\n')
                        writer.write(json.dumps({ "success": False, "message": "Lock is already closed" }))
                    
                else:
                    writer.write('HTTP/1.0 404 OK\r\nContent-type: text/json\r\n\r\n')
                    writer.write(json.dumps({ "success": False, "message": "Route not found" }))
        
            else:
                writer.write('HTTP/1.0 405 OK\r\nContent-type: text/json\r\n\r\n')
                writer.write(json.dumps({ "success": False, "message": "Method not all" }))
        else:
            writer.write('HTTP/1.0 400 OK\r\nContent-type: text/json\r\n\r\n')
            writer.write(json.dumps({ "success": False, "message": f"Cannot perform any action in the {STATE}" }))

    await writer.drain()
    await writer.wait_closed()
    
async def locker():
    global MACHINE_ID, STATE, LOCKER_ID
    
    while True:
        if STATE == LockerState.ONLINE:
            data = api.init_locker(MACHINE_ID, IP_ADDR, STATE)
            
            STATE = data["state"]
            LOCKER_ID = data["id"]
            
        if STATE == LockerState.AVAILABLE:
            pass
            
        if STATE == LockerState.IN_USE:
            pass
        
        await asyncio.sleep(0)

async def main():
    global IP_ADDR
    IP_ADDR = await connect()
    
    server = asyncio.start_server(handle_client, IP_ADDR, 80)
    asyncio.create_task(server)
    asyncio.create_task(locker())
        

loop = asyncio.get_event_loop()
loop.create_task(main())

try:
    loop.run_forever()
except Exception as e:
    print('Error occured: ', e)
except KeyboardInterrupt:
    pass
