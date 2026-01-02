from Xlib import display
from datetime import datetime, timedelta
import time
import sys

d = display.Display()
root = d.screen().root

# Default: stop immediately if no argument (or you can set a default duration)
duration_hours = 0

if len(sys.argv) == 2:
    try:
        duration_hours = float(sys.argv[1])
    except ValueError:
        print("ERROR: Duration must be a number (hours). Example: python script.py 1.5")
        sys.exit(1)

stop_time = datetime.now() + timedelta(hours=duration_hours)

def get_pointer():
    pointer = root.query_pointer()
    return pointer.root_x, pointer.root_y

while True:
    x, y = get_pointer()
    root.warp_pointer(x + 1, y)
    d.sync()
    time.sleep(0.1)
    root.warp_pointer(x, y)
    d.sync()

    print("_now:  ", datetime.now().time())
    print("_stop: ", stop_time.time())

    if datetime.now() >= stop_time:
        break

    time.sleep(30)
