import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  Environment,
  EnvParser,
  ConfigValidationError,
  MemoryConfigLoader,
  ConfigBuilder,
  type AppConfig,
} from '../src/config/index.js';

describe('Configuration Module', () => {
  describe('EnvParser', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    describe('getString', () => {
      it('should return environment variable value', () => {
        process.env.TEST_VAR = 'test-value';
        expect(EnvParser.getString('TEST_VAR')).toBe('test-value');
      });

      it('should return default value if not set', () => {
        expect(EnvParser.getString('MISSING_VAR', 'default')).toBe('default');
      });

      it('should return undefined if not set and no default', () => {
        expect(EnvParser.getString('MISSING_VAR')).toBeUndefined();
      });
    });

    describe('getNumber', () => {
      it('should parse valid number', () => {
        process.env.PORT = '3000';
        expect(EnvParser.getNumber('PORT')).toBe(3000);
      });

      it('should return default value if not set', () => {
        expect(EnvParser.getNumber('MISSING_PORT', 8080)).toBe(8080);
      });

      it('should throw error for invalid number', () => {
        process.env.INVALID_NUM = 'not-a-number';
        expect(() => EnvParser.getNumber('INVALID_NUM')).toThrow(ConfigValidationError);
      });
    });

    describe('getBoolean', () => {
      it('should parse true values', () => {
        process.env.ENABLE_FEATURE = 'true';
        expect(EnvParser.getBoolean('ENABLE_FEATURE')).toBe(true);

        process.env.ENABLE_FEATURE = '1';
        expect(EnvParser.getBoolean('ENABLE_FEATURE')).toBe(true);
      });

      it('should parse false values', () => {
        process.env.ENABLE_FEATURE = 'false';
        expect(EnvParser.getBoolean('ENABLE_FEATURE')).toBe(false);

        process.env.ENABLE_FEATURE = '0';
        expect(EnvParser.getBoolean('ENABLE_FEATURE')).toBe(false);
      });

      it('should throw error for invalid boolean', () => {
        process.env.INVALID_BOOL = 'yes';
        expect(() => EnvParser.getBoolean('INVALID_BOOL')).toThrow(ConfigValidationError);
      });
    });

    describe('getEnum', () => {
      it('should parse valid enum value', () => {
        process.env.NODE_ENV = 'production';
        const result = EnvParser.getEnum('NODE_ENV', ['development', 'production', 'test'] as const);
        expect(result).toBe('production');
      });

      it('should throw error for invalid enum value', () => {
        process.env.NODE_ENV = 'invalid';
        expect(() =>
          EnvParser.getEnum('NODE_ENV', ['development', 'production', 'test'] as const)
        ).toThrow(ConfigValidationError);
      });
    });

    describe('getJson', () => {
      it('should parse valid JSON', () => {
        process.env.JSON_CONFIG = '{"key":"value","num":42}';
        const result = EnvParser.getJson<{ key: string; num: number }>("JSON_CONFIG");
        expect(result).toEqual({ key: 'value', num: 42 });
      });

      it('should throw error for invalid JSON', () => {
        process.env.INVALID_JSON = '{invalid}';
        expect(() => EnvParser.getJson('INVALID_JSON')).toThrow(ConfigValidationError);
      });
    });
  });

  describe('MemoryConfigLoader', () => {
    let loader: MemoryConfigLoader;
    let config: AppConfig;

    beforeEach(() => {
      config = {
        name: 'test-app',
        version: '1.0.0',
        environment: Environment.DEVELOPMENT,
        logging: {
          level: 'info',
          format: 'text',
          destination: 'console',
        },
      };
      loader = new MemoryConfigLoader(config);
    });

    it('should load configuration', () => {
      const loaded = loader.load();
      expect(loaded.name).toBe('test-app');
      expect(loaded.version).toBe('1.0.0');
    });

    it('should get specific config value', () => {
      expect(loader.get('name')).toBe('test-app');
      expect(loader.get('environment')).toBe(Environment.DEVELOPMENT);
    });

    it('should set config value', () => {
      loader.set('version', '2.0.0');
      expect(loader.get('version')).toBe('2.0.0');
    });

    it('should validate configuration', () => {
      expect(loader.validate()).toBe(true);
    });

    it('should fail validation for invalid config', () => {
      const invalidConfig = {
        environment: Environment.PRODUCTION,
      } as AppConfig;
      const invalidLoader = new MemoryConfigLoader(invalidConfig);
      expect(invalidLoader.validate()).toBe(false);
    });
  });

  describe('ConfigBuilder', () => {
    it('should build valid configuration', () => {
      const config = new ConfigBuilder()
        .withName('my-app')
        .withVersion('1.0.0')
        .withEnvironment(Environment.PRODUCTION)
        .withLogging({
          level: 'error',
          format: 'json',
          destination: 'file',
          filePath: '/var/log/app.log',
        })
        .build();

      expect(config.name).toBe('my-app');
      expect(config.version).toBe('1.0.0');
      expect(config.environment).toBe(Environment.PRODUCTION);
      expect(config.logging.level).toBe('error');
    });

    it('should throw error when required fields missing', () => {
      const builder = new ConfigBuilder().withName('incomplete-app');
      expect(() => builder.build()).toThrow(ConfigValidationError);
    });

    it('should support fluent API', () => {
      const builder = new ConfigBuilder()
        .withName('app')
        .withVersion('1.0.0')
        .withEnvironment(Environment.TEST)
        .withFeatures({ darkMode: true, beta: false })
        .withCustom({ region: 'us-west' });

      const config = builder.build();
      expect(config.features).toEqual({ darkMode: true, beta: false });
      expect(config.custom).toEqual({ region: 'us-west' });
    });
  });

  describe('Type contracts', () => {
    it('should enforce BaseConfig structure', () => {
      const config: AppConfig = {
        name: 'test',
        version: '1.0.0',
        environment: Environment.DEVELOPMENT,
        logging: {
          level: 'info',
          format: 'text',
          destination: 'console',
        },
      };

      expect(config.name).toBeDefined();
      expect(config.version).toBeDefined();
      expect(config.environment).toBeDefined();
    });

    it('should support optional database config', () => {
      const config: AppConfig = {
        name: 'test',
        version: '1.0.0',
        environment: Environment.PRODUCTION,
        logging: {
          level: 'info',
          format: 'json',
          destination: 'console',
        },
        database: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          username: 'user',
          password: 'pass',
        },
      };

      expect(config.database?.host).toBe('localhost');
      expect(config.database?.port).toBe(5432);
    });
  });
});
