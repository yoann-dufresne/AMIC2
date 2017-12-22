import zmq
import time
from threading import Thread



class Client:
	def __init__ (self, ip='127.0.0.1'):
		self.context = zmq.Context()
		self.socket = self.context.socket(zmq.REQ)
		self.serv_addr = "tcp://{}:5555".format(ip)
		self.socket.connect(self.serv_addr)

		self.socket.send(b"connect")
		message = int(self.socket.recv().decode('utf-8'))
		self.is_connected = True
		self.idx = message


	def start (self):
		self.ping_thread = Thread(target=self.ping)
		self.ping_thread.start()


	def ping (self):
		# Send ping request each 5 seconds
		while self.is_connected:
			time.sleep(5)
			# Send ping request
			self.socket.send('ping {}'.format(self.idx).encode('utf-8'))
			# Wait answer for half a second
			time.sleep(0.5)
			try:
				# Read the server answer
				msg = self.socket.recv(zmq.NOBLOCK).decode('utf-8')
				if msg != 'pong':
					print("Server answer \"{}\" instead of pong".format(msg))
					self.is_connected = False
			except zmq.ZMQError:
				print("Server is not answering to ping request")
				self.is_connected = False
	

	def stop (self):
		self.is_connected = False
		self.ping_thread.join()
		print("joined")
		self.context.destroy()
		print("destroyed")


if __name__ == "__main__":
	client = Client()
	client.start()

	while client.is_connected:
		time.sleep(1)
	client.stop()
    