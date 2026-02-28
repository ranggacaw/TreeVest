<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(rand(5, 10));
        return [
            'title' => $title,
            'slug' => \Illuminate\Support\Str::slug($title),
            'content' => fake()->paragraphs(rand(5, 15), true),
            'excerpt' => fake()->sentence(rand(20, 50)),
            'featured_image' => fake()->imageUrl(1200, 630),
            'status' => fake()->randomElement(['draft', 'published']),
            'published_at' => fake()->optional(0.7)->dateTimeBetween('-1 year', 'now'),
            'author_id' => \App\Models\User::factory(),
            'view_count' => fake()->numberBetween(0, 1000),
            'meta_title' => $title,
            'meta_description' => fake()->sentence(rand(15, 30)),
            'meta_keywords' => fake()->words(5, true),
        ];
    }
}
