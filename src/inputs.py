from threading import Thread
import time
import struct

from ArduinoCommunication import ArduinoManager


class PositionCarrier:

    def __init__(self):
        self.position = 0.0
        self.offset = 180.0


    def absolute_move(self, deg):
        self.position = deg % 360

    def relative_move(self, deg):
        self.position += deg
        self.position %= 360

    def get_degree_position(self):
        return (self.position + self.offset)%360

    def get_ratio_position(self):
        return self.get_degree_position() / 360.0

    def __repr__(self):
        return str(self.position)


class PositionUpdater(Thread):
    # Receptor arduino serial: 95632313334351D0A160

    def __init__(self, position, verbose=False, debug_network=None):
        Thread.__init__(self)
        self.position = position
        self.debug_network = debug_network
        self.verbose = verbose

        self.sensors_manager = ArduinoManager()
        self.rotation = None

        self.terminated = False
        self.start()

    def handle_serial(self, bytes):
        # read the check int to align the flux
        db = int.from_bytes(bytes[:4], byteorder="little")
        if db != 0xDEADBEEF:
            self.rotation.offset_stream(1)
            return

        x = struct.unpack("f", bytes[4:8])[0]
        y = struct.unpack("f", bytes[8:12])[0]
        z = struct.unpack("f", bytes[12:16])[0]

        # TODO: Update the chair position with x, y, z

        if self.debug_network is not None:
            self.debug_network.socket_server.broadcast(f"debug rotations {x} {y} {z}")

    def run(self):
        # If the thread was not cancelled
        while not self.terminated:
            # Connection
            while self.rotation is None:
                if self.terminated:
                    return
                self.rotation = self.sensors_manager.open_serial(device_serial_number="95632313334351D0A160", packet_size=16, keep_alive=True)
                time.sleep(3)
            
            self.rotation.register_listener(self.handle_serial)

            # Wait for a process to finish
            while not self.terminated or not self.rotation.terminated:
                time.sleep(1)

    def stop(self):
        self.terminated = True
        self.sensors_manager.stop()
        self.sensors_manager.join()
        print("Input manager terminated")
