import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getInfo() {
    return {
      name: 'Mave CMS',
      version: '0.1.0',
      description: 'Modern Headless CMS with MACH Architecture',
      architecture: 'MACH (Microservices, API-first, Cloud-native, Headless)',
      endpoints: {
        api: '/api',
        graphql: '/graphql',
        health: '/api/health',
      },
    };
  }
}

