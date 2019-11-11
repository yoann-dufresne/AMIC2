import sys, time, sched, _thread

from game import Game
from inputs import PositionCarrier


class GameManager:
    def __init__(self, network):
        self.screens = []
        self.network = network
        self.current_game = None
        self.scheduler = sched.scheduler(time.time, time.sleep)
        self.network.socket_server.add_listener(self.message_handler)
        self.position = PositionCarrier()


    def start_game(self):
        if self.current_game != None:
            print("A game is already running", file=sys.stderr)
            return False

        self.current_game = Game(len(self.screens), self.position, self.scheduler)
        self.current_game.start()
        self.loop_thread = _thread.start_new_thread(self.game_loop, ())
        print("Game created")

        return True


    def game_loop(self):
        saved_events = set()

        while self.current_game.stop_time == 0:
            # Run the game
            self.scheduler.run(blocking=False)

            # Obsere new scheduled event
            for event in self.scheduler.queue:
                idx = event.kwargs["idx"]
                if idx not in saved_events:
                    print("new event", event)
                    saved_events.add(idx)

            # wait for next loop
            time.sleep(0.01)

        print("Game loop over")
        self.current_game = None


    def stop_game(self):
        if self.current_game == None:
            print("No game running", file=sys.stderr)
            return False

        self.current_game.stop()
        print("time elapsed", self.current_game.stop_time - self.current_game.start_time)

        return True


    """ Function that will be valled for each message going through websocket server
        ATTENTION : The operations done is this function must be light. Indeed, this function is called by the network thread. So, if there is a long blocking operation, the network will be down.
    """
    def message_handler(self, msg):
        split = msg.split()
        keyword = split[0]

        if keyword == "start":
            self.start_game()
        elif keyword == "stop":
            self.stop_game()

        elif keyword == "declare" and len(split) == 3:
            if split[2] == "screen":
                self.screens.append(int(split[1]))
            order = f"order {' '.join([str(x) for x in self.screens])}"
            self.network.socket_server.broadcast(order)
            self.network.socket_server.broadcast(f"position {self.position.position}")

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
                print(f"Invalide movement mode '{mode}'", file=sys.stderr)
                return

            # Send the new position to clients
            self.network.socket_server.broadcast(f"position {self.position.position}")

        elif keyword == "order":
            new_order = [int(x) for x in split[1:]]

            if set(self.screens) != set(new_order):
                print(f"Wrong screen id in order {new_order}", file=sys.stderr)
                return
            
            self.screens = new_order
