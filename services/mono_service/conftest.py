"""Put the service root on sys.path so tests can import `src.*` absolutely.

The `src` tree has no __init__.py files, so it resolves as a namespace package
— which works only if this directory is importable.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
