import time
import threading

import http.server
import socketserver
import os

import asyncio
import websockets


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
        self.web_server.stop()
        self.web_server.join()
        self.stopped = True


class WebSocketServer(threading.Thread):
    def __init__(self, port=6502):
        threading.Thread.__init__(self)

        self.port = port
        self.stopped = False

    def run(self):
        asyncio.set_event_loop(asyncio.new_event_loop())
        start_server = websockets.serve(request, 'localhost', self.port)
        print("websocket at port", self.port)

    def stop(self):
        self.stopped = True


async def request(websocket, path):
    async for message in websocket:
        print(message)


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
