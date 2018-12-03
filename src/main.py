import time

from game import Game
import inputs
from view import View

from server import Server


def main():
    game = Game(8)
    view = View(game, term=True, net=True)

    # Create the server
    network = Server()
    time.sleep(3)
    # listen the inputs
    inputs.init()

    # Main game loop
    game_loop(game, view)

    # Close everything
    inputs.close()
    network.stop()


def game_loop(game, view):
    game.start()

    while game.stop_time == 0:
        # Update inputs
        movement = inputs.update()
        # Update game logic
        game.player_relative_move(movement*360/game.nb_scenes)
        # Update game state
        if inputs.quit_input:
            break
        # Refresh view
        view.refresh()

        time.sleep(0.01)

    print("Game loop over")
    game.stop()



if __name__ == '__main__':
    main()
