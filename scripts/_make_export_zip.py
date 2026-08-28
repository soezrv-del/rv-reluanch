#!/usr/bin/env python3
import json
import sys
import zipfile
from pathlib import Path

exports = Path(sys.argv[1])
zip_path = Path(sys.argv[2])
files = json.loads(sys.argv[3])
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for f in files:
        p = exports / f
        if p.exists():
            z.write(p, f)
print("zipped", zip_path, "files", len(files))
