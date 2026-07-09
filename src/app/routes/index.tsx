import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});

function HomeScreen() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Twitter Clone</h1>
      <p>scaffolding OK なのだ</p>
    </main>
  );
}
