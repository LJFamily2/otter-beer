import { BrandStoryRepository } from "@/repositories/BrandStoryRepository";
import type { BrandStoryUpdateInput } from "@/lib/validation/brandStory";
import type { IBrandStory } from "@/models/BrandStory";

export class BrandStoryService {
  constructor(
    private readonly repository: BrandStoryRepository = new BrandStoryRepository()
  ) {}

  async get(): Promise<IBrandStory | null> {
    return this.repository.get();
  }

  async replacePages(
    input: BrandStoryUpdateInput,
    actorId: string
  ): Promise<IBrandStory> {
    return this.repository.replacePages(input.pages, actorId);
  }

  // ─── Public reads (Server Components can call this directly — no HTTP
  // round trip — once the homepage flipbook is wired to real data) ────────
  async getPublished(): Promise<IBrandStory | null> {
    return this.repository.get();
  }
}

export const brandStoryService = new BrandStoryService();
