#!/bin/bash

# Source https://github.com/stripe/stripe-react-native/blob/master/scripts/run-maestro-tests
set -uo pipefail

trap 'exit 130' INT TERM

PLATFORM=${1:-}
APPID="com.pagerviewexample"
MAX_ATTEMPTS=${MAX_ATTEMPTS:-3}
RETRY_DELAYS=(5 15)
DEVICE_ID=${MAESTRO_DEVICE:-${DEVICE_ID:-}}
SHARD_COUNT=${SHARD_COUNT:-}
SHARD_INDEX=${SHARD_INDEX:-}

# Validate passed platform
case $PLATFORM in
  ios | android )
    ;;

  *)
    echo "Error! You must pass either 'android' or 'ios'"
    echo ""
    exit 1
    ;;
esac

if { [ -n "$SHARD_COUNT" ] || [ -n "$SHARD_INDEX" ]; } && { [ -z "$SHARD_COUNT" ] || [ -z "$SHARD_INDEX" ]; }; then
  echo "Error! Both SHARD_COUNT and SHARD_INDEX must be set to enable sharding."
  exit 1
fi

if [ -n "$SHARD_COUNT" ]; then
  if ! [[ $SHARD_COUNT =~ ^[0-9]+$ ]] || ! [[ $SHARD_INDEX =~ ^[0-9]+$ ]]; then
    echo "Error! SHARD_COUNT and SHARD_INDEX must be integers."
    exit 1
  fi

  if [ "$SHARD_COUNT" -le 0 ] || [ "$SHARD_INDEX" -lt 0 ] || [ "$SHARD_INDEX" -ge "$SHARD_COUNT" ]; then
    echo "Error! SHARD_INDEX must satisfy 0 <= SHARD_INDEX < SHARD_COUNT. Got SHARD_INDEX=$SHARD_INDEX, SHARD_COUNT=$SHARD_COUNT"
    exit 1
  fi

  echo "Sharding enabled: SHARD_INDEX=$SHARD_INDEX SHARD_COUNT=$SHARD_COUNT"
fi

shopt -s nullglob
allTestFiles=(
  .maestro/tests/*.yaml
  .maestro/"$PLATFORM"-only/*.yaml
)

if [ ${#allTestFiles[@]} -eq 0 ]; then
  echo "Error! No Maestro test files found for platform '$PLATFORM'."
  exit 1
fi

mkdir -p .maestro/debug-output

failedTests=()
idx=0

runTest() {
  local file=$1
  local attempt=$2
  local testName
  local artifactDir
  local maestroCommand

  testName=$(basename "${file%.*}")
  if [ "$attempt" -eq 1 ]; then
    artifactDir=".maestro/debug-output/$testName"
  else
    artifactDir=".maestro/debug-output/$testName-retry-$((attempt - 1))"
  fi

  maestroCommand=(
    maestro test
    -p "$PLATFORM"
    "$file"
    -e APP_ID="$APPID"
    --debug-output "$artifactDir"
    --flatten-debug-output
  )

  if [ -n "$DEVICE_ID" ]; then
    maestroCommand+=(--device "$DEVICE_ID")
  fi

  "${maestroCommand[@]}"
}

# Run every test once before retrying. This prevents one flaky test from
# delaying the first attempt of every test after it.
for file in "${allTestFiles[@]}"; do
  if [ -n "$SHARD_COUNT" ]; then
    mod=$((idx % SHARD_COUNT))
    if [ "$mod" -ne "$SHARD_INDEX" ]; then
      idx=$((idx + 1))
      continue
    fi
  fi

  if ! runTest "$file" 1; then
    failedTests+=("$file")
  fi

  idx=$((idx + 1))
done

for ((attempt = 2; attempt <= MAX_ATTEMPTS && ${#failedTests[@]} > 0; attempt++)); do
  delay=${RETRY_DELAYS[$((attempt - 2))]:-120}
  echo "${#failedTests[@]} test(s) failed. Retrying them in ${delay}s..."
  sleep "$delay"

  retryTests=("${failedTests[@]}")
  failedTests=()

  for file in "${retryTests[@]}"; do
    if ! runTest "$file" "$attempt"; then
      failedTests+=("$file")
    fi
  done
done

if [ ${#failedTests[@]} -eq 0 ]; then
    exit 0
else
    echo "These tests failed:"
    printf '%s\n' "${failedTests[@]}"
    exit 1
fi
