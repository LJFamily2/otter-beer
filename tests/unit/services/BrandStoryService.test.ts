// Mocked so this orchestration-only test never pulls in the real Mongoose
// model chain — same rationale as BeerService.test.ts.
jest.mock("@/repositories/BrandStoryRepository");

import { BrandStoryService } from "@/services/BrandStoryService";
import { BrandStoryRepository } from "@/repositories/BrandStoryRepository";
import type { BrandStoryUpdateInput } from "@/lib/validation/brandStory";

describe("BrandStoryService", () => {
  let repository: BrandStoryRepository;
  let service: BrandStoryService;

  beforeEach(() => {
    repository = {
      get: jest.fn(),
      replacePages: jest.fn(),
    } as unknown as BrandStoryRepository;
    service = new BrandStoryService(repository);
  });

  describe("get", () => {
    it("delegates to the repository", async () => {
      const doc = { pages: [] };
      (repository.get as jest.Mock).mockResolvedValue(doc);

      const result = await service.get();

      expect(result).toBe(doc);
    });

    it("returns null when no document has ever been saved", async () => {
      (repository.get as jest.Mock).mockResolvedValue(null);

      const result = await service.get();

      expect(result).toBeNull();
    });
  });

  describe("getPublished", () => {
    it("returns the same singleton document as get() (no draft/published split)", async () => {
      const doc = { pages: [{ imageKey: "k1" }] };
      (repository.get as jest.Mock).mockResolvedValue(doc);

      const result = await service.getPublished();

      expect(result).toBe(doc);
    });
  });

  describe("replacePages", () => {
    it("passes the input pages and actor id through to the repository", async () => {
      const input: BrandStoryUpdateInput = {
        pages: [
          {
            imageKey: "k1",
            translations: [{ locale: "vi", title: "Tiêu đề", caption: "Nội dung" }],
          },
        ],
      };
      const saved = { pages: input.pages };
      (repository.replacePages as jest.Mock).mockResolvedValue(saved);

      const result = await service.replacePages(input, "507f1f77bcf86cd799439011");

      expect(repository.replacePages).toHaveBeenCalledWith(
        input.pages,
        "507f1f77bcf86cd799439011"
      );
      expect(result).toBe(saved);
    });

    it("passes an empty pages array through unchanged", async () => {
      const input: BrandStoryUpdateInput = { pages: [] };
      (repository.replacePages as jest.Mock).mockResolvedValue({ pages: [] });

      await service.replacePages(input, "507f1f77bcf86cd799439011");

      expect(repository.replacePages).toHaveBeenCalledWith([], "507f1f77bcf86cd799439011");
    });
  });
});
