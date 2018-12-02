import time
from threading import Thread

import http.server
import socketserver
import os


class Server:
    def __init__(self, web_port=80):
        self.start_web_server(web_port)
        print("coucou")


    def start_web_server(self, web_port):
        # Start a simple HTTP server to serve the client web interface
        web_dir = os.path.join(os.path.dirname(__file__), 'www')
        os.chdir(web_dir)

        Handler = http.server.SimpleHTTPRequestHandler
        httpd = socketserver.TCPServer(("", web_port), Handler)
        print("serving at port", web_port)
        httpd.serve_forever()
