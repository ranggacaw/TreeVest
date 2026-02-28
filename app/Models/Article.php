<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'featured_image',
        'status',
        'published_at',
        'author_id',
        'view_count',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'view_count' => 'integer',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function scopePublished($query): void
    {
        $query->where('status', 'published');
    }

    public function scopeSearch($query, string $term): void
    {
        $query->whereFullText(['title', 'content'], $term);
    }

    public function scopeSearchWithRanking($query, string $term): void
    {
        $query
            ->select('articles.*')
            ->where(function ($q) use ($term) {
                $q->whereFullText(['title', 'content'], $term)
                    ->orWhere('title', 'LIKE', "%{$term}%");
            })
            ->orderByRaw(
                'CASE 
                    WHEN title LIKE ? THEN 1 
                    WHEN title LIKE ? THEN 2 
                    WHEN content LIKE ? THEN 3 
                    ELSE 4 
                END',
                ["{$term}%", "%{$term}%", "{$term}%"]
            );
    }

    public function scopePopular($query, int $limit = 10): void
    {
        $query->orderBy('view_count', 'desc')->limit($limit);
    }

    public function scopeStale($query, int $months = 6): void
    {
        $query->where('updated_at', '<', now()->subMonths($months));
    }

    public function isStale(int $months = 6): bool
    {
        return $this->updated_at->isBefore(now()->subMonths($months));
    }

    protected static function booted(): void
    {
        static::creating(function ($article) {
            if (empty($article->slug)) {
                $article->slug = \Illuminate\Support\Str::slug($article->title);
            }
        });

        static::created(function () {
            cache()->forget('articles::');
            cache()->forget('categories:all');
        });

        static::updated(function () {
            cache()->forget('articles::');
            cache()->forget('categories:all');
        });

        static::deleted(function () {
            cache()->forget('articles::');
            cache()->forget('categories:all');
        });

        static::deleting(function ($article) {
            if ($article->featured_image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($article->featured_image);
            }
        });
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function publish(): void
    {
        $this->status = 'published';
        $this->published_at = now();
        $this->save();
    }

    public function unpublish(): void
    {
        $this->status = 'draft';
        $this->save();
    }
}
