#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/RESTART_SPRING_MAC.command"
