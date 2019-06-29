import time
import threading

import http.server
import socketserver
import os
import sys

import asyncio
import websockets
from websockets.exceptions import ConnectionClosed
import datetime
import random
from copy import deepcopy


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


    def get_clients(self):
        return deepcopy(self.socket_server.client_type)


class WebSocketServer(threading.Thread):
    def __init__(self, port=6502, connection_rate=0.001):
        threading.Thread.__init__(self)

        self.port = port
        self.stopped = False
        self.connection_rate = connection_rate

        self.next_client_id = 1
        self.client_mailbox = {}
        self.client_type = {}
        self.handlers = []


    def add_listener(self, handler):
        self.handlers.append(handler)


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
            print("websocket initiated at port", self.port)
            await self.stop_condition

    async def ws_server_stop(self):
        self.stop_condition.set_result(42)


    def stop(self):
        self.stopped = True
        asyncio.run_coroutine_threadsafe(self.ws_server_stop(), self.event_loop)
        print("Websocket server stopped")


    async def request(self, websocket, path):
        client_id = self.next_client_id
        self.broadcast(f"new_client {client_id}")
        print(f"New connection detected. Client {client_id} connected")

        self.client_type[client_id] = "unknown"
        self.client_mailbox[client_id] = [f"new_client {id}" for id in self.client_mailbox]
        self.client_mailbox[client_id] = [f"id {client_id}"] + self.client_mailbox[client_id]
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

                # Receive a message
                try:
                    msg = await asyncio.wait_for(websocket.recv(), timeout=0.01)

                    if msg.startswith("declare"):
                        _, idx, typ = msg.split()
                        idx = int(idx)
                        assert (idx == client_id), "Not corresponding id between the client and the declaration"
                        self.client_type[idx] = typ
                        print(f"Client {idx} declared as {typ}")
                    
                    self.broadcast(msg)

                    for handler in self.handlers:
                        handler(msg)
                except asyncio.TimeoutError:
                    pass
                # Wait for a small amout of time
                await asyncio.sleep(self.connection_rate)

        except ConnectionClosed as cc:
            print(f"Disconnection from client {client_id}")
            self.broadcast(f"client_closed {client_id}")

            # Alert localy of the deconnection
            for handler in self.handlers:
                handler(f"client_closed {client_id}")

        del self.client_mailbox[client_id]
        del self.client_type[client_id]


    def send_to(self, to, msg):
        if to in self.client_mailbox:
            self.client_mailbox[to].append(msg)
        else:
            print(f"[send_to websocket] Wrong destination {to}", file=sys.stderr)


    def broadcast(self, msg):
        for inbox in self.client_mailbox.values():
            inbox.append(msg)



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
        print("webserver initiated at port", self.port)
        self.httpd.serve_forever()


    def stop(self):
        self.httpd.shutdown()
        self.stopped = True
        print("HTTP server stopped")
