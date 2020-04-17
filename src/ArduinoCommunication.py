from threading import Thread
from serial.tools import list_ports
import sys
import serial
import time


class ArduinoManager(Thread):

    def __init__(self, verbose=False):
        Thread.__init__(self)
        # port.device = address
        # port.serial_number = unique id
        # port.name = short name (end of address)
        self.ports = {}
        self.coms = {}
        self.verbose = verbose
        self.terminated = False
        self.start()

    def stop(self):
        self.terminated = True

    def run(self):
        while not self.terminated:
            if self.verbose:
                devices = set(self.ports.keys())
            self.discover_arduinos()

            for id, com in self.coms.items():
                if id not in self.ports.keys():
                    com.stop()
                    com.join()
            
            if self.verbose:
                current_devices = set(self.ports.keys())
                connected_devices = current_devices - devices
                disconected_devices = devices - current_devices

                if len(connected_devices) > 0:
                    print("New arduino(s) added")
                    print(self)
                elif len(disconected_devices) > 0:
                    print("Disconnection of aduino(s)")
                    print(self)
            time.sleep(3)

        for com in self.coms.values():
            com.stop()
            com.join()

    def open_serial(self, device_serial_number=None, packet_size=1):
        # Try to infer serial number
        if device_serial_number == None:
            if len(self.ports) == 1:
                device_serial_number = list(self.ports.keys())[0]
            elif len(self.ports) == 0:
                print("No Arduino connected, impossible to open serial communication", file=sys.stderr)
                return
            else:
                print("Multiple Arduino connected. Please choose one.", file=sys.stderr)
                return

        # Try to open connection
        if device_serial_number not in self.ports:
            print("Wrong serial number. The arduino not seems to be connected.", file=sys.stderr)
        com = ArduinoCommunicator(self.ports[device_serial_number], packet_size=packet_size)
        self.coms[device_serial_number] = com
        return com

    def discover_arduinos(self):
        self.ports = {}
        for port in list_ports.comports():
            if "Arduino" in port.manufacturer:
                self.ports[port.serial_number] = port

    def __repr__(self):
        s = "Arduino connected:\n"
        for port in self.ports.values():
            s += f"- {port.name}: {port.device} ({port.serial_number})"

        return s


class ArduinoCommunicator(Thread):

    def __init__(self, port, packet_size=1):
        Thread.__init__(self)
        self.terminated = False
        self.port = port
        self.serial = None
        self.packet_size = packet_size
        self.offset = 0

        self.listeners = []
        self.start()

    def offset_stream(self, offset):
        """ Ask to drop some bytes to realign communication"""
        self.offset = offset

    def register_listener(self, listener):
        self.listeners.append(listener)

    def unregister_listener(self, listener):
        self.listener.remove(listener)

    def run(self):
        serial_pipe = serial.Serial(self.port.device, 115200)
        # serial_pipe.open()
        serial_pipe.reset_input_buffer()
        serial_pipe.reset_output_buffer()

        while not self.terminated:
            try:
                # remove bytes is asked for offset
                if self.offset > 0:
                    serial_pipe.read(size=self.offset)
                    self.offset = 0

                # Read byte packet
                data = serial_pipe.read(size=self.packet_size)
                for listener in self.listeners:
                    listener(data)
            except serial.SerialException:
                print(f"port {self.port.device} on device {self.port.serial_number} seems closed.", file=sys.stderr)
                print("Halting reading thread.", file=sys.stderr)
                self.terminated = True

        serial_pipe.close()

    def stop(self):
        self.terminated = True


# TODO: Refactor from here

manager = ArduinoManager(verbose=True)
print('manager constructed')

while len(manager.ports) != 1:
    time.sleep(1)

com = manager.open_serial(packet_size=16)
print("Com serial pipe opened")


import struct
def read_floats(bytes):
    # read the check int to align the flux
    db = int.from_bytes(bytes[:4], byteorder="little")
    if db != 0xDEADBEEF:
        com.offset_stream(1)
        return

    x = struct.unpack("f", bytes[4:8])[0]
    y = struct.unpack("f", bytes[8:12])[0]
    z = struct.unpack("f", bytes[12:16])[0]
    print("\r                                                                       ", end='')
    print(f"\r{round(x)}\t{round(y)}\t{round(z)}", end='')

com.register_listener(read_floats)

while not com.terminated:
    time.sleep(1)

print("Arduino disconnected")

manager.stop()
manager.join()

