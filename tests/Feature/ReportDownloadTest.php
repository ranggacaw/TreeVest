<?php

namespace Tests\Feature;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use App\Models\GeneratedReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReportDownloadTest extends TestCase
{
    use RefreshDatabase;

    protected User $investor;

    protected User $otherInvestor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->investor = User::factory()->investor()->create();
        $this->otherInvestor = User::factory()->investor()->create();
    }

    public function test_completed_report_can_be_downloaded(): void
    {
        Storage::fake('private');

        Storage::put('private/reports/test.pdf', 'PDF content');

        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', 'attachment; filename="profit_loss_report.pdf"');
    }

    public function test_pending_report_returns_202(): void
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
        $response->assertJson(['message' => 'Report is not ready yet']);
    }

    public function test_generating_report_returns_202(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Generating,
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(202);
        $response->assertJson(['message' => 'Report is not ready yet']);
    }

    public function test_expired_report_returns_410(): void
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
        $response->assertJson(['message' => 'Report has expired']);
    }

    public function test_other_investors_report_returns_403(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->otherInvestor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(403);
        $response->assertJson(['message' => 'You do not own this report.']);
    }

    public function test_failed_report_returns_202(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Failed,
            'failure_reason' => 'Generation error',
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(202);
        $response->assertJson(['message' => 'Report is not ready yet']);
    }

    public function test_report_without_file_path_returns_202(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => null,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(202);
    }

    public function test_report_with_missing_file_returns_404(): void
    {
        Storage::fake('private');

        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/missing.pdf',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(404);
    }

    public function test_tax_summary_report_can_be_downloaded(): void
    {
        Storage::fake('private');

        Storage::put('private/reports/tax_summary_test.pdf', 'Tax PDF content');

        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::TaxSummary,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/tax_summary_test.pdf',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', 'attachment; filename="tax_summary_report.pdf"');
    }

    public function test_unauthenticated_user_cannot_download(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->get(route('reports.download', $report));

        $response->assertRedirect(route('login'));
    }

    public function test_report_expires_after_7_days(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => now()->addDays(7)->subSecond(),
        ]);

        $this->assertTrue($report->isExpired());

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(410);
    }

    public function test_report_not_expired_before_7_days(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => now()->addDays(7),
        ]);

        $this->assertFalse($report->isExpired());

        Storage::fake('private');
        Storage::put('private/reports/test.pdf', 'PDF content');

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(200);
    }

    public function test_report_with_null_expires_at_is_not_expired(): void
    {
        $report = GeneratedReport::factory()->create([
            'user_id' => $this->investor->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'private/reports/test.pdf',
            'expires_at' => null,
        ]);

        $this->assertFalse($report->isExpired());

        Storage::fake('private');
        Storage::put('private/reports/test.pdf', 'PDF content');

        $response = $this
            ->actingAs($this->investor)
            ->get(route('reports.download', $report));

        $response->assertStatus(200);
    }
}
