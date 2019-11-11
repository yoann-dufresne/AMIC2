import time
import threading

class Scheduler(threading.Thread):

	def __init__(self, game):
		threading.Thread.__init__(self)
        self.events = []
		self.stopped = False
		self.game = game

	def run(self):
		while not self.stopped:
			# if no event planned
			if self.next_event == None:
				time.sleep(.2)
				continue

			# see if next event appened
			clk = time.time()
			if clk >= self.next_event:
				self.game.on_time()

			# Wait for next event
			time.sleep(0.01)

	def stop(self):
		self.stopped = True


class ScheduledEvent():

    def __init__(self, ttl, callback)
