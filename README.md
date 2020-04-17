# A Maze In Chair V2

## WS protocol

    # Your network uniq id
    id <id>

    # New client connected
    new_client <id>

    # Client disconnection
    client_closed <id>

## Arduino serial reading

Before any reading/writing, please add the user that will execute the python to the dialout group
If not done, you'll have permission denied on the serial access.
    
    sudo usermod -a -G dialout <unername>
