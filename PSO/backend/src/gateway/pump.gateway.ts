import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface ConnectedUser {
    socketId: string;
    userId: string;
    role: string;
    username: string;
}

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/pump',
})
export class PumpGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('PumpGateway');
    private connectedUsers: Map<string, ConnectedUser> = new Map();

    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.connectedUsers.delete(client.id);
        this.broadcastActiveOperators();
    }

    // User authentication after connection
    @SubscribeMessage('auth:register')
    handleRegister(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { userId: string; role: string; username: string },
    ) {
        this.connectedUsers.set(client.id, {
            socketId: client.id,
            userId: data.userId,
            role: data.role,
            username: data.username,
        });

        // Join role-specific rooms
        if (data.role === 'ADMIN') {
            client.join('admins');
        } else {
            client.join('operators');
            client.join(`operator:${data.userId}`);
        }

        this.logger.log(`User registered: ${data.username} (${data.role})`);
        this.broadcastActiveOperators();

        return { success: true };
    }

    // ============= SALE EVENTS =============

    // Emit new sale to all admins
    emitNewSale(sale: {
        id: string;
        operatorName: string;
        fuelType: string;
        liters: number;
        amount: number;
        paymentMethod: string;
        timestamp: Date;
    }) {
        this.server.to('admins').emit('sale:new', sale);
        this.logger.log(`New sale emitted: Rs ${sale.amount} by ${sale.operatorName}`);
    }

    // ============= TANK EVENTS =============

    // Emit tank level update to all connected clients
    emitTankUpdate(data: {
        fuelType: string;
        previousLevel: number;
        currentLevel: number;
        capacity: number;
        percentageFull: number;
    }) {
        this.server.emit('tank:update', data);
        this.logger.log(`Tank update: ${data.fuelType} at ${data.percentageFull.toFixed(1)}%`);
    }

    // ============= SHIFT EVENTS =============

    // Emit shift updates to admins
    emitShiftUpdate(data: {
        operatorId: string;
        operatorName: string;
        shiftId: string;
        totalSales: number;
        totalLiters: number;
        status: string;
    }) {
        this.server.to('admins').emit('shift:update', data);
    }

    // Notify operator about shift events
    emitToOperator(operatorId: string, event: string, data: any) {
        this.server.to(`operator:${operatorId}`).emit(event, data);
    }

    // ============= ALERT EVENTS =============

    // Emit alert to admins
    emitAlert(alert: {
        id: string;
        type: string;
        severity: string;
        message: string;
        timestamp: Date;
    }) {
        this.server.to('admins').emit('alert:new', alert);
        this.logger.warn(`Alert: ${alert.message}`);
    }

    // ============= CREDIT APPROVAL =============

    // Notify operator about credit approval
    emitCreditApproval(operatorId: string, data: {
        saleId: string;
        approved: boolean;
        customerName: string;
        amount: number;
    }) {
        this.server.to(`operator:${operatorId}`).emit('credit:response', data);
    }

    // Request credit approval from admin
    @SubscribeMessage('credit:request')
    handleCreditRequest(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: {
            operatorId: string;
            operatorName: string;
            customerName: string;
            amount: number;
        },
    ) {
        this.server.to('admins').emit('credit:approval_needed', {
            ...data,
            requestedAt: new Date(),
        });
        return { success: true, message: 'Credit approval request sent' };
    }

    // ============= DASHBOARD STATS =============

    // Get active operators list
    getActiveOperators(): ConnectedUser[] {
        return Array.from(this.connectedUsers.values()).filter(
            (user) => user.role === 'OPERATOR',
        );
    }

    // Broadcast active operators count to admins
    private broadcastActiveOperators() {
        const activeOperators = this.getActiveOperators();
        this.server.to('admins').emit('operators:active', {
            count: activeOperators.length,
            operators: activeOperators.map((op) => ({
                userId: op.userId,
                username: op.username,
            })),
        });
    }

    // ============= UTILITY =============

    // Check if user is connected
    isUserConnected(userId: string): boolean {
        return Array.from(this.connectedUsers.values()).some(
            (user) => user.userId === userId,
        );
    }

    // Get connected user info
    getConnectedUser(userId: string): ConnectedUser | undefined {
        return Array.from(this.connectedUsers.values()).find(
            (user) => user.userId === userId,
        );
    }
}
