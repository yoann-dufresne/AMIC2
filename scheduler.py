import time
import threading

class Scheduler(threading.Thread):

	def __init__(self, game):
		threading.Thread.__init__(self)
		self.next_event = None
		self.stopped = False
		self.game = game

	def run(self):
		while not self.stopped:
			time.sleep(0.01)

	def stop(self):
		self.stopped = True
