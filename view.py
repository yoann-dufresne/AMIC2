from math import floor

def refresh(game):
	next_walls = ['-' if val else ' ' for val in game.scenes[0]]
	scenes = [' '] * game.nb_scenes
	scenes[floor(game.player_position)] = "X"

	print("\n{}\n{}".format(str(next_walls), str(scenes)))
