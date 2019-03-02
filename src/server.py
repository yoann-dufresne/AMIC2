import time
import threading

import http.server
import socketserver
import os

import asyncio
import websockets


class Server:
    def __init__(self, web_port=80):
        self.web_server = WebServer(80)
        self.web_server.start()
        self.stopped = False

    def stop(self):
        self.web_server.stop()
        self.web_server.join()
        self.stopped = True


class WebSocketServer(threading.Thread):
    def __init__(self):
        self.stopped = False

    def run(self):
        start_server = websockets.serve(self.request, 'localhost', 3030)

    def stop(self):
        self.stopped = True


class WebServer(threading.Thread):

    def __init__(self, port=80):
        threading.Thread.__init__(self)
        self.port = 80
        self.stopped = False

    def run(self):
        # Start a simple HTTP server to serve the client web interface
        web_dir = os.path.join(os.path.dirname(__file__), 'www')
        os.chdir(web_dir)

        Handler = http.server.SimpleHTTPRequestHandler
        self.httpd = socketserver.TCPServer(("", self.port), Handler)
        print("serving at port", self.port)
        self.httpd.serve_forever()

    def stop(self):
        self.httpd.shutdown()
        self.stopped = True
