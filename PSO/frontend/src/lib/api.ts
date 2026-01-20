// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

// API client with auth
class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        let token = this.getToken();

        const getHeaders = (t: string | null) => ({
            'Content-Type': 'application/json',
            ...(t && { Authorization: `Bearer ${t}` }),
            ...options.headers,
        });

        let response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: getHeaders(token),
        });

        if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

            if (refreshToken) {
                try {
                    // Try to refresh token
                    const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (refreshResponse.ok) {
                        const data = await refreshResponse.json();
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('accessToken', data.accessToken);
                            localStorage.setItem('refreshToken', data.refreshToken);
                        }

                        // Retry original request with new token
                        token = data.accessToken;
                        response = await fetch(`${this.baseUrl}${endpoint}`, {
                            ...options,
                            headers: getHeaders(token),
                        });
                    } else {
                        // Refresh failed - clear auth and redirect
                        this.handleLogout();
                    }
                } catch (error) {
                    this.handleLogout();
                }
            } else {
                this.handleLogout();
            }
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || 'Request failed');
        }

        // Handle 204 No Content or empty responses
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');

        if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
            return null as T;
        }

        const text = await response.text();
        if (!text || text.trim() === '') {
            return null as T;
        }

        return JSON.parse(text);
    }

    private handleLogout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
    }

    // Auth endpoints
    async login(username: string, password: string) {
        return this.request<{
            user: { id: string; username: string; fullName: string; role: 'ADMIN' | 'OPERATOR' };
            accessToken: string;
            refreshToken: string;
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    async getProfile() {
        return this.request<{
            id: string;
            username: string;
            fullName: string;
            role: string;
            status: string;
        }>('/auth/profile');
    }

    async refreshToken(refreshToken: string) {
        return this.request<{ accessToken: string; refreshToken: string }>(
            '/auth/refresh',
            {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            }
        );
    }

    // Users endpoints
    async getOperators() {
        return this.request<any[]>('/users/operators');
    }

    async getPendingOperators() {
        return this.request<any[]>('/users/operators/pending');
    }

    async approveOperator(id: string) {
        return this.request(`/users/operators/${id}/approve`, { method: 'PATCH' });
    }

    async suspendOperator(id: string) {
        return this.request(`/users/operators/${id}/suspend`, { method: 'PATCH' });
    }

    async createOperator(data: {
        username: string;
        password: string;
        fullName: string;
        phone?: string;
        cnic?: string;
    }) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ ...data, role: 'OPERATOR' }),
        });
    }

    // Shifts endpoints
    async startShift(data: {
        shiftType: string;
        openingCash: number;
        openingPetrolLevel: number;
        openingDieselLevel: number;
    }) {
        return this.request<{
            message: string;
            shift: {
                id: string;
                shiftType: string;
                startTime: string;
                openingCash: number;
                openingPetrolLevel: number;
                openingDieselLevel: number;
            };
        }>('/shifts/start', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async endShift(shiftId: string, data: {
        closingCash: number;
        closingPetrolLevel: number;
        closingDieselLevel: number;
        notes?: string;
    }) {
        return this.request<{
            message: string;
            summary: {
                shiftId: string;
                shiftType: string;
                duration: string;
                totalSales: number;
                totalLiters: number;
                cashCollected: number;
                cardPayments: number;
                creditSales: number;
                cashVariance: number;
                fuelVariance: number;
            };
        }>(`/shifts/${shiftId}/end`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getActiveShift() {
        return this.request<any>('/shifts/active');
    }

    async getAllActiveShifts() {
        return this.request<any[]>('/shifts/active/all');
    }

    async getDailyShifts() {
        return this.request<any[]>('/shifts/daily');
    }

    // Sales endpoints
    async recordSale(data: {
        fuelType: string;
        liters: number;
        paymentMethod: string;
        shiftId: string;
        vehicleNumber?: string;
        customerName?: string;
    }) {
        return this.request<{
            id: string;
            saleNumber: number;
            fuelType: string;
            liters: number;
            pricePerLiter: number;
            totalAmount: number;
            paymentMethod: string;
            saleDate: string;
        }>('/sales', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getTodaySales() {
        return this.request<{ sales: any[]; totals: any }>('/sales/today');
    }

    async getMyTodaySales() {
        return this.request<{ sales: any[]; totals: any }>('/sales/my-today');
    }

    async getDashboardStats() {
        return this.request<{
            todaySales: number;
            todayLiters: number;
            todayTransactions: number;
            cashInHand: number;
            activeOperators: number;
            percentageChange: string;
        }>('/sales/dashboard');
    }

    async getAnalytics(range: '7days' | '30days' = '7days') {
        return this.request<{
            date: string;
            totalSales: number;
            totalLiters: number;
            petrol: number;
            diesel: number;
        }[]>(`/sales/analytics?range=${range}`);
    }

    async getFuelPrices() {
        return this.request<{ PETROL: number; DIESEL: number }>('/sales/prices');
    }

    // Tanks endpoints
    async getTankStats() {
        return this.request<any[]>('/tanks/stats');
    }

    async getTanks() {
        return this.request<any[]>('/tanks');
    }

    async getTankPredictions() {
        return this.request<any[]>('/tanks/predictions');
    }

    async recordDelivery(data: {
        fuelType: string;
        quantityLiters: number;
        pricePerLiter: number;
        supplierName: string;
        invoiceNumber?: string;
    }) {
        return this.request('/tanks/delivery', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Banking endpoints
    async getCashFlow() {
        return this.request<{
            cashFromSales: number;
            deposited: number;
            expenses: number;
            cashInHand: number;
        }>('/banking/cash-flow');
    }

    async getMonthlySummary() {
        return this.request<{
            totalSales: number;
            totalDeposits: number;
            totalExpenses: number;
            fuelPurchases: number;
            profit: number;
        }>('/banking/monthly-summary');
    }

    async getTransactions(take?: number) {
        return this.request<any[]>(`/banking/transactions${take ? `?take=${take}` : ''}`);
    }

    async recordDeposit(data: { amount: number; bankName?: string; reference?: string; description?: string }) {
        return this.request('/banking/deposit', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getExpenses(take?: number) {
        return this.request<any[]>(`/banking/expenses${take ? `?take=${take}` : ''}`);
    }

    async getExpensesByCategory() {
        return this.request<any[]>('/banking/expenses/by-category');
    }

    async recordExpense(data: { amount: number; category: string; description?: string; vendor?: string }) {
        return this.request('/banking/expenses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getCreditCustomers() {
        return this.request<any[]>('/banking/credit-customers');
    }

    async createCreditCustomer(data: { name: string; phone?: string; creditLimit: number }) {
        return this.request('/banking/credit-customers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async receiveCreditPayment(customerId: string, amount: number) {
        return this.request(`/banking/credit-customers/${customerId}/payment`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }

    // Messages endpoints
    async getMessages(userId: string) {
        return this.request<any[]>(`/messages/${userId}`);
    }

    async getConversation(userId1: string, userId2: string) {
        return this.request<any[]>(`/messages/conversation/${userId1}/${userId2}`);
    }

    async markMessageRead(id: string) {
        return this.request(`/messages/${id}/read`, { method: 'PUT' });
    }

    async sendMessage(data: { senderId: string; receiverId: string; content: string }) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Settings endpoints
    async updateFuelPrices(data: { petrol: number; diesel: number }) {
        return this.request('/settings/prices', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async updatePumpInfo(data: { name: string; address: string; phone: string; taxRate: string }) {
        return this.request('/settings/pump-info', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getPumpInfo() {
        return this.request<{ name: string; address: string; phone: string; taxRate: string }>('/settings/pump-info');
    }

    // Profile endpoints
    async updateProfile(data: { fullName?: string; phone?: string }) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async changePassword(data: { currentPassword: string; newPassword: string }) {
        return this.request('/users/change-password', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Credit approval endpoints
    async getPendingCreditRequests() {
        return this.request<any[]>('/sales/credit-requests/pending');
    }

    async approveCreditRequest(requestId: string) {
        return this.request(`/sales/credit-requests/${requestId}/approve`, {
            method: 'POST',
        });
    }

    async rejectCreditRequest(requestId: string, reason?: string) {
        return this.request(`/sales/credit-requests/${requestId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }
}

export const api = new ApiClient();
