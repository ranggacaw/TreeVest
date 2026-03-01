<?php

namespace Tests\Feature;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\FruitType;
use App\Models\Investment;
use App\Models\Payout;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class TaxReportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $investor;

    protected User $farmOwner;

    protected FruitType $fruitType;

    protected Farm $farm;

    protected FruitCrop $fruitCrop;

    protected Tree $tree;

    protected Investment $investment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->investor = User::factory()->investor()->create();
        $this->farmOwner = User::factory()->farmOwner()->create();

        $this->fruitType = FruitType::factory()->create();
        $this->farm = Farm::factory()->create();
        $this->fruitCrop = FruitCrop::factory()->create([
            'farm_id' => $this->farm->id,
            'fruit_type_id' => $this->fruitType->id,
        ]);
        $this->tree = Tree::factory()->create([
            'fruit_crop_id' => $this->fruitCrop->id,
        ]);

        $this->investment = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
            'purchase_date' => '2024-06-15',
        ]);

        Payout::factory()->create([
            'investment_id' => $this->investment->id,
            'net_amount_cents' => 500000,
            'status' => 'completed',
            'completed_at' => '2024-12-01',
        ]);
    }

    public function test_investor_can_access_tax_report(): void
    {
        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax.show', ['year' => 2024]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Investor/Reports/Tax/Show')
                ->where('year', 2024)
                ->has('taxData')
        );
    }

    public function test_non_investor_cannot_access_tax_report(): void
    {
        $response = $this
            ->actingAs($this->farmOwner)
            ->get(route('reports.tax.show', ['year' => 2024]));

        $response->assertStatus(403);
    }

    public function test_invalid_year_returns_404(): void
    {
        $currentYear = (int) date('Y');
        $futureYear = $currentYear + 10;

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax.show', ['year' => $futureYear]));

        $response->assertStatus(404);
    }

    public function test_tax_report_returns_correct_data(): void
    {
        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax.show', ['year' => 2024]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('year', 2024)
                ->where('taxData.summary.totalIncomeCents', 500000)
                ->where('taxData.summary.totalInvestedCents', 1000000)
                ->where('taxData.summary.netCents', -500000)
        );
    }

    public function test_tax_report_filters_by_year(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
            'purchase_date' => '2023-06-15',
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax.show', ['year' => 2024]));

        $response->assertInertia(
            fn ($page) => $page
                ->where('taxData.summary.totalInvestedCents', 1000000)
        );
    }

    public function test_tax_report_includes_only_completed_payouts(): void
    {
        Payout::factory()->create([
            'investment_id' => $this->investment->id,
            'net_amount_cents' => 600000,
            'status' => 'pending',
            'completed_at' => '2024-12-01',
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax.show', ['year' => 2024]));

        $response->assertInertia(
            fn ($page) => $page
                ->where('taxData.summary.totalIncomeCents', 500000)
        );
    }

    public function test_tax_pdf_request_creates_generated_report(): void
    {
        Queue::fake();

        $response = $this
            ->actingAs($this->investor)
            ->post(route('reports.tax.pdf.request', ['year' => 2024]));

        $response->assertStatus(202);
        $response->assertJson(['message' => 'Report generation started']);

        $this->assertDatabaseHas('generated_reports', [
            'user_id' => $this->investor->id,
            'report_type' => ReportType::TaxSummary->value,
            'status' => GeneratedReportStatus::Pending->value,
        ]);
    }

    public function test_tax_pdf_request_dispatches_job(): void
    {
        Queue::fake();

        $this
            ->actingAs($this->investor)
            ->post(route('reports.tax.pdf.request', ['year' => 2024]));

        Queue::assertPushed(\App\Jobs\GeneratePdfReport::class);
    }

    public function test_tax_pdf_request_with_different_year(): void
    {
        Queue::fake();

        $response = $this
            ->actingAs($this->investor)
            ->post(route('reports.tax.pdf.request', ['year' => 2023]));

        $response->assertStatus(202);

        $this->assertDatabaseHas('generated_reports', [
            'user_id' => $this->investor->id,
            'report_type' => ReportType::TaxSummary->value,
            'status' => GeneratedReportStatus::Pending->value,
        ]);
    }

    public function test_tax_csv_download_returns_correct_content(): void
    {
        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax.csv', ['year' => 2024]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $response->assertHeader('Content-Disposition', 'attachment; filename="tax_summary_2024.csv"');

        $content = $response->streamedContent();
        $this->assertStringContainsString('Tax Summary Report - 2024', $content);
        $this->assertStringContainsString('INCOME (PAYOUTS)', $content);
        $this->assertStringContainsString('INVESTMENTS', $content);
    }

    public function test_tax_csv_with_investments_and_payouts(): void
    {
        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax.csv', ['year' => 2024]));

        $response->assertStatus(200);
        $content = $response->streamedContent();
        $this->assertStringContainsString('10000.00', $content);
        $this->assertStringContainsString('5000.00', $content);
    }

    public function test_tax_csv_filters_by_year(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
            'purchase_date' => '2023-06-15',
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax.csv', ['year' => 2024]));

        $response->assertStatus(200);
        $content = $response->streamedContent();
        $this->assertStringContainsString('10000.00', $content);
        $this->assertStringNotContainsString('20000.00', $content);
    }

    public function test_tax_redirects_to_current_year(): void
    {
        $currentYear = (int) date('Y');

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.tax'));

        $response->assertRedirect(route('reports.tax.show', ['year' => $currentYear]));
    }
}
