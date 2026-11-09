import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import AuthScreen from "../../../components/auth/AuthScreen.jsx";
import AuthGuard from "../../../features/auth/AuthGuard.jsx";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => { sessionStorage.clear(); replace.mockClear(); });

it("hides dashboard content and sends a new visitor to login", async () => {
  render(<AuthGuard><p>Private dashboard</p></AuthGuard>);
  expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
});

it("allows dashboard access after a frontend preview login without storing credentials", async () => {
  const view = render(<AuthScreen mode="login" />);
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "test-password" } });
  fireEvent.click(screen.getByRole("button", { name: "로그인" }));
  expect(replace).toHaveBeenCalledWith("/");
  expect(JSON.stringify(sessionStorage)).not.toContain("test-password");
  expect(JSON.stringify(sessionStorage)).not.toContain("test@example.com");
  view.unmount();
  render(<AuthGuard><p>Private dashboard</p></AuthGuard>);
  expect(await screen.findByText("Private dashboard")).toBeInTheDocument();
});

it("shows a signup preview confirmation without signing in or sending credentials", () => {
  render(<AuthScreen mode="signup" />);
  for (const [label, value] of [["이름", "홍길동"], ["이메일", "test@example.com"], ["비밀번호", "test-password"], ["비밀번호 확인", "test-password"]]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
  expect(screen.getByRole("status")).toHaveTextContent("실제 계정은 생성되지 않았어요");
  expect(replace).not.toHaveBeenCalled();
  expect(sessionStorage.length).toBe(0);
});

