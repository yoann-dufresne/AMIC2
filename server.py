import time
import zmq
from threading import Thread


class Server:
	def __init__ (self):
		# Serrver configuration
		self.context = zmq.Context()
		self.socket = self.context.socket(zmq.REP)
		self.socket.bind("tcp://*:5555")
		# Loop init
		self.is_alive = True

		# Create empty dictonnary for clients
		self.clients = {}
		self.next_id = 0

	def start (self):
		# Start listening for clients in a thread
		self.process = Thread(target=self.register_client)
		self.process.start()

	def register_client(self):
		while self.is_alive:
			try:
				#  Wait for next request from client
				message = self.socket.recv(zmq.NOBLOCK)
				message = message.decode('utf-8')

				client_id = -1
				if message == "connect":
					# Send id to the client
					self.socket.send("{}".format(self.next_id).encode('utf-8'))
					client_id = self.next_id
					# Update the client next id
					self.next_id += 1
				elif message.startswith("ping"):
					print(message)
					client_id = int(message.strip().split(' ')[1])
					self.socket.send(b"pong")
				else:
					print('Unrecognized message: {}'.format(message))
					self.socket.send(b'unrecognized message')

				# Save last connection date of the client
				if client_id != -1:
					self.clients[client_id] = time.time()
			except zmq.ZMQError:
				time.sleep(0.1)

	def stop (self):
		self.is_alive = False
		self.context.destroy()
		self.process.join()
		print ("Exited")


serv = Server()
serv.start()

time.sleep(10)
serv.stop()

