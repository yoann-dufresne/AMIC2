
class PositionCarrier:

    def __init__(self):
        self.position = 0.0


    def absolute_move(self, deg):
        self.position = deg % 360

    def relative_move(self, deg):
        self.position += deg
        self.position %= 360
