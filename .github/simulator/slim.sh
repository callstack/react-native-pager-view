#!/usr/bin/env bash
# Usage: slim.sh <udid>...
#
# Makes each shut-down simulator boot without the daemons listed in
# disabled-daemons.txt. launchd_sim reads its disable overrides from this
# undocumented host-side store when it starts (persisted since iOS 18.5), so
# seeding the file before the first boot needs no launchctl calls or reboot.
# The file is overwritten, so run it on fresh devices only.
set -euo pipefail

labels="$(dirname "$0")/disabled-daemons.txt"

for udid in "$@"; do
  store="/private/var/tmp/com.apple.CoreSimulator.SimDevice.$udid"
  mkdir -p -m 700 "$store"
  {
    echo '<?xml version="1.0" encoding="UTF-8"?>'
    echo '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
    echo '<plist version="1.0">'
    echo '<dict>'
    grep -v '^#' "$labels" | while read -r label; do
      printf '\t<key>%s</key>\n\t<true/>\n' "$label"
    done
    echo '</dict>'
    echo '</plist>'
  } > "$store/disabled.plist.tmp"
  plutil -lint -s "$store/disabled.plist.tmp"
  mv "$store/disabled.plist.tmp" "$store/disabled.plist"
done
