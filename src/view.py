from math import floor


class View:
	def __init__(self, game, term=True, net=False):
		self.game = game
		self.terminal = term

	def refresh(self):
		if self.terminal:
			self.refresh_term()

	def refresh_term(self):
		next_walls = ['-' if val else ' ' for val in self.game.scenes]
		scenes = [' '] * self.game.nb_scenes
		scenes[floor(self.game.player_position)] = "X"

		print("\n{}\n{}".format(str(next_walls), str(scenes)))
