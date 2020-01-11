from serial.tools import list_ports


for portinfo in list_ports.comports():
    print(portinfo.device, portinfo.serial_number, portinfo.product)

