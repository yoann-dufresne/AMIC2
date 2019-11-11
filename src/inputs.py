
class PositionCarrier:

    def __init__(self):
        self.position = 0.0
        self.offset = 180.0


    def absolute_move(self, deg):
        self.position = deg % 360

    def relative_move(self, deg):
        self.position += deg
        self.position %= 360

    def get_degree_position(self):
        return (self.position + self.offset)%360

    def get_ratio_position(self):
        return self.get_degree_position() / 360.0

    def __repr__(self):
        return str(self.position)
