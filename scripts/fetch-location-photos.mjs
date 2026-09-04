import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const places = [
  ["풍원장", "pungwonjang", "풍원장 미역국정찬 마린시티점"],
  ["가야밀면", "gaya-milmyeon", "해운대 가야밀면"],
  ["해목", "haemok", "해목 해운대점"],
  ["호랑이젤라떡", "tiger-gelatteok", "호랑이젤라떡 해운대본점"],
  ["OPS", "ops", "옵스 해운대점"],
  ["진횟집", "jin-hoetjip", "진횟집 광안리"],
  ["수영돼지국밥", "suyeong-gukbap", "수영돼지국밥"],
  ["톤쇼우", "tonshou", "톤쇼우 광안점"],
  ["착한낙지", "good-nakji", "착한낙지 부산남구직영점"],
  ["광안목", "gwanganmok", "광안목 광안점"],
  ["해변횟집", "haebyeon-hoetjip", "해변횟집 송도 부산"],
  ["뚱보네", "ttungbone", "뚱보네 송도 부산"],
  ["씨앗호떡", "biff-hotteok", "BIFF광장 씨앗호떡"],
  ["비빔당면", "bibim-dangmyeon", "국제시장 비빔당면"],
  ["개미집", "gaemijip", "안경희 개미집 본점"],
  ["부산족발", "busan-jokbal", "부산족발 부평동"],
  ["부평깡통시장", "bupyeong-market", "부평깡통시장 야시장"],
  ["기장손칼국수", "gijang-kalguksu", "기장손칼국수 서면"],
  ["송정3대국밥", "songjeong-gukbap", "송정3대국밥 서면"],
  ["바오하우스", "bao-haus", "바오하우스 전포"],
  ["모모스커피", "momos-yeongdo", "모모스커피 영도 로스터리"],
  ["白淺村海景咖啡", "huinnyeoul-cafe", "흰여울문화마을 카페"],
  ["소수인", "sosuin", "소수인 서면"],
  ["수월경화", "suwol-gyeonghwa", "수월경화 송정"],
  ["송정집", "songjeongjip", "송정집 부산"],
  ["낙불집", "nakbuljip", "낙불집 송정"],
  ["명가의 뜰", "myeongga-airport", "명가의 뜰 김해공항"],
  ["플레이보6", "flavour6-airrail", "플레이보6 에어레일 김해공항"],
  ["K라면바", "k-ramen-airport", "K라면바 김해공항"],
  ["해복", "haebok", "해복 해운대 엘시티"]
];

const expectedNames = {
  "OPS": "옵스",
  "씨앗호떡": "승기씨앗호떡",
  "부평깡통시장": "야시장포차",
  "白淺村海景咖啡": "흰여울문화마을",
  "플레이보6": "플레이보6",
  "K라면바": "K라면바"
};

const exactProfiles = {
  "가야밀면": "Y8MFfxSbfvDn",
  "호랑이젤라떡": "RJMZaQspxw2p",
  "수영돼지국밥": "Bim8NWyynqmE",
  "착한낙지": "dYNPx1McRWwu",
  "해변횟집": "TzpZcnmX7a8C",
  "뚱보네": "8kZEJWVdAgw8",
  "씨앗호떡": "IjPjscHrY6yp",
  "개미집": "OQBJXOse09dg",
  "모모스커피": "3WZjdTKERcnH",
  "白淺村海景咖啡": "2By2KSn1ocZ5",
  "해복": "e8yNxohUB52n"
};

const exactPages = {
  "K라면바": "https://zzizdda.tistory.com/53?category=1206298"
};

const exactPhotoData = {
  "부평깡통시장": {
    page: "https://www.bsjunggu.go.kr/board/view.junggu?boardId=LIFE&dataSid=56224&menuCd=DOM_000000205002001000&startPage=1",
    image: "https://www.bsjunggu.go.kr/upload_data/board_data/LIFE/151203078857863.jpg",
    title: "부평깡통야시장 · Busan Jung-gu official photo"
  },
  "해복": {
    page: "https://dailyguidehub.tistory.com/93",
    image: "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FdLEztA%2FdJMcageSO2w%2FAAAAAAAAAAAAAAAAAAAAAMCvpIEEs03dcaZZP3i6EYKtgVgHETruHPojlSbcdROr%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1790780399%26allow_ip%3D%26allow_referer%3D%26signature%3DfWZRUN2tBlyUyWfg55e2hPJ8l%252B8%253D",
    title: "해복 · actual LCT visit photo"
  }
};

const outputDir = path.resolve("assets/food/locations");
await mkdir(outputDir, { recursive: true });

const browserHeaders = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15" };

async function fetchHtml(url) {
  const response = await fetch(url, { headers: browserHeaders });
  if (!response.ok) throw new Error(`${url}: page ${response.status}`);
  return response.text();
}

function extractPhotoUrls(html, source, primaryImage) {
  const decoded = html.replaceAll("&amp;", "&").replaceAll("\\/", "/");
  let urls = [...decoded.matchAll(/https?:\/\/[^"'<>\s]+?\.(?:jpe?g|webp|png)(?:\?[^"'<>\s]*)?/gi)].map(match => match[0]);
  if (source.includes("diningcode.com")) {
    urls = urls.filter(url => url.includes("d12zq4w4guyljn.cloudfront.net"));
  } else if (source.includes("tistory.com")) {
    // Keep article photography only; Tistory pages also expose many UI icons and profile assets.
    urls = urls.filter(url => url.includes("blog.kakaocdn.net"));
  } else if (source.includes("bsjunggu.go.kr")) {
    urls = urls.filter(url => url.includes("upload_data"));
  }
  urls = urls.map(url => url.replace("/300_300_", "/750_750_").replace("/original_", "/750_750_"));
  const candidates = source.includes("diningcode.com") ? [...urls, primaryImage] : [primaryImage, ...urls];
  return [...new Set(candidates.filter(Boolean))].slice(0, 4);
}

async function fetchDiningCodePhotos(profileUrl, primaryImage) {
  const profileId = new URL(profileUrl).searchParams.get("rid");
  if (!profileId) return [primaryImage].filter(Boolean);
  const response = await fetch("https://www.diningcode.com/2018/ajax/headerImageList.php", {
    method: "POST",
    headers: { ...browserHeaders, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ v_rid: profileId, offset: "0", size: "10" })
  });
  if (!response.ok) return [primaryImage].filter(Boolean);
  const data = await response.json();
  const urls = data.result_data?.images?.list?.map(photo => photo.middle || photo.origin).filter(Boolean) || [];
  return [...new Set(urls.length ? urls : [primaryImage])].slice(0, 4);
}

async function downloadPhoto(url, slug, index, source) {
  const imageResponse = await fetch(url, { headers: browserHeaders });
  if (!imageResponse.ok) throw new Error(`${slug}: image ${imageResponse.status}`);
  const contentType = imageResponse.headers.get("content-type") || "";
  const extension = contentType.includes("webp") ? "webp" : contentType.includes("png") ? "png" : "jpg";
  const file = `${slug}-${index + 1}.${extension}`;
  await writeFile(path.join(outputDir, file), Buffer.from(await imageResponse.arrayBuffer()));
  return { image: `assets/food/locations/${file}`, source };
}

async function fetchPlace([key, slug, query]) {
  const photoData = exactPhotoData[key];
  const exactPage = exactPages[key];
  const profileId = exactProfiles[key];
  const pageUrl = photoData?.page || exactPage || (profileId
    ? `https://www.diningcode.com/profile.php?rid=${profileId}`
    : `https://www.diningcode.com/list.dc?query=${encodeURIComponent(query)}`);
  const html = await fetchHtml(pageUrl);
  let title;
  let imageUrl;
  let source = pageUrl;
  if (photoData) {
    title = photoData.title;
    imageUrl = photoData.image;
  } else if (profileId || exactPage) {
    title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
    imageUrl = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
  } else {
    const rawData = html.match(/localStorage\.setItem\('listData', '([\s\S]*?)'\);/)?.[1];
    if (!rawData) throw new Error(`${query}: listing data not found`);
    const data = JSON.parse(Function(`"use strict"; return '${rawData}';`)());
    const expected = (expectedNames[key] || key).replaceAll(/\s/g, "").toLowerCase();
    const listings = data.poi_section?.list || [];
    const listing = listings.find(item => `${item.nm || ""}${item.branch || ""}`.replaceAll(/\s/g, "").toLowerCase().includes(expected));
    if (!listing) throw new Error(`${query}: exact listing not found among ${listings.length} results (${listings.map(item => `${item.nm || ""}${item.branch || ""}`).join(", ")})`);
    title = `${listing.nm}${listing.branch ? ` ${listing.branch}` : ""}`;
    imageUrl = listing.image?.replace("/300_300_", "/750_750_");
    source = `https://www.diningcode.com/profile.php?rid=${listing.v_rid}`;
  }
  if (!title || !imageUrl) throw new Error(`${query}: metadata not found`);
  const gallerySource = source;
  const galleryHtml = gallerySource === pageUrl ? html : await fetchHtml(gallerySource);
  const photoUrls = gallerySource.includes("diningcode.com")
    ? await fetchDiningCodePhotos(gallerySource, imageUrl)
    : extractPhotoUrls(galleryHtml, gallerySource, imageUrl);
  const downloads = await Promise.allSettled(photoUrls.map((url, index) => downloadPhoto(url, slug, index, gallerySource)));
  const images = downloads.filter(item => item.status === "fulfilled").map(item => item.value);
  if (!images.length) throw new Error(`${query}: no gallery images downloaded`);
  return { key, slug, query, title, image: images[0].image, images, source: gallerySource };
}

const results = [];
for (let i = 0; i < places.length; i += 6) {
  const batch = await Promise.allSettled(places.slice(i, i + 6).map(fetchPlace));
  for (const item of batch) {
    if (item.status === "fulfilled") results.push(item.value);
    else console.error(`SKIP\t${item.reason.message}`);
  }
}
await writeFile(path.join(outputDir, "sources.json"), `${JSON.stringify(results, null, 2)}\n`);
for (const result of results) console.log(`${result.key}\t${result.title}\t${result.image}`);
