import time
import threading

import http.server
import socketserver
import os


class Server:
    def __init__(self, web_port=80):
        self.web_server = WebServer(80)
        self.web_server.start()

    def stop(self):
        self.web_server.stop()
        self.web_server.join()


class WebServer(threading.Thread):

    def __init__(self, port=80):
        threading.Thread.__init__(self)
        self.port = 80

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
