"""Run a Django management command with the active Aluminum service environment."""

import os
import subprocess
import sys


SERVICE = "aluminum.service"
PROJECT = "/www/wwwroot/Aluminum/backend"
PYTHON = "/www/server/pyporject_evn/aluminum_venv/bin/python"


def main():
    pid_text = subprocess.check_output(
        ["systemctl", "show", SERVICE, "--property=MainPID", "--value"]
    ).decode("utf-8").strip()
    if not pid_text.isdigit() or pid_text == "0":
        raise SystemExit(f"Could not identify the active process for {SERVICE}")

    process_env = {}
    with open(f"/proc/{pid_text}/environ", "rb") as source:
        for entry in source.read().split(b"\0"):
            if b"=" not in entry:
                continue
            key, value = entry.split(b"=", 1)
            process_env[key.decode()] = value.decode(errors="surrogateescape")

    env = os.environ.copy()
    env.update(process_env)
    command = [PYTHON, "manage.py", *sys.argv[1:]]
    return subprocess.call(command, cwd=PROJECT, env=env)


if __name__ == "__main__":
    raise SystemExit(main())
