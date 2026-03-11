<?php

namespace Tests\Unit;

use App\Http\Middleware\SetLocale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class SetLocaleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set up available locales for testing
        config(['app.available_locales' => ['en' => 'English', 'id' => 'Bahasa Indonesia']]);
        config(['app.locale' => 'en']);
        config(['app.fallback_locale' => 'en']);
    }

    public function test_middleware_uses_authenticated_user_locale_preference()
    {
        $user = User::factory()->create(['locale' => 'id']);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $user);

        $middleware = new SetLocale;
        $next = function ($req) {
            return response('OK');
        };

        $response = TestResponse::fromBaseResponse($middleware->handle($request, $next));

        $this->assertEquals('id', app()->getLocale());
        $response->assertHeader('Content-Language', 'id');
    }

    public function test_middleware_falls_back_to_accept_language_for_guests()
    {
        $request = Request::create('/');
        $request->headers->set('Accept-Language', 'id-ID,id;q=0.9,en;q=0.8');

        $middleware = new SetLocale;
        $next = function ($req) {
            return response('OK');
        };

        $response = TestResponse::fromBaseResponse($middleware->handle($request, $next));

        $this->assertEquals('id', app()->getLocale());
        $response->assertHeader('Content-Language', 'id');
    }

    public function test_middleware_falls_back_to_default_locale_when_no_supported_locale_found()
    {
        $request = Request::create('/');
        $request->headers->set('Accept-Language', 'fr-FR,fr;q=0.9,en;q=0.8');

        $middleware = new SetLocale;
        $next = function ($req) {
            return response('OK');
        };

        $response = TestResponse::fromBaseResponse($middleware->handle($request, $next));

        $this->assertEquals('en', app()->getLocale());
        $response->assertHeader('Content-Language', 'en');
    }

    public function test_middleware_uses_user_preference_over_accept_language()
    {
        $user = User::factory()->create(['locale' => 'en']);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $user);
        $request->headers->set('Accept-Language', 'id-ID,id;q=0.9,en;q=0.8');

        $middleware = new SetLocale;
        $next = function ($req) {
            return response('OK');
        };

        $response = TestResponse::fromBaseResponse($middleware->handle($request, $next));

        $this->assertEquals('en', app()->getLocale());
        $response->assertHeader('Content-Language', 'en');
    }

    public function test_middleware_handles_null_user_locale()
    {
        $user = User::factory()->create(['locale' => null]);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $user);
        $request->headers->set('Accept-Language', 'id-ID,id;q=0.9,en;q=0.8');

        $middleware = new SetLocale;
        $next = function ($req) {
            return response('OK');
        };

        $response = TestResponse::fromBaseResponse($middleware->handle($request, $next));

        $this->assertEquals('id', app()->getLocale());
        $response->assertHeader('Content-Language', 'id');
    }
}
