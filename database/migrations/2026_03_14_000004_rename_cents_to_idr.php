<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->renameColumn('price_cents', 'price_idr');
            $table->renameColumn('min_investment_cents', 'min_investment_idr');
            $table->renameColumn('max_investment_cents', 'max_investment_idr');
            $table->renameIndex('trees_status_price_cents_index', 'trees_status_price_idr_index');
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->renameColumn('base_price_per_tree_cents', 'base_price_per_tree_idr');
            $table->renameColumn('current_price_per_tree_cents', 'current_price_per_tree_idr');
            $table->renameColumn('selling_revenue_cents', 'selling_revenue_idr');
        });

        Schema::table('lot_price_snapshots', function (Blueprint $table) {
            $table->renameColumn('price_per_tree_cents', 'price_per_tree_idr');
        });

        Schema::table('investments', function (Blueprint $table) {
            $table->renameColumn('amount_cents', 'amount_idr');
        });

        Schema::table('payouts', function (Blueprint $table) {
            $table->renameColumn('gross_amount_cents', 'gross_amount_idr');
            $table->renameColumn('platform_fee_cents', 'platform_fee_idr');
            $table->renameColumn('net_amount_cents', 'net_amount_idr');
        });

        Schema::table('market_listings', function (Blueprint $table) {
            $table->renameColumn('ask_price_cents', 'ask_price_idr');
            $table->renameColumn('platform_fee_cents', 'platform_fee_idr');
            $table->renameColumn('net_proceeds_cents', 'net_proceeds_idr');
        });

        Schema::table('investment_transfers', function (Blueprint $table) {
            $table->renameColumn('transfer_price_cents', 'transfer_price_idr');
            $table->renameColumn('platform_fee_cents', 'platform_fee_idr');
        });

        Schema::table('wallets', function (Blueprint $table) {
            $table->renameColumn('balance_cents', 'balance_idr');
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->renameColumn('amount_cents', 'amount_idr');
            $table->renameColumn('balance_after_cents', 'balance_after_idr');
        });
    }

    public function down(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->renameColumn('price_idr', 'price_cents');
            $table->renameColumn('min_investment_idr', 'min_investment_cents');
            $table->renameColumn('max_investment_idr', 'max_investment_cents');
            $table->renameIndex('trees_status_price_idr_index', 'trees_status_price_cents_index');
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->renameColumn('base_price_per_tree_idr', 'base_price_per_tree_cents');
            $table->renameColumn('current_price_per_tree_idr', 'current_price_per_tree_cents');
            $table->renameColumn('selling_revenue_idr', 'selling_revenue_cents');
        });

        Schema::table('lot_price_snapshots', function (Blueprint $table) {
            $table->renameColumn('price_per_tree_idr', 'price_per_tree_cents');
        });

        Schema::table('investments', function (Blueprint $table) {
            $table->renameColumn('amount_idr', 'amount_cents');
        });

        Schema::table('payouts', function (Blueprint $table) {
            $table->renameColumn('gross_amount_idr', 'gross_amount_cents');
            $table->renameColumn('platform_fee_idr', 'platform_fee_cents');
            $table->renameColumn('net_amount_idr', 'net_amount_cents');
        });

        Schema::table('market_listings', function (Blueprint $table) {
            $table->renameColumn('ask_price_idr', 'ask_price_cents');
            $table->renameColumn('platform_fee_idr', 'platform_fee_cents');
            $table->renameColumn('net_proceeds_idr', 'net_proceeds_cents');
        });

        Schema::table('investment_transfers', function (Blueprint $table) {
            $table->renameColumn('transfer_price_idr', 'transfer_price_cents');
            $table->renameColumn('platform_fee_idr', 'platform_fee_cents');
        });

        Schema::table('wallets', function (Blueprint $table) {
            $table->renameColumn('balance_idr', 'balance_cents');
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->renameColumn('amount_idr', 'amount_cents');
            $table->renameColumn('balance_after_idr', 'balance_after_cents');
        });
    }
};
