from math import floor
from random import shuffle

NB_CACHE = 5

class Game:
  def __init__(self, nb_scene):
    """ Define the initial state of the game.
    The player is on the middle of the scene 0 where nb_scene scenes are created.
    To allow the possibility of multiple walls on a screen NB_CACHE walls are generated by advance.
    """
    self.nb_scene = nb_scene
    self.scenes = [[False] * nb_scene] * NB_CACHE
    self.player_position = 0.5

  # ----------- Maze functions -----------

  def create_walls (self, filling_ratio):
    """ Create a new layer of wall in the scene cache.
    The parameter filling_ratio will decide the number of walls generated
    with a minimum of 1 wall and maximum of nb_scene-1.
    """
    # Get the number of walls
    nb_walls = floor(filling_ratio * self.nb_scene)
    if nb_walls >= self.nb_scene:
      nb_walls = self.nb_scene - 1
    elif nb_walls <= 0:
      nb_walls = 1

    # Generate the list
    new_walls = [True] * nb_walls + [False] * (self.nb_scene - nb_walls)
    shuffle(new_walls)

    # Add the new walls
    self.scenes += [new_walls]

  # ----------- Player functions -----------

  def player_relative_move (self, degree):
    """ Increment the player position ragarding the rotation angle applied.
    """
    self.player_position += degree * self.nb_scene / 360
    self.player_position %= self.nb_scene

  def player_absolute_move (self, degree):
    """ Place the player on the absolute position.
    0° == middle of the scene 0.
    """
    self.player_position = (0.5 + degree * self.nb_scene / 360) % self.nb_scene

  def collide (self):
    """ Test if the player is on a scene wher a wall if present.
    """
    return self.scenes[0][floor(self.player_position)]

