{!! $xml !!}

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ url('/') }}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{{ route('education.index') }}</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>{{ route('encyclopedia.index') }}</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>

    @foreach($categories as $category)
        <url>
            <loc>{{ route('education.index', ['category' => $category->slug]) }}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
        </url>
    @endforeach

    @foreach($articles as $article)
        <url>
            <loc>{{ route('education.show', $article->slug) }}</loc>
            @if($article->updated_at)
                <lastmod>{{ $article->updated_at->toIso8601String() }}</lastmod>
            @endif
            <changefreq>monthly</changefreq>
            <priority>0.6</priority>
        </url>
    @endforeach
</urlset>