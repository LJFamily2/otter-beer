/**
 * Seeds the three system roles and their default permission matrices, then
 * (if the respective collections are empty) seeds mock Beers, Hero slides,
 * Blog posts and a Brand Story book — sample content for previewing the
 * marketing site against real backend data instead of hardcoded arrays.
 * Mock images are uploaded from public/images/* to Cloudinary (same images
 * reused across records — sample data only).
 *
 * Safe to re-run — role/permission writes are upserts, and each mock-content
 * block skips itself once its collection already has documents (or, for the
 * Hero Section / Brand Story singletons, once one has ever been saved) so a
 * re-run never overwrites real admin edits or duplicates sample rows.
 *
 *   pnpm run seed        (dev DB — .env.local + .env.development.local)
 *   pnpm run seed:prod   (prod DB — .env.local + .env.production.local)
 *
 * Run this once before the first login. The first superAdmin account is
 * NOT created here — it is created automatically the first time
 * FIRST_SUPER_ADMIN_EMAIL signs in with Google (see src/services/AuthService.ts).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import mongoose, { Types } from "mongoose";
import { Database } from "../src/lib/db/mongodb";
import { env } from "../src/lib/env";
import { RoleModel } from "../src/models/Role";
import { PermissionModel } from "../src/models/Permission";
import { UserModel } from "../src/models/User";
import { BeerModel } from "../src/models/Beer";
import { HeroSectionModel } from "../src/models/HeroSection";
import { BlogPostModel } from "../src/models/BlogPost";
import { BrandStoryModel } from "../src/models/BrandStory";
import {
  SYSTEM_ROLE_KEYS,
  SYSTEM_ROLE_LABELS_VI,
  SYSTEM_ROLE_LEVELS,
  type SystemRoleKey,
} from "../src/config/roles";
import {
  MODULE_KEYS,
  fullAccessGrant,
  noAccessGrant,
  type ActionGrant,
  type ModuleKey,
} from "../src/config/permissions";

type DefaultMatrix = Partial<Record<ModuleKey, ActionGrant>>;

const DEFAULT_MATRICES: Record<SystemRoleKey, DefaultMatrix> = {
  [SYSTEM_ROLE_KEYS.SUPER_ADMIN]: {
    [MODULE_KEYS.NEWS_BLOG]: fullAccessGrant(),
    [MODULE_KEYS.HERO_SECTION]: fullAccessGrant(),
    [MODULE_KEYS.BEERS]: fullAccessGrant(),
    [MODULE_KEYS.BRAND_STORY]: fullAccessGrant(),
    [MODULE_KEYS.USERS]: fullAccessGrant(),
    [MODULE_KEYS.ROLES_PERMISSIONS]: fullAccessGrant(),
  },
  [SYSTEM_ROLE_KEYS.ADMIN]: {
    [MODULE_KEYS.NEWS_BLOG]: fullAccessGrant(),
    [MODULE_KEYS.HERO_SECTION]: fullAccessGrant(),
    [MODULE_KEYS.BEERS]: fullAccessGrant(),
    [MODULE_KEYS.BRAND_STORY]: fullAccessGrant(),
    [MODULE_KEYS.USERS]: {
      ...noAccessGrant(),
      access: true,
      view: true,
    },
    [MODULE_KEYS.ROLES_PERMISSIONS]: {
      ...noAccessGrant(),
      access: true,
      view: true,
    },
  },
  [SYSTEM_ROLE_KEYS.OFFICE_MEMBER]: {
    [MODULE_KEYS.NEWS_BLOG]: {
      ...noAccessGrant(),
      access: true,
      view: true,
      add: true,
    },
    [MODULE_KEYS.HERO_SECTION]: {
      ...noAccessGrant(),
      access: true,
      view: true,
    },
    [MODULE_KEYS.BEERS]: {
      ...noAccessGrant(),
      access: true,
      view: true,
      add: true,
    },
    [MODULE_KEYS.BRAND_STORY]: {
      ...noAccessGrant(),
      access: true,
      view: true,
    },
    [MODULE_KEYS.USERS]: noAccessGrant(),
    [MODULE_KEYS.ROLES_PERMISSIONS]: noAccessGrant(),
  },
};

function redactedTarget(uri: string): string {
  return uri.replace(/\/\/[^/@]+@/, "//<redacted>@");
}

async function seedRolesAndPermissions() {
  for (const [key, label] of Object.entries(SYSTEM_ROLE_LABELS_VI) as [
    SystemRoleKey,
    string,
  ][]) {
    const role = await RoleModel.findOneAndUpdate(
      { key },
      { $set: { name: label, isSystem: true, level: SYSTEM_ROLE_LEVELS[key] } },
      { upsert: true, returnDocument: "after" }
    );

    const matrix = DEFAULT_MATRICES[key];
    for (const [moduleKey, actions] of Object.entries(matrix) as [
      ModuleKey,
      ActionGrant,
    ][]) {
      await PermissionModel.findOneAndUpdate(
        { roleId: role._id, moduleKey },
        { $set: { actions } },
        { upsert: true }
      );
    }

    console.log(`Seeded role "${key}" (${label}) with default permission matrix`);
  }
}

// ─── Mock content ──────────────────────────────────────────────────────────
// Sample data so the marketing site's Hero / Blog / Beer / Brand Story
// sections have something real to render once wired to the backend. Text is
// generated; images are the site's own public/images/* files re-uploaded to
// Cloudinary (duplicated across records on purpose — sample data only).

const PUBLIC_IMAGES_DIR = path.join(__dirname, "..", "public", "images");

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** In-run cache so the same local file referenced by multiple mock records is uploaded once per namespace. */
const uploadCache = new Map<string, string>();

function signCloudinaryParams(params: Record<string, string>): string {
  const toSign = Object.keys(params)
    .sort()
    .map((name) => `${name}=${params[name]}`)
    .join("&");
  return createHash("sha1")
    .update(`${toSign}${env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
}

/**
 * Uploads a local public/images/* file to Cloudinary directly from the
 * server (signed upload, no browser round trip) and returns the storage key
 * — same key format as StorageService.buildMediaKey, so the result is a
 * normal imageKey/mediaKey the app's media proxy route can serve.
 */
async function uploadMockImage(namespace: string, filename: string): Promise<string> {
  const cacheKey = `${namespace}:${filename}`;
  const cached = uploadCache.get(cacheKey);
  if (cached) return cached;

  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext];
  if (!contentType) {
    throw new Error(`Unsupported mock image extension: ${filename}`);
  }

  const datePrefix = new Date().toISOString().slice(0, 10);
  const key = `${namespace}/${datePrefix}/${randomUUID()}${ext}`;
  const publicId = key.replace(/\.[^./]+$/, "");
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signedParams = {
    public_id: publicId,
    timestamp,
    upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
  };
  const signature = signCloudinaryParams(signedParams);

  const bytes = await readFile(path.join(PUBLIC_IMAGES_DIR, filename));
  const form = new FormData();
  form.set("file", new Blob([new Uint8Array(bytes)], { type: contentType }), filename);
  form.set("api_key", env.CLOUDINARY_API_KEY);
  form.set("public_id", publicId);
  form.set("timestamp", timestamp);
  form.set("upload_preset", env.CLOUDINARY_UPLOAD_PRESET);
  form.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cloudinary upload failed for ${filename}: ${response.status} ${body}`);
  }

  uploadCache.set(cacheKey, key);
  console.log(`  Uploaded ${filename} → ${key}`);
  return key;
}

/**
 * The account mock content is attributed to. Reuses the oldest real user if
 * one already exists (e.g. the bootstrap superAdmin), otherwise upserts a
 * dedicated placeholder account so seeding never depends on someone having
 * signed in first.
 */
async function ensureSeedAuthor(): Promise<Types.ObjectId> {
  const existingUser = await UserModel.findOne().sort({ createdAt: 1 }).exec();
  if (existingUser) return existingUser._id as Types.ObjectId;

  const superAdminRole = await RoleModel.findOne({ key: SYSTEM_ROLE_KEYS.SUPER_ADMIN }).exec();
  if (!superAdminRole) {
    throw new Error("superAdmin role not found — role seeding must run before mock content.");
  }

  const seedUser = await UserModel.findOneAndUpdate(
    { email: "seed@otterbeer.vn" },
    {
      $setOnInsert: {
        email: "seed@otterbeer.vn",
        name: "OtterBeer Seed",
        roleId: superAdminRole._id,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  ).exec();

  return seedUser!._id as Types.ObjectId;
}

async function seedMockBeers(actorId: Types.ObjectId) {
  const existing = await BeerModel.countDocuments().exec();
  if (existing > 0) {
    console.log(`Beers: ${existing} already exist — skipping mock seed.`);
    return;
  }

  const lagerImage = await uploadMockImage("beers", "otter-beer-premium-lager.jpg");
  const paleAleImage = await uploadMockImage("beers", "otter-beer-single-can.png");
  const ipaImage = await uploadMockImage("beers", "otter-beer-single-3d.png");

  await BeerModel.create([
    {
      imageKey: lagerImage,
      abv: 5.0,
      ibu: 18,
      shopUrl: "https://otterbeer.vn/shop/premium-lager",
      findLocallyUrl: "https://otterbeer.vn/tim-cua-hang",
      themeColor: "#002867",
      themeColorContainer: "#1D3F82",
      isFeatured: true,
      status: "published",
      translations: [
        {
          locale: "vi",
          style: "PREMIUM LAGER",
          headline: "OTTER BEER\nPREMIUM LAGER",
          description:
            "Vị lager cổ điển, lên men lạnh chậm rãi từ mạch nha vàng óng và hoa bia Saaz — hậu vị sạch, dễ uống quanh năm.",
        },
        {
          locale: "en",
          style: "PREMIUM LAGER",
          headline: "OTTER BEER\nPREMIUM LAGER",
          description:
            "A classic cold-fermented lager built on golden malt and Saaz hops — clean, easy-drinking, brewed for any season.",
        },
      ],
      createdBy: actorId,
      updatedBy: actorId,
    },
    {
      imageKey: paleAleImage,
      abv: 5.4,
      ibu: 32,
      shopUrl: "https://otterbeer.vn/shop/golden-pale-ale",
      findLocallyUrl: "https://otterbeer.vn/tim-cua-hang",
      themeColor: "#8A5A20",
      themeColorContainer: "#C9975A",
      isFeatured: false,
      status: "published",
      translations: [
        {
          locale: "vi",
          style: "PALE ALE",
          headline: "GOLDEN\nPALE ALE",
          description:
            "Hương cam quýt và hoa bia Mỹ nổi bật trên nền mạch nha caramel nhẹ — vị đắng vừa phải, sảng khoái cho buổi chiều ở taproom.",
        },
        {
          locale: "en",
          style: "PALE ALE",
          headline: "GOLDEN\nPALE ALE",
          description:
            "Bright citrus and American hops over a light caramel malt base — a balanced bitterness built for long taproom afternoons.",
        },
      ],
      createdBy: actorId,
      updatedBy: actorId,
    },
    {
      imageKey: ipaImage,
      abv: 6.2,
      ibu: 55,
      shopUrl: "https://otterbeer.vn/shop/coastal-ipa",
      findLocallyUrl: "https://otterbeer.vn/tim-cua-hang",
      themeColor: "#0F6E5C",
      themeColorContainer: "#4FAF95",
      isFeatured: false,
      status: "published",
      translations: [
        {
          locale: "vi",
          style: "IPA",
          headline: "COASTAL\nIPA",
          description:
            "Bốn loại hoa bia dry-hop tạo hương nhiệt đới đậm đà, vị đắng rõ nét nhưng không gắt — dành cho người sành IPA.",
        },
        {
          locale: "en",
          style: "IPA",
          headline: "COASTAL\nIPA",
          description:
            "Four dry hops stack tropical aroma over a firm, clean bitterness — built for drinkers who take their IPA seriously.",
        },
      ],
      createdBy: actorId,
      updatedBy: actorId,
    },
  ]);

  console.log("Seeded 3 mock beers (Premium Lager featured).");
}

async function seedMockHeroSection(actorId: Types.ObjectId) {
  const existing = await HeroSectionModel.findOne().exec();
  if (existing) {
    console.log("Hero section: a document already exists — skipping mock seed.");
    return;
  }

  const slideSources = [
    {
      file: "otter-beer-hero.png",
      vi: "Lon bia thủ công Otter Beer trên nền tối — dòng bia chủ lực nấu tại Tây Ninh",
      en: "Otter Beer craft can on a dark backdrop — the flagship lager brewed in Tay Ninh",
    },
    {
      file: "otter-beer-premium-lager.jpg",
      vi: "Bia Otter Beer Premium Lager rót ra ly, bọt mịn, màu vàng hổ phách",
      en: "Otter Beer Premium Lager poured into a glass, fine foam, amber gold",
    },
    {
      file: "contact-hero.jpeg",
      vi: "Không gian taproom của nhà máy bia Otter Beer tại Tây Ninh",
      en: "The taproom at Otter Beer's Tay Ninh brewery",
    },
    {
      file: "brand-story-bg.jpg",
      vi: "Mạch nha vàng và hoa bia Saaz — nguyên liệu nấu bia thủ công Otter Beer",
      en: "Golden malt and Saaz hops — the ingredients behind Otter Beer's craft brews",
    },
  ];

  const slides = [];
  for (const source of slideSources) {
    const mediaKey = await uploadMockImage("hero", source.file);
    slides.push({
      mediaKey,
      mediaType: "image" as const,
      status: "published" as const,
      translations: [
        { locale: "vi", alt: source.vi },
        { locale: "en", alt: source.en },
      ],
    });
  }

  await HeroSectionModel.create({ slides, updatedBy: actorId });
  console.log(`Seeded hero section with ${slides.length} mock slides.`);
}

interface MockPostSpec {
  file: string;
  tags: string[];
  publishedAt: string;
  vi: { title: string; slug: string; excerpt: string; content: string; seoTitle: string; seoDescription: string };
  en: { title: string; slug: string; excerpt: string; content: string; seoTitle: string; seoDescription: string };
}

const MOCK_POSTS: MockPostSpec[] = [
  {
    file: "otter-beer-premium-lager.jpg",
    tags: ["hau-truong", "brewhouse"],
    publishedAt: "2026-05-12",
    vi: {
      title: "Nhật Ký Nhà Nấu",
      slug: "nhat-ky-nha-nau",
      excerpt:
        "Một ngày ở xưởng nấu Otter Beer: từ mẻ mạch nha đầu tiên lúc 5 giờ sáng đến khi mẻ bia cuối cùng vào tank lên men lúc nửa đêm.",
      content:
        "<p>5 giờ sáng, xưởng nấu đã sáng đèn. Đội ngũ Otter Beer bắt đầu ngày mới bằng việc kiểm tra nhiệt độ nồi nấu và cân đong mạch nha cho mẻ đầu tiên.</p><p>Mỗi mẻ bia đi qua bốn công đoạn chính: nghiền mạch nha, đường hóa, đun sôi với hoa bia, rồi làm lạnh nhanh trước khi chuyển sang tank lên men. Cả quy trình mất gần 12 tiếng, chưa kể vài tuần lên men và ủ chín sau đó.</p><p>Đến nửa đêm, mẻ cuối cùng của ngày được bơm vào tank — và xưởng nấu tạm nghỉ trước khi lặp lại vào sáng hôm sau.</p>",
      seoTitle: "Nhật Ký Nhà Nấu — Một Ngày Ở Xưởng Nấu Otter Beer",
      seoDescription:
        "Theo chân đội ngũ Otter Beer qua một ngày nấu bia trọn vẹn, từ mẻ mạch nha đầu tiên đến khi bia vào tank lên men.",
    },
    en: {
      title: "Brewhouse Diary",
      slug: "brewhouse-diary",
      excerpt:
        "A day inside the Otter Beer brewhouse: from the first grain bill at 5am to the last batch hitting the fermenter at midnight.",
      content:
        "<p>5am, and the brewhouse lights are already on. The Otter Beer team starts the day checking mash tun temperatures and weighing out grain for the first batch.</p><p>Every batch moves through four stages: milling the malt, mashing, boiling with hops, then a fast chill before it moves to the fermenter. The whole process takes close to 12 hours, before weeks of fermentation and conditioning even begin.</p><p>By midnight, the day's last batch is pumped into the tank — and the brewhouse rests before doing it all again tomorrow.</p>",
      seoTitle: "Brewhouse Diary — A Day Inside Otter Beer's Brewery",
      seoDescription:
        "Follow the Otter Beer team through a full brew day, from the first grain bill to the last batch hitting the fermenter.",
    },
  },
  {
    file: "contact-hero.jpeg",
    tags: ["su-kien", "events"],
    publishedAt: "2026-04-28",
    vi: {
      title: "Đêm Bên Bờ Biển",
      slug: "dem-ben-bo-bien",
      excerpt:
        "Otter Beer mang taproom di động ra bãi biển cho một đêm nhạc acoustic, đồ nướng và bia tươi rót thẳng từ bồn.",
      content:
        "<p>Cuối tuần vừa rồi, Otter Beer dựng taproom di động ngay trên bãi biển cho một đêm hội tụ bạn bè, nhạc acoustic và bia tươi rót thẳng từ bồn lạnh.</p><p>Khách ghé quầy được nếm thử cả ba dòng bia hiện có, trong khi đầu bếp khách mời chuẩn bị đồ nướng theo phong cách hải sản địa phương.</p><p>Đây là sự kiện ngoài trời đầu tiên trong chuỗi hoạt động cộng đồng mà Otter Beer dự định tổ chức đều đặn hơn trong năm nay.</p>",
      seoTitle: "Đêm Bên Bờ Biển — Sự Kiện Taproom Di Động Của Otter Beer",
      seoDescription:
        "Otter Beer tổ chức đêm nhạc acoustic bên bãi biển với bia tươi rót từ bồn và đồ nướng hải sản địa phương.",
    },
    en: {
      title: "Coastal Nights",
      slug: "coastal-nights",
      excerpt:
        "Otter Beer took a pop-up taproom to the beach for a night of acoustic music, local grilling and beer poured straight from the tank.",
      content:
        "<p>Last weekend, Otter Beer set up a pop-up taproom right on the beach for a night of friends, acoustic music and beer poured straight from a cold tank.</p><p>Guests sampled all three current beers while a guest chef ran a grill station built around local seafood.</p><p>It was the first outdoor event in a series Otter Beer plans to run more regularly through the rest of the year.</p>",
      seoTitle: "Coastal Nights — Otter Beer's Pop-Up Taproom Event",
      seoDescription:
        "Otter Beer hosted a beachside acoustic night with tank-poured beer and a local seafood grill station.",
    },
  },
  {
    file: "age-verification-bg.jpg",
    tags: ["nguyen-lieu", "ingredients"],
    publishedAt: "2026-04-09",
    vi: {
      title: "Hoa Bia Xứ Tây Ninh",
      slug: "hoa-bia-xu-tay-ninh",
      excerpt:
        "Vì sao Otter Beer chọn nguồn nguyên liệu địa phương khi có thể, và điều đó thay đổi hương vị mỗi mẻ bia như thế nào.",
      content:
        "<p>Phần lớn hoa bia Otter Beer sử dụng vẫn được nhập khẩu, nhưng đội ngũ nấu bia luôn tìm cách đưa nguyên liệu địa phương vào công thức khi chất lượng cho phép.</p><p>Nước nấu bia lấy từ nguồn nước ngầm quanh khu vực Tây Ninh, được xử lý và điều chỉnh khoáng chất riêng cho từng dòng bia — lager cần nước mềm hơn, trong khi IPA chịu được độ cứng cao hơn một chút để tôn vị đắng.</p><p>Kết quả là mỗi mẻ bia mang một chút dấu ấn của vùng đất nơi nó được nấu ra.</p>",
      seoTitle: "Hoa Bia Xứ Tây Ninh — Nguyên Liệu Đứng Sau Bia Otter Beer",
      seoDescription:
        "Otter Beer chia sẻ cách chọn nước và nguyên liệu địa phương ở Tây Ninh để tạo nên hương vị riêng cho từng dòng bia.",
    },
    en: {
      title: "Hops of Tay Ninh",
      slug: "hops-of-tay-ninh",
      excerpt:
        "Why Otter Beer sources locally where it can, and how that choice shapes the flavor of every batch.",
      content:
        "<p>Most of Otter Beer's hops are still imported, but the brewing team looks for ways to work local ingredients into the recipe whenever the quality holds up.</p><p>Brewing water is drawn from groundwater around Tay Ninh, treated and mineral-adjusted per beer — the lager wants softer water, while the IPA carries a touch more hardness to lift its bitterness.</p><p>The result is a batch that carries a little of the place it was brewed in.</p>",
      seoTitle: "Hops of Tay Ninh — The Ingredients Behind Otter Beer",
      seoDescription:
        "Otter Beer on sourcing local water and ingredients in Tay Ninh to shape the flavor of each beer.",
    },
  },
  {
    file: "brand-story-bg.jpg",
    tags: ["san-pham", "product"],
    publishedAt: "2026-03-21",
    vi: {
      title: "Rót Một Ly Vàng Óng",
      slug: "rot-mot-ly-vang-ong",
      excerpt:
        "Ghi chú nếm thử cho Premium Lager — dòng bia chủ lực của Otter Beer — từ màu sắc, hương thơm đến hậu vị.",
      content:
        "<p>Premium Lager rót ra có màu vàng hổ phách trong vắt, lớp bọt trắng mịn giữ được lâu nhờ tỉ lệ mạch nha và protein được cân chỉnh kỹ.</p><p>Mũi ngửi đầu tiên là hương mạch nha ngọt nhẹ, xen chút hoa cỏ từ hoa bia Saaz. Vào miệng, vị bia sạch, carbon hóa vừa phải, hậu vị khô gọn chứ không đọng ngọt.</p><p>Đây là dòng bia được thiết kế để uống được nhiều ly mà không ngán — đúng tinh thần một premium lager nên có.</p>",
      seoTitle: "Rót Một Ly Vàng Óng — Ghi Chú Nếm Thử Premium Lager",
      seoDescription:
        "Ghi chú nếm thử chi tiết cho Otter Beer Premium Lager, từ màu sắc, hương thơm đến hậu vị khô gọn đặc trưng.",
    },
    en: {
      title: "The Golden Pour",
      slug: "the-golden-pour",
      excerpt:
        "Tasting notes for Premium Lager — Otter Beer's flagship — from color and aroma through to the finish.",
      content:
        "<p>Premium Lager pours a clear amber gold, with a fine white head that holds thanks to a carefully balanced malt-to-protein ratio.</p><p>The first thing you notice is a light sweet malt aroma with a floral edge from Saaz hops. On the palate it's clean, moderately carbonated, with a dry, tidy finish rather than lingering sweetness.</p><p>It's a beer built for more than one glass — exactly what a premium lager should be.</p>",
      seoTitle: "The Golden Pour — Premium Lager Tasting Notes",
      seoDescription:
        "Detailed tasting notes for Otter Beer Premium Lager, from color and aroma to its signature dry finish.",
    },
  },
  {
    file: "footer-bg.png",
    tags: ["con-nguoi", "people"],
    publishedAt: "2026-03-02",
    vi: {
      title: "Cộng Đồng Thủ Công",
      slug: "cong-dong-thu-cong",
      excerpt:
        "Otter Beer không nấu bia một mình — câu chuyện về những nhà làm bia thủ công khác ở Việt Nam mà đội ngũ học hỏi và hợp tác cùng.",
      content:
        "<p>Cộng đồng bia thủ công ở Việt Nam vẫn còn nhỏ, và phần lớn các xưởng nấu đều biết nhau. Otter Beer thường xuyên trao đổi công thức, thiết bị và cả men bia với vài xưởng bạn ở khu vực phía Nam.</p><p>Tinh thần chung là chia sẻ thay vì cạnh tranh — một xưởng nấu thành công giúp cả thị trường bia thủ công lớn mạnh hơn.</p><p>Otter Beer đang lên kế hoạch cho một mẻ bia hợp tác đầu tiên trong năm nay, dự kiến công bố chi tiết trong vài tháng tới.</p>",
      seoTitle: "Cộng Đồng Thủ Công — Otter Beer Và Các Nhà Làm Bia Bạn",
      seoDescription:
        "Otter Beer chia sẻ về cộng đồng bia thủ công Việt Nam và kế hoạch hợp tác cùng các xưởng nấu khác.",
    },
    en: {
      title: "The Craft Community",
      slug: "the-craft-community",
      excerpt:
        "Otter Beer doesn't brew alone — a look at the other Vietnamese craft brewers the team learns from and works with.",
      content:
        "<p>Vietnam's craft beer community is still small, and most brewhouses know each other. Otter Beer regularly swaps recipes, equipment and even yeast with a handful of brewers across the south.</p><p>The shared mindset is cooperation over competition — one brewery's success helps grow the whole craft market.</p><p>Otter Beer is planning its first collaboration batch this year, with details expected in the coming months.</p>",
      seoTitle: "The Craft Community — Otter Beer and Fellow Brewers",
      seoDescription:
        "Otter Beer on Vietnam's small craft beer community and an upcoming collaboration brew with fellow brewers.",
    },
  },
];

async function seedMockBlogPosts(actorId: Types.ObjectId) {
  const existing = await BlogPostModel.countDocuments().exec();
  if (existing > 0) {
    console.log(`Blog posts: ${existing} already exist — skipping mock seed.`);
    return;
  }

  for (const post of MOCK_POSTS) {
    const coverImageKey = await uploadMockImage("news-blog", post.file);
    await BlogPostModel.create({
      coverImageKey,
      authorId: actorId,
      tags: post.tags,
      status: "published",
      publishedAt: new Date(post.publishedAt),
      translations: [
        {
          locale: "vi",
          title: post.vi.title,
          slug: post.vi.slug,
          excerpt: post.vi.excerpt,
          content: post.vi.content,
          seoTitle: post.vi.seoTitle,
          seoDescription: post.vi.seoDescription,
          seoKeywords: post.tags,
        },
        {
          locale: "en",
          title: post.en.title,
          slug: post.en.slug,
          excerpt: post.en.excerpt,
          content: post.en.content,
          seoTitle: post.en.seoTitle,
          seoDescription: post.en.seoDescription,
          seoKeywords: post.tags,
        },
      ],
      createdBy: actorId,
      updatedBy: actorId,
    });
  }

  console.log(`Seeded ${MOCK_POSTS.length} mock blog posts.`);
}

interface MockChapterSpec {
  files: string[];
  vi: string;
  en: string;
}

const MOCK_CHAPTERS: MockChapterSpec[] = [
  {
    files: ["otter-beer-premium-lager.jpg", "contact-hero.jpeg", "otter-beer-hero.png"],
    vi: "Câu Chuyện",
    en: "Our Story",
  },
  {
    files: ["otter-beer-single-3d.png", "otter-beer-single-can.png"],
    vi: "Nguyên Liệu",
    en: "Ingredients",
  },
  {
    files: [
      "otter-beer-premium-lager-transparent.png",
      "new-bg.png",
      "brand-story-bg.jpg",
      "age-verification-bg.jpg",
    ],
    vi: "Nấu Bia",
    en: "Brewing",
  },
  {
    files: ["contact-hero.jpeg", "otter-beer-premium-lager.jpg", "otter-beer-hero.png"],
    vi: "Cộng Đồng",
    en: "Community",
  },
  {
    files: ["footer-bg.png", "otter-beer-single-3d.png"],
    vi: "Nhật Ký",
    en: "Journal",
  },
];

async function seedMockBrandStory(actorId: Types.ObjectId) {
  const existing = await BrandStoryModel.findOne().exec();
  if (existing) {
    console.log("Brand story: a document already exists — skipping mock seed.");
    return;
  }

  const chapters = [];
  for (const chapter of MOCK_CHAPTERS) {
    const images = [];
    for (const file of chapter.files) {
      images.push(await uploadMockImage("brand-story", file));
    }
    chapters.push({
      images,
      translations: [
        { locale: "vi", title: chapter.vi },
        { locale: "en", title: chapter.en },
      ],
    });
  }

  await BrandStoryModel.create({ chapters, updatedBy: actorId });
  console.log(`Seeded brand story with ${chapters.length} mock chapters.`);
}

async function seedMockContent() {
  console.log("\nSeeding mock content for local preview...");
  const actorId = await ensureSeedAuthor();
  await seedMockBeers(actorId);
  await seedMockHeroSection(actorId);
  await seedMockBlogPosts(actorId);
  await seedMockBrandStory(actorId);
}

async function seed() {
  console.log(`Seeding target: ${redactedTarget(env.MONGODB_URI)}\n`);
  await Database.connect();

  await seedRolesAndPermissions();
  await seedMockContent();

  console.log(
    "\nDone. Roles, default permissions and mock content seeded.\n\nSet FIRST_SUPER_ADMIN_EMAIL in .env.local and sign in with that Google account (against this same database) to create the first superAdmin."
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
