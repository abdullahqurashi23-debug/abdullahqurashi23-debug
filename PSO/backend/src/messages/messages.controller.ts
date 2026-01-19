import { Controller, Get, Post, Body, Param, Put, UseGuards, Query, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    async createMessage(@Body() body: { senderId: string; receiverId: string; content: string }) {
        return this.messagesService.createMessage(body.senderId, body.receiverId, body.content);
    }

    @Get(':userId')
    async getUserMessages(@Param('userId') userId: string) {
        return this.messagesService.getUserMessages(userId);
    }

    @Get('conversation/:userId1/:userId2')
    async getConversation(
        @Param('userId1') userId1: string,
        @Param('userId2') userId2: string
    ) {
        return this.messagesService.getMessages(userId1, userId2);
    }

    @Put(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.messagesService.markAsRead(id);
    }
}
