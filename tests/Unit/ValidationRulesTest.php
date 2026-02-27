<?php

namespace Tests\Unit;

use App\Rules\NoSqlInjection;
use App\Rules\NoXss;
use App\Rules\SafeFilename;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ValidationRulesTest extends TestCase
{
    public function test_no_xss_rule()
    {
        $rule = new NoXss;

        $passes = Validator::make(['input' => 'Safe String'], ['input' => $rule])->passes();
        $this->assertTrue($passes, 'Safe string should pass');

        $fails = Validator::make(['input' => '<script>alert(1)</script>'], ['input' => $rule])->passes();
        $this->assertFalse($fails, 'XSS string should fail');

        $fails = Validator::make(['input' => 'String with <b>HTML</b>'], ['input' => $rule])->passes();
        $this->assertFalse($fails, 'HTML tags should fail');
    }

    public function test_no_sql_injection_rule()
    {
        $rule = new NoSqlInjection;

        $passes = Validator::make(['input' => 'Safe Search'], ['input' => $rule])->passes();
        $this->assertTrue($passes, 'Safe string should pass');

        $fails = Validator::make(['input' => "' OR '1'='1"], ['input' => $rule])->passes();
        $this->assertFalse($fails, 'SQL injection pattern should fail');

        $fails = Validator::make(['input' => 'UNION SELECT * FROM users'], ['input' => $rule])->passes();
        $this->assertFalse($fails, 'UNION SELECT should fail');
    }

    public function test_safe_filename_rule()
    {
        $rule = new SafeFilename;

        $passes = Validator::make(['input' => 'safe_file.jpg'], ['input' => $rule])->passes();
        $this->assertTrue($passes, 'Safe filename should pass');

        $fails = Validator::make(['input' => '../unsafe.jpg'], ['input' => $rule])->passes();
        $this->assertFalse($fails, 'Directory traversal should fail');

        $fails = Validator::make(['input' => 'file/with/path.jpg'], ['input' => $rule])->passes();
        $this->assertFalse($fails, 'Path separator should fail');

        $fails = Validator::make(['input' => "file\0name.jpg"], ['input' => $rule])->passes();
        $this->assertFalse($fails, 'Null byte should fail');
    }
}
