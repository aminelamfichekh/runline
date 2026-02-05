<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');
            $table->string('stripe_payment_intent_id')->unique()->nullable();
            $table->string('stripe_charge_id')->nullable();
            $table->string('stripe_invoice_id')->nullable();
            $table->integer('amount'); // Amount in cents
            $table->string('currency', 3)->default('usd');
            $table->enum('status', ['pending', 'succeeded', 'failed', 'refunded'])->default('pending');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Additional metadata
            $table->timestamps();
            $table->index(['user_id', 'status']);
            $table->index('stripe_payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
