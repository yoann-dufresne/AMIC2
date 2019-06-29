import sys

from game import Game
from inputs import PositionCarrier


class GameManager:
    def __init__(self, network):
        self.screens = []
        self.network = network
        self.current_game = None
        self.network.socket_server.add_listener(self.message_handler)
        self.position = PositionCarrier()


    def start_game(self):
        if self.current_game != None:
            print("A game is already running", file=sys.stderr)
            return False

        self.current_game = Game(len(self.screens))

        return True


    """ Function that will be valled for each message going through websocket server
        ATTENTION : The operations done is this function must be light. Indeed, this function is called by the network thread. So, if there is a long blocking operation, the network will be down.
    """
    def message_handler(self, msg):
        split = msg.split()
        keyword = split[0]

        if keyword == "start":
            self.to_start = True
        elif keyword == "stop":
            self.stop_game()

        elif keyword == "declare" and len(split) == 3 and split[2] == "screen":
            self.screens.append(int(split[1]))
            order = f"order {' '.join([str(x) for x in self.screens])}"
            self.network.socket_server.broadcast(order)

        elif keyword == "client_closed":
            idx = int(split[1])
            if idx in self.screens:
                self.screens.remove(idx)

        elif keyword == "move":
            # Decompose the command
            _, mode, value = msg.split()
            value = float(value)

            # Apply the movement
            if mode == "relative":
                self.position.relative_move(value)
            else:
                print("Invalide movement mode", file=sys.stderr)
                return

            # Send the new position to clients
            self.network.socket_server.broadcast(f"position {self.position.position}")

        elif keyword == "order":
            print("TODO: Change the sceen order")


    def game_loop(self):
        self.current_game.start()

        while self.current_game.stop_time == 0:
            # Update inputs
            # movement = inputs.update()
            # Update game logic
            # game.player_relative_move(movement*360/game.nb_scenes)
            # Update game state
            # if inputs.quit_input:
            #     break
            # Refresh view
            # view.refresh()

            time.sleep(0.01)

        print("Game loop over")
        game.stop()


    def stop_game(self):
        if self.current_game == None:
            print("No game running", file=sys.stderr)
            return False

        return True
