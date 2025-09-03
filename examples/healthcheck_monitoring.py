#!/usr/bin/env python3
"""
Example monitoring script for LightRAG healthcheck endpoints
"""

import requests
import time
from datetime import datetime
from typing import Dict, Any


class LightRAGMonitor:
    def __init__(self, base_url: str = "http://localhost:9621", api_key: str = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})

    def check_health(self) -> Dict[str, Any]:
        """Check basic health status"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            response.raise_for_status()
            return {
                "status": "success",
                "data": response.json(),
                "timestamp": datetime.now().isoformat(),
            }
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }

    def check_readiness(self) -> Dict[str, Any]:
        """Check if service is ready"""
        try:
            response = self.session.get(f"{self.base_url}/ready", timeout=10)
            response.raise_for_status()
            return {
                "status": "success",
                "data": response.json(),
                "timestamp": datetime.now().isoformat(),
            }
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }

    def check_detailed_health(self) -> Dict[str, Any]:
        """Check detailed health status (requires auth)"""
        if not self.api_key:
            return {
                "status": "error",
                "error": "API key required for detailed health check",
                "timestamp": datetime.now().isoformat(),
            }

        try:
            response = self.session.get(f"{self.base_url}/health/detailed", timeout=10)
            response.raise_for_status()
            return {
                "status": "success",
                "data": response.json(),
                "timestamp": datetime.now().isoformat(),
            }
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }

    def monitor_continuously(self, interval: int = 30, max_failures: int = 3):
        """Monitor continuously with failure tracking"""
        print(f"Starting continuous monitoring of {self.base_url}")
        print(f"Check interval: {interval} seconds")
        print(f"Max consecutive failures: {max_failures}")
        print("-" * 60)

        consecutive_failures = 0

        while True:
            try:
                # Check health
                health_result = self.check_health()

                if health_result["status"] == "success":
                    consecutive_failures = 0
                    print(f"[{health_result['timestamp']}] ✅ Health: OK")

                    # Check readiness
                    readiness_result = self.check_readiness()
                    if readiness_result["status"] == "success":
                        print(f"[{readiness_result['timestamp']}] ✅ Readiness: OK")
                    else:
                        print(
                            f"[{readiness_result['timestamp']}] ⚠️  Readiness: {readiness_result['error']}"
                        )

                    # Check detailed health if API key is available
                    if self.api_key:
                        detailed_result = self.check_detailed_health()
                        if detailed_result["status"] == "success":
                            data = detailed_result["data"]
                            print(
                                f"[{detailed_result['timestamp']}] ✅ Detailed: {data['status']} | Auth: {data['auth_mode']} | Pipeline: {'busy' if data['pipeline_busy'] else 'idle'}"
                            )
                        else:
                            print(
                                f"[{detailed_result['timestamp']}] ⚠️  Detailed: {detailed_result['error']}"
                            )
                else:
                    consecutive_failures += 1
                    print(
                        f"[{health_result['timestamp']}] ❌ Health: {health_result['error']}"
                    )

                    if consecutive_failures >= max_failures:
                        print(
                            f"❌ Service has failed {consecutive_failures} times consecutively. Stopping monitoring."
                        )
                        break

                time.sleep(interval)

            except KeyboardInterrupt:
                print("\n🛑 Monitoring stopped by user")
                break
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                consecutive_failures += 1
                if consecutive_failures >= max_failures:
                    break
                time.sleep(interval)


def main():
    """Main function with command line argument parsing"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Monitor LightRAG healthcheck endpoints"
    )
    parser.add_argument(
        "--url", default="http://localhost:9621", help="Base URL of LightRAG API"
    )
    parser.add_argument("--api-key", help="API key for detailed health checks")
    parser.add_argument(
        "--interval", type=int, default=30, help="Check interval in seconds"
    )
    parser.add_argument(
        "--max-failures",
        type=int,
        default=3,
        help="Max consecutive failures before stopping",
    )
    parser.add_argument(
        "--single-check",
        action="store_true",
        help="Perform single check instead of continuous monitoring",
    )

    args = parser.parse_args()

    monitor = LightRAGMonitor(args.url, args.api_key)

    if args.single_check:
        print("Performing single health check...")
        print("-" * 40)

        # Health check
        health_result = monitor.check_health()
        print(f"Health Check: {health_result['status']}")
        if health_result["status"] == "success":
            print(f"  Status: {health_result['data']['status']}")
            print(f"  Service: {health_result['data']['service']}")
            print(f"  Version: {health_result['data']['version']}")
        else:
            print(f"  Error: {health_result['error']}")

        # Readiness check
        readiness_result = monitor.check_readiness()
        print(f"\nReadiness Check: {readiness_result['status']}")
        if readiness_result["status"] == "success":
            print(f"  Status: {readiness_result['data']['status']}")
        else:
            print(f"  Error: {readiness_result['error']}")

        # Detailed check (if API key provided)
        if args.api_key:
            detailed_result = monitor.check_detailed_health()
            print(f"\nDetailed Health Check: {detailed_result['status']}")
            if detailed_result["status"] == "success":
                data = detailed_result["data"]
                print(f"  Status: {data['status']}")
                print(f"  Auth Mode: {data['auth_mode']}")
                print(f"  Pipeline Busy: {data['pipeline_busy']}")
                print(f"  Core Version: {data['core_version']}")
                print(f"  API Version: {data['api_version']}")
            else:
                print(f"  Error: {detailed_result['error']}")
    else:
        monitor.monitor_continuously(args.interval, args.max_failures)


if __name__ == "__main__":
    main()
