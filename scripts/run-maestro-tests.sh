#!/bin/bash

# Runs Maestro-compatible flows with https://github.com/devicelab-dev/maestro-runner
set -uo pipefail

if [ -t 1 ] && [ "${NO_COLOR:-}" != "1" ] && [ "${TERM:-}" != "dumb" ]; then
  BOLD=$'\033[1m'
  DIM=$'\033[2m'
  RESET=$'\033[0m'
  BLUE=$'\033[34m'
  GREEN=$'\033[32m'
  RED=$'\033[31m'
  YELLOW=$'\033[33m'
else
  BOLD=""
  DIM=""
  RESET=""
  BLUE=""
  GREEN=""
  RED=""
  YELLOW=""
fi

formatDuration() {
  local seconds=$1
  printf '%dm %02ds' "$((seconds / 60))" "$((seconds % 60))"
}

printDivider() {
  printf '%s%s────────────────────────────────────────────────────────────────%s\n' "$DIM" "$BLUE" "$RESET"
}

printError() {
  printf '%sERROR%s %s\n' "$RED$BOLD" "$RESET" "$*" >&2
}

trap 'printf "\n%sINTERRUPTED%s Maestro run stopped.\n" "$YELLOW$BOLD" "$RESET"; exit 130' INT TERM

PLATFORM=""
RETRY_FAILED_TESTS=false
APPID="com.pagerviewexample"
MAX_ATTEMPTS=${MAX_ATTEMPTS:-3}
RETRY_DELAYS=(5 15)
DEVICE_ID=${MAESTRO_DEVICE:-${DEVICE_ID:-}}
SHARD_COUNT=${SHARD_COUNT:-}
SHARD_INDEX=${SHARD_INDEX:-}

for argument in "$@"; do
  case $argument in
    ios | android )
      if [ -n "$PLATFORM" ]; then
        printError "Only one platform may be passed."
        exit 1
      fi
      PLATFORM=$argument
      ;;

    --retry )
      RETRY_FAILED_TESTS=true
      ;;

    *)
      printError "Unknown argument '$argument'."
      echo "Usage: $0 <android|ios> [--retry]"
      exit 1
      ;;
  esac
done

# Validate passed platform
case $PLATFORM in
  ios | android )
    ;;

  *)
    printError "You must pass either 'android' or 'ios'."
    echo ""
    exit 1
    ;;
esac

if ! command -v maestro-runner >/dev/null 2>&1; then
  printError "maestro-runner is not installed. See https://open.devicelab.dev/install/maestro-runner"
  exit 1
fi

if { [ -n "$SHARD_COUNT" ] || [ -n "$SHARD_INDEX" ]; } && { [ -z "$SHARD_COUNT" ] || [ -z "$SHARD_INDEX" ]; }; then
  printError "Both SHARD_COUNT and SHARD_INDEX must be set to enable sharding."
  exit 1
fi

if [ -n "$SHARD_COUNT" ]; then
  if ! [[ $SHARD_COUNT =~ ^[0-9]+$ ]] || ! [[ $SHARD_INDEX =~ ^[0-9]+$ ]]; then
    printError "SHARD_COUNT and SHARD_INDEX must be integers."
    exit 1
  fi

  if [ "$SHARD_COUNT" -le 0 ] || [ "$SHARD_INDEX" -lt 0 ] || [ "$SHARD_INDEX" -ge "$SHARD_COUNT" ]; then
    printError "SHARD_INDEX must satisfy 0 <= SHARD_INDEX < SHARD_COUNT. Got SHARD_INDEX=$SHARD_INDEX, SHARD_COUNT=$SHARD_COUNT"
    exit 1
  fi
fi

shopt -s nullglob
allTestFiles=(
  .maestro/tests/*.yaml
  .maestro/issues/*.yaml
  .maestro/"$PLATFORM"-only/*.yaml
)

if [ ${#allTestFiles[@]} -eq 0 ]; then
  printError "No Maestro test files found for platform '$PLATFORM'."
  exit 1
fi

mkdir -p .maestro/debug-output

testFiles=()
for idx in "${!allTestFiles[@]}"; do
  if [ -z "$SHARD_COUNT" ] || [ "$((idx % SHARD_COUNT))" -eq "$SHARD_INDEX" ]; then
    testFiles+=("${allTestFiles[$idx]}")
  fi
done

if [ ${#testFiles[@]} -eq 0 ]; then
  printError "Shard $SHARD_INDEX/$SHARD_COUNT has no Maestro tests to run."
  exit 1
fi

failedTests=()
totalTests=${#testFiles[@]}
runStartedAt=$(date +%s)
retryCount=0

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
    maestro-runner
    -p "$PLATFORM"
  )

  if [ -n "$DEVICE_ID" ]; then
    maestroCommand+=(--device "$DEVICE_ID")
  fi

  maestroCommand+=(
    test
    -e APP_ID="$APPID"
    --output "$artifactDir"
    --flatten
    "$file"
  )

  "${maestroCommand[@]}"
}

runAndReport() {
  local file=$1
  local attempt=$2
  local position=$3
  local testName
  local startedAt
  local finishedAt
  local duration

  testName=$(basename "${file%.*}")
  startedAt=$(date +%s)

  printf '\n%s▶%s %s[%d/%d]%s %s%s%s' \
    "$BLUE$BOLD" "$RESET" "$DIM" "$position" "$totalTests" "$RESET" "$BOLD" "$testName" "$RESET"
  if [ "$attempt" -gt 1 ]; then
    printf ' %s(retry %d/%d)%s' "$YELLOW" "$((attempt - 1))" "$((MAX_ATTEMPTS - 1))" "$RESET"
  fi
  printf '\n%s  %s%s\n' "$DIM" "$file" "$RESET"

  if runTest "$file" "$attempt"; then
    finishedAt=$(date +%s)
    duration=$((finishedAt - startedAt))
    printf '%s✓ PASS%s %s%s%s\n' "$GREEN$BOLD" "$RESET" "$DIM" "($(formatDuration "$duration"))" "$RESET"
    return 0
  fi

  finishedAt=$(date +%s)
  duration=$((finishedAt - startedAt))
  printf '%s✗ FAIL%s %s%s%s\n' "$RED$BOLD" "$RESET" "$DIM" "($(formatDuration "$duration"))" "$RESET"
  return 1
}

printDivider
printf '%sMAESTRO TEST RUN%s\n' "$BOLD" "$RESET"
printf '  Platform  %s%s%s\n' "$BLUE" "$PLATFORM" "$RESET"
printf '  Tests     %s%d%s' "$BOLD" "$totalTests" "$RESET"
if [ -n "$SHARD_COUNT" ]; then
  printf ' %s(shard %d/%d)%s' "$DIM" "$((SHARD_INDEX + 1))" "$SHARD_COUNT" "$RESET"
fi
printf '\n'
printf '  Device    %s%s%s\n' "$DIM" "${DEVICE_ID:-default}" "$RESET"
printf '  Retries   %s%s%s\n' "$DIM" "$([ "$RETRY_FAILED_TESTS" = true ] && printf '%d attempts' "$MAX_ATTEMPTS" || printf 'disabled')" "$RESET"
printf '  Artifacts %s.maestro/debug-output%s\n' "$DIM" "$RESET"
printDivider

# Run every test once before retrying. This prevents one flaky test from
# delaying the first attempt of every test after it.
for position in "${!testFiles[@]}"; do
  file=${testFiles[$position]}
  if ! runAndReport "$file" 1 "$((position + 1))"; then
    failedTests+=("$file")
  fi
done

if [ "$RETRY_FAILED_TESTS" = true ]; then
  for ((attempt = 2; attempt <= MAX_ATTEMPTS && ${#failedTests[@]} > 0; attempt++)); do
    delay=${RETRY_DELAYS[$((attempt - 2))]:-120}
    retryCount=$((retryCount + ${#failedTests[@]}))
    printf '\n%s↻ RETRY%s %d test(s) retrying in %ss (attempt %d/%d)\n' \
      "$YELLOW$BOLD" "$RESET" "${#failedTests[@]}" "$delay" "$attempt" "$MAX_ATTEMPTS"
    sleep "$delay"

    retryTests=("${failedTests[@]}")
    failedTests=()

    for file in "${retryTests[@]}"; do
      for position in "${!testFiles[@]}"; do
        [ "${testFiles[$position]}" = "$file" ] && break
      done
      if ! runAndReport "$file" "$attempt" "$((position + 1))"; then
        failedTests+=("$file")
      fi
    done
  done
fi

runFinishedAt=$(date +%s)
runDuration=$((runFinishedAt - runStartedAt))
passedTests=$((totalTests - ${#failedTests[@]}))
printDivider
if [ ${#failedTests[@]} -eq 0 ]; then
  printf '%s✓ ALL TESTS PASSED%s %d/%d tests in %s' \
    "$GREEN$BOLD" "$RESET" "$passedTests" "$totalTests" "$(formatDuration "$runDuration")"
else
  printf '%s✗ TEST RUN FAILED%s %d passed, %d failed, %d total in %s' \
    "$RED$BOLD" "$RESET" "$passedTests" "${#failedTests[@]}" "$totalTests" "$(formatDuration "$runDuration")"
fi
if [ "$retryCount" -gt 0 ]; then
  printf ' %s(%d retried)%s' "$DIM" "$retryCount" "$RESET"
fi
printf '\n'

if [ ${#failedTests[@]} -eq 0 ]; then
  exit 0
else
  printf '%sFailed tests:%s\n' "$RED$BOLD" "$RESET"
  for file in "${failedTests[@]}"; do
    testName=$(basename "${file%.*}")
    printf '  %s•%s %s %s(artifacts: .maestro/debug-output/%s)%s\n' \
      "$RED" "$RESET" "$file" "$DIM" "$testName" "$RESET"
  done
  exit 1
fi
