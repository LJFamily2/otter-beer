import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BeerForm } from "@/app/(admin)/admin/(protected)/beers/BeerForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/dòng bia/i), {
    target: { value: "Premium Lager" },
  });
  fireEvent.change(screen.getByLabelText(/tiêu đề/i), {
    target: { value: "Headline" },
  });
  fireEvent.change(screen.getByLabelText(/mô tả/i), {
    target: { value: "Description" },
  });
  fireEvent.change(screen.getByLabelText(/abv/i), { target: { value: "4.5" } });
  fireEvent.change(screen.getByLabelText(/^ibu$/i), { target: { value: "20" } });
}

function mockFetchOk() {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ _id: "beer-1" }),
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("BeerForm theme color fields", () => {
  it("defaults the color swatches to the brand colors when no value is set", () => {
    render(<BeerForm mode="create" />);

    const primarySwatch = screen.getByLabelText(/chọn màu chính/i) as HTMLInputElement;
    const containerSwatch = screen.getByLabelText(/chọn màu nền/i) as HTMLInputElement;

    expect(primarySwatch.value.toLowerCase()).toBe("#002867");
    expect(containerSwatch.value.toLowerCase()).toBe("#1d3f82");
  });

  it("syncs the swatch with a valid hex typed into the text field", () => {
    render(<BeerForm mode="create" />);

    const hexInput = screen.getByLabelText(/^màu chính/i) as HTMLInputElement;
    const swatch = screen.getByLabelText(/chọn màu chính/i) as HTMLInputElement;

    fireEvent.change(hexInput, { target: { value: "#123abc" } });
    expect(swatch.value.toLowerCase()).toBe("#123abc");

    fireEvent.change(hexInput, { target: { value: "not-a-color" } });
    expect(swatch.value.toLowerCase()).toBe("#002867");
  });

  it("rejects an invalid hex color on submit without calling the API", async () => {
    const fetchMock = mockFetchOk();
    render(<BeerForm mode="create" />);
    fillRequiredFields();

    fireEvent.change(screen.getByLabelText(/^màu chính/i), {
      target: { value: "not-a-hex" },
    });
    fireEvent.click(screen.getByRole("button", { name: /lưu sản phẩm/i }));

    await waitFor(() => {
      expect(screen.getByText(/mã hex không hợp lệ/i)).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits themeColor/themeColorContainer when both are filled in", async () => {
    const fetchMock = mockFetchOk();
    render(<BeerForm mode="create" />);
    fillRequiredFields();

    fireEvent.change(screen.getByLabelText(/^màu chính/i), {
      target: { value: "#123abc" },
    });
    fireEvent.change(screen.getByLabelText(/^màu nền/i), {
      target: { value: "#654321" },
    });
    fireEvent.click(screen.getByRole("button", { name: /lưu sản phẩm/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.themeColor).toBe("#123abc");
    expect(body.themeColorContainer).toBe("#654321");
  });

  it("omits theme colors from the payload when left blank", async () => {
    const fetchMock = mockFetchOk();
    render(<BeerForm mode="create" />);
    fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: /lưu sản phẩm/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.themeColor).toBeUndefined();
    expect(body.themeColorContainer).toBeUndefined();
  });

  it("pre-fills theme colors from initialData when editing", () => {
    render(
      <BeerForm
        mode="edit"
        beerId="beer-1"
        initialData={{
          abv: 4.3,
          ibu: 20,
          isFeatured: false,
          status: "published",
          themeColor: "#b22a2a",
          themeColorContainer: "#8b1f1f",
          translations: {
            vi: { style: "Bia", headline: "Tiêu đề", description: "Mô tả" },
          },
        }}
      />
    );

    expect(screen.getByLabelText(/^màu chính/i)).toHaveValue("#b22a2a");
    expect(screen.getByLabelText(/^màu nền/i)).toHaveValue("#8b1f1f");
  });
});
