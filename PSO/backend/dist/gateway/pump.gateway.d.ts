import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
interface ConnectedUser {
    socketId: string;
    userId: string;
    role: string;
    username: string;
}
export declare class PumpGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    private connectedUsers;
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(client: Socket, data: {
        userId: string;
        role: string;
        username: string;
    }): {
        success: boolean;
    };
    emitNewSale(sale: {
        id: string;
        operatorName: string;
        fuelType: string;
        liters: number;
        amount: number;
        paymentMethod: string;
        timestamp: Date;
    }): void;
    emitTankUpdate(data: {
        fuelType: string;
        previousLevel: number;
        currentLevel: number;
        capacity: number;
        percentageFull: number;
    }): void;
    emitShiftUpdate(data: {
        operatorId: string;
        operatorName: string;
        shiftId: string;
        totalSales: number;
        totalLiters: number;
        status: string;
    }): void;
    emitToOperator(operatorId: string, event: string, data: any): void;
    emitAlert(alert: {
        id: string;
        type: string;
        severity: string;
        message: string;
        timestamp: Date;
    }): void;
    emitCreditApproval(operatorId: string, data: {
        saleId: string;
        approved: boolean;
        customerName: string;
        amount: number;
    }): void;
    handleCreditRequest(client: Socket, data: {
        operatorId: string;
        operatorName: string;
        customerName: string;
        amount: number;
    }): {
        success: boolean;
        message: string;
    };
    getActiveOperators(): ConnectedUser[];
    private broadcastActiveOperators;
    isUserConnected(userId: string): boolean;
    getConnectedUser(userId: string): ConnectedUser | undefined;
}
export {};
