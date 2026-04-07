#!/bin/bash

# Load Testing Runner Script
# Usage: ./run-tests.sh [scenario] [--cloud] [--output json|summary]
# Examples:
#   ./run-tests.sh read-heavy
#   ./run-tests.sh write-heavy --output json
#   ./run-tests.sh sustained --cloud

set -e

SCENARIO=${1:-read-heavy}
BASE_URL=${BASE_URL:-http://localhost:3000}
CLOUD_MODE=false
OUTPUT_FORMAT="summary"

# Parse additional arguments
shift || true
while [[ $# -gt 0 ]]; do
  case $1 in
    --cloud)
      CLOUD_MODE=true
      shift
      ;;
    --output)
      OUTPUT_FORMAT=$2
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Map scenario names to k6 scenario options
SCENARIO_MAP=(
  [read-heavy]="scenarioReadHeavy"
  [write-heavy]="scenarioWriteHeavy"
  [sustained]="scenarioSustained"
)

K6_SCENARIO=${SCENARIO_MAP[$SCENARIO]:-scenarioReadHeavy}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="tests/load/results"

mkdir -p "$RESULTS_DIR"

echo "=========================================="
echo "K6 Load Test Runner"
echo "=========================================="
echo "Scenario: $SCENARIO"
echo "Base URL: $BASE_URL"
echo "Timestamp: $TIMESTAMP"
echo "=========================================="
echo ""

if [ "$CLOUD_MODE" = true ]; then
  echo "Running in Grafana Cloud mode..."
  k6 cloud --projectID 3000 \
    -e BASE_URL="$BASE_URL" \
    --scenario "$K6_SCENARIO" \
    tests/load/scenarios.js
else
  if [ "$OUTPUT_FORMAT" = "json" ]; then
    echo "Running with JSON output to $RESULTS_DIR/${SCENARIO}_${TIMESTAMP}.json"
    k6 run \
      -e BASE_URL="$BASE_URL" \
      --scenario "$K6_SCENARIO" \
      -o json="$RESULTS_DIR/${SCENARIO}_${TIMESTAMP}.json" \
      tests/load/scenarios.js
  else
    echo "Running with summary output..."
    k6 run \
      -e BASE_URL="$BASE_URL" \
      --scenario "$K6_SCENARIO" \
      tests/load/scenarios.js
  fi

  if [ -f "$RESULTS_DIR/${SCENARIO}_${TIMESTAMP}.json" ]; then
    echo ""
    echo "Results saved to: $RESULTS_DIR/${SCENARIO}_${TIMESTAMP}.json"
    echo ""
    echo "To analyze results, run:"
    echo "  node tests/load/analyze-results.js $RESULTS_DIR/${SCENARIO}_${TIMESTAMP}.json"
  fi
fi

echo ""
echo "Test completed: $(date)"
