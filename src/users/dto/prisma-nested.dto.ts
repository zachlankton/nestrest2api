import { Allow } from 'class-validator';

export class PrismaNestedLimited {
  @Allow()
  connect?: any;
  @Allow()
  disconnect?: any;
}
