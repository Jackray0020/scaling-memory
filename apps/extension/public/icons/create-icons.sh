#!/bin/bash

# Create a simple 1x1 purple pixel PNG and scale it
# This is a base64 encoded 16x16 purple PNG
echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKklEQVR4AWP4//8/AzbMQCZgGDUAAzZM5mYGahk4agAGbJjMzQzUMhAAN/0GAzXhGP0AAAAASUVORK5CYII=" | base64 -d > icon16.png

# For simplicity, just copy the same icon for other sizes
# In production, you'd create proper scaled versions
cp icon16.png icon32.png
cp icon16.png icon48.png  
cp icon16.png icon128.png

echo "Icon placeholders created!"
