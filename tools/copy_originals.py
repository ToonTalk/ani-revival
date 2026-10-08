"""Copy the recovered MIT AI Lab files into original/, byte for byte, and write a manifest.

Usage: python -I tools/copy_originals.py <archive-root> <project-root>

The archive (Documents\\MIT-AI-Lab) is never modified. Personal material (email,
mailing lists, letters, resumes, plans) is left out; the manifest lists what was
skipped and why.
"""
import fnmatch
import hashlib
import json
import os
import shutil
import sys

ARCHIVE, PROJECT = sys.argv[1], sys.argv[2]
DEST = os.path.join(PROJECT, "original")

# Tape folders and the latest date found in each (from email headers and notes).
TAPE_DATES = {
    "7005044": "Dec 1975",
    "3100153": "late 1976",
    "7005017": "Feb 1979",
    "9004336": "Aug 1979",
    "7008432": "Jun 1979",
    "701431": "Apr 1980",
    "701501": "Aug 1980",
    "7008321": "Nov 1980",
    "7006808": "undated",
    "7006812": "undated",
    "7006813": "undated",
    "7006885": "undated",
}

SKIP = [
    ("*.rmail", "email"),
    ("*.mail", "email"),
    ("}msgs}.*", "messages"),
    ("aesthe.tics", "mailing-list email"),
    ("*.letter", "letters"),
    ("let.tony", "letter"),
    ("_write.letter", "letter"),
    ("letter.macros", "letter formatting"),
    ("resume.*", "resume"),
    ("ken.plan", "personal travel plan"),
    ("mylife.*", "personal"),
    ("talks.*", "list of talks"),
    ("desktop.ini", "Windows metadata"),
]
SKIP_PATHS = {
    ("9004336", "}^rsv.3"): "copy of the personal travel plan",
}


def its_name(fname):
    """Best guess at the ITS name: 'cindy.46' -> 'CINDY 46'."""
    if "." not in fname:
        return fname.upper()
    fn1, fn2 = fname.split(".", 1)
    return f"{fn1.upper()} {fn2.upper()}"


def main():
    manifest, skipped = [], []
    for tape in sorted(os.listdir(ARCHIVE)):
        tdir = os.path.join(ARCHIVE, tape)
        if not os.path.isdir(tdir) or tape.startswith("."):
            continue
        for dirpath, dirnames, files in os.walk(tdir):
            rel_dir = os.path.relpath(dirpath, tdir)
            if "email" in rel_dir.split(os.sep):
                for f in files:
                    skipped.append({"tape": tape, "file": os.path.join(rel_dir, f), "reason": "email"})
                continue
            for f in sorted(files):
                reason = next((r for pat, r in SKIP if fnmatch.fnmatch(f, pat)), None)
                reason = reason or SKIP_PATHS.get((tape, f))
                if reason:
                    skipped.append({"tape": tape, "file": f, "reason": reason})
                    continue
                src = os.path.join(dirpath, f)
                dst = os.path.join(DEST, tape, f)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(src, dst)
                data = open(src, "rb").read()
                manifest.append({
                    "path": f"original/{tape}/{f}",
                    "tape": tape,
                    "tape_date": TAPE_DATES.get(tape, "?"),
                    "its_dir": rel_dir.split(os.sep)[0].upper() if rel_dir != "." else "",
                    "its_name": its_name(f),
                    "bytes": len(data),
                    "sha256": hashlib.sha256(data).hexdigest(),
                })
    os.makedirs(DEST, exist_ok=True)
    with open(os.path.join(DEST, "MANIFEST.json"), "w", newline="\n") as out:
        json.dump({"files": manifest, "skipped": skipped}, out, indent=1)
    print(f"copied {len(manifest)} files, skipped {len(skipped)}")
    for s in skipped:
        print(f"  skipped {s['tape']}/{s['file']}: {s['reason']}")


if __name__ == "__main__":
    main()
