import http from 'k6/http';
import { check, sleep } from 'k6';

const TARGET_URL =
  __ENV.TARGET_URL || 'http://localhost:3000/events';

export const options = {
  scenarios: {
    users: {
      executor: 'ramping-arrival-rate',

      startRate: 10,
      timeUnit: '1s',

      preAllocatedVUs: 20,
      maxVUs: 200,

      stages: [
        { target: 20, duration: '1m' },
        { target: 50, duration: '1m' },
        { target: 100, duration: '2m' },
        { target: 150, duration: '1m' },
        { target: 0, duration: '1m' },
      ],
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: [
      'p(95)<1000',
      'p(99)<2000',
    ],
  },
};

export default function () {
  const res = http.get(TARGET_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response under 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}