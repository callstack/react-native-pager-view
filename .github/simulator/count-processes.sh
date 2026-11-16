#!/usr/bin/env bash
# Usage: count-processes.sh <udid>
#
# Prints how many processes run under a booted simulator's launchd_sim, to
# check that slim.sh took effect.
set -euo pipefail

udid=$1
root=$(pgrep -f "launchd_sim .*$udid" | head -n 1)

ps -axo pid=,ppid= | awk -v root="$root" '
  { parent[$1] = $2 }
  END {
    for (pid in parent) {
      for (p = pid; p != "" && p != 1 && p != 0; p = parent[p]) {
        if (p == root) { count++; break }
      }
    }
    print count + 0
  }
'
