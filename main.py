from game import Game


def main():
    game = Game(3)
    print (game.scenes)
    print (game.collide())
    game.scenes[0][0] = True
    print (game.scenes)
    print (game.collide())
    game.player_relative_move(65)
    print (game.player_position)
    game.player_absolute_move(355)
    print (game.player_position)
    game.create_walls(0.7)
    print(game.scenes)


if __name__ == '__main__':
    main()
