/**
 * Jest setup file
 */

// Define vi object for compatibility with vitest
global.vi = {
  fn: () => {
    const mockFn = jest.fn();
    return mockFn;
  },
  mock: jest.mock,
  spyOn: jest.spyOn,
};

// Mock fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
);