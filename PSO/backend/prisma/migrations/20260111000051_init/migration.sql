-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'EVENING', 'NIGHT');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'CREDIT', 'EASYPAISA', 'JAZZCASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DeliveryPaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LOW_FUEL', 'CASH_VARIANCE', 'CREDIT_OVERDUE', 'LOAN_DUE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "cnic" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "profile_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "shift_type" "ShiftType" NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "status" "ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "opening_cash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "closing_cash" DECIMAL(12,2),
    "opening_petrol_level" DECIMAL(10,2) NOT NULL,
    "opening_diesel_level" DECIMAL(10,2) NOT NULL,
    "closing_petrol_level" DECIMAL(10,2),
    "closing_diesel_level" DECIMAL(10,2),
    "total_sales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_liters" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cash_collected" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "card_payments" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "credit_sales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cash_variance" DECIMAL(10,2),
    "fuel_variance" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_tanks" (
    "id" TEXT NOT NULL,
    "fuel_type" "FuelType" NOT NULL,
    "capacity" DECIMAL(10,2) NOT NULL,
    "current_level" DECIMAL(10,2) NOT NULL,
    "min_threshold" DECIMAL(10,2) NOT NULL DEFAULT 500,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_refill_date" TIMESTAMP(3),
    "sensor_connected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fuel_tanks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "sale_number" SERIAL NOT NULL,
    "operator_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "fuel_type" "FuelType" NOT NULL,
    "liters" DECIMAL(10,2) NOT NULL,
    "price_per_liter" DECIMAL(8,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "vehicle_number" TEXT,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "credit_approved_by" TEXT,
    "credit_due_date" TIMESTAMP(3),
    "credit_paid" BOOLEAN NOT NULL DEFAULT false,
    "credit_customer_id" TEXT,
    "sale_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_deliveries" (
    "id" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "delivery_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fuel_type" "FuelType" NOT NULL,
    "quantity_liters" DECIMAL(10,2) NOT NULL,
    "price_per_liter" DECIMAL(8,2) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMP(3),
    "payment_status" "DeliveryPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_due_date" TIMESTAMP(3),
    "tank_level_before" DECIMAL(10,2) NOT NULL,
    "tank_level_after" DECIMAL(10,2) NOT NULL,
    "density" DECIMAL(5,3),
    "temperature" DECIMAL(4,1),
    "received_by_id" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "fuel_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking_transactions" (
    "id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "bank_name" TEXT,
    "account_number" TEXT,
    "reference_number" TEXT,
    "description" TEXT,
    "shift_id" TEXT,
    "delivery_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "receipt_image" TEXT,

    CONSTRAINT "banking_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_customers" (
    "id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT,
    "cnic" TEXT,
    "address" TEXT,
    "company_name" TEXT,
    "credit_limit" DECIMAL(12,2) NOT NULL DEFAULT 10000,
    "total_outstanding" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_payments" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "reference_number" TEXT,
    "notes" TEXT,
    "received_by_id" TEXT NOT NULL,

    CONSTRAINT "credit_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "expense_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "receipt_number" TEXT,
    "receipt_image" TEXT,
    "approved_by_id" TEXT,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "alert_type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "related_id" TEXT,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "table_name" TEXT,
    "record_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_cnic_key" ON "users"("cnic");

-- CreateIndex
CREATE INDEX "shifts_operator_id_idx" ON "shifts"("operator_id");

-- CreateIndex
CREATE INDEX "shifts_start_time_idx" ON "shifts"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_tanks_fuel_type_key" ON "fuel_tanks"("fuel_type");

-- CreateIndex
CREATE UNIQUE INDEX "sales_sale_number_key" ON "sales"("sale_number");

-- CreateIndex
CREATE INDEX "sales_operator_id_idx" ON "sales"("operator_id");

-- CreateIndex
CREATE INDEX "sales_shift_id_idx" ON "sales"("shift_id");

-- CreateIndex
CREATE INDEX "sales_sale_date_idx" ON "sales"("sale_date");

-- CreateIndex
CREATE INDEX "sales_fuel_type_idx" ON "sales"("fuel_type");

-- CreateIndex
CREATE INDEX "fuel_deliveries_fuel_type_idx" ON "fuel_deliveries"("fuel_type");

-- CreateIndex
CREATE INDEX "fuel_deliveries_delivery_date_idx" ON "fuel_deliveries"("delivery_date");

-- CreateIndex
CREATE INDEX "banking_transactions_transaction_type_idx" ON "banking_transactions"("transaction_type");

-- CreateIndex
CREATE INDEX "banking_transactions_transaction_date_idx" ON "banking_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "credit_customers_phone_idx" ON "credit_customers"("phone");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "alerts_alert_type_idx" ON "alerts"("alert_type");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_credit_approved_by_fkey" FOREIGN KEY ("credit_approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_credit_customer_id_fkey" FOREIGN KEY ("credit_customer_id") REFERENCES "credit_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_deliveries" ADD CONSTRAINT "fuel_deliveries_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_transactions" ADD CONSTRAINT "banking_transactions_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_transactions" ADD CONSTRAINT "banking_transactions_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "fuel_deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_transactions" ADD CONSTRAINT "banking_transactions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_payments" ADD CONSTRAINT "credit_payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "credit_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_payments" ADD CONSTRAINT "credit_payments_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
