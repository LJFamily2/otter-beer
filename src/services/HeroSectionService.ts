import { HeroSectionRepository } from "@/repositories/HeroSectionRepository";
import type { HeroSectionUpdateInput } from "@/lib/validation/heroSection";
import type { IHeroSection, IHeroSlide } from "@/models/HeroSection";

export class HeroSectionService {
  constructor(
    private readonly repository: HeroSectionRepository = new HeroSectionRepository()
  ) {}

  async get(): Promise<IHeroSection | null> {
    return this.repository.get();
  }

  async replaceSlides(
    input: HeroSectionUpdateInput,
    actorId: string
  ): Promise<IHeroSection> {
    return this.repository.replaceSlides(input.slides, actorId);
  }

  // ─── Public reads (Server Components can call these directly — no HTTP
  // round trip — once the homepage carousel is wired to real data) ────────

  /**
   * Published slides only, in admin-defined order. This is what the public
   * hero will render; drafts stay admin-only. Not called by any page yet —
   * HeroSection.tsx still renders its hardcoded SLIDES array, and wiring it
   * up is deliberately out of scope for this change.
   */
  async listPublishedSlides(): Promise<IHeroSlide[]> {
    const heroSection = await this.repository.get();
    return (heroSection?.slides ?? []).filter(
      (slide) => slide.status === "published"
    );
  }
}

export const heroSectionService = new HeroSectionService();
