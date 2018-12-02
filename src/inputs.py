from pynput import keyboard
import threading


mode_debug = True
quit_input = False
move = 0
thread = None


def on_press(key):
    global move
    
    try:
        char = key.char
        if char == 'l':
            move -= 1
        elif char == 'm':
            move += 1
    except AttributeError:
        if key == keyboard.Key.left:
            move -= 1
        elif key == keyboard.Key.right:
            move += 1


def on_release(key):
    global quit_input
    try:
        char = key.char
        if char == 'q':
            quit_input = True
            return False
    except AttributeError:
        pass


def init():
    global thread
    thread = keyboard.Listener(on_press=on_press, on_release=on_release)
    thread.start()


def close():
    global thread
    thread.stop()
    thread.join()


def update():
    global move
    val = move
    move = 0
    return val

