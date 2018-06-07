import time

from game import Game
import inputs
import view


def main():
    game = Game(8)
    game.player_relative_move(65)
    game.player_absolute_move(355)
    game.create_walls(0.7)

    inputs.init()

    game_loop(game)

    inputs.close()


def game_loop(game):
    game.start()

    while True:
        # Update inputs
        movement = inputs.update()
        # Update game logic
        game.player_relative_move(movement*360/game.nb_scenes)
        # Update game state
        if inputs.quit_input:
            game.stop()
            break
        # Refresh view
        view.refresh(game)


        time.sleep(0.01)



if __name__ == '__main__':
    main()
