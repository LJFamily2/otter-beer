/**
 * @jest-environment node
 *
 * Regression test for a real bug: PermissionService.getMatrixForRoleId used
 * to build each matrix cell via `{ ...row.actions }`. row.actions is a
 * Mongoose subdocument, not a plain object — a shallow spread copies its
 * internal bookkeeping (including a $__parent back-reference to the row
 * itself), producing a genuinely self-referential object. JSON.stringify
 * hides this (Mongoose documents define toJSON, which JSON.stringify calls
 * automatically), but React's RSC flight serializer walks raw properties
 * and recurses forever on the cycle — this is what crashed /admin/roles
 * with "Maximum call stack size exceeded" once real DB-backed permission
 * rows reached the page (the temporary QA harness used during development
 * only exercised plain fake objects, which never hit this path).
 */
import { Types } from "mongoose";
import { PermissionModel } from "@/models/Permission";
import { RoleModel } from "@/models/Role";
import { PermissionService } from "@/services/PermissionService";
import { PermissionRepository } from "@/repositories/PermissionRepository";
import { RoleRepository } from "@/repositories/RoleRepository";

// Raw, no-toJSON property walk — mirrors what a naive deep serializer (like
// React's flight protocol) does, unlike JSON.stringify which would silently
// paper over a Mongoose document's circular internals via its toJSON().
function assertNoRawCycle(value: unknown): void {
  const seen = new Set<unknown>();
  function walk(node: unknown, depth: number): void {
    if (depth > 100) throw new Error("depth exceeded 100 — cyclic or too deep");
    if (node === null || typeof node !== "object") return;
    if (seen.has(node)) throw new Error("cycle detected");
    seen.add(node);
    for (const key of Object.keys(node as object)) {
      walk((node as Record<string, unknown>)[key], depth + 1);
    }
    seen.delete(node);
  }
  walk(value, 0);
}

describe("PermissionService.getMatrixForRoleId", () => {
  it("returns a matrix with no raw circular references from Mongoose subdocuments", async () => {
    const roleId = new Types.ObjectId();

    // A real (unsaved, offline) Mongoose document — this is what
    // PermissionRepository.findByRole returns in production, and it carries
    // genuine internal Mongoose state that a plain mock object would not.
    const row = new PermissionModel({
      roleId,
      moduleKey: "news_blog",
      actions: { access: true, view: true, add: false, edit: false, delete: false },
    });

    const permissionRepository = {
      findByRole: jest.fn().mockResolvedValue([row]),
    } as unknown as PermissionRepository;
    const roleRepository = {} as RoleRepository;

    const service = new PermissionService(roleRepository, permissionRepository);
    const matrix = await service.getMatrixForRoleId(String(roleId));

    expect(() => assertNoRawCycle(matrix)).not.toThrow();
    expect(matrix.news_blog).toEqual({
      access: true,
      view: true,
      add: false,
      edit: false,
      delete: false,
    });
  });

  it("sanity check: RoleModel construction doesn't affect the assertion helper", () => {
    // Guards against a no-op test — confirms assertNoRawCycle actually
    // detects a cycle when one is deliberately introduced.
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => assertNoRawCycle(cyclic)).toThrow("cycle detected");
    expect(new RoleModel({ key: "x", name: "x" })).toBeTruthy();
  });
});
