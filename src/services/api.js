// Klien API watch → GODENPG v2.
// Semua panggilan lewat path relatif /api/* ; nginx watch mem-proxy ke v2 (/v1/*)
// dan menyuntik header Authorization: Bearer server-side (key TIDAK pernah ke browser).
//
// Bentuk v2: sukses { data, page, perPage, total } ; error { error:{code,message} }.
// Anime/ donghua dari godenpg v2 DB; komik dari vault (via proxy).

const safeGet = async (path) => {
  try {
    const res = await fetch(path, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`API error ${path}:`, error.message);
    return null;
  }
};

const listResult = (json, page = 1) => ({
  success: Boolean(json),
  data: json?.data ?? [],
  page: json?.page ?? page,
  total: json?.total,
});

// Detail v2 → tambahkan field datar yang dicari helper (detailPath bawa tipe utk link balik).
const shapeDetail = (payload, kind) => {
  const d = payload?.data;
  if (!d) return { success: false, data: null };
  const videoUrls = d.videoUrls && typeof d.videoUrls === 'object' ? d.videoUrls : {};
  // Normalisasi seasons[].episodes[]: inject url stream + number + season int.
  // pickEpisodes (utils.js) baca detail.seasons → episode HARUS dapat field url/number di sini.
  const seasons = Array.isArray(d.seasons)
    ? d.seasons.map((s, sIdx) => {
        const seasonNum = Number.isFinite(Number(sIdx + 1)) ? sIdx + 1 : 1;
        return {
          ...s,
          season: seasonNum,
          episodes: flattenSeasonEps(s?.episodes ?? [], videoUrls, seasonNum),
        };
      })
    : d.seasons;
  return {
    success: true,
    data: {
      ...d,
      detailPath: `${kind}:${d.slug}`,
      seasons,
      episodes: flattenSeasonEps(seasons?.flatMap((s) => s?.episodes ?? []) ?? [], videoUrls, 1),
    },
  };
};

// Flatten episodes di dalam satu season — inject url dari videoUrls map + number dari path.
const flattenSeasonEps = (episodes = [], videoUrls = {}, season = 1) => {
  const numFromPath = (p) => {
    const m = /Episode\s+(\d+)/i.exec(p || '');
    return m ? parseInt(m[1], 10) : undefined;
  };
  return (episodes || []).map((e, i) => {
    const link = Array.isArray(e.links) ? e.links[0] : undefined;
    const num = e.number ?? numFromPath(e.logicalPath) ?? (i + 1);
    const streamUrl = e.url || e.videoUrl || videoUrls[e.id] || link?.url;
    return {
      ...e,
      number: num,
      episode: num,
      season,
      name: e.name || `Episode ${num}`,
      url: streamUrl,
      mode: streamUrl ? 'hls' : (link?.type === 'HLS' ? 'hls' : 'iframe'),
    };
  });
};

// ── Anime filter ──
// category: 'latest' | 'popular' | 'ongoing' | 'completed' | 'movie' | 'serial'
const fetchAnimeFilter = async (category, page = 1, genre = '') => {
  const g = genre ? `&genre=${encodeURIComponent(genre)}` : '';
  const json = await safeGet(`/api/anime/filter/${category}?page=${page}${g}`);
  return listResult(json, page);
};

// ── Donghua filter ──
const fetchDonghuaFilter = async (category, page = 1, genre = '') => {
  const g = genre ? `&genre=${encodeURIComponent(genre)}` : '';
  const json = await safeGet(`/api/donghua/filter/${category}?page=${page}${g}`);
  return listResult(json, page);
};

const fetchList = async (kind, page = 1) => listResult(await safeGet(`/api/${kind}?page=${page}`), page);

export const api = {
  // Beranda: anime terbaru (filter/latest).
  getHome: (page = 1) => fetchAnimeFilter('latest', page),

  // Anime: latest, ongoing, completed, movie, serial.
  getAnimeLatest: (page = 1) => fetchAnimeFilter('latest', page),
  getAnimeOngoing: (page = 1) => fetchAnimeFilter('ongoing', page),
  getAnimeCompleted: (page = 1) => fetchAnimeFilter('completed', page),
  getAnimePopular: (page = 1) => fetchAnimeFilter('popular', page),
  getAnimeMovie: (page = 1) => fetchAnimeFilter('movie', page),
  getAnimeSerial: (page = 1) => fetchAnimeFilter('serial', page),

  // Donghua: latest, ongoing, completed, movie, serial.
  getDonghuaLatest: (page = 1) => fetchDonghuaFilter('latest', page),
  getDonghuaOngoing: (page = 1) => fetchDonghuaFilter('ongoing', page),
  getDonghuaCompleted: (page = 1) => fetchDonghuaFilter('completed', page),
  getDonghuaPopular: (page = 1) => fetchDonghuaFilter('popular', page),
  getDonghuaMovie: (page = 1) => fetchDonghuaFilter('movie', page),
  getDonghuaSerial: (page = 1) => fetchDonghuaFilter('serial', page),

  // Legacy aliases — keep for backward compat
  getMovies: (page = 1) => fetchAnimeFilter('latest', page),
  getSeries: (page = 1) => fetchDonghuaFilter('latest', page),
  getTrending: (page = 1) => fetchDonghuaFilter('latest', page),

  // Kategori: anime/donghua (legacy — sekarang pakai genre param).
  getCategory: (action, page = 1) => fetchList(action, page),

  // ── Komik ──
  // type: 'manga'|'manhwa'|'manhua'|'adult' atau multi 'manga,manhwa'. Kosong = semua.
  getComics: async (page = 1, type = '') => {
    const t = type ? `&type=${type}` : '';
    return listResult(await safeGet(`/api/komik?page=${page}${t}`), page);
  },

  // Daftar genre unik dari vault (agregasi). Response: [{name, slug, count}].
  getComicGenres: async () => {
    const json = await safeGet('/api/komik/genres');
    return json?.data ?? [];
  },

  getComicDetail: async (code) => {
    if (!code) return { success: false, data: null };
    const p = encodeURIComponent(code);
    const json = await safeGet(`/api/komik/${p}`);
    const d = json?.data;
    if (!d) return { success: false, data: null };
    return {
      success: true,
      data: {
        ...d,
        detailPath: `comic:${d.code}`,
        slug: d.code,
        posterUrl: d.posterUrl ?? d.thumbnail?.url ?? null,
        thumbnail: d.posterUrl ?? d.thumbnail?.url ?? null,
        // chapters sudah dari v2 dalam bentuk [{chapter, pages: [{url,...}]}]
        chapters: d.chapters || [],
      },
    };
  },

  // ── Search ──
  search: async (query, page = 1) => {
    if (!query) return { success: false, data: [], page };
    const json = await safeGet(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
    return listResult(json, page);
  },

  // ── Detail (anime/donghua) ──
  // detailPath = "anime:slug" / "donghua:slug" / "comic:code" / code polos.
  // vault anime slug: "anime:tv:texhnolyze-2003" (3 segments)
  // vault donghua slug: "donghua:slug" (2 segments, but might be more)
  getDetail: async (detailPath) => {
    if (!detailPath) return { success: false, data: null };
    const parts = String(detailPath).split(':');
    // Prefix anime/donghua: "anime:slug" atau "anime:tv:slug"
    if (parts[0] === 'anime' || parts[0] === 'donghua') {
      const kind = parts[0];
      const slug = parts.slice(1).join(':');
      return shapeDetail(await safeGet(`/api/${kind}/${encodeURIComponent(slug)}`), kind);
    }
    // Prefix komik: full code (vault "comic:type:slug") — detailPath = code.
    if (parts[0] === 'comic') {
      const code = detailPath;
      const json = await safeGet(`/api/komik/${encodeURIComponent(code)}`);
      if (json?.data) return api.getComicDetail(code);
    }
    // slug polos → coba anime, donghua, lalu komik
    const slug = detailPath;
    const anime = await safeGet(`/api/anime/${encodeURIComponent(slug)}`);
    if (anime?.data) return shapeDetail(anime, 'anime');
    const donghua = await safeGet(`/api/donghua/${encodeURIComponent(slug)}`);
    if (donghua?.data) return shapeDetail(donghua, 'donghua');
    const komik = await safeGet(`/api/komik/${encodeURIComponent(slug)}`);
    if (komik?.data) return api.getComicDetail(slug);
    return { success: false, data: null };
  },
};
