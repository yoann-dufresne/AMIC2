import time
import threading

import http.server
import socketserver
import os

import asyncio
import websockets
from websockets.exceptions import ConnectionClosed
import datetime
import random


class Server:
    def __init__(self, web_port=80):
        # Webserver
        self.web_server = WebServer(web_port)
        self.web_server.start()

        # Websocket server
        self.socket_server = WebSocketServer()
        self.socket_server.start()

        self.stopped = False


    def stop(self):
        # Stop the webserver
        self.web_server.stop()
        self.web_server.join()
        # Stop the server socket
        self.socket_server.stop()
        self.socket_server.join()

        self.stopped = True


class WebSocketServer(threading.Thread):
    def __init__(self, port=6502, connection_rate=0.001):
        threading.Thread.__init__(self)

        self.port = port
        self.stopped = False
        self.connection_rate = connection_rate

        self.next_client_id = 1
        self.client_mailbox = {}


    def run(self):
        # Create a local eventloop
        asyncio.set_event_loop(asyncio.new_event_loop())
        self.event_loop = asyncio.get_event_loop()

        # Set_up the stop condition
        self.stop_condition = asyncio.Future()

        # Realy start the server
        self.event_loop.run_until_complete(self.ws_server())


    async def ws_server(self):
        async with websockets.serve(self.request, 'localhost', self.port):
            print("websocket at port", self.port)
            await self.stop_condition

    async def ws_server_stop(self):
        self.stop_condition.set_result(42)


    def stop(self):
        self.stopped = True
        asyncio.run_coroutine_threadsafe(self.ws_server_stop(), self.event_loop)
        print("Websocket server stopped")


    async def request(self, websocket, path):
        client_id = self.next_client_id
        self.client_mailbox[client_id] = [f"id {client_id}"]
        self.next_client_id += 1

        try:
            loops = 0
            s3_loops = round(3 / self.connection_rate)
            while not self.stopped:
                # ping all the 3s
                if loops >= s3_loops:
                    # print(f"ping {client_id}")
                    random_val = str(random.randint(0, 10000))
                    await websocket.ping(random_val)
                    loops = 0
                loops += 1

                # Send all the awaiting messages
                while len(self.client_mailbox[client_id]) > 0:
                    msg = self.client_mailbox[client_id].pop(0)
                    await websocket.send(msg)
                # Wait for a small amout of time
                await asyncio.sleep(self.connection_rate)

        except ConnectionClosed as cc:
            print(f"Disconnection from client {client_id}")

        del self.client_mailbox[client_id]



class WebServer(threading.Thread):

    def __init__(self, port=80):
        threading.Thread.__init__(self)
        self.port = port
        self.stopped = False


    def run(self):
        # Start a simple HTTP server to serve the client web interface
        web_dir = os.path.join(os.path.dirname(__file__), 'www')
        os.chdir(web_dir)

        Handler = http.server.SimpleHTTPRequestHandler
        self.httpd = socketserver.TCPServer(("", self.port), Handler)
        print("webserver at port", self.port)
        self.httpd.serve_forever()


    def stop(self):
        self.httpd.shutdown()
        self.stopped = True
        print("HTTP server stopped")
