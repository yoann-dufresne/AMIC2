#!/usr/bin/env python3

import time

from server import Server
from gamemanager import GameManager

import signal


def main():
    # Create the servers
    network = Server(web_port=8080)
    # Properly close the servers on SIGINT
    def signal_handler(sig, frame):
        print()
        network.stop()
    signal.signal(signal.SIGINT, signal_handler)

    # Wait for initialization to complete
    time.sleep(1)
    gm = GameManager(network)

    while (not network.stopped):
        time.sleep(0.2)
    gm.close()



if __name__ == '__main__':
    main()
