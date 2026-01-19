import { Module, Global } from '@nestjs/common';
import { PumpGateway } from './pump.gateway';

@Global()
@Module({
    providers: [PumpGateway],
    exports: [PumpGateway],
})
export class GatewayModule { }
