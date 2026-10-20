import { HealthController } from '../../../src/http/health.controller.js';

describe('HealthController', () => {
  it('reports the service as ok', () => {
    expect(new HealthController().getHealth()).toEqual({ status: 'ok', service: 'ai-ops-service' });
  });
});
