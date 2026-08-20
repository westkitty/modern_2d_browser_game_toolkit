#!/usr/bin/env python3
"""Serve the toolkit showcase on loopback with cross-origin isolation headers."""
from __future__ import annotations

import argparse
import functools
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ISOLATION_HEADERS = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Resource-Policy": "same-origin",
}


class ShowcaseRequestHandler(SimpleHTTPRequestHandler):
    """HTTP handler that always emits isolation headers for SharedArrayBuffer demos."""

    def end_headers(self) -> None:
        for name, value in ISOLATION_HEADERS.items():
            self.send_header(name, value)
        super().end_headers()

    def log_message(self, format: str, *args) -> None:  # noqa: A002
        sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))


def make_handler(directory: Path):
    return functools.partial(ShowcaseRequestHandler, directory=str(directory))


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve the Modern 2D Browser Game Toolkit showcase on loopback."
    )
    parser.add_argument("--port", type=int, default=8000, help="TCP port (default: 8000)")
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Bind address. Defaults to loopback. Do not use 0.0.0.0 unless you intend LAN exposure.",
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=ROOT,
        help="Directory to serve (default: repository root)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.port <= 0 or args.port > 65535:
        print("ERROR: --port must be in 1..65535", file=sys.stderr)
        return 2
    root = args.root.resolve()
    if not root.is_dir():
        print(f"ERROR: root is not a directory: {root}", file=sys.stderr)
        return 2

    server = ThreadingHTTPServer((args.host, args.port), make_handler(root))
    launcher = f"http://{args.host}:{args.port}/showcase/"
    print(f"Serving {root}")
    print(f"Launcher: {launcher}")
    print("Isolation headers: COOP=same-origin COEP=require-corp CORP=same-origin")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
