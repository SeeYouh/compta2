import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { ErrorBoundary, NotFound, RouteError } from "../../src/components/ErrorScreen";

/**
 * Avant ces composants, une erreur de rendu ou un `loader` en échec produisait une
 * PAGE BLANCHE. L'utilisateur ne pouvait ni comprendre, ni récupérer, ni signaler.
 *
 * Ces tests verrouillent trois garanties : un message s'affiche, l'erreur est
 * journalisée, et une issue est toujours proposée.
 */

const Explose = () => {
  throw new Error("Panne de rendu simulée");
};

describe("ErrorBoundary", () => {
  it("affiche un écran d'erreur au lieu d'une page blanche", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Explose />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Une erreur est survenue/i)).toBeInTheDocument();
  });

  it("journalise l'erreur — elle ne disparaît jamais en silence", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Explose />
      </ErrorBoundary>,
    );

    const traces = spy.mock.calls.flat().join(" ");
    expect(traces).toContain("ErrorBoundary");
  });

  it("propose toujours une issue à l'utilisateur", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Explose />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("button", { name: /Réessayer/i })).toBeInTheDocument();
  });

  it("laisse passer les enfants quand tout va bien", () => {
    render(
      <ErrorBoundary>
        <p>Contenu normal</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Contenu normal")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("RouteError", () => {
  it("affiche l'échec d'un loader au lieu d'une page blanche", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const router = createMemoryRouter(
      [
        {
          path: "/",
          loader: () => {
            throw new Error("Loader en échec");
          },
          Component: () => <p>Jamais affiché</p>,
          errorElement: <RouteError />,
        },
      ],
      { initialEntries: ["/"] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("Jamais affiché")).not.toBeInTheDocument();
  });
});

describe("NotFound", () => {
  it("répond à une URL inconnue plutôt que de ne rien rendre", async () => {
    const router = createMemoryRouter(
      [{ path: "*", Component: NotFound }],
      { initialEntries: ["/route-qui-nexiste-pas"] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText(/Page introuvable/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Retour à l'accueil/i }),
    ).toBeInTheDocument();
  });
});
