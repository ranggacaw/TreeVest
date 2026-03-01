<?php

namespace Tests\Feature;

use App\Enums\InvestmentStatus;
use App\Enums\ReportType;
use App\Enums\GeneratedReportStatus;
use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\FruitType;
use App\Models\GeneratedReport;
use App\Models\Investment;
use App\Models\Payout;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $investor;

    protected User $farmOwner;

    protected User $admin;

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
        $this->admin = User::factory()->admin()->create();

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
        ]);

        Payout::factory()->create([
            'investment_id' => $this->investment->id,
            'net_amount_cents' => 500000,
            'status' => 'completed',
        ]);
    }

    public function test_investor_can_access_reports_index(): void
    {
        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Investor/Reports/Index')
            ->has('profitLoss')
            ->has('performance')
            ->has('filterOptions')
        );
    }

    public function test_non_investor_cannot_access_reports_index(): void
    {
        $response = $this
            ->actingAs($this->farmOwner)
            ->get(route('reports.index'));

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_access_reports(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('reports.index'));

        $response->assertStatus(200);
    }

    public function test_report_index_returns_correct_data(): void
    {
        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Investor/Reports/Index')
            ->where('profitLoss.summary.totalInvestedCents', 1000000)
            ->where('profitLoss.summary.totalPayoutsCents', 500000)
            ->where('profitLoss.summary.netCents', -500000)
        );
    }

    public function test_filter_parameters_are_applied(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
            'purchase_date' => '2025-01-01',
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.index', [
                'from' => '2024-01-01',
                'to' => '2024-12-31',
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('profitLoss.summary.totalInvestedCents', 1000000)
        );
    }

    public function test_pdf_request_creates_generated_report(): void
    {
        Queue::fake();

        $response = $this
            ->actingAs($this->investor)
            ->post(route('reports.pdf.request'));

        $response->assertStatus(202);
        $response->assertJson(['message' => 'Report generation started']);

        $this->assertDatabaseHas('generated_reports', [
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss->value,
            'status' => GeneratedReportStatus::Pending->value,
        ]);
    }

    public function test_pdf_request_dispatches_job(): void
    {
        Queue::fake();

        $this
            ->actingAs($this->investor)
            ->post(route('reports.pdf.request'));

        Queue::assertPushed(\App\Jobs\GeneratePdfReport::class);
    }

    public function test_csv_download_returns_correct_content(): void
    {
        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.csv'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $response->assertHeader('Content-Disposition', 'attachment; filename="profit_loss_report.csv"');

        $content = $response->streamedContent();
        $this->assertStringContainsString('Investment ID', $content);
        $this->assertStringContainsString('10000.00', $content);
    }

    public function test_csv_with_filters(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
            'purchase_date' => '2025-01-01',
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.csv', [
                'from' => '2024-01-01',
                'to' => '2024-12-31',
            ]));

        $response->assertStatus(200);
        $content = $response->streamedContent();
        $this->assertStringContainsString('10000.00', $content);
        $this->assertStringNotContainsString('20000.00', $content);
    }

    public function test_download_completed_report(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => now()->addDays(7),
        ]);

        Storage::shouldReceive('exists')->andReturn(true);
        Storage::shouldReceive('download')->andReturn(new \Symfony\Component\HttpFoundation\BinaryFileResponse(__FILE__));

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(200);
    }

    public function test_download_pending_report_returns_202(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Pending,
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(202);
    }

    public function test_download_expired_report_returns_410(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => now()->subDays(1),
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(410);
    }

    public function test_download_other_investors_report_returns_403(): void
    {
        $otherInvestor = User::factory()->investor()->create();

        $report = GeneratedReport::factory()->create([
            'user_id' => $otherInvestor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(403);
    }
}
