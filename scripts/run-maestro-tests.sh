#!/bin/bash

# Source https://github.com/stripe/stripe-react-native/blob/master/scripts/run-maestro-tests
set -uo pipefail

trap 'exit 130' INT TERM

PLATFORM=${1:-}
APPID="com.pagerviewexample"
MAX_ATTEMPTS=${MAX_ATTEMPTS:-3}
RETRY_DELAYS=(30 120)
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

for file in "${allTestFiles[@]}"; do
  if [ -n "$SHARD_COUNT" ]; then
    mod=$((idx % SHARD_COUNT))
    if [ "$mod" -ne "$SHARD_INDEX" ]; then
      idx=$((idx + 1))
      continue
    fi
  fi

  testName=$(basename "${file%.*}")
  success=false

  for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
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

    if "${maestroCommand[@]}"; then
      success=true
      break
    fi

    if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
      delay=${RETRY_DELAYS[$((attempt - 1))]:-120}
      echo "Test ${file} failed. Retrying in ${delay}s..."
      sleep "$delay"
    fi
  done

  if [ "$success" = false ]; then
    failedTests+=("$file")
  fi

  idx=$((idx + 1))
done

if [ ${#failedTests[@]} -eq 0 ]; then
    exit 0
else
    echo "These tests failed:"
    printf '%s\n' "${failedTests[@]}"
    exit 1
fi
