import time
import threading

class Scheduler(threading.Thread):

	def __init__(self):
		self.next_event = None
		self.stopped = False

	def run(self):
		while not self.stopped:
			time.sleep(3)

	def stop(self):
		self.stopped = True
