import zmq


def main():
	# init the server
	context = zmq.Context()
	socket = context.socket(zmq.SUB)
	socket.connect("tcp://localhost:5556")
	socket.setsockopt_string(zmq.SUBSCRIBE, "")

	while True:
		print(socket.recv_string())


if __name__ == "__main__":
	main()
