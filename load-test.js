import http from 'k6/http';
import { check, sleep } from 'k6';

// Read target URL from environment variable or default to local Next.js server
const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:3000/events';

export const options = {
  scenarios: {
    users: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1m',
      preAllocatedVUs: 20,
      maxVUs: 200,
      stages: [
        { target: 100, duration: '1m' },
        { target: 250, duration: '1m' },
        { target: 500, duration: '2m' },
        { target: 750, duration: '1m' },
        { target: 0, duration: '1m' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],    // Less than 1% failure rate
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1000ms
  },
};

export default function runLoadTest() {
  const res = http.get(TARGET_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
